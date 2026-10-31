import type { Locale } from './index';

const copy = {
  en: {
    home: {
      description: '111iridescence builds focused macOS applications: Iridescence PDF Reader, Mass Print, Resource Guard, and QuickPad.',
      eyebrow: 'Software designed here', title: 'My apps', lead: 'Focused macOS tools that respect your data.',
      futureEyebrow: 'The signal continues.', future: 'More applications are in development.', allApps: 'View all apps',
    },
    catalog: {
      title: 'Apps for macOS', description: 'Discover 111iridescence macOS applications: Iridescence PDF Reader, Mass Print, Resource Guard, and QuickPad.',
      eyebrow: '111iridescence · macOS software', lead: 'Focused tools designed to disappear behind what you want to accomplish.',
      label: 'All apps', discover: 'Discover', futureEyebrow: 'Coming next', futureTitle: 'More applications will follow.',
      future: 'The same standard: a clear idea, a native interface, and your data under your control.',
    },
    about: { domainsEyebrow: 'What I do', domainsTitle: 'Three areas.', domainsLead: 'Development, cybersecurity, and systems.', aiEyebrow: 'Building with artificial intelligence', appsEyebrow: 'Why 111iridescence?', closingEyebrow: 'Keep exploring', appsCta: 'Explore my applications' },
    product: {
      allApps: 'All apps', macApp: 'macOS application', discover: 'Discover', comingSoon: 'Coming soon', autoVersion: 'Version detected automatically', download: 'Download for macOS', version: 'Version',
      pdfEyebrow: 'Native PDF reader', overviewEyebrow: 'Overview', overviewTitle: 'Reading that stays in the flow.', galleryEyebrow: 'Inside the app', galleryTitle: 'A native space, from the first PDF to the final comment.', ocrNote: 'Recognition uses Apple Vision and runs locally on your Mac.', latest: 'Latest public version', downloadPdf: 'Download Iridescence PDF Reader', detected: 'The latest compatible public macOS release is detected automatically.',
      massEyebrow: 'Ordered printing', controlEyebrow: 'Everything under control', controlTitle: 'A clear queue before anything starts.', mainEyebrow: 'Main window', mainTitle: 'Documents, order, and settings in one window.', finderNote: 'Select your files, then use the Mass Print Quick Action. You always keep final approval.', localEyebrow: 'Local by design', noAccount: 'No account', noAnalytics: 'No analytics', originals: 'Originals untouched', publicVersion: 'Public version', downloadMass: 'Download Mass Print', massDetected: 'Universal DMG for Apple Silicon and Intel. The latest GitHub release is detected automatically.',
      guardOverviewEyebrow: 'Kernel telemetry', guardOverviewTitle: 'Zero background weight. True memory pressure.', guardGalleryEyebrow: 'Menu bar inspection', guardGalleryTitle: 'Live system metrics at a single glance.', downloadGuard: 'Download Resource Guard',
      quickpadOverviewEyebrow: 'Native AppKit editor', quickpadOverviewTitle: 'Sub-100 ms startup. Structured live previews.', quickpadGalleryEyebrow: 'Split-view workspace', quickpadGalleryTitle: 'Markdown, JSON trees, and CSV grids in real time.', downloadQuickpad: 'Download QuickPad',
      orderLabel: 'Print order', documents: '4 documents', cover: 'Cover.pdf', report: 'Annual report.pdf', appendices: 'Appendices.pdf', notes: 'Final notes.txt', page: 'page', pages: 'pages', orderHelp: 'Drag to reorder · printing follows this queue exactly.',
    },
    notFound: { title: 'Page not found', description: 'This address does not exist. Return home or explore the 111iridescence applications.', message: 'This address does not exist.', nav: 'Return to the site', home: 'Home', apps: 'All apps', about: 'About' },
  },
  fr: {
    home: {
      description: '111iridescence conçoit des applications macOS ciblées, simples et rapides : Iridescence PDF Reader, Mass Print, Resource Guard et QuickPad.',
      eyebrow: 'Logiciels conçus ici', title: 'Mes apps', lead: 'Des outils macOS ciblés qui respectent vos données.',
      futureEyebrow: 'Le signal continue.', future: 'D’autres applications sont en préparation.', allApps: 'Voir toutes les apps',
    },
    catalog: {
      title: 'Apps pour macOS', description: 'Découvrez les applications macOS de 111iridescence : Iridescence PDF Reader, Mass Print, Resource Guard et QuickPad.',
      eyebrow: '111iridescence · logiciel macOS', lead: 'Des outils concentrés sur une tâche, dessinés pour disparaître derrière ce que vous voulez accomplir.',
      label: 'Toutes les apps', discover: 'Découvrir', futureEyebrow: 'À suivre', futureTitle: 'D’autres applications suivront.',
      future: 'La même exigence : une idée nette, une interface native et vos données sous votre contrôle.',
    },
    about: { domainsEyebrow: 'Ce que je fais', domainsTitle: 'Trois domaines.', domainsLead: 'Développement, cybersécurité et systèmes.', aiEyebrow: 'Créer avec l’intelligence artificielle', appsEyebrow: 'Pourquoi 111iridescence ?', closingEyebrow: 'Pour continuer', appsCta: 'Découvrir mes applications' },
    product: {
      allApps: 'Toutes les apps', macApp: 'Application macOS', discover: 'Découvrir', comingSoon: 'Bientôt disponible', autoVersion: 'Version détectée automatiquement', download: 'Télécharger pour macOS', version: 'Version',
      pdfEyebrow: 'Lecteur PDF natif', overviewEyebrow: 'Vue d’ensemble', overviewTitle: 'Une lecture qui reste dans le flux.', galleryEyebrow: 'Dans l’app', galleryTitle: 'Un espace natif, du premier PDF au dernier commentaire.', ocrNote: 'La reconnaissance utilise Apple Vision et s’exécute localement sur votre Mac.', latest: 'Dernière version publique', downloadPdf: 'Télécharger Iridescence PDF Reader', detected: 'La dernière release macOS publique compatible est détectée automatiquement.',
      massEyebrow: 'Impression ordonnée', controlEyebrow: 'Tout sous contrôle', controlTitle: 'Une file claire avant de lancer quoi que ce soit.', mainEyebrow: 'Vue principale', mainTitle: 'Documents, ordre et réglages dans une seule fenêtre.', finderNote: 'Sélectionnez vos fichiers, puis utilisez l’action rapide Mass Print. Vous gardez toujours la validation finale.', localEyebrow: 'Local par conception', noAccount: 'Sans compte', noAnalytics: 'Sans analytics', originals: 'Originaux intacts', publicVersion: 'Version publique', downloadMass: 'Télécharger Mass Print', massDetected: 'DMG universel pour Apple Silicon et Intel. La dernière release GitHub est détectée automatiquement.',
      guardOverviewEyebrow: 'Télémétrie noyau', guardOverviewTitle: 'Zéro surcharge. La vraie pression mémoire.', guardGalleryEyebrow: 'Menu bar en direct', guardGalleryTitle: 'La télémétrie en temps réel au bout des doigts.', downloadGuard: 'Télécharger Resource Guard',
      quickpadOverviewEyebrow: 'Éditeur AppKit natif', quickpadOverviewTitle: 'Démarrage sous 100 ms. Aperçus structurés en direct.', quickpadGalleryEyebrow: 'Espace en vue scindée', quickpadGalleryTitle: 'Markdown, arbres JSON et tables CSV en temps réel.', downloadQuickpad: 'Télécharger QuickPad',
      orderLabel: 'Ordre d’impression', documents: '4 documents', cover: 'Couverture.pdf', report: 'Rapport annuel.pdf', appendices: 'Annexes.pdf', notes: 'Notes finales.txt', page: 'page', pages: 'pages', orderHelp: 'Glissez pour réordonner · l’impression suit exactement cette file.',
    },
    notFound: { title: 'Page introuvable', description: 'Cette adresse n’existe pas. Revenez à l’accueil ou découvrez les applications 111iridescence.', message: 'Cette adresse n’existe pas.', nav: 'Revenir au site', home: 'Accueil', apps: 'Toutes les apps', about: 'À propos' },
  },
} as const;

export const pageCopy = (locale: Locale) => copy[locale];
