import * as Array from 'effect/Array'
import * as DateTime from 'effect/DateTime'
import * as Function from 'effect/Function'
import * as Match from 'effect/Match'
import * as Option from 'effect/Option'
import * as Schema from 'effect/Schema'
import * as SchemaAST from 'effect/SchemaAST'
import * as Struct from 'effect/Struct'

const id = <const T extends string>(tag: T) =>
  `@macklinu/effect-og/${tag}` as const

const OpenGraphProperty = Symbol.for(id('OpenGraphProperty'))

const openGraphProperty = (value: string) =>
  ({ [OpenGraphProperty]: value }) as const

const getOpenGraphProperty = SchemaAST.getAnnotation<string>(OpenGraphProperty)

declare module 'effect/Schema' {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [OpenGraphProperty]?: string
    }
  }
}

/**
 * Accepts a string and validates it as a URL. Decodes to a `URL` instance,
 * encodes back to a string.
 */
const Url = Schema.URL

const forEncodingOnly = <const Self extends string>(self: Self) =>
  Schema.optionalWith(Schema.Literal(self), { default: () => self })

class Image extends Schema.TaggedClass<Image>(id('Image'))(id('Image'), {
  url: Url.annotations(openGraphProperty('og:image')),
  secureUrl: Schema.optional(Url).annotations(
    openGraphProperty('og:image:secure_url')
  ),
  width: Schema.optional(Schema.Number).annotations(
    openGraphProperty('og:image:width')
  ),
  height: Schema.optional(Schema.Number).annotations(
    openGraphProperty('og:image:height')
  ),
  type: Schema.optional(Schema.String).annotations(
    openGraphProperty('og:image:type')
  ),
  alt: Schema.optional(Schema.String).annotations(
    openGraphProperty('og:image:alt')
  ),
}) {
  static readonly is = Schema.is(Image)
}

class Locale extends Schema.TaggedClass<Locale>(id('Locale'))(id('Locale'), {
  default: Schema.String.annotations(openGraphProperty('og:locale')),
  alternate: Schema.optional(Schema.Array(Schema.String)).annotations(
    openGraphProperty('og:locale:alternate')
  ),
}) {
  static readonly is = Schema.is(Locale)
}

class Metadata extends Schema.TaggedClass<Metadata>(id('Metadata'))(
  id('Metadata'),
  {
    type: forEncodingOnly('website').annotations(openGraphProperty('og:type')),
    title: Schema.String.annotations(openGraphProperty('og:title')),
    url: Url.annotations(openGraphProperty('og:url')),
    audio: Schema.optional(Schema.String).annotations(
      openGraphProperty('og:audio')
    ),
    description: Schema.optional(Schema.String).annotations(
      openGraphProperty('og:description')
    ),
    determiner: Schema.optional(
      Schema.Literal('a', 'an', 'the', '', 'auto')
    ).annotations(openGraphProperty('og:determiner')),
    image: Schema.Union(Image, Schema.Array(Image)),
    locale: Schema.optional(Locale),
    siteName: Schema.optional(Schema.String).annotations(
      openGraphProperty('og:site_name')
    ),
    video: Schema.optional(Url).annotations(openGraphProperty('og:video')),
  }
) {}

export class Article extends Schema.TaggedClass<Article>(id('Article'))(
  id('Article'),
  {
    ...Struct.omit(Metadata.fields, '_tag', 'type'),
    type: forEncodingOnly('article').annotations(openGraphProperty('og:type')),
    /** When the article was first published. */
    publishedTime: Schema.DateTimeUtcFromSelf.annotations(
      openGraphProperty('article:published_time')
    ),
    /** When the article was last changed. */
    modifiedTime: Schema.optional(Schema.DateTimeUtcFromSelf).annotations(
      openGraphProperty('article:modified_time')
    ),
    /** When the article is out of date after. */
    expirationTime: Schema.optional(Schema.DateTimeUtcFromSelf).annotations(
      openGraphProperty('article:expiration_time')
    ),
    /** Writers of the article. */
    author: Schema.optional(Url).annotations(
      openGraphProperty('article:author')
    ),
    /** A high-level section name. E.g. Technology. */
    section: Schema.optional(Schema.String).annotations(
      openGraphProperty('article:section')
    ),
    /** Tag words associated with this article. */
    tags: Schema.optional(Schema.Array(Schema.String)).annotations(
      openGraphProperty('article:tag')
    ),
  }
) {
  static readonly is = Schema.is(Article)
}

const toString = <A extends { toString: () => string }>(a: A): string =>
  a.toString()

