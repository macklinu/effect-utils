import { expect, it } from '@effect/vitest'
import * as DateTime from 'effect/DateTime'
import * as Effect from 'effect/Effect'

import * as Og from './Og'
import { MetaTags } from './react'

it.effect('MetaTags renders meta elements from OG metadata', () =>
  Effect.gen(function* () {
    const data = yield* Og.makeArticle({
      title: 'Test',
      publishedTime: DateTime.unsafeMake('2025-01-01'),
      url: 'https://example.com',
      image: { url: 'https://example.com/og.png' },
    })
    expect(MetaTags({ of: data })).toMatchInlineSnapshot(`
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

it.effect('MetaTags renders twitter tags using name attribute', () =>
  Effect.gen(function* () {
    const data = yield* Og.makeWebsite({
      title: 'My Site',
      url: 'https://example.com',
      image: { url: 'https://example.com/og.png' },
    }).pipe(
      Effect.flatMap(
        Og.withTwitter({
          card: 'summary_large_image',
          site: '@example',
          title: 'My Site',
        })
      )
    )
    expect(MetaTags({ of: data })).toMatchInlineSnapshot(`
      <React.Fragment>
        <meta
          content="website"
          property="og:type"
        />
        <meta
          content="My Site"
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
          content="summary_large_image"
          name="twitter:card"
        />
        <meta
          content="@example"
          name="twitter:site"
        />
        <meta
          content="My Site"
          name="twitter:title"
        />
      </React.Fragment>
    `)
  })
)
