---
'@macklinu/effect-og': minor
---

Add `Og.withTwitter`

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
