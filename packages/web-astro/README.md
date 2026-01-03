# @macklinu/effect-web-astro

> Astro implementation for `@macklinu/effect-web`

## Installation

```sh
pnpm add @macklinu/effect-web-astro
```

Also ensure you install the required peer dependencies:

- `@macklinu/effect-web`
- `astro`
- `effect`
- `@effect/platform`

## Usage

```ts
import { Effect, Schema } from 'effect'

import { RequestParams } from '@macklinu/effect-web'
import { EffectWebAstro } from '@macklinu/effect-web-astro'

const requestHandler = Effect.gen(function* () {
  const { slug } = yield* RequestParams.pipe(
    Schema.decodeUnknown(Schema.Struct({ slug: Schema.String }))
  )

  // ...
})

const result = await Effect.runPromiseExit(
  requestHandler.pipe(
    // Provide the Astro global/context to your Effect
    EffectWebAstro.provideService(Astro)
  )
)
```

More docs to come as I implement this into projects and have better examples.
