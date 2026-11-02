export type AppSlug = 'iridescence-installer' | 'iridescence-pdf-reader' | 'mass-print' | 'resource-guard' | 'quickpad';
import type { Locale } from '../i18n';
import { englishAppContent } from './app-locales';
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
  accent: 'iris' | 'blue' | 'cyan';
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

const frenchApps: AppDefinition[] = [
  {
    slug: 'iridescence-installer',
    name: 'Iridescence Installer',
    shortName: 'Installer',
    tagline: 'Tout l’écosystème 111iridescence. En un clic.',
    description: 'Gestionnaire d’applications natif pour macOS : découvrez, installez et mettez à jour tous les logiciels de l’atelier sans friction Gatekeeper.',
    longDescription: 'Fini les montages manuels de DMG et les blocages de sécurité à répétition. Iridescence Installer automatise les releases GitHub, gère la quarantaine de manière ciblée et maintient vos apps à jour en toute transparence.',
    icon: '/apps/iridescence-installer/icon.png',
    accent: 'cyan',
    platform: 'macOS',
    compatibility: 'macOS 13 ou version ultérieure',
    architecture: 'Apple Silicon et Intel',
    publicationStatus: 'available',
    repository: 'gobelet69/iridescence-installer',
    releasePolicy: { acceptedAssets: ['universal-dmg', 'dmg'] },
    primaryScreenshot: {
      src: '/apps/iridescence-installer/installer-main.png',
      alt: 'Fenêtre principale d’Iridescence Installer avec la liste des applications de l’écosystème, leur version et leur statut.',
      width: 920,
      height: 608,
    },
    screenshots: [
      {
        src: '/apps/iridescence-installer/installer-main.png',
        alt: 'Fenêtre principale d’Iridescence Installer avec les applications installées.',
        width: 920,
        height: 608,
        caption: 'Détection exclusive et gestion unifiée des outils 111iridescence.',
      },
      {
        src: '/apps/iridescence-installer/installer-discover.png',
        alt: 'Catalogue Découvrir parcourant les applications disponibles de l’écosystème.',
        width: 920,
        height: 608,
        caption: 'Exploration dynamique des nouveaux outils de l’atelier sans recompiler l’application.',
      },
      {
        src: '/apps/iridescence-installer/installer-updates.png',
        alt: 'Gestionnaire de mises à jour avec détection de nouvelles versions et notes de release.',
        width: 920,
        height: 608,
        caption: 'Mises à jour atomiques et vérification d’intégrité SHA-256 en un clic.',
      },
      {
        src: '/apps/iridescence-installer/installer-installed.png',
        alt: 'Gestion fine des applications installées, architectures et état de quarantaine.',
        width: 920,
        height: 608,
        caption: 'Levée ciblée de la quarantaine Gatekeeper pour les apps de confiance.',
      },
    ],
    features: [
      { title: 'Installation en 1 clic', description: 'Téléchargement, extraction DMG/Zip, vérification SHA-256 et installation atomique dans /Applications sans manipulation manuelle.' },
      { title: 'Gestion ciblée de Gatekeeper', description: 'Levée automatique de l’attribut de quarantaine scoped com.apple.quarantine sur les apps vérifiées sans affaiblir la sécurité globale.' },
      { title: 'Mises à jour automatiques', description: 'Détection des nouvelles versions GitHub avec ETag conditionnel, téléchargement différentiel et bouton Mettre à jour tout.' },
      { title: 'Catalogue Découvrir', description: 'Exploration dynamique des nouveaux outils de l’atelier via les dépôts GitHub officiels sans recompiler l’installateur.' },
      { title: 'Sauvegarde & Restauration', description: 'Archivage automatique de la version précédente avant mise à jour pour un retour en arrière immédiat en cas de besoin.' },
      { title: 'Auto-mise à jour intégrée', description: 'Iridescence Installer met à jour son propre bundle de manière autonome avec vérification d’intégrité.' },
    ],
    sections: [
      { id: 'discover', title: 'Tout l’atelier à portée de main', description: 'Parcourez le catalogue officiel, installez n’importe quelle application en un clic et suivez les nouvelles sorties en temps réel.', screenshot: '/apps/iridescence-installer/installer-discover.png' },
      { id: 'updates', title: 'Mises à jour atomiques et transparentes', description: 'Vérification automatique des releases GitHub, affichage des notes de version et remplacement atomique sans interruption de flux.', screenshot: '/apps/iridescence-installer/installer-updates.png' },
      { id: 'quarantine', title: 'La simplicité sans compromettre votre Mac', description: 'Une gestion ciblée de l’attribut com.apple.quarantine réservée aux applications 111iridescence, sans jamais désactiver Gatekeeper sur votre système.', screenshot: '/apps/iridescence-installer/installer-installed.png' },
    ],
    seo: {
      title: 'Iridescence Installer pour macOS',
      description: 'Gestionnaire d’applications officiel pour macOS : installez, découvrez et mettez à jour tous les logiciels de l’atelier 111iridescence sans friction.',
      image: '/apps/iridescence-installer/og.png',
    },
  },
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
    publicationStatus: 'available',
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
  {
    slug: 'resource-guard',
    name: 'Resource Guard',
    shortName: 'Resource Guard',
    tagline: 'Surveillez votre Mac. Sans consommer votre Mac.',
    description: 'Un utilitaire de barre des menus ultra-léger pour Apple Silicon, alertant sans faire de faux positifs.',
    longDescription: 'Gardez un œil sur l’occupation CPU, la pression mémoire réelle et le swap avec des métriques Mach/Darwin pures, sans Electron ni surcharge en arrière-plan.',
    icon: '/apps/resource-guard/icon.png',
    accent: 'blue',
    platform: 'macOS',
    compatibility: 'macOS 13 ou version ultérieure',
    architecture: 'Apple Silicon',
    publicationStatus: 'available',
    repository: 'gobelet69/mac-resource-guard',
    releasePolicy: { acceptedAssets: ['dmg'] },
    primaryScreenshot: {
      src: '/apps/resource-guard/resource-guard-main.png',
      alt: 'Menu déroulant de Resource Guard affichant l’utilisation CPU, la pression mémoire et les applications actives.',
      width: 848,
      height: 952,
    },
    screenshots: [
      {
        src: '/apps/resource-guard/resource-guard-main.png',
        alt: 'Menu déroulant de Resource Guard avec métriques et processus.',
        width: 848,
        height: 952,
        caption: 'Surveillance granulaire sans aucun polling lourd en arrière-plan.',
      },
      {
        src: '/apps/resource-guard/resource-guard-background.png',
        alt: 'Resource Guard en mode arrière-plan discret.',
        width: 848,
        height: 952,
        caption: 'Intervalles adaptatifs : seulement deux Mach traps toutes les 10 secondes.',
      },
    ],
    features: [
      { title: 'AppKit 100% natif', description: 'Écrit en Swift avec les API noyau Mach/Darwin. Zéro Electron, zéro web view, zéro surcharge.' },
      { title: 'Surveillance adaptative', description: 'Vérification légère toutes les 10 secondes en veille, analyse fine uniquement en cas de charge soutenue.' },
      { title: 'Pression mémoire intelligente', description: 'Distingue le cache fichier légitime de la vraie saturation mémoire pour éviter les fausses alertes.' },
      { title: 'Regroupement multi-processus', description: 'Agrège les processus de Chrome, Safari ou VS Code sans jamais compter deux fois leur mémoire.' },
      { title: 'Arrêt sécurisé d’applications', description: 'Privilégie la fermeture standard avec confirmation d’enregistrement et bloque l’arrêt des composants système essentiels.' },
      { title: 'Respect total de la vie privée', description: 'Aucune donnée collectée, aucun appel réseau, fonctionnement 100% local sur votre machine.' },
    ],
    sections: [
      { id: 'adaptive', title: 'Une surveillance qui ne fatigue pas votre processeur', description: 'Deux appels noyau légers toutes les dix secondes suffisent pour veiller sur le système sans perturber vos tâches.', screenshot: '/apps/resource-guard/resource-guard-background.png' },
      { id: 'memory', title: 'Comprendre la vraie pression mémoire', description: 'macOS utilise souvent toute la mémoire disponible pour le cache. Resource Guard analyse les signaux du kernel pour n’alerter qu’en cas de réel besoin.', screenshot: '/apps/resource-guard/resource-guard-main.png' },
      { id: 'safety', title: 'Fermer une application en toute confiance', description: 'Les processus enfants sont regroupés automatiquement. Vous quittez l’application proprement sans risque d’interrompre un service critique de macOS.', screenshot: '/apps/resource-guard/resource-guard-main.png' },
    ],
    seo: {
      title: 'Resource Guard pour macOS',
      description: 'Utilitaire de barre des menus léger pour macOS Apple Silicon : surveillance CPU, pression mémoire et arrêt sécurisé.',
      image: '/apps/resource-guard/og.png',
    },
  },
  {
    slug: 'quickpad',
    name: 'QuickPad',
    shortName: 'QuickPad',
    tagline: 'Ouvrez instantanément. Éditez sans friction.',
    description: 'Un éditeur de texte et inspecteur de fichiers structurés ultra-rapide pour macOS, écrit en Swift 6 et AppKit.',
    longDescription: 'Lancez l’application en moins de 100 ms avec une empreinte mémoire inférieure à 9 Mo, ouvrez des fichiers de 100 Mo sans blocage et inspectez vos documents Markdown, JSON ou CSV en temps réel.',
    icon: '/apps/quickpad/icon.png',
    accent: 'iris',
    platform: 'macOS',
    compatibility: 'macOS 13 ou version ultérieure',
    architecture: 'Apple Silicon et Intel',
    publicationStatus: 'available',
    repository: 'gobelet69/quickpad',
    releasePolicy: { acceptedAssets: ['universal-dmg', 'dmg'] },
    primaryScreenshot: {
      src: '/apps/quickpad/quickpad-main.png',
      alt: 'Fenêtre principale de QuickPad en vue scindée avec éditeur Markdown et aperçu GitHub Flavored Markdown en direct.',
      width: 1180,
      height: 760,
    },
    screenshots: [
      {
        src: '/apps/quickpad/quickpad-main.png',
        alt: 'QuickPad en vue scindée avec coloration syntaxique et aperçu Markdown en direct.',
        width: 1180,
        height: 760,
        caption: 'Édition native et aperçu Markdown temps réel côte à côte.',
      },
      {
        src: '/apps/quickpad/quickpad-json.png',
        alt: 'Inspecteur d’arborescence JSON de QuickPad avec filtrage et extraction de chemin JSON.',
        width: 1180,
        height: 760,
        caption: 'Arborescence JSON interactive avec filtrage instantané et copie de chemin.',
      },
    ],
    features: [
      { title: 'Démarrage sous 100 ms', description: 'Écrit en Swift 6 et AppKit pur : moins de 9 Mo de RAM au repos et 0 % de CPU en veille.' },
      { title: 'Aperçus structurés', description: 'Aperçu Markdown GFM en direct, arborescence JSON interactive et grille CSV RFC 4180.' },
      { title: 'Fichiers jusqu’à 100 Mo', description: 'Ouverture en moins de 50 ms des journaux et exports volumineux sans figer l’interface.' },
      { title: 'Intégrité universelle', description: 'Détection automatique UTF-8, UTF-16, ISO-8859-1, fins de ligne LF/CRLF et protection binaire.' },
      { title: 'Écriture atomique', description: 'Sauvegarde résiliente via fichier de transit atomique pour éviter toute corruption.' },
      { title: '100 % local et privé', description: 'Aucune télémétrie, aucun appel réseau, aucun démon en arrière-plan.' },
    ],
    sections: [
      { id: 'speed', title: 'Une réactivité immédiate, quelle que soit la taille', description: 'QuickPad s’ouvre instantanément et charge des fichiers de 100 Mo en moins de 50 millisecondes grâce à son moteur AppKit natif.', screenshot: '/apps/quickpad/quickpad-main.png' },
      { id: 'inspectors', title: 'Inspectez Markdown, JSON et CSV côte à côte', description: 'Basculez entre le code source, la vue scindée et l’inspecteur dédié pour explorer un arbre JSON ou une table CSV de plus de 100 000 lignes.', screenshot: '/apps/quickpad/quickpad-json.png' },
      { id: 'integrity', title: 'Vos fichiers restent intacts, du premier au dernier octet', description: 'Chaque enregistrement passe par une écriture atomique sécurisée en préservant l’encodage et les fins de ligne d’origine.', screenshot: '/apps/quickpad/quickpad-main.png' },
    ],
    seo: {
      title: 'QuickPad pour macOS',
      description: 'Éditeur de texte macOS natif ultra-rapide en Swift 6 et AppKit avec aperçu Markdown, inspecteur JSON/CSV et écriture atomique.',
      image: '/apps/quickpad/og.png',
    },
  },
];

export function getApps(locale: Locale = 'en'): AppDefinition[] {
  if (locale === 'fr') return frenchApps;
  return frenchApps.map((app) => ({ ...app, ...englishAppContent[app.slug] }));
}

export const apps = getApps('en');

export function getApp(slug: string, locale: Locale = 'fr'): AppDefinition {
  const app = getApps(locale).find((candidate) => candidate.slug === slug);
  if (!app) throw new Error(`Unknown app slug: ${slug}`);
  return app;
}