const renderContent = Match.type<string | number | URL | DateTime.Utc>().pipe(
  Match.withReturnType<string>(),
  Match.when(DateTime.isDateTime, (dateTime) => DateTime.formatIso(dateTime)),
  Match.when(Match.string, Function.identity<string>),
  Match.whenOr(Match.number, Match.instanceOfUnsafe(URL), toString),
  Match.exhaustive
)

type MetaTag = Readonly<{ property: string; content: string }>

export const renderTaggedClass =
  <F extends Schema.Struct.Fields>(classType: { fields: F }) =>
  (instance: Record<string, any>): ReadonlyArray<MetaTag> => {
    return Array.filterMap(Struct.entries(classType.fields), ([key, value]) => {
      const annotated =
        value.ast._tag === 'PropertySignatureTransformation'
          ? value.ast.to
          : value.ast

      const fieldValue = instance[key]

      if (typeof fieldValue === 'undefined') {
        return Option.none()
      }

      if (Image.is(fieldValue)) {
        return Option.some(renderTaggedClass(Image)(fieldValue))
      }

      if (Locale.is(fieldValue)) {
        return Option.some(renderTaggedClass(Locale)(fieldValue))
      }

      if (Array.isArray(fieldValue)) {
        if (Array.every(fieldValue, Image.is)) {
          return Option.some(fieldValue.flatMap(renderTaggedClass(Image)))
        }
        if (Array.every(fieldValue, Locale.is)) {
          return Option.some(fieldValue.flatMap(renderTaggedClass(Locale)))
        }
      }

      return Option.zipWith(
        getOpenGraphProperty(annotated),
        Option.fromNullable(fieldValue).pipe(
          Option.map((value) => Array.ensure(value).map(renderContent))
        ),
        (property, content) => content.map((content) => ({ property, content }))
      )
    }).flat()
  }

const OgSchema = Schema.Union(Article, Metadata)
type OgSchema = typeof OgSchema.Type

const validateMetadata = Schema.validate(Metadata)
const validateArticle = Schema.validate(Article)

type UrlInput = string | URL

const toUrl = (value: UrlInput): URL =>
  typeof value === 'string' ? new URL(value) : value

interface ImageInput {
  readonly url: UrlInput
  readonly secureUrl?: UrlInput
  readonly width?: number
  readonly height?: number
  readonly type?: string
  readonly alt?: string
}

const normalizeImage = (image: ImageInput) =>
  Image.make({
    ...image,
    url: toUrl(image.url),
    secureUrl: image.secureUrl ? toUrl(image.secureUrl) : undefined,
  })

interface LocaleInput {
  readonly default: string
  readonly alternate?: ReadonlyArray<string>
}

interface MetadataInput {
  readonly title: string
  readonly url: UrlInput
  readonly audio?: string
  readonly description?: string
  readonly determiner?: 'a' | 'an' | 'the' | '' | 'auto'
  readonly image: ImageInput | ReadonlyArray<ImageInput>
  readonly locale?: LocaleInput
  readonly siteName?: string
  readonly video?: UrlInput
}

export const makeWebsite = (website: MetadataInput) =>
  validateMetadata(
    Metadata.make({
      ...website,
      url: toUrl(website.url),
      video: website.video ? toUrl(website.video) : undefined,
      image: Array.ensure(website.image).map(normalizeImage),
      locale: website.locale ? Locale.make(website.locale) : undefined,
    })
  )

export const make = makeWebsite

interface ArticleInput extends Omit<MetadataInput, 'determiner'> {
  readonly publishedTime: DateTime.Utc
  readonly modifiedTime?: DateTime.Utc
  readonly expirationTime?: DateTime.Utc
  readonly author?: UrlInput
  readonly section?: string
  readonly tags?: ReadonlyArray<string>
}

export const makeArticle = (article: ArticleInput) =>
  validateArticle(
    Article.make({
      ...article,
      url: toUrl(article.url),
      video: article.video ? toUrl(article.video) : undefined,
      author: article.author ? toUrl(article.author) : undefined,
      image: Array.ensure(article.image).map(normalizeImage),
      locale: article.locale ? Locale.make(article.locale) : undefined,
    })
  )

export const render = (schema: OgSchema) => (
  <>
    {Match.value(schema)
      .pipe(
        Match.tag(id('Article'), renderTaggedClass(Article)),
        Match.tag(id('Metadata'), renderTaggedClass(Metadata)),
        Match.exhaustive
      )
      .map(({ property, content }) => (
        <meta
          key={`${property}-${content}`}
          property={property}
          content={content}
        />
      ))}
  </>
)
