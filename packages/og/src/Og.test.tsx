import { expect, it } from '@effect/vitest'
import * as Arbitrary from 'effect/Arbitrary'
import * as DateTime from 'effect/DateTime'
import * as Effect from 'effect/Effect'

import * as Og from './Og'

it.effect('Article', () =>
  Effect.gen(function* () {
    const article = yield* Og.makeArticle({
      title: 'My article',
      publishedTime: DateTime.unsafeMake('2025-12-20'),
      url: 'https://example.com',
      locale: {
        default: 'en-US',
        alternate: ['pt-BR'],
      },
      image: [
        {
          url: 'https://example.com/image.png',
          width: 800,
          height: 600,
        },
        {
          url: 'https://example.com/image-2.png',
          width: 800,
          height: 600,
        },
      ],
    })
    expect(Og.render(article)).toMatchSnapshot()
  })
)

it.effect('Article with URL instances', () =>
  Effect.gen(function* () {
    const article = yield* Og.makeArticle({
      title: 'URL instance test',
      publishedTime: DateTime.unsafeMake('2025-12-20'),
      url: new URL('https://example.com'),
      image: {
        url: new URL('https://example.com/image.png'),
      },
    })
    expect(Og.render(article)).toMatchSnapshot()
  })
)

it.prop(
  'article renders without throwing',
  [Arbitrary.make(Og.Article)],
  ([article]) => {
    const rendered = Og.renderTaggedClass(Og.Article)(article)
    expect(rendered).toBeInstanceOf(Array)
    expect(rendered.length).toBeGreaterThan(0)
    for (const tag of rendered) {
      expect(tag).toHaveProperty('property')
      expect(tag).toHaveProperty('content')
      expect(typeof tag.property).toBe('string')
      expect(typeof tag.content).toBe('string')
    }
  }
)
