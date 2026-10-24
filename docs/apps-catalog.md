# Ajouter une application

Le catalogue public vient de `src/data/apps.ts`. Une application ajoutée à `apps` apparaît dans `/apps`; la route dynamique `src/pages/apps/[slug].astro` lui fournit ensuite une page produit.

## 1. Données

Ajouter un `AppDefinition` complet avec un `slug` unique, le nom, les textes, l’icône, les captures et leurs dimensions, les fonctionnalités, la plateforme, la compatibilité, l’architecture, le statut, le dépôt facultatif et les métadonnées SEO. Les claims doivent venir du code ou de la documentation de l’application.

## 2. Assets authentiques

Placer les fichiers sous `public/apps/<slug>/`. Garder les captures originales, sans contenu local ou privé visible, renseigner un texte alternatif précis et conserver leurs dimensions intrinsèques. Ajouter une image Open Graph dédiée dans le même dossier.

## 3. Composition

Créer une composition dans `src/components/apps/` si le produit a besoin d’un récit propre, puis l’associer dans `[slug].astro`. Les primitives `AppIcon`, `AppScreenshot`, `ProductFeatureList`, `ReleaseDownload` et `ProductJsonLd` restent communes; elles n’imposent pas une mise en page identique.

## 4. Release

Ajouter le slug au type `AppSlug`, puis définir `releasePolicy.acceptedAssets`. `src/lib/releases.ts` doit explicitement accepter les noms et formats autorisés; aucun asset arbitraire n’est publié. L’endpoint `/api/releases/<slug>` interroge la dernière release GitHub publique. Une release absente ou invalide garde le bouton « Bientôt disponible »; une release valide active le lien, la version, le format et les notes sans rebuild du site.

## 5. Publication

1. Ajouter les tests de catalogue, de normalisation de release et de page produit.
2. Tester le fallback et une réponse de release valide.
3. Exécuter `npm run check`, `npm run test:unit`, `npm run build`, `npm run test:e2e` et `npm run test:worker`.
4. Vérifier `/apps`, la page produit, le sitemap, les métadonnées, les liens, le clavier et les quatre formats de QA.
5. Publier seulement après contrôle visuel des captures et de la compatibilité annoncée.
