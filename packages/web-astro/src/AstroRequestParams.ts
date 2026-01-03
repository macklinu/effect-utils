import type { AstroGlobal, AstroSharedContext } from 'astro'
import * as Effect from 'effect/Effect'

import * as RequestParams from '@macklinu/effect-web/RequestParams'

export const provideService = (Astro: AstroGlobal | AstroSharedContext) =>
  Effect.provideService(RequestParams.RequestParams, Astro.params)
