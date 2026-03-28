import { expect, it } from '@effect/vitest'
import * as DateTime from 'effect/DateTime'
import * as Effect from 'effect/Effect'

import * as Og from './Og'
import { MetaTags } from './react'

it.effect('MetaTags renders meta elements from OG metadata', () =>
  Effect.gen(function* () {
    const article = yield* Og.makeArticle({
      title: 'Test',
      publishedTime: DateTime.unsafeMake('2025-01-01'),
      url: new URL('https://example.com'),
      image: { url: new URL('https://example.com/og.png') },
    })
    expect(MetaTags({ of: article })).toMatchInlineSnapshot(`
      <React.Fragment>
        <meta
          content="Test"
          property="og:title"
        />
        <meta
          content="https://example.com/"
          property="og:url"
        />
        <meta
          content="https://example.com/og.png"
          property="og:image"
        />
        <meta
          content="article"
          property="og:type"
        />
        <meta
          content="2025-01-01T00:00:00.000Z"
          property="article:published_time"
        />
      </React.Fragment>
    `)
  })
)
