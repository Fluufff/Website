# Flüüfff website 2026

## Quick start

- [Visit this site](https://fluufff.org)
- [Building this site](./docs/dev.md)

## Branches

- `main`: the primary branch, best to leave untouched when you are new.
- `next`: the development branch, pull requests should target this one.

## Fonts

Some fonts are not referenced by their string name but via var instead:

```diff
- font-family: "Inter", sans-serif;
+ font-family: var(--font-inter), sans-serif;
```

### Strapi

Some of the content comes from the CMS, the IT department can be contacted for a read-only API key.

Avoid adding those secrets to .env, instead you will want to create an .env.local file alongside it.

### Scoped css

Note that when css is scoped those classes cannot be used as inner/outer class on `Section` elements.

### Stack traces

The line numbers mentioned on that page might not point to the actual line of code,
if you are unable to find it there then search around based on the error message itself.
