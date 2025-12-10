import * as HttpServerRequest from '@effect/platform/HttpServerRequest'
import type { AstroGlobal } from 'astro'
import * as Layer from 'effect/Layer'

import * as ServerRequest from '@macklinu/effect-web/ServerRequest'

export const layer = (Astro: AstroGlobal) =>
  Layer.succeed(
    ServerRequest.ServerRequest,
    HttpServerRequest.fromWeb(Astro.request)
  )
