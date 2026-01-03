import type { AstroGlobal } from 'astro'
import * as Effect from 'effect/Effect'

import * as RequestParams from '@macklinu/effect-web/RequestParams'

export const provideService = (Astro: AstroGlobal) =>
  Effect.provideService(RequestParams.RequestParams, Astro.params)
