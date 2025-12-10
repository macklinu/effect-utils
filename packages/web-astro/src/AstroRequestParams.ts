import type { AstroGlobal } from 'astro'
import * as Layer from 'effect/Layer'

import * as RequestParams from '@macklinu/effect-web/RequestParams'

export const layer = (Astro: AstroGlobal) =>
  Layer.succeed(RequestParams.RequestParams, Astro.params)
