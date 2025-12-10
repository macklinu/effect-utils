import * as NodeHttpServer from '@effect/platform-node/NodeHttpServer'
import * as Headers from '@effect/platform/Headers'
import * as HttpApi from '@effect/platform/HttpApi'
import * as HttpApiBuilder from '@effect/platform/HttpApiBuilder'
import * as HttpApiClient from '@effect/platform/HttpApiClient'
import * as HttpApiEndpoint from '@effect/platform/HttpApiEndpoint'
import * as HttpApiGroup from '@effect/platform/HttpApiGroup'
import { assert, describe, expect, it } from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Option from 'effect/Option'
import * as Schema from 'effect/Schema'

import * as TraceparentMiddleware from './TraceparentMiddleware'

describe('layer', () => {
  const Api = HttpApi.make('Api')
    .add(
      HttpApiGroup.make('users').add(
        HttpApiEndpoint.get('get')`/users`.addSuccess(Schema.Any)
      )
    )
    .middleware(TraceparentMiddleware.TraceparentMiddleware)

  const ApiLive = HttpApiBuilder.api(Api).pipe(
    Layer.provide(
      HttpApiBuilder.group(Api, 'users', (handlers) =>
        handlers.handle('get', () => Effect.succeed([]))
      )
    ),
    Layer.provide(TraceparentMiddleware.layer)
  )

  const HttpLive = HttpApiBuilder.serve().pipe(
    Layer.provide(ApiLive),
    Layer.provideMerge(NodeHttpServer.layerTest)
  )

  it.effect('adds traceparent header', () =>
    Effect.gen(function* () {
      const client = yield* HttpApiClient.make(Api)
      const [, response] = yield* client.users.get({ withResponse: true })
      const span = yield* Effect.currentSpan
      const traceparent = Headers.get(response.headers, 'traceparent')

      assert(Option.isSome(traceparent))

      expect(traceparent.value).toMatch(
        new RegExp(`00-${span.traceId}-.*-01`, 'i')
      )
    }).pipe(Effect.withSpan('span-for-testing'), Effect.provide(HttpLive))
  )
})
