# Build Toolchain

Vite + React + TypeScript + Tailwind 3 + PostCSS.

## File(s)

- [package.json](../../package.json) — dependencies + scripts
- [vite.config.ts](../../vite.config.ts) — Vite config
- [tailwind.config.js](../../tailwind.config.js) — Tailwind config + theme tokens
- [postcss.config.js](../../postcss.config.js) — PostCSS pipeline
- [tsconfig.json](../../tsconfig.json), [tsconfig.app.json](../../tsconfig.app.json), [tsconfig.node.json](../../tsconfig.node.json) — TypeScript configs

## Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `vite` | Local dev server (port 5173 by default, falls back to 5174 if busy) |
| `npm run build` | `tsc -b && vite build` | Typecheck then produce `dist/` |
| `npm run preview` | `vite preview` | Serve the built `dist/` locally |

## Dependencies

### Runtime

- `react` ^18.3.1
- `react-dom` ^18.3.1
- `framer-motion` ^11.11.17 — **installed but not currently imported by any component.** Kept for potential future use; can be removed if confirmed unused after another audit pass.

### Dev

- `vite` ^5.4.11
- `@vitejs/plugin-react` ^4.3.3
- `tailwindcss` ^3.4.15
- `postcss` ^8.4.49
- `autoprefixer` ^10.4.20
- `typescript` ^5.6.3
- `@types/react`, `@types/react-dom`

## Vite config

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

Stock React + Vite. No path aliases, no proxy, no custom build options.

## Tailwind config

```js
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { /* see foundation/design-tokens.md */ },
      fontFamily: { display: [...], sans: [...], mono: [...] },
      letterSpacing: { widest: '0.3em', ultrawide: '0.42em' },
    },
  },
  plugins: [],
};
```

`darkMode: 'class'` enables the `.dark` selector mechanism — see [theming.md](../foundation/theming.md).

`content` glob excludes `specs/**/*.md` (only `.html`/`.tsx`/etc. are scanned for class names). This means Tailwind classes mentioned only in spec files will NOT be emitted — when documenting a class, also use it somewhere in code.

## PostCSS config

```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

Standard Tailwind + Autoprefixer pipeline.

## TypeScript

- `tsconfig.json` — project references (`tsconfig.app.json` for app code, `tsconfig.node.json` for Vite config).
- Strict mode on.
- `tsbuildinfo` files are gitignored (`*.tsbuildinfo`).

## Output

`vite build` produces `dist/`:
- `dist/index.html`
- `dist/assets/*` — hashed JS, CSS, and font assets.

`dist/` is gitignored. Vercel and Netlify both build from source on push.

## Boundary

You may change in this spec:
- Bumping minor dependency versions.
- Adding Vite plugins (declare them here).
- Adding Tailwind plugins (declare them here AND in [design-tokens.md](../foundation/design-tokens.md) if they introduce new tokens).
- Adding path aliases in Vite + tsconfig (declare here).

You must update *other specs* before changing:
- Bumping Tailwind to v4 — opacity utility handling changes; touches [design-tokens.md](../foundation/design-tokens.md).
- Removing `darkMode: 'class'` — touches [theming.md](../foundation/theming.md).
- Removing `framer-motion` — confirm no inflight component imports it.

## Out of scope

- Color tokens — [design-tokens.md](../foundation/design-tokens.md).
- Fonts — [typography.md](../foundation/typography.md).
- Deployment configs — [deployment.md](deployment.md).
