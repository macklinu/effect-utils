import * as Otlp from '@effect/opentelemetry/Otlp'
import type { HttpClient } from '@effect/platform'
import * as Config from 'effect/Config'
import * as ConfigError from 'effect/ConfigError'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

/**
 * Creates an OpenTelemetry layer from standard OpenTelemetry environment variables.
 *
 * Required environment variables:
 * - `OTEL_SERVICE_NAME`: The name of the service.
 * - `OTEL_EXPORTER_OTLP_ENDPOINT`: The endpoint for the OTLP exporter.
 */
export const layerOtel: Layer.Layer<
  never,
  ConfigError.ConfigError,
  HttpClient.HttpClient
> = Layer.unwrapEffect(
  Effect.gen(function* () {
    const serviceName = yield* Config.string('OTEL_SERVICE_NAME')
    const baseUrl = yield* Config.string('OTEL_EXPORTER_OTLP_ENDPOINT')

    return Otlp.layer({
      baseUrl,
      resource: { serviceName },
    })
  })
)
