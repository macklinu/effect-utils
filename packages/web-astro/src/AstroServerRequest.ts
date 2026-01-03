import * as HttpServerRequest from '@effect/platform/HttpServerRequest'
import type { AstroGlobal, AstroSharedContext } from 'astro'
import * as Effect from 'effect/Effect'

import * as ServerRequest from '@macklinu/effect-web/ServerRequest'

export const provideService = (Astro: AstroGlobal | AstroSharedContext) =>
  Effect.provideService(
    ServerRequest.ServerRequest,
    HttpServerRequest.fromWeb(Astro.request)
  )
