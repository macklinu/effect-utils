import { expect, it } from '@effect/vitest'
import * as Arbitrary from 'effect/Arbitrary'
import * as DateTime from 'effect/DateTime'
import * as Effect from 'effect/Effect'
import * as Exit from 'effect/Exit'

import * as Og from './Og'

it.effect('makeWebsite sets og:type to website', () =>
  Effect.gen(function* () {
    const data = yield* Og.makeWebsite({
      title: 'My Site',
      url: 'https://example.com',
      image: { url: 'https://example.com/og.png' },
    })
    const tags = Og.toMetaTags(data)
    expect(tags).toContainEqual({ property: 'og:type', content: 'website' })
    expect(tags).toContainEqual({ property: 'og:title', content: 'My Site' })
    expect(tags).toContainEqual({
      property: 'og:url',
      content: 'https://example.com/',
    })
  })
)

it.effect('makeArticle sets og:type to article', () =>
  Effect.gen(function* () {
    const data = yield* Og.makeArticle({
      title: 'My Post',
      url: 'https://example.com/post',
      publishedTime: DateTime.unsafeMake('2025-06-15'),
      image: { url: 'https://example.com/og.png' },
    })
    const tags = Og.toMetaTags(data)
    expect(tags).toContainEqual({ property: 'og:type', content: 'article' })
    expect(tags).toContainEqual({
      property: 'article:published_time',
      content: '2025-06-15T00:00:00.000Z',
    })
  })
)

it.effect('makeWebsite fails on invalid URL', () =>
  Effect.gen(function* () {
    const exit = yield* Og.makeWebsite({
      title: 'Bad',
      url: 'not a url',
      image: { url: 'https://example.com/og.png' },
    }).pipe(Effect.exit)
    expect(Exit.isFailure(exit)).toBe(true)
  })
)

it.effect('multiple images produce multiple og:image tags', () =>
  Effect.gen(function* () {
    const data = yield* Og.makeWebsite({
      title: 'Multi',
      url: 'https://example.com',
      image: [
        { url: 'https://example.com/a.png', width: 800 },
        { url: 'https://example.com/b.png', width: 600 },
      ],
    })
    const imageTags = Og.toMetaTags(data).filter(
      ({ property }) => property === 'og:image'
    )
    expect(imageTags).toEqual([
      expect.objectContaining({ content: 'https://example.com/a.png' }),
      expect.objectContaining({ content: 'https://example.com/b.png' }),
    ])
  })
)

it.effect('optional fields are omitted from meta tags', () =>
  Effect.gen(function* () {
    const data = yield* Og.makeWebsite({
      title: 'Minimal',
      url: 'https://example.com',
      image: { url: 'https://example.com/og.png' },
    })
    const properties = Og.toMetaTags(data).map(({ property }) => property)
    expect(properties).not.toContain('og:description')
    expect(properties).not.toContain('og:site_name')
    expect(properties).not.toContain('og:video')
  })
)

it.effect('fully-populated website produces all expected meta tags', () =>
  Effect.gen(function* () {
    const data = yield* Og.makeWebsite({
      title: 'Full',
      url: 'https://example.com',
      audio: 'https://example.com/audio.mp3',
      description: 'A description',
      determiner: 'the',
      image: {
        url: 'https://example.com/og.png',
        secureUrl: 'https://example.com/og.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'Alt text',
      },
      locale: { default: 'en_US', alternate: ['fr_FR'] },
      siteName: 'Example',
      video: 'https://example.com/video.mp4',
    })
    const tags = Og.toMetaTags(data)
    const properties = tags.map(({ property }) => property)
    expect(properties).toEqual(
      expect.arrayContaining([
        'og:type',
        'og:title',
        'og:url',
        'og:audio',
        'og:description',
        'og:determiner',
        'og:image',
        'og:image:secure_url',
        'og:image:width',
        'og:image:height',
        'og:image:type',
        'og:image:alt',
        'og:locale',
        'og:locale:alternate',
        'og:site_name',
        'og:video',
      ])
    )
    expect(tags).toHaveLength(16)
  })
)

it.effect('fully-populated article produces all expected meta tags', () =>
  Effect.gen(function* () {
    const data = yield* Og.makeArticle({
      title: 'Full Article',
      url: 'https://example.com/post',
      publishedTime: DateTime.unsafeMake('2025-06-15'),
      modifiedTime: DateTime.unsafeMake('2025-06-16'),
      expirationTime: DateTime.unsafeMake('2026-06-15'),
      author: 'https://example.com/authors/test',
      section: 'Tech',
      tags: ['a', 'b'],
      image: {
        url: 'https://example.com/og.png',
        width: 1200,
        height: 630,
      },
    })
    const metaTags = Og.toMetaTags(data)
    const properties = metaTags.map(({ property }) => property)
    expect(properties).toEqual(
      expect.arrayContaining([
        'og:type',
        'og:title',
        'og:url',
        'og:image',
        'og:image:width',
        'og:image:height',
        'article:published_time',
        'article:modified_time',
        'article:expiration_time',
        'article:author',
        'article:section',
        'article:tag',
      ])
    )
    expect(metaTags).toHaveLength(13)
  })
)

