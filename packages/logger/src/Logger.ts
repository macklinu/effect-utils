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

/**
 * Creates an Effect Logger with the minimum log level determined by the NODE_ENV
 * environment variable.
 *
 * When `NODE_ENV=development`, all log messages are printed.
 * When `NODE_ENV=test`, no log messages are printed.
 * Otherwise, the default log level is set to `LogLevel.Info`.
 */
export const layerFromNodeEnv: Layer.Layer<
  never,
  ConfigError.ConfigError,
  never
> = Layer.unwrapEffect(
  Effect.gen(function* () {
    const nodeEnv = yield* Config.string('NODE_ENV').pipe(
      Config.withDefault('production')
    )

    switch (nodeEnv) {
      case 'development':
        return Logger.minimumLogLevel(LogLevel.All)
      case 'test':
        return Logger.minimumLogLevel(LogLevel.None)
      case 'production':
      default:
        return Logger.minimumLogLevel(LogLevel.Info)
    }
  })
)
