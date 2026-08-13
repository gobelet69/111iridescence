---
title: Vault
description: Interface personnelle de fichiers et de notes, avec métadonnées D1 et stockage R2.
slug: vault
repo: gobelet69/portail-vault
stack:
  - JavaScript
  - React
  - Cloudflare Workers
  - D1
  - R2
status: actif
featured: true
order: 1
caseStudy: true
---

## Contexte

Vault rassemble des fichiers et des notes dans une interface web personnelle. Le dépôt public décrit une application React, un éditeur Monaco et un Worker Cloudflare ; les métadonnées sont conservées dans D1 et les fichiers dans R2.

## Architecture

Le navigateur charge l’interface React. Le Worker sert l’application et porte les opérations sur les contenus, avec une séparation entre les métadonnées structurées et les fichiers eux-mêmes.

## Intégration au portail

Sur ce site, Vault reste un outil secondaire. Son interface et ses ressources sont préparées pendant le build puis servies sous `/portail/vault`, derrière l’authentification commune du portail. L’ancienne route racine n’est plus exposée.

## Limites actuelles

L’outil nécessite une session authentifiée. Son intégration dépend aussi des ressources produites par le dépôt Vault au moment du build ; une publication doit donc vérifier le bundle réel, pas uniquement la page d’entrée.
