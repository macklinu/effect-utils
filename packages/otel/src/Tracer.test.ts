import * as FetchHttpClient from '@effect/platform/FetchHttpClient'
import { assert, describe, expect, it } from '@effect/vitest'
import * as Cause from 'effect/Cause'
import * as ConfigError from 'effect/ConfigError'
import * as ConfigProvider from 'effect/ConfigProvider'
import * as Effect from 'effect/Effect'
import * as Exit from 'effect/Exit'
import * as Layer from 'effect/Layer'

import * as Tracer from './Tracer'

describe('layerOtel', () => {
  const OtelLive = Layer.provide(Tracer.layerOtel, FetchHttpClient.layer)

  const createProgram = (configMap: Map<string, string>) =>
    Effect.succeed(1).pipe(
      Effect.provide(OtelLive),
      Effect.withConfigProvider(ConfigProvider.fromMap(configMap))
    )

  it('fails to create layer when OTEL_SERVICE_NAME is missing', async () => {
    const exit = await Effect.runPromiseExit(
      createProgram(
        new Map([['OTEL_EXPORTER_OTLP_ENDPOINT', 'http://localhost:4318']])
      )
    )

    assert(Exit.isFailure(exit))

    expect(exit.cause).toEqual(
      Cause.fail(
        ConfigError.MissingData(
          ['OTEL_SERVICE_NAME'],
          'Expected OTEL_SERVICE_NAME to exist in the provided map'
        )
      )
    )
  })

  it('fails to create layer when OTEL_EXPORTER_OTLP_ENDPOINT is missing', async () => {
    const exit = await Effect.runPromiseExit(
      createProgram(new Map([['OTEL_SERVICE_NAME', 'my-service']]))
    )

    assert(Exit.isFailure(exit))

    expect(exit.cause).toEqual(
      Cause.fail(
        ConfigError.MissingData(
          ['OTEL_EXPORTER_OTLP_ENDPOINT'],
          'Expected OTEL_EXPORTER_OTLP_ENDPOINT to exist in the provided map'
        )
      )
    )
  })

  it('succeeds when all required environment variables are provided', async () => {
    const exit = await Effect.runPromiseExit(
      createProgram(
        new Map([
          ['OTEL_SERVICE_NAME', 'my-service'],
          ['OTEL_EXPORTER_OTLP_ENDPOINT', 'http://localhost:4318'],
        ])
      )
    )

    assert(Exit.isSuccess(exit))
  })
})
