import type { AstroGlobal, AstroSharedContext } from 'astro'
import * as Effect from 'effect/Effect'

import * as AstroRequestParams from './AstroRequestParams'
import * as AstroServerRequest from './AstroServerRequest'
import * as AstroServerResponse from './AstroServerResponse'

export const provideService =
  (Astro: AstroGlobal) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(
      AstroRequestParams.provideService(Astro),
      AstroServerRequest.provideService(Astro),
      AstroServerResponse.provideService(Astro)
    )

export const provideServiceApiRoute =
  (Astro: AstroSharedContext) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(
      AstroRequestParams.provideService(Astro),
      AstroServerRequest.provideService(Astro)
    )
