# @ota/i18n

Internationalization package for osu! Tournament Arena using [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs).

## Structure

```
@ota/i18n/
├── messages/           # Translation files
│   └── en.json        # English translations
├── project.inlang/    # inlang configuration
│   └── settings.json
└── package.json
```

## How It Works

This package contains the shared translation files and inlang configuration. The actual compilation happens in the consuming app (e.g., `@ota/web`) via the Paraglide Vite plugin.

1. **Translation files** are stored in `messages/{locale}.json`
2. The **inlang project** is configured in `project.inlang/settings.json`
3. Each app compiles translations at build time using `paraglideVitePlugin`

## Adding a New Language

1. Add the locale to `project.inlang/settings.json`:

   ```json
   {
      "locales": ["en", "de"]
   }
   ```

2. Create a new translation file `messages/de.json`

3. Add locale metadata to `messages/en.json` (or each locale's file):
   ```json
   {
      "locale": {
         "en": "English",
         "de": "Deutsch"
      }
   }
   ```

## Translation Format

Translations use the inlang message format with support for:

- **Variables**: `{name}` in message text
- **Nested keys**: Organize translations in nested objects
- **Pluralization**: Complex messages with variants

Example:

```json
{
   "home": {
      "welcome": "Welcome, {name}!"
   }
}
```

Usage in components:

```svelte
<script>
   import { m } from "$lib/paraglide/messages.js";
</script>

<h1>{m["home.welcome"]({ name: "User" })}</h1>
```

## Regenerating Translations

The Vite plugin automatically regenerates translation functions when message files change. Run the dev server or build to trigger regeneration.
