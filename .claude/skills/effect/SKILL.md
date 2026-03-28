---
name: effect
description: Consult the Effect TypeScript library source code for API reference, patterns, and usage examples. Use when asked about Effect APIs, writing Effect code, debugging Effect patterns, or exploring what's available in the Effect ecosystem.
---

Answer questions about the [Effect](https://github.com/effect-ts/effect) TypeScript library by consulting its **actual source code** in a local clone. The source is always more up-to-date than docs websites or LLM training data.

> **Version note:** This skill covers **Effect v3 (stable)** only. Effect v4 is in development at a separate repo (`Effect-TS/effect-smol`) and is not yet used in this project. Do not reference v4 APIs or the `effect-smol` repo. When this project migrates to v4, this skill will be updated.

## 1. Ensure the local repo is up-to-date

Before inspecting any source, run these steps:

```sh
# Clone if missing
if [ ! -d ~/.local/share/repos/effect-ts/effect ]; then
  git clone https://github.com/effect-ts/effect.git ~/.local/share/repos/effect-ts/effect
fi

# Always pull latest main
git -C ~/.local/share/repos/effect-ts/effect pull origin main
```

The repo lives at `~/.local/share/repos/effect-ts/effect`. All file reads below are relative to that root.

## 2. Repo layout

```
packages/
├── effect/              # Core: Effect, Schema, Context, Layer, Data, Stream, etc.
├── platform/            # Platform-agnostic HTTP, FileSystem, Terminal, etc.
├── platform-node/       # Node.js implementations of platform services
├── platform-bun/        # Bun implementations of platform services
├── platform-browser/    # Browser implementations of platform services
├── vitest/              # Effect-aware Vitest test utilities
├── cli/                 # CLI framework
├── cluster/             # Distributed systems primitives
├── experimental/        # Experimental modules
├── opentelemetry/       # OpenTelemetry integration
├── rpc/                 # RPC framework
├── sql/                 # SQL client abstraction
├── sql-pg/              # PostgreSQL SQL implementation
├── sql-sqlite-node/     # SQLite (Node) implementation
├── ai/                  # AI/LLM integration
├── workflow/            # Workflow engine
├── printer/             # Pretty-printer
├── printer-ansi/        # ANSI pretty-printer
├── typeclass/           # Typeclass definitions
└── ...                  # Additional SQL drivers, etc.
```

### Within each package

| Path                           | Contents                                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| `packages/<pkg>/src/*.ts`      | **Public API** — type signatures, JSDoc comments, re-exports. This is the primary reference.   |
| `packages/<pkg>/src/internal/` | **Implementations** — consult when you need to understand runtime behavior beyond types/JSDoc. |
| `packages/<pkg>/test/`         | **Tests** — excellent usage examples showing real patterns.                                    |

## 3. How to answer Effect questions

### Identify the right package

| If the question involves…                                                                                                                                                                      | Look in                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `Effect`, `Schema`, `Context`, `Layer`, `Data`, `Stream`, `Match`, `ManagedRuntime`, `Option`, `Either`, `Cause`, `Exit`, `Fiber`, `Schedule`, `Scope`, `Ref`, `Queue`, `PubSub`, `Pool`, etc. | `packages/effect/`         |
| `HttpClient`, `HttpServer`, `HttpApi`, `FileSystem`, `Command`, `Socket`, `Terminal`, `KeyValueStore`, `Worker`, etc.                                                                          | `packages/platform/`       |
| Node.js-specific platform layers                                                                                                                                                               | `packages/platform-node/`  |
| `it.effect`, `it.scoped`, test helpers                                                                                                                                                         | `packages/vitest/`         |
| CLI commands, options, args                                                                                                                                                                    | `packages/cli/`            |
| SQL queries, transactions                                                                                                                                                                      | `packages/sql/`            |
| Any other module                                                                                                                                                                               | List `packages/` directory |

### Steps to find an answer

1. **Read the public API file** — e.g., for `Effect.fn`, read `packages/effect/src/Effect.ts` and search for `export const fn` or the function name. The JSDoc on each export is the authoritative documentation.
2. **Check tests for usage examples** — e.g., `packages/effect/test/Effect/` or `packages/effect/test/Schema.test.ts`. Tests demonstrate real usage patterns and edge cases.
3. **Consult internals when needed** — if the public API file doesn't fully explain behavior, read the implementation in `packages/<pkg>/src/internal/`.
4. **Use grep liberally** — the codebase is large. Use grep/search tools like `rg` and `fd` to find specific function names, type names, or patterns across files.

### Important conventions in the Effect codebase

- **Dual APIs** — many functions support both `data-first` and `data-last` (pipeable) styles via the `dual` helper. When you see `dual(arity, implementation)`, the function can be called as `fn(data, args)` or `pipe(data, fn(args))`.
- **Namespace re-exports** — the public `src/*.ts` files re-export from `internal/`. The public file is the API contract; internal is the implementation.
- **`@since` tags** — JSDoc `@since` annotations indicate when an API was added. Use these to determine availability.
- **`@experimental` tags** — APIs marked `@experimental` may change without notice.
- **`@category` tags** — JSDoc `@category` annotations group related functions (e.g., `constructors`, `combinators`, `destructors`, `models`).
