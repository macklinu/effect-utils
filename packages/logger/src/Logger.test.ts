import { describe, expect, it } from '@effect/vitest'
import * as ConfigError from 'effect/ConfigError'
import * as ConfigProvider from 'effect/ConfigProvider'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Logger from 'effect/Logger'

import { layerFromDebug, layerFromNodeEnv } from './Logger'

const exerciseLogger = Effect.fnUntraced(
  function* (
    loggerLayer: Layer.Layer<never, ConfigError.ConfigError, never>,
    _configMap: Map<string, string>
  ) {
    const c = yield* Effect.console
    const logs: Array<{ level: string; value: unknown }> = []
    const pusher = (level: string) => (value: unknown) => {
      logs.push({ level, value })
    }
    const newConsole: typeof c = {
      ...c,
      unsafe: {
        ...c.unsafe,
        log: pusher('log'),
        warn: pusher('warn'),
        error: pusher('error'),
        info: pusher('info'),
        debug: pusher('debug'),
        trace: pusher('trace'),
      },
    }

    const logger = Logger.make((o) => String(o.message)).pipe(
      Logger.withLeveledConsole
    )
    yield* Effect.gen(function* () {
      yield* Effect.log('log plain')
      yield* Effect.logInfo('log info')
      yield* Effect.logWarning('log warn')
      yield* Effect.logError('log err')
      yield* Effect.logFatal('log fatal')
      yield* Effect.logDebug('log debug')
      yield* Effect.logTrace('log trace')
    }).pipe(
      Effect.provide(
        Layer.mergeAll(
          Logger.replace(Logger.defaultLogger, logger),
          loggerLayer
        )
      ),
      Effect.withConsole(newConsole)
    )

    return logs
  },
  (effect, _layer, configMap) =>
    Effect.withConfigProvider(effect, ConfigProvider.fromMap(configMap))
)

describe('layerFromDebug', () => {
  it.effect('omits debug and trace logs when DEBUG=false', () =>
    Effect.gen(function* () {
      const logs = yield* exerciseLogger(
        layerFromDebug,
        new Map([['DEBUG', 'false']])
      )

      expect(logs).toEqual([
        {
          level: 'info',
          value: 'log plain',
        },
        {
          level: 'info',
          value: 'log info',
        },
        {
          level: 'warn',
          value: 'log warn',
        },
        {
          level: 'error',
          value: 'log err',
        },
        {
          level: 'error',
          value: 'log fatal',
        },
      ])
    })
  )

  it.effect('includes debug and trace logs when DEBUG=true', () =>
    Effect.gen(function* () {
      const logs = yield* exerciseLogger(
        layerFromDebug,
        new Map([['DEBUG', 'true']])
      )

      expect(logs).toEqual([
        {
          level: 'info',
          value: 'log plain',
        },
        {
          level: 'info',
          value: 'log info',
        },
        {
          level: 'warn',
          value: 'log warn',
        },
        {
          level: 'error',
          value: 'log err',
        },
        {
          level: 'error',
          value: 'log fatal',
        },
        {
          level: 'debug',
          value: 'log debug',
        },
        {
          level: 'trace',
          value: 'log trace',
        },
      ])
    })
  )
})

describe('layerFromNodeEnv', () => {
  it.effect('logs nothing when NODE_ENV=test', () =>
    Effect.gen(function* () {
      const logs = yield* exerciseLogger(
        layerFromNodeEnv,
        new Map([['NODE_ENV', 'test']])
      )

      expect(logs).toEqual([])
    })
  )

  it.effect('logs everything when NODE_ENV=development', () =>
    Effect.gen(function* () {
      const logs = yield* exerciseLogger(
        layerFromNodeEnv,
        new Map([['NODE_ENV', 'development']])
      )

      expect(logs).toEqual([
        {
          level: 'info',
          value: 'log plain',
        },
        {
          level: 'info',
          value: 'log info',
        },
        {
          level: 'warn',
          value: 'log warn',
        },
        {
          level: 'error',
          value: 'log err',
        },
        {
          level: 'error',
          value: 'log fatal',
        },
        {
          level: 'debug',
          value: 'log debug',
        },
        {
          level: 'trace',
          value: 'log trace',
        },
      ])
    })
  )

  it.effect('logs info levels when NODE_ENV=production', () =>
    Effect.gen(function* () {
      const logs = yield* exerciseLogger(
        layerFromNodeEnv,
        new Map([['NODE_ENV', 'production']])
      )

      expect(logs).toEqual([
        {
          level: 'info',
          value: 'log plain',
        },
        {
          level: 'info',
          value: 'log info',
        },
        {
          level: 'warn',
          value: 'log warn',
        },
        {
          level: 'error',
          value: 'log err',
        },
        {
          level: 'error',
          value: 'log fatal',
        },
      ])
    })
  )
})
