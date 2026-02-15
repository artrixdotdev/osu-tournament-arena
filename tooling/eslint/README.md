# @ota/eslint-config

Shared ESLint configuration for the monorepo.

## Usage

Extend in your `eslint.config.js`:

```js
import eslintConfig from "@ota/eslint-config/base";

export default eslintConfig;
```

For Svelte projects:

```js
import eslintConfig from "@ota/eslint-config/svelte";

export default eslintConfig;
```

## Included Plugins

- `@eslint/js` - Base ESLint rules
- `typescript-eslint` - TypeScript support
- `eslint-plugin-svelte` - Svelte support
- `eslint-plugin-import` - Import ordering
- `eslint-plugin-turbo` - Turborepo specific rules
