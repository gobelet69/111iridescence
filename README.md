# 111iridescence

Source du site public [111iridescence.org](https://111iridescence.org) : accueil Astro, blog technique, projets et interface d'administration autonome sur `/admin`.

Le portail d'outils est déployé séparément depuis [`gobelet69/portail`](https://github.com/gobelet69/portail) et reste accessible sur [`/portail`](https://111iridescence.org/portail).

## Développement

```bash
npm ci
npm run dev
```

## Validation

```bash
SKIP_GITHUB_SYNC=1 npm test
npm audit --audit-level=high
SKIP_GITHUB_SYNC=1 npx wrangler deploy --dry-run
```

Le contenu public est versionné dans `src/data`. L'interface `/admin` modifie uniquement ces fichiers via l'API GitHub et nécessite une session administrateur fournie par l'authentification du portail.
