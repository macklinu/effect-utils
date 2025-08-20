import * as HttpApiMiddleware from '@effect/platform/HttpApiMiddleware'
import * as HttpApp from '@effect/platform/HttpApp'
import * as HttpServerResponse from '@effect/platform/HttpServerResponse'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

export class TraceparentMiddleware extends HttpApiMiddleware.Tag<TraceparentMiddleware>()(
  'HttpMiddleware/TraceparentMiddleware',
  {
    optional: true,
  }
) {}

export const layer = Layer.succeed(
  TraceparentMiddleware,
  Effect.gen(function* () {
    const span = yield* Effect.currentSpan
    const traceparent = `00-${span.traceId}-${span.spanId}-01`

    yield* HttpApp.appendPreResponseHandler((_, response) =>
      HttpServerResponse.setHeader(response, 'traceparent', traceparent)
    )
  })
)
