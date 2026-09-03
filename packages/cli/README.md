# Atronix UI CLI

Official command-line interface for **Atronix UI** — Sovereign Physical Realism & Liquid Glass UI Library.

## Quick Start

Add any component directly to your React, Next.js, or Vite project:

```bash
npx atronix add orbit-globe
npx atronix add pendant-lamp
npx atronix add liquid-mitosis
npx atronix add aero-core
```

## List All Available Components

```bash
npx atronix list
```

## Publishing to NPM

To publish this package so anyone globally can run `npx atronix add ...`:

1. Log into npm:
   ```bash
   npm login
   ```

2. Publish from the `packages/cli` directory:
   ```bash
   cd packages/cli
   npm publish --access public
   ```
