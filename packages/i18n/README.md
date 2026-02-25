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

3. Add locale metadata to each locale's file:
   ```json
   {
      "locale_en": "English",
      "locale_de": "Deutsch"
   }
   ```

## Translation Format

Translations use flat keys with underscores for organization. This approach is recommended by Paraglide JS for better IDE support, tree-shaking, and consistency across tooling.

Example:

```json
{
   "navigation_home": "Home",
   "navigation_schedule": "Schedule",
   "home_welcome": "Welcome, {name}!",
   "signup_pageTitle": "Complete Signup"
}
```

Usage in components:

```svelte
<script>
   import { m } from "$i18n/messages";
</script>

<!-- Direct access for lowercase+underscore keys -->
<h1>{m.navigation_home()}</h1>

<!-- Bracket notation for keys with camelCase -->
<p>{m["common_appName"]()}</p>

<!-- With parameters -->
<p>{m.home_welcome({ name: "User" })}</p>
```

## Key Naming Convention

- Use lowercase letters and underscores: `navigation_home`, `signup_pageTitle`
- CamelCase parts in keys require bracket notation access: `m["navigation_myLibrary"]()`
- All-lowercase+underscore keys can use dot notation: `m.navigation_home()`

## Regenerating Translations

The Vite plugin automatically regenerates translation functions when message files change. Run the dev server or build to trigger regeneration.
