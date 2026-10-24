# About Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire une page `/a-propos` personnelle, anonyme, éditoriale et responsive qui raconte le parcours et la méthode de création derrière 111iridescence.

**Architecture:** Le contenu principal reste dans le JSON À propos validé et administrable. La page Astro assemble ce contenu en sections spécialisées et réutilise le catalogue typé des apps ; un composant décoratif isolé porte le motif de signal.

**Tech Stack:** Astro 7, TypeScript, CSS natif, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-25-about-page-design.md`

## Global Constraints

- Aucune identité civile, coordonnée personnelle, localisation précise, photographie ou avatar.
- Ne pas modifier l’accueil, son animation, la navigation globale ni les pages produit.
- Aucune dépendance ajoutée.
- Respecter clavier, contraste, `prefers-reduced-motion`, 320 px minimum et les quatre viewports de QA.
- Ne décrire les applications qu’à partir de `src/data/apps.ts`.

## Review Focus

- Une donnée éditoriale privée doit être rejetée par le validateur et détectée dans le HTML public.
- Un identifiant de section manquant doit faire échouer explicitement le build, pas produire une section vide.
- Sans JavaScript ou avec mouvement réduit, tout le contenu reste lisible.
- À 320/390 px, les étapes IA, liens et titres ne débordent pas.
- La hiérarchie garde exactement un H1 et des H2/H3 ordonnés.

---

### Task 1: Contrat éditorial personnel

**Files:**
- Modify: `src/data/pages/about.json`
- Modify: `tests/unit/about.test.ts`
- Modify: `tests/e2e/about.spec.ts`

**Interfaces:**
- Consumes: `validateAboutPage(input): AboutPage`.
- Produces: dix sections stables accessibles par leur `id`.

- [ ] Écrire les assertions échouant sur le nouveau titre, le Master, les quatre explorations, l’IA, les activités hors écran et l’anonymat.
- [ ] Exécuter les tests unitaires et E2E ciblés pour constater l’échec éditorial.
- [ ] Remplacer le contenu JSON par le récit personnel validé, sans fait inventé.
- [ ] Exécuter les tests ciblés et vérifier leur réussite.
- [ ] Committer le contrat éditorial.

### Task 2: Composition et signal visuel

**Files:**
- Create: `src/components/about/AboutSignal.astro`
- Modify: `src/pages/a-propos.astro`
- Modify: `tests/e2e/about.spec.ts`

**Interfaces:**
- Consumes: sections JSON par identifiant et `apps: AppDefinition[]`.
- Produces: sections accessibles `origin`, `explorations`, `ai-process`, `identity`, `principles`, `beyond`, `closing`.

- [ ] Ajouter les tests échouant sur landmarks, titres ordonnés, étapes du processus, liens d’apps et absence de débordement.
- [ ] Vérifier l’échec avant implémentation.
- [ ] Construire le motif de signal décoratif, sans texte accessible ni JavaScript.
- [ ] Construire la page éditoriale et ses liens en réutilisant le catalogue d’apps.
- [ ] Ajouter les styles responsive, l’unique animation d’entrée et la variante mouvement réduit.
- [ ] Exécuter les tests ciblés et committer.

### Task 3: SEO, confidentialité et régressions

**Files:**
- Modify: `tests/e2e/accessibility.spec.ts`
- Modify: `tests/e2e/shell.spec.ts`
- Modify: `scripts/verify-built-site.mjs` si nécessaire.

**Interfaces:**
- Consumes: HTML final de `/a-propos`.
- Produces: preuves d’accessibilité, métadonnées anonymes et liens valides.

- [ ] Ajouter les assertions sur description SEO, canonical, absence d’identité civile et navigation sans JavaScript.
- [ ] Exécuter les tests pour constater les écarts éventuels.
- [ ] Corriger uniquement les écarts révélés.
- [ ] Exécuter `astro check`, unitaires, build, E2E, Worker et vérificateur de liens.
- [ ] Committer les garanties finales.

### Task 4: QA visuelle et itérations

**Files:**
- Create: `outputs/qa/about/` (hors dépôt, livrable utilisateur)
- Modify: snapshots Playwright pertinents.

**Interfaces:**
- Consumes: build local final.
- Produces: captures 1440×900, 1280×800, 768×1024 et 390×844 avec rapport de revue.

- [ ] Capturer la page complète aux quatre tailles et les zones hero, IA et conclusion.
- [ ] Examiner hiérarchie, rythme, longueurs de ligne, contrastes, footer et débordements.
- [ ] Corriger les défauts constatés et renouveler les captures.
- [ ] Exécuter une dernière fois la suite complète et `git diff --check`.
- [ ] Committer les snapshots et documenter les résultats.
