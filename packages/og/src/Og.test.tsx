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
    expect(Og.render(article)).toMatchInlineSnapshot(`
      <React.Fragment>
        <meta
          content="My article"
          property="og:title"
        />
        <meta
          content="https://example.com"
          property="og:url"
        />
        <meta
          content="https://example.com/image.png"
          property="og:image"
        />
        <meta
          content="800"
          property="og:image:width"
        />
        <meta
          content="600"
          property="og:image:height"
        />
        <meta
          content="https://example.com/image-2.png"
          property="og:image"
        />
        <meta
          content="800"
          property="og:image:width"
        />
        <meta
          content="600"
          property="og:image:height"
        />
        <meta
          content="en-US"
          property="og:locale"
        />
        <meta
          content="pt-BR"
          property="og:locale:alternate"
        />
        <meta
          content="article"
          property="og:type"
        />
        <meta
          content="2025-12-20T00:00:00.000Z"
          property="article:published_time"
        />
      </React.Fragment>
    `)
  })
)

it.effect.prop('article all', [Arbitrary.make(Og.Article)], ([article]) =>
  Effect.gen(function* () {
    console.log(article)
  })
)
