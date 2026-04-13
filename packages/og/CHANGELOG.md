# @macklinu/effect-og

## 0.2.0

### Minor Changes

- 9ea4075: Add `Og.withTwitter`

  Attaches Twitter Card meta tags to an existing `OgData` value, supporting both data-first and data-last (pipeable) styles.

  ```ts
  import * as Effect from 'effect/Effect'
  import * as Og from '@macklinu/effect-og'

  // data-first
  const data = yield* Og.makeWebsite({ ... })
  const withTwitter = yield* Og.withTwitter(data, {
    card: 'summary_large_image',
    site: '@example',
    image: 'https://example.com/og.png',
  })

  // data-last (pipeable)
  const withTwitter = yield* Og.makeWebsite({ ... }).pipe(
    Effect.flatMap(Og.withTwitter({ card: 'summary', site: '@example' }))
  )
  ```

## 0.1.0

### Minor Changes

- 1993cd6: Initial release
