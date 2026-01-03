import * as Array from 'effect/Array'
import * as DateTime from 'effect/DateTime'
import * as Function from 'effect/Function'
import * as Match from 'effect/Match'
import * as Option from 'effect/Option'
import * as ParseResult from 'effect/ParseResult'
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

type WithoutTag<T extends { _tag: string }> = Omit<T, '_tag'>

type Properties<TSchema extends Schema.Schema<any>> = WithoutTag<
  Schema.Schema.Encoded<TSchema>
>

const URLFromStringOrURL = Schema.encodedSchema(
  Schema.transformOrFail(
    Schema.Union(Schema.String, Schema.instanceOf(URL)),
    Schema.instanceOf(URL),
    {
      strict: true,
      decode: (input, _options, ast) => {
        if (typeof input === 'string') {
          const url = URL.parse(input)

          if (url) {
            return ParseResult.succeed(url)
          }

          return ParseResult.fail(
            new ParseResult.Type(ast, input, 'Invalid URL')
          )
        }

        return ParseResult.succeed(input)
      },
      encode: (input) => ParseResult.succeed(input.toString()),
    }
  )
).annotations({ arbitrary: () => (fc) => fc.webUrl() })

const forEncodingOnly = <const Self extends string>(self: Self) =>
  Schema.optionalWith(Schema.Literal(self), { default: () => self })

class Image extends Schema.TaggedClass<Image>(id('Image'))(id('Image'), {
  url: URLFromStringOrURL.annotations(openGraphProperty('og:image')),
  secureUrl: Schema.optional(URLFromStringOrURL).annotations(
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
    url: URLFromStringOrURL.annotations(openGraphProperty('og:url')),
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
    video: Schema.optional(URLFromStringOrURL).annotations(
      openGraphProperty('og:video')
    ),
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
    author: Schema.optional(URLFromStringOrURL).annotations(
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
      console.log(key, value)
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

const OgSchema = Schema.Union(Article)
type OgSchema = typeof OgSchema.Encoded

const decodeMetadata = Schema.decodeUnknown(Metadata)
const decodeArticle = Schema.decodeUnknown(Article)

export const makeWebsite = (
  website: Omit<Properties<typeof Metadata>, 'image' | 'locale'> & {
    image: Properties<typeof Image> | ReadonlyArray<Properties<typeof Image>>
    locale?: Properties<typeof Locale>
  }
) =>
  decodeMetadata(
    Metadata.make({
      ...website,
      image: Array.ensure(website.image).map((image) => Image.make(image)),
      locale: website.locale ? Locale.make(website.locale) : undefined,
    })
  )

export const make = makeWebsite

export const makeArticle = (
  article: Omit<WithoutTag<typeof Article.Encoded>, 'image' | 'locale'> & {
    image: Properties<typeof Image> | ReadonlyArray<Properties<typeof Image>>
    locale?: Properties<typeof Locale>
  }
) =>
  decodeArticle(
    Article.make({
      ...article,
      image: Array.ensure(article.image).map((image) => Image.make(image)),
      locale: article.locale ? Locale.make(article.locale) : undefined,
    })
  )

export const render = (schema: OgSchema) => (
  <>
    {Match.value(schema)
      .pipe(
        Match.tag(id('Article'), renderTaggedClass(Article)),
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
