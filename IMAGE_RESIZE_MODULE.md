# Image Resize Module

Module de redimensionnement d'images pour AdaTools.

## Features

### Redimensionnement
- Dimensions personnalisées (largeur/hauteur)
- Mise à l'échelle par pourcentage (25%, 50%, 75%, 100%, 150%, 200%)
- Verrouillage/déverrouillage du ratio d'aspect
- Rotation (90°)
- Retournement horizontal/vertical

### Presets
- **Réseaux sociaux**: Instagram, Facebook, Twitter, LinkedIn, YouTube
- **Tailles courantes**: Thumbnail, HD, Full HD, 4K, Icon, Favicon
- Presets personnalisés sauvegardés en localStorage

### Algorithmes de redimensionnement
| Algorithme | Description | Usage recommandé |
|------------|-------------|------------------|
| Ultra Quality (Pica) | Vrai Lanczos3 via pica.js | Meilleure qualité pour downscaling photos |
| High Quality | Lanczos natif navigateur | Photos et images détaillées |
| Standard | Bicubic | Équilibre qualité/vitesse |
| Fast | Bilinear | Traitement rapide |
| Pixel Perfect | Nearest neighbor | Pixel art |

### Formats de sortie
- PNG (lossless)
- JPEG (avec slider qualité)
- WebP (avec slider qualité)

### Fonctionnalités additionnelles
- Preview en temps réel avec debouncing
- Contrôles de zoom
- Comparaison avant/après
- Estimation de la taille du fichier
- Téléchargement et copie dans le presse-papiers
- Upload par drag-and-drop
- Coller depuis le presse-papiers
- Mode batch (fichiers multiples)

## Structure des fichiers

```
src/lib/
├── image-resize-utils.ts      # Fonctions utilitaires
└── image-resize-presets.ts    # Définitions des presets

components/modules/
├── image-resize-module.tsx    # Module principal
└── image-resize/
    ├── algorithm-selector.tsx # Sélection algorithme
    ├── batch-processor.tsx    # Traitement batch
    ├── image-preview.tsx      # Aperçu canvas
    ├── output-settings.tsx    # Paramètres sortie
    ├── preset-selector.tsx    # Sélection presets
    └── resize-controls.tsx    # Contrôles dimensions
```

## Dépendances

- `pica` - Redimensionnement haute qualité (Lanczos3)
