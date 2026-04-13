# @macklinu/effect-og

> A module for working with [Open Graph](https://ogp.me/) metadata in [Effect](https://effect.website/)

## Installation

```sh
pnpm add @macklinu/effect-og
```

Peer dependencies:

- `effect@^3.19.0`
- `react@^19` (optional; needed if using `@macklinu/effect-og/react`).

## Usage

### Website metadata

```ts
import * as Effect from 'effect/Effect'

import { Og } from '@macklinu/effect-og'

const program = Effect.gen(function* () {
  const metadata = yield* Og.makeWebsite({
    title: 'My Website',
    url: 'https://example.com',
    description: 'A website about things',
    siteName: 'Example',
    image: {
      url: 'https://example.com/og.png',
      width: 1200,
      height: 630,
      alt: 'Example website',
    },
  })

  // Get plain meta tag data (framework-agnostic)
  const tags = Og.toMetaTags(metadata)
  // [{ property: "og:type", content: "website" },
  //  { property: "og:title", content: "My Website" }, ...]
})
```

### Article metadata

```ts
import * as DateTime from 'effect/DateTime'
import * as Effect from 'effect/Effect'

import { Og } from '@macklinu/effect-og'

const program = Effect.gen(function* () {
  const article = yield* Og.makeArticle({
    title: 'How to Use Effect',
    url: 'https://example.com/blog/effect',
    publishedTime: DateTime.unsafeMake('2025-12-20'),
    author: [
      'https://example.com/authors/macklinu',
      'https://example.com/authors/other',
    ],
    section: 'Technology',
    tags: ['effect', 'typescript'],
    image: [
      {
        url: 'https://example.com/blog/effect/og.png',
        width: 1200,
        height: 630,
      },
      {
        url: 'https://example.com/blog/effect/og-2.png',
        width: 800,
        height: 600,
      },
    ],
  })
})
```

### Twitter Card metadata

`Og.withTwitter` attaches Twitter Card meta tags to any `OgData` value. Only `card` is required - Twitter falls back to `og:title`, `og:description`, and `og:image` automatically, so you only need to add extra fields to explicitly override those.

```ts
import * as Effect from 'effect/Effect'

import { Og } from '@macklinu/effect-og'

const program = Effect.gen(function* () {
  // data-first
  const data = yield* Og.makeWebsite({ ... })
  const withCard = yield* Og.withTwitter(data, { card: 'summary_large_image' })

  // data-last (pipeable)
  const withCard = yield* Og.makeArticle({ ... }).pipe(
    Effect.flatMap(
      Og.withTwitter({ card: 'summary', site: '@example' })
    )
  )

  Og.toMetaTags(withCard)
  // [...og tags...,
  //  { property: "twitter:card", content: "summary" },
  //  { property: "twitter:site", content: "@example" }]
})
```

### Rendering to React

```tsx
import { MetaTags } from '@macklinu/effect-og/react'

// Inside a React component or framework that supports <head> injection

;<MetaTags of={article} />
// Renders: <meta property="og:type" content="article" />
//          <meta property="og:title" content="How to Use Effect" />
//          <meta name="twitter:card" content="summary" />
//          ...
```

## Supported types

| OG type   | Constructor        |
| --------- | ------------------ |
| `website` | `Og.makeWebsite()` |
| `article` | `Og.makeArticle()` |

Both constructors return `Effect<T, ParseError, never>`, validating inputs and surfacing any issues as typed `ParseError` values in the error channel.

## API

| Export                   | Description                                                |
| ------------------------ | ---------------------------------------------------------- |
| `Og.makeWebsite(input)`  | Construct validated website metadata                       |
| `Og.makeArticle(input)`  | Construct validated article metadata                       |
| `Og.withTwitter(input)`  | Attach Twitter Card tags to an `OgData` value (dual)       |
| `Og.toMetaTags(data)`    | Convert metadata to `ReadonlyArray<{ property, content }>` |
| `Og.Article`             | Effect Schema class for article metadata                   |
| `Og.WebsiteMetadata`     | Effect Schema class for website metadata                   |
| `Og.Twitter`             | Effect Schema class for Twitter Card metadata              |
| `<MetaTags of={data} />` | React component (`@macklinu/effect-og/react`)              |
