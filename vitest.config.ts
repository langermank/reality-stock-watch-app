import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['lib/**/*.test.ts'],
    environment: 'node',
  },
  // Mirror the tsconfig `@/* -> ./*` alias so tests can import modules by their
  // `@/...` paths (matching app code) rather than brittle relative paths.
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
})
