---
format: article
title: Pourquoi ce site reste statique
description: Le découpage retenu entre pages Astro statiques et applications servies par le Worker Cloudflare.
slug: pourquoi-ce-site-reste-statique
theme: systemes
tags: [astro, cloudflare-workers, architecture-web]
publishedAt: '2026-08-11T18:30:00+02:00'
draft: false
---

## Deux surfaces, un domaine

Le contenu public est construit à l'avance. Les outils authentifiés restent pris en charge par le Worker.

> **La frontière utile** — Une page de lecture n'a pas besoin du même cycle d'exécution qu'une application avec session.

## Ce qui reste dynamique

Les sessions, les API et les outils du portail conservent leur exécution côté Worker.

```js
const route = matchPortalRoute(url.pathname);
const app = route ? APPS[route.slug] : null;
if (!app) return env.ASSETS.fetch(request);
```

## Pourquoi garder cette séparation

Elle limite le JavaScript envoyé aux lecteurs sans contraindre les applications qui en ont besoin.