it.prop(
  'toMetaTags always includes required properties for articles',
  [Arbitrary.make(Og.Article)],
  ([article]) => {
    const tags = Og.toMetaTags(article)
    const properties = tags.map(({ property }) => property)
    expect(properties).toContain('og:type')
    expect(properties).toContain('og:title')
    expect(properties).toContain('og:url')
    expect(properties).toContain('article:published_time')
    expect(tags.find(({ property }) => property === 'og:type')).toHaveProperty(
      'content',
      'article'
    )
  }
)

it.prop(
  'toMetaTags always includes required properties for websites',
  [Arbitrary.make(Og.WebsiteMetadata)],
  ([metadata]) => {
    const tags = Og.toMetaTags(metadata)
    const properties = tags.map(({ property }) => property)
    expect(properties).toContain('og:type')
    expect(properties).toContain('og:title')
    expect(properties).toContain('og:url')
    expect(tags.find(({ property }) => property === 'og:type')).toHaveProperty(
      'content',
      'website'
    )
  }
)

it.effect('withTwitter data-first adds twitter meta tags', () =>
  Effect.gen(function* () {
    const data = yield* Og.makeWebsite({
      title: 'My Site',
      url: 'https://example.com',
      image: { url: 'https://example.com/og.png' },
    })
    const withTwitter = yield* Og.withTwitter(data, {
      card: 'summary_large_image',
      site: '@example',
      title: 'My Site',
      description: 'A description',
      image: 'https://example.com/og.png',
      imageAlt: 'Alt text',
    })
    const tags = Og.toMetaTags(withTwitter)
    expect(tags).toContainEqual({
      property: 'twitter:card',
      content: 'summary_large_image',
    })
    expect(tags).toContainEqual({
      property: 'twitter:site',
      content: '@example',
    })
    expect(tags).toContainEqual({
      property: 'twitter:title',
      content: 'My Site',
    })
    expect(tags).toContainEqual({
      property: 'twitter:description',
      content: 'A description',
    })
    expect(tags).toContainEqual({
      property: 'twitter:image',
      content: 'https://example.com/og.png',
    })
    expect(tags).toContainEqual({
      property: 'twitter:image:alt',
      content: 'Alt text',
    })
  })
)

it.effect('withTwitter data-last (pipeable) adds twitter meta tags', () =>
  Effect.gen(function* () {
    const data = yield* Og.makeArticle({
      title: 'My Post',
      url: 'https://example.com/post',
      publishedTime: DateTime.unsafeMake('2025-06-15'),
      image: { url: 'https://example.com/og.png' },
    })
    const withTwitter = yield* Effect.succeed(data).pipe(
      Effect.flatMap(Og.withTwitter({ card: 'summary', site: '@example' }))
    )
    const tags = Og.toMetaTags(withTwitter)
    expect(tags).toContainEqual({ property: 'og:type', content: 'article' })
    expect(tags).toContainEqual({
      property: 'twitter:card',
      content: 'summary',
    })
    expect(tags).toContainEqual({
      property: 'twitter:site',
      content: '@example',
    })
  })
)

it.effect('withTwitter optional fields are omitted when not provided', () =>
  Effect.gen(function* () {
    const data = yield* Og.makeWebsite({
      title: 'Minimal',
      url: 'https://example.com',
      image: { url: 'https://example.com/og.png' },
    })
    const withTwitter = yield* Og.withTwitter(data, { card: 'summary' })
    const tags = Og.toMetaTags(withTwitter)
    const properties = tags.map(({ property }) => property)
    expect(properties).toContain('twitter:card')
    expect(properties).not.toContain('twitter:site')
    expect(properties).not.toContain('twitter:title')
    expect(properties).not.toContain('twitter:description')
    expect(properties).not.toContain('twitter:image')
    expect(properties).not.toContain('twitter:image:alt')
  })
)

it.effect('withTwitter fails on invalid twitter:site (missing @)', () =>
  Effect.gen(function* () {
    const data = yield* Og.makeWebsite({
      title: 'My Site',
      url: 'https://example.com',
      image: { url: 'https://example.com/og.png' },
    })
    const exit = yield* Og.withTwitter(data, {
      card: 'summary',
      site: 'example' as `@${string}`,
    }).pipe(Effect.exit)
    expect(Exit.isFailure(exit)).toBe(true)
  })
)

it.effect('withTwitter does not mutate original OgData', () =>
  Effect.gen(function* () {
    const data = yield* Og.makeWebsite({
      title: 'My Site',
      url: 'https://example.com',
      image: { url: 'https://example.com/og.png' },
    })
    const withTwitter = yield* Og.withTwitter(data, { card: 'summary' })
    expect(data.twitter).toBeUndefined()
    expect(withTwitter.twitter).toBeDefined()
  })
)
