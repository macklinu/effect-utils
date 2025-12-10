import type { AstroGlobal } from 'astro'
import * as Layer from 'effect/Layer'

import * as AstroRequestParams from './AstroRequestParams'
import * as AstroServerRequest from './AstroServerRequest'
import * as AstroServerResponse from './AstroServerResponse'

export const layerRequest = (Astro: AstroGlobal) =>
  AstroRequestParams.layer(Astro).pipe(
    Layer.provideMerge(AstroServerRequest.layer(Astro)),
    Layer.provideMerge(AstroServerResponse.layer(Astro))
  )
