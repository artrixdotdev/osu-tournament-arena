# @ota/tailwind-config

Shared Tailwind CSS configuration for the monorepo.

## Usage

Import the theme in your CSS:

```css
@import "@ota/tailwind-config/theme";
```

Use the PostCSS config in your `postcss.config.js`:

```js
import config from "@ota/tailwind-config/postcss-config";

export default config;
```

## Exports

| Export                                | Description                |
| ------------------------------------- | -------------------------- |
| `@ota/tailwind-config/theme`          | Shared CSS theme variables |
| `@ota/tailwind-config/postcss-config` | PostCSS configuration      |
