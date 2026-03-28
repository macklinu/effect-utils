import { expect, it } from '@effect/vitest'
import * as Arbitrary from 'effect/Arbitrary'
import * as DateTime from 'effect/DateTime'
import * as Effect from 'effect/Effect'

import * as Og from './Og'

it.effect('makeWebsite sets og:type to website', () =>
  Effect.gen(function* () {
    const metadata = yield* Og.makeWebsite({
      title: 'My Site',
      url: new URL('https://example.com'),
      image: { url: new URL('https://example.com/og.png') },
    })
    const tags = Og.toMetaTags(metadata)
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
    const article = yield* Og.makeArticle({
      title: 'My Post',
      url: new URL('https://example.com/post'),
      publishedTime: DateTime.unsafeMake('2025-06-15'),
      image: { url: new URL('https://example.com/og.png') },
    })
    const tags = Og.toMetaTags(article)
    expect(tags).toContainEqual({ property: 'og:type', content: 'article' })
    expect(tags).toContainEqual({
      property: 'article:published_time',
      content: '2025-06-15T00:00:00.000Z',
    })
  })
)

it.effect('multiple images produce multiple og:image tags', () =>
  Effect.gen(function* () {
    const metadata = yield* Og.makeWebsite({
      title: 'Multi',
      url: new URL('https://example.com'),
      image: [
        { url: new URL('https://example.com/a.png'), width: 800 },
        { url: new URL('https://example.com/b.png'), width: 600 },
      ],
    })
    const imageTags = Og.toMetaTags(metadata).filter(
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
    const metadata = yield* Og.makeWebsite({
      title: 'Minimal',
      url: new URL('https://example.com'),
      image: { url: new URL('https://example.com/og.png') },
    })
    const properties = Og.toMetaTags(metadata).map(({ property }) => property)
    expect(properties).not.toContain('og:description')
    expect(properties).not.toContain('og:site_name')
    expect(properties).not.toContain('og:video')
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
  [Arbitrary.make(Og.Metadata)],
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
