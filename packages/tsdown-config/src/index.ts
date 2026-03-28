import { defineConfig, type UserConfig } from 'tsdown/config'

export const defineLibraryConfig = (options?: Partial<UserConfig>) =>
  defineConfig({
    entry: ['./src/!(*.test).ts'],
    exports: {
      all: true,
      devExports: '@macklinu/source',
    },
    format: ['esm'],
    dts: {
      sourcemap: true,
    },
    sourcemap: true,
    attw: {
      profile: 'esm-only',
    },
    ...options,
  })
