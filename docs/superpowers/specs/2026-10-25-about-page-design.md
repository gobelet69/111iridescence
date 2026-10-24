# Refonte de la page À propos — design

## Intention

Faire de `/a-propos` le portrait anonyme et sincère de la personne derrière 111iridescence. La page raconte une curiosité ancienne, un parcours encore en construction, quatre terrains d’exploration et une manière de créer où l’IA est assumée comme partenaire de travail. Elle complète la vitrine produit sans devenir un CV ni une seconde page Apps.

## Contraintes

- Identité publique exclusivement « 111iridescence » ; aucune identité civile, localisation précise, photographie ou avatar inventé.
- Français, première personne, ton naturel et humble.
- Aucun statut d’expert, de chercheur confirmé ou d’entrepreneur.
- L’accueil, son animation et les pages produit ne changent pas.
- Astro, composants et variables existants ; aucune dépendance supplémentaire.
- Navigation clavier, contraste, `prefers-reduced-motion`, largeur minimale 320 px et absence de débordement horizontal.
- Les descriptions d’applications viennent de `src/data/apps.ts`, qui reflète les fonctionnalités et releases déjà vérifiées.

## Direction éditoriale

1. **Introduction** — « Curieux de nature. » établit immédiatement la présence d’une personne, son diplôme supérieur en informatique et son Master en cybersécurité.
2. **Origine** — la curiosité depuis l’enfance relie ordinateurs, développement, systèmes, réseaux et sécurité sans anecdote inventée.
3. **Explorations** — quatre chapitres : développement, cybersécurité, systèmes/homelab, interfaces/design.
4. **IA** — section centrale, honnête et non défensive, avec le cycle Idée → Expérimentation → Prototype → Tests → Améliorations.
5. **111iridescence** — explique l’identité de création et relie brièvement les deux applications actuelles.
6. **Principes** — curiosité, simplicité, performance, expérimentation comme préférences personnelles.
7. **Hors écran** — ski et escalade comme respiration humaine très courte.
8. **Conclusion** — ouverture sur ce qui reste à apprendre, liens vers `/apps` et GitHub.

## Direction visuelle

### Palette

- Encre : `#21182b` — typographie et section IA.
- Papier : `#f3eff4` — fond commun au site.
- Papier clair : `#faf8fa` — plans secondaires.
- Violet : `#b778c8` — curiosité et signal.
- Bleu : `#6272b5` — systèmes et liens.
- Corail : `#ed8d77` — détails humains et étapes.

### Typographie

`0xProto NF` porte les titres, numéros et repères techniques ; la police système du site porte les paragraphes. Les titres ont une échelle plus expressive que la page actuelle, mais les textes restent limités à environ 60 caractères par ligne.

### Composition

```text
┌────────────────────────────────────────────────────────┐
│ Derrière 111iridescence       · champ de pixels        │
│ Curieux de nature.            · signal abstrait        │
│ parcours + master                                      │
├───────────────┬────────────────────────────────────────┤
│ fil de signal │ Tout commence par la curiosité.        │
├───────────────┴────────────────────────────────────────┤
│ 01 Développement              texte                    │
│ 02 Cybersécurité                        texte          │
│ 03 Systèmes                   texte                    │
│ 04 Interfaces                           texte          │
├────────────────────────────────────────────────────────┤
│ SECTION SOMBRE : L’IA fait partie du processus.        │
│ Idée → Expérimentation → Prototype → Tests → Améliorer │
├────────────────────────────────────────────────────────┤
│ Pourquoi 111iridescence ?  | deux projets, très courts │
├────────────────────────────────────────────────────────┤
│ quatre principes en lignes | ski / escalade            │
├────────────────────────────────────────────────────────┤
│ Toujours quelque chose à explorer.        [liens]      │
└────────────────────────────────────────────────────────┘
```

L’alignement est majoritairement à gauche. Une alternance mesurée des colonnes crée du rythme, sans cartes répétitives. La section IA est le seul grand changement de matière : c’est le point fort visuel et éditorial. Un motif de pixels abstrait, dérivé de la matrice du hero, apparaît dans l’introduction et se prolonge comme un fil discret entre les sections.

### Mouvement

Une seule entrée orchestrée anime le titre et le motif du hero. Les interactions de liens restent légères. Aucun contenu ne dépend de l’animation ; le mouvement est neutralisé par `prefers-reduced-motion`.

## Architecture

- `src/data/pages/about.json` conserve le contenu éditable et le validateur d’anonymat existant, avec dix sections aux identifiants stables.
- `src/pages/a-propos.astro` orchestre la structure éditoriale et consomme `src/data/apps.ts` pour éviter toute duplication des informations produit.
- `src/components/about/AboutSignal.astro` dessine le motif abstrait accessible uniquement comme décoration.
- Les styles restent co-localisés dans la page et le composant, en réutilisant les tokens globaux.

## Anti-objectifs

Pas de portrait, badges de compétences, statistiques, barres de niveau, faux terminal, grande grille de cartes, arc-en-ciel agressif, glass omniprésent, CV chronologique ou prose marketing.

## Auto-critique d’unicité

La première piste utilisait des cartes translucides pour les quatre domaines ; elle a été rejetée car elle reproduisait un kit SaaS. La version retenue transforme les domaines en chapitres éditoriaux traversés par une même ligne de signal. Les numéros y indiquent un parcours de lecture réel, et non de simples badges décoratifs. La section IA reçoit le contraste principal parce qu’elle exprime le mieux la méthode personnelle demandée.
