# @macklinu/effect-web

> Common services used when bridging web frameworks with Effect

## Installation

```sh
pnpm add @macklinu/effect-web
```

## Usage

There are 3 main web Effect services (`Context.Tag`) that you can implement for your web framework of choice:

- `RequestParams`: the parameters found in the file path for a framework with file based routing
- `ServerRequest`: the incoming request for an SSR framework
- `ServerResponse`: the outgoing response for an SSR framework

Anyone can then inject the service into an `Effect.Effect` in order to help bridge the gap between your web framework of choice and your Effect domain. For example:

```ts
import { Effect, Schema } from 'effect'

import { RequestParams } from '@macklinu/effect-web'

const requestHandler = Effect.gen(function* () {
  const { slug } = yield* RequestParams.pipe(
    Schema.decodeUnknown(Schema.Struct({ slug: Schema.String }))
  )

  // ...
})

const result = await Effect.runPromiseExit(
  requestHandler.pipe(Effect.provide(SomeImplementation.layer))
)
```

Notice that `SomeImplementation.layer` is provided on a per-request basis. This import isn't real but is a placeholder for the framework implementation of your choice. I maintain the following implementations:

- `@macklinu/effect-web-astro`: bindings for the [Astro](https://astro.build/) framework
