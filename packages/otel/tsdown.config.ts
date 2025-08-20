import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/*.ts'],
  format: ['esm'],
  dts: { sourcemap: true },
  sourcemap: true,
  attw: { profile: 'esmOnly' },
})
