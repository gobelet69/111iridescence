export type AppSlug = 'iridescence-pdf-reader' | 'mass-print';
export type PublicationStatus = 'available' | 'coming-soon';
export type AcceptedAsset = 'dmg' | 'macos-zip' | 'universal-dmg';

export interface AppScreenshot {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export interface AppFeature {
  title: string;
  description: string;
}

export interface AppSection {
  id: string;
  title: string;
  description: string;
  screenshot?: string;
}

export interface ReleasePolicy {
  acceptedAssets: AcceptedAsset[];
}

export interface AppDefinition {
  slug: AppSlug;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  longDescription: string;
  icon: string;
  accent: 'iris' | 'blue';
  platform: 'macOS';
  compatibility: string;
  architecture: string;
  publicationStatus: PublicationStatus;
  repository: `gobelet69/${string}`;
  releasePolicy: ReleasePolicy;
  primaryScreenshot: AppScreenshot;
  screenshots: AppScreenshot[];
  features: AppFeature[];
  sections: AppSection[];
  seo: {
    title: string;
    description: string;
    image: string;
  };
}

export const apps: AppDefinition[] = [
  {
    slug: 'iridescence-pdf-reader',
    name: 'Iridescence PDF Reader',
    shortName: 'PDF Reader',
    tagline: 'Lire vite. Rester concentré.',
    description: 'Un lecteur PDF natif pour macOS, conçu pour une lecture rapide, fluide et sans distraction.',
    longDescription: 'Ouvrez un document ou tout un espace de travail, retrouvez instantanément ce que vous cherchez et annotez sans quitter une interface résolument macOS.',
    icon: '/apps/iridescence-pdf-reader/icon.png',
    accent: 'iris',
    platform: 'macOS',
    compatibility: 'macOS 14 ou version ultérieure',
    architecture: 'Apple Silicon',
    publicationStatus: 'coming-soon',
    repository: 'gobelet69/iridecence-pdf-reader',
    releasePolicy: { acceptedAssets: ['dmg', 'macos-zip'] },
    primaryScreenshot: {
      src: '/apps/iridescence-pdf-reader/reader-workspace-light.png',
      alt: 'Fenêtre principale d’Iridescence PDF Reader avec l’espace de travail, le document et l’inspecteur.',
      width: 2200,
      height: 1400,
    },
    screenshots: [
      {
        src: '/apps/iridescence-pdf-reader/reader-workspace-light.png',
        alt: 'Espace de travail d’Iridescence PDF Reader en mode clair.',
        width: 2200,
        height: 1400,
        caption: 'Un document, son dossier et ses repères dans une même fenêtre.',
      },
      {
        src: '/apps/iridescence-pdf-reader/tabs.png',
        alt: 'Plusieurs documents PDF ouverts dans des onglets natifs.',
        width: 2200,
        height: 1400,
        caption: 'Chaque onglet conserve sa position, son zoom et ses annotations.',
      },
      {
        src: '/apps/iridescence-pdf-reader/annotations.png',
        alt: 'Une annotation et la liste des commentaires dans l’inspecteur.',
        width: 2200,
        height: 1400,
        caption: 'Surlignages, soulignements, barrés et commentaires PDFKit.',
      },
      {
        src: '/apps/iridescence-pdf-reader/palette-command.png',
        alt: 'Palette de commandes inspirée de Spotlight.',
        width: 1240,
        height: 792,
        caption: 'Commandes, recherche, fichiers et pages depuis le clavier.',
      },
      {
        src: '/apps/iridescence-pdf-reader/ocr-panel.png',
        alt: 'Texte reconnu par Apple Vision dans le panneau OCR.',
        width: 1280,
        height: 1000,
        caption: 'Le texte d’un scan devient sélectionnable, copiable et exportable.',
      },
      {
        src: '/apps/iridescence-pdf-reader/settings.png',
        alt: 'Réglages natifs d’Iridescence PDF Reader.',
        width: 1040,
        height: 846,
        caption: 'Lecture, espaces de travail et confidentialité restent configurables.',
      },
    ],
    features: [
      { title: 'Natif, vraiment', description: 'Rust pilote directement AppKit et PDFKit : pas d’Electron, pas de couche web.' },
      { title: 'Espaces de travail', description: 'Parcourez les dossiers, suivez l’état iCloud et indexez vos PDF en arrière-plan.' },
      { title: 'Plusieurs documents', description: 'Des onglets indépendants gardent position, zoom, historique et modifications.' },
      { title: 'Lecture active', description: 'Sommaire, miniatures, recherche, signets, annotations et commentaires restent proches.' },
      { title: 'Palette rapide', description: 'Ouvrez une commande, un fichier, une recherche ou une page comme dans Spotlight.' },
      { title: 'OCR Apple Vision', description: 'Reconnaissez le texte d’une page scannée localement et exportez-le en TXT.' },
    ],
    sections: [
      { id: 'workspaces', title: 'Vos dossiers deviennent des espaces de lecture', description: 'Ouvrez un dossier entier, naviguez dans sa hiérarchie et laissez macOS rapatrier les éléments iCloud nécessaires.', screenshot: '/apps/iridescence-pdf-reader/reader-workspace-light.png' },
      { id: 'reading', title: 'Lire, repérer, annoter', description: 'Miniatures, sommaire, recherche, signets et annotations PDFKit organisent le travail sans recouvrir le document.', screenshot: '/apps/iridescence-pdf-reader/annotations.png' },
      { id: 'command-palette', title: 'Tout retrouver depuis le clavier', description: 'La palette rassemble actions, recherche plein texte, saut de page, documents récents et fichiers de l’espace de travail.', screenshot: '/apps/iridescence-pdf-reader/palette-command.png' },
      { id: 'ocr', title: 'Le texte des scans, enfin accessible', description: 'Apple Vision reconnaît la page à la demande sur le Mac. Le résultat peut être copié ou enregistré, sans service distant.', screenshot: '/apps/iridescence-pdf-reader/ocr-panel.png' },
    ],
    seo: {
      title: 'Iridescence PDF Reader pour macOS',
      description: 'Lecteur PDF macOS natif avec espaces de travail, onglets, annotations, palette de commandes, OCR Apple Vision et iCloud Drive.',
      image: '/apps/iridescence-pdf-reader/og.png',
    },
  },
  {
    slug: 'mass-print',
    name: 'Mass Print',
    shortName: 'Mass Print',
    tagline: 'Tous vos documents. Le bon ordre. Une seule impression.',
    description: 'Préparez plusieurs documents dans l’ordre exact, puis lancez une impression séquentielle depuis une seule fenêtre.',
    longDescription: 'Déposez des fichiers depuis Finder, réorganisez-les à la main ou avec un tri précis, choisissez votre imprimante et gardez le contrôle jusqu’au dernier document.',
    icon: '/apps/mass-print/icon.png',
    accent: 'blue',
    platform: 'macOS',
    compatibility: 'macOS 12.3 ou version ultérieure',
    architecture: 'Apple Silicon et Intel',
    publicationStatus: 'available',
    repository: 'gobelet69/Mass-Print',
    releasePolicy: { acceptedAssets: ['universal-dmg'] },
    primaryScreenshot: {
      src: '/apps/mass-print/mass-print-main.png',
      alt: 'Fenêtre Mass Print avec quatre documents ordonnés, les options d’impression et le bouton Print All.',
      width: 1180,
      height: 760,
    },
    screenshots: [
      {
        src: '/apps/mass-print/mass-print-main.png',
        alt: 'File de documents de Mass Print avec ordre, états et options d’impression.',
        width: 1180,
        height: 760,
        caption: 'La file visible est l’ordre exact transmis à l’imprimante.',
      },
    ],
    features: [
      { title: 'Ordre maîtrisé', description: 'Glissez les lignes, utilisez les boutons accessibles ou inversez un tri prédéfini.' },
      { title: 'Tris utiles', description: 'Nom naturel, date, taille, type, nombre de pages ou ordre d’ajout.' },
      { title: 'Action rapide Finder', description: 'Envoyez une sélection vers la file depuis Actions rapides ou Services, sans imprimer automatiquement.' },
      { title: 'Réglages essentiels', description: 'Imprimante, copies, niveaux de gris, recto verso et adaptation à la page.' },
      { title: 'Impression séquentielle', description: 'Les travaux sont préparés puis soumis à CUPS un à un dans l’ordre visible.' },
      { title: 'Traitement local', description: 'Pas de compte, d’analytics ou d’envoi : vos originaux ne quittent pas le Mac et ne sont jamais modifiés.' },
    ],
    sections: [
      { id: 'ordering', title: 'L’ordre visible est l’ordre imprimé', description: 'Construisez une file personnalisée ou appliquez un tri stable. Les nouveaux documents respectent le mode actif.' },
      { id: 'finder', title: 'Depuis Finder, sans détour', description: 'L’action rapide ouvre ou réveille Mass Print avec les fichiers sélectionnés. Elle ne déclenche jamais l’impression seule.' },
      { id: 'privacy', title: 'Vos documents restent sur votre Mac', description: 'Préparation, conversion et soumission passent par les outils locaux de macOS. Les fichiers sources restent intacts.' },
    ],
    seo: {
      title: 'Mass Print pour macOS',
      description: 'Organisez et imprimez plusieurs documents dans un ordre précis avec glisser-déposer Finder, tris et impression séquentielle locale.',
      image: '/apps/mass-print/og.png',
    },
  },
];

export function getApp(slug: string): AppDefinition {
  const app = apps.find((candidate) => candidate.slug === slug);
  if (!app) throw new Error(`Unknown app slug: ${slug}`);
  return app;
}
