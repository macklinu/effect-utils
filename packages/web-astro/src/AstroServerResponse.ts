import * as HttpServerResponse from '@effect/platform/HttpServerResponse'
import type { AstroGlobal } from 'astro'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import * as ServerResponse from '@macklinu/effect-web/ServerResponse'

export const layer = (Astro: AstroGlobal) =>
  Layer.effect(
    ServerResponse.ServerResponse,
    Effect.gen(function* () {
      let response = HttpServerResponse.empty().pipe(
        HttpServerResponse.setHeaders(Astro.response.headers)
      )

      if (Astro.response.status) {
        response = yield* HttpServerResponse.setStatus(
          response,
          Astro.response.status
        )
      }

      return response
    })
  )
