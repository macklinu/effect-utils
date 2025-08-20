import * as Config from 'effect/Config'
import type * as ConfigError from 'effect/ConfigError'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Logger from 'effect/Logger'
import * as LogLevel from 'effect/LogLevel'

/**
 * Creates an Effect Logger with the minimum log level determined by the DEBUG
 * environment variable.
 *
 * When `DEBUG=true`, all log messages are printed.
 * Otherwise, the default log level is set to `LogLevel.Info`.
 */
export const layerFromDebug: Layer.Layer<
  never,
  ConfigError.ConfigError,
  never
> = Layer.unwrapEffect(
  Effect.gen(function* () {
    const debug = yield* Config.boolean('DEBUG').pipe(Config.withDefault(false))

    const level = debug ? LogLevel.All : LogLevel.Info
    return Logger.minimumLogLevel(level)
  })
)
