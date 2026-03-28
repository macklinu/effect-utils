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

### Rendering to React

```tsx
import { MetaTags } from '@macklinu/effect-og/react'

// Inside a React component or framework that supports <head> injection

;<MetaTags of={article} />
// Renders: <meta property="og:type" content="article" />
//          <meta property="og:title" content="How to Use Effect" />
//          ...
```

## Supported types

| OG type   | Constructor        |
| --------- | ------------------ |
| `website` | `Og.makeWebsite()` |
| `article` | `Og.makeArticle()` |

Both constructors return `Effect<T, ParseError, never>`, validating inputs and surfacing any issues as typed `ParseError` values in the error channel.

## API

| Export                     | Description                                                |
| -------------------------- | ---------------------------------------------------------- |
| `Og.makeWebsite(input)`    | Construct validated website metadata                       |
| `Og.makeArticle(input)`    | Construct validated article metadata                       |
| `Og.toMetaTags(schema)`    | Convert metadata to `ReadonlyArray<{ property, content }>` |
| `Og.Article`               | Effect Schema class for article metadata                   |
| `Og.WebsiteMetadata`       | Effect Schema class for website metadata                   |
| `<MetaTags of={schema} />` | React component (`@macklinu/effect-og/react`)              |
