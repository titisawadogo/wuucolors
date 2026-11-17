const messages = {
  en: {
    pageTitle: 'wuuColors — Color, revealed', description: 'Inspect exact pixel colors and palettes in images and PDFs. Your files stay in your browser.',
    language: 'Language', howItWorks: 'How it works', eyebrow: 'A CREATIVE COLOR TOOL', heroFirst: 'See the colors', heroSecond: 'behind the design.', heroIntro: 'Explore colors in images and PDFs, down to individual pixels. You can also pick colors anywhere on your screen.',
    colorInspector: 'COLOR INSPECTOR', workspace: 'YOUR WORKSPACE', readyForFile: 'READY FOR A FILE', exampleOpen: 'EXAMPLE OPEN', fileOpen: 'FILE OPEN', tryExample: 'Try an example', openFile: 'Open a file', uploadLabel: 'Upload an image or PDF', dropTitle: 'Drop in a design.', supportedTypes: 'PNG, JPG, WEBP, AVIF, GIF, BMP, SVG or PDF.', localAnalysis: 'Up to 25 MB. Analyzed in this browser.', chooseFile: 'CHOOSE A FILE', localPrivacy: 'Your file never leaves this page.', previewHintMouse: 'Click for a pixel. Drag for an area.', previewHintTouch: 'Tap for a pixel. Use Select area for a region.', selectAreaHint: 'Drag on the image, or choose two corners.', selectAreaAction: 'Select area', clearSelectedArea: 'Clear area', cancelSelection: 'Cancel', removeFile: 'Remove file', fileRemoved: 'File removed', areaResultsTitle: 'SELECTED AREA', firstCorner: 'First corner set. Choose the opposite corner.', previousPage: 'Previous PDF page', nextPage: 'Next PDF page', imagePreview: 'Uploaded design preview', dimensionsIdle: 'IMAGE · PDF',
    noFileLoaded: 'NO FILE LOADED', imageLoaded: 'IMAGE LOADED', colorAnalysis: 'COLOR ANALYSIS', panelTitle: 'Every shade has a story.', panelLead: 'Explore palettes and exact pixel colors in images and PDFs. Pick from your screen too.', screenEyedropper: 'SCREEN EYEDROPPER', noUploadNeeded: 'NO UPLOAD NEEDED', pickFromScreen: 'Pick from screen', screenSupport: 'Choose one visible color from any window. Repeat to build a palette.', screenUnsupported: 'Screen picking is unavailable here. Open this Site in desktop Chrome or Edge, or use an image or PDF.', savedScreenColors: 'SAVED SCREEN COLORS', clearAll: 'CLEAR ALL', paletteEmpty: 'Your palette and pixel details will appear here.', dominantPalette: 'DOMINANT PALETTE', copyAll: 'COPY ALL', pixelInspector: 'PIXEL INSPECTOR', clickDesign: 'CLICK DESIGN', copyPixel: 'Copy pixel color', smallDetails: 'SMALL DETAILS & WORDS', selectArea: 'SELECT AN AREA', dragDetail: 'Drag over a detail', areaHelp: 'Select a word, logo, or object to see colors in that area. Click a letter for its exact pixel color.', exportFindings: 'EXPORT FINDINGS', rights: 'All rights reserved.',
    helpShort: 'THE SHORT VERSION', closeHelp: 'Close help', helpTitle: 'Look closer.', step1Title: 'Open an image or PDF.', step1Text: 'Choose a file to see its palette. Files stay in your browser.', step2Title: 'Inspect a pixel or area.', step2Text: 'Click or tap for a pixel. Drag over a detail, or use Select area and choose two corners.', step3Title: 'Pick from your screen.', step3Text: 'In supporting browsers, use the eyedropper to choose a color from another visible window. Press Escape to cancel.', step4Title: 'Keep your findings.', step4Text: 'Download a TXT or PDF summary.', startExploring: 'START EXPLORING',
    copied: 'Copied to clipboard', clipboardUnavailable: 'Clipboard unavailable here', copyColor: 'Copy {color}', removeColor: 'Remove {color}', copy: 'COPY', screenAdded: '{color} added to screen colors', screenExists: '{color} is already saved', screenFailed: 'Screen picker could not open in this browser', screenCleared: 'Screen colors cleared', pageOf: 'PAGE {page} / {total}', pdfPageState: 'PDF · PAGE {page}', renderedPage: ' · RENDERED PAGE', pdfLocal: 'PDF page rendered locally.', scaledPreview: 'Large image scaled for preview.', clickPixelHint: 'Click design for exact pixel color.', colorsCount: '{count} COLORS', selectedArea: 'SELECTED AREA · {width} × {height} PX', areaSelected: 'Area selected — choose another', dragPreview: 'Drag on the preview now', dragLarger: 'Drag over a larger area', areaReady: 'Area colors ready', fileTooLarge: 'Please choose a file under 25 MB', invalidFile: 'Use an image or PDF file', fileReady: 'File ready to inspect', fileError: 'Could not read this file in your browser', demoReady: 'Example ready to explore', openFileFirst: 'Open an image or PDF first', dragPrompt: 'Drag over a detail on the preview', txtDownloaded: 'TXT report downloaded', pdfDownloaded: 'PDF report downloaded', exampleComposition: 'Example composition', untitled: 'Untitled', opacity: '{value}% opacity',
    fileColorsSuffix: 'colors', screenColorsFile: 'screen-colors', reportTitle: 'WUUCOLORS - COLOR FINDINGS', reportGenerated: 'Generated: {date}', reportScreen: 'SCREEN COLORS', reportFile: 'File: {file}', reportType: 'Type: {type}', reportImage: 'Image', reportPdf: 'PDF, page {page} of {total}', reportDimensions: 'Rendered dimensions: {width} x {height} px', reportPalette: 'DOMINANT PALETTE', reportScaled: 'Image scaled from {width} x {height} px for preview.', reportPixel: 'SELECTED PIXEL', reportAt: '{color} at x {x}, y {y}', reportArea: 'SELECTED AREA', reportAreaSize: 'Area: x {x}, y {y}, {width} x {height} px', reportEstimates: 'Palette percentages are estimates from visible pixels.', reportPdfNote: 'PDF values are sampled from the rendered page.', reportPrivacy: 'All analysis was performed in your browser.'
  },
  fr: {
    pageTitle: 'wuuColors — La couleur révélée', description: 'Explorez les couleurs exactes des pixels et les palettes des images et PDF. Vos fichiers restent dans votre navigateur.',
    language: 'Langue', howItWorks: 'Mode d’emploi', eyebrow: 'UN OUTIL CRÉATIF POUR LA COULEUR', heroFirst: 'Voyez les couleurs', heroSecond: 'derrière le design.', heroIntro: 'Explorez les couleurs de vos images et PDF, jusqu’au moindre pixel. Vous pouvez aussi prélever une couleur partout sur votre écran.',
    colorInspector: 'INSPECTEUR DE COULEUR', workspace: 'VOTRE ESPACE', readyForFile: 'EN ATTENTE D’UN FICHIER', exampleOpen: 'EXEMPLE OUVERT', fileOpen: 'FICHIER OUVERT', tryExample: 'Essayer un exemple', openFile: 'Ouvrir un fichier', uploadLabel: 'Importer une image ou un PDF', dropTitle: 'Déposez un visuel.', supportedTypes: 'PNG, JPG, WEBP, AVIF, GIF, BMP, SVG ou PDF.', localAnalysis: 'Jusqu’à 25 Mo. Analysé dans ce navigateur.', chooseFile: 'CHOISIR UN FICHIER', localPrivacy: 'Votre fichier ne quitte pas cette page.', previewHintMouse: 'Cliquez pour un pixel. Glissez pour une zone.', previewHintTouch: 'Touchez pour un pixel. Choisissez Sélectionner une zone pour une région.', selectAreaHint: 'Glissez sur l’image ou choisissez deux coins.', selectAreaAction: 'Sélectionner une zone', clearSelectedArea: 'Effacer la zone', cancelSelection: 'Annuler', removeFile: 'Retirer le fichier', fileRemoved: 'Fichier retiré', areaResultsTitle: 'ZONE SÉLECTIONNÉE', firstCorner: 'Premier coin choisi. Choisissez le coin opposé.', previousPage: 'Page PDF précédente', nextPage: 'Page PDF suivante', imagePreview: 'Aperçu du visuel importé', dimensionsIdle: 'IMAGE · PDF',
    noFileLoaded: 'AUCUN FICHIER', imageLoaded: 'IMAGE OUVERTE', colorAnalysis: 'ANALYSE DES COULEURS', panelTitle: 'Chaque nuance a son histoire.', panelLead: 'Explorez les palettes et les couleurs exactes des pixels de vos images et PDF. Prélevez aussi une couleur sur votre écran.', screenEyedropper: 'PIPETTE D’ÉCRAN', noUploadNeeded: 'SANS IMPORTATION', pickFromScreen: 'Prélever sur l’écran', screenSupport: 'Choisissez une couleur visible dans n’importe quelle fenêtre. Répétez pour créer une palette.', screenUnsupported: 'La pipette d’écran n’est pas disponible ici. Ouvrez ce site dans Chrome ou Edge sur ordinateur, ou utilisez une image ou un PDF.', savedScreenColors: 'COULEURS ENREGISTRÉES', clearAll: 'TOUT EFFACER', paletteEmpty: 'Votre palette et les détails des pixels apparaîtront ici.', dominantPalette: 'PALETTE DOMINANTE', copyAll: 'TOUT COPIER', pixelInspector: 'INSPECTEUR DE PIXELS', clickDesign: 'CLIQUEZ SUR LE VISUEL', copyPixel: 'Copier la couleur du pixel', smallDetails: 'DÉTAILS ET MOTS', selectArea: 'SÉLECTIONNER UNE ZONE', dragDetail: 'Glissez sur un détail', areaHelp: 'Sélectionnez un mot, un logo ou un objet pour voir ses couleurs. Cliquez sur une lettre pour sa couleur exacte.', exportFindings: 'EXPORTER LES RÉSULTATS', rights: 'Tous droits réservés.',
    helpShort: 'EN BREF', closeHelp: 'Fermer l’aide', helpTitle: 'Regardez de plus près.', step1Title: 'Ouvrez une image ou un PDF.', step1Text: 'Choisissez un fichier pour voir sa palette. Il reste dans votre navigateur.', step2Title: 'Inspectez un pixel ou une zone.', step2Text: 'Cliquez ou touchez pour un pixel. Glissez sur un détail, ou choisissez Sélectionner une zone puis deux coins.', step3Title: 'Prélevez sur l’écran.', step3Text: 'Dans un navigateur compatible, utilisez la pipette pour choisir une couleur dans une autre fenêtre visible. Appuyez sur Échap pour annuler.', step4Title: 'Conservez vos résultats.', step4Text: 'Téléchargez un résumé TXT ou PDF.', startExploring: 'COMMENCER',
    copied: 'Copié dans le presse-papiers', clipboardUnavailable: 'Presse-papiers indisponible ici', copyColor: 'Copier {color}', removeColor: 'Retirer {color}', copy: 'COPIER', screenAdded: '{color} ajouté aux couleurs d’écran', screenExists: '{color} est déjà enregistré', screenFailed: 'La pipette d’écran ne peut pas s’ouvrir ici', screenCleared: 'Couleurs d’écran effacées', pageOf: 'PAGE {page} / {total}', pdfPageState: 'PDF · PAGE {page}', renderedPage: ' · PAGE AFFICHÉE', pdfLocal: 'Page PDF affichée localement.', scaledPreview: 'Grande image réduite pour l’aperçu.', clickPixelHint: 'Cliquez sur le visuel pour la couleur exacte d’un pixel.', colorsCount: '{count} COULEURS', selectedArea: 'ZONE SÉLECTIONNÉE · {width} × {height} PX', areaSelected: 'Zone sélectionnée — en choisir une autre', dragPreview: 'Glissez sur l’aperçu', dragLarger: 'Sélectionnez une zone plus grande', areaReady: 'Couleurs de la zone prêtes', fileTooLarge: 'Choisissez un fichier de moins de 25 Mo', invalidFile: 'Utilisez une image ou un PDF', fileReady: 'Fichier prêt à inspecter', fileError: 'Impossible de lire ce fichier dans votre navigateur', demoReady: 'Exemple prêt à explorer', openFileFirst: 'Ouvrez d’abord une image ou un PDF', dragPrompt: 'Glissez sur un détail de l’aperçu', txtDownloaded: 'Rapport TXT téléchargé', pdfDownloaded: 'Rapport PDF téléchargé', exampleComposition: 'Composition exemple', untitled: 'Sans titre', opacity: '{value} % d’opacité',
    fileColorsSuffix: 'couleurs', screenColorsFile: 'couleurs-ecran', reportTitle: 'WUUCOLORS - RÉSULTATS DES COULEURS', reportGenerated: 'Généré le : {date}', reportScreen: 'COULEURS D’ÉCRAN', reportFile: 'Fichier : {file}', reportType: 'Type : {type}', reportImage: 'Image', reportPdf: 'PDF, page {page} sur {total}', reportDimensions: 'Dimensions affichées : {width} x {height} px', reportPalette: 'PALETTE DOMINANTE', reportScaled: 'Image réduite depuis {width} x {height} px pour l’aperçu.', reportPixel: 'PIXEL SÉLECTIONNÉ', reportAt: '{color} à x {x}, y {y}', reportArea: 'ZONE SÉLECTIONNÉE', reportAreaSize: 'Zone : x {x}, y {y}, {width} x {height} px', reportEstimates: 'Les pourcentages de la palette sont des estimations des pixels visibles.', reportPdfNote: 'Les couleurs PDF proviennent de la page affichée.', reportPrivacy: 'Toute l’analyse a été effectuée dans votre navigateur.'
  },
  es: {
    pageTitle: 'wuuColors — El color, revelado', description: 'Explora colores exactos de píxeles y paletas en imágenes y PDF. Tus archivos permanecen en tu navegador.',
    language: 'Idioma', howItWorks: 'Cómo funciona', eyebrow: 'UNA HERRAMIENTA CREATIVA DE COLOR', heroFirst: 'Descubre los colores', heroSecond: 'detrás del diseño.', heroIntro: 'Explora los colores de imágenes y PDF, hasta el último píxel. También puedes elegir colores en cualquier parte de tu pantalla.',
    colorInspector: 'INSPECTOR DE COLOR', workspace: 'TU ESPACIO', readyForFile: 'LISTO PARA UN ARCHIVO', exampleOpen: 'EJEMPLO ABIERTO', fileOpen: 'ARCHIVO ABIERTO', tryExample: 'Probar un ejemplo', openFile: 'Abrir un archivo', uploadLabel: 'Subir una imagen o un PDF', dropTitle: 'Suelta un diseño.', supportedTypes: 'PNG, JPG, WEBP, AVIF, GIF, BMP, SVG o PDF.', localAnalysis: 'Hasta 25 MB. Analizado en este navegador.', chooseFile: 'ELEGIR UN ARCHIVO', localPrivacy: 'Tu archivo no sale de esta página.', previewHintMouse: 'Pulsa para un píxel. Arrastra para un área.', previewHintTouch: 'Toca para un píxel. Usa Seleccionar área para una región.', selectAreaHint: 'Arrastra en la imagen o elige dos esquinas.', selectAreaAction: 'Seleccionar área', clearSelectedArea: 'Borrar área', cancelSelection: 'Cancelar', removeFile: 'Quitar archivo', fileRemoved: 'Archivo quitado', areaResultsTitle: 'ÁREA SELECCIONADA', firstCorner: 'Primera esquina elegida. Elige la esquina opuesta.', previousPage: 'Página PDF anterior', nextPage: 'Página PDF siguiente', imagePreview: 'Vista previa del diseño cargado', dimensionsIdle: 'IMAGEN · PDF',
    noFileLoaded: 'NINGÚN ARCHIVO', imageLoaded: 'IMAGEN CARGADA', colorAnalysis: 'ANÁLISIS DE COLOR', panelTitle: 'Cada tono tiene su historia.', panelLead: 'Explora paletas y colores exactos de píxeles en imágenes y PDF. También puedes elegir colores de la pantalla.', screenEyedropper: 'CUENTAGOTAS DE PANTALLA', noUploadNeeded: 'SIN SUBIR ARCHIVOS', pickFromScreen: 'Elegir de la pantalla', screenSupport: 'Elige un color visible de cualquier ventana. Repite para crear una paleta.', screenUnsupported: 'El cuentagotas no está disponible aquí. Abre este sitio en Chrome o Edge de escritorio, o usa una imagen o PDF.', savedScreenColors: 'COLORES GUARDADOS', clearAll: 'BORRAR TODO', paletteEmpty: 'Tu paleta y los detalles de píxeles aparecerán aquí.', dominantPalette: 'PALETA DOMINANTE', copyAll: 'COPIAR TODO', pixelInspector: 'INSPECTOR DE PÍXELES', clickDesign: 'PULSA EL DISEÑO', copyPixel: 'Copiar color del píxel', smallDetails: 'DETALLES Y PALABRAS', selectArea: 'SELECCIONAR UN ÁREA', dragDetail: 'Arrastra sobre un detalle', areaHelp: 'Selecciona una palabra, logotipo u objeto para ver sus colores. Pulsa una letra para conocer su color exacto.', exportFindings: 'EXPORTAR RESULTADOS', rights: 'Todos los derechos reservados.',
    helpShort: 'EN POCAS PALABRAS', closeHelp: 'Cerrar ayuda', helpTitle: 'Mira más de cerca.', step1Title: 'Abre una imagen o un PDF.', step1Text: 'Elige un archivo para ver su paleta. Permanece en tu navegador.', step2Title: 'Inspecciona un píxel o área.', step2Text: 'Pulsa para un píxel. Arrastra sobre un detalle, o usa Seleccionar área y elige dos esquinas.', step3Title: 'Elige de la pantalla.', step3Text: 'En navegadores compatibles, usa el cuentagotas para elegir un color de otra ventana visible. Pulsa Escape para cancelar.', step4Title: 'Guarda tus resultados.', step4Text: 'Descarga un resumen TXT o PDF.', startExploring: 'EMPEZAR',
    copied: 'Copiado al portapapeles', clipboardUnavailable: 'Portapapeles no disponible aquí', copyColor: 'Copiar {color}', removeColor: 'Quitar {color}', copy: 'COPIAR', screenAdded: '{color} añadido a los colores de pantalla', screenExists: '{color} ya está guardado', screenFailed: 'No se pudo abrir el cuentagotas aquí', screenCleared: 'Colores de pantalla borrados', pageOf: 'PÁGINA {page} / {total}', pdfPageState: 'PDF · PÁGINA {page}', renderedPage: ' · PÁGINA RENDERIZADA', pdfLocal: 'Página PDF renderizada en el navegador.', scaledPreview: 'Imagen grande reducida para la vista previa.', clickPixelHint: 'Pulsa el diseño para ver el color exacto de un píxel.', colorsCount: '{count} COLORES', selectedArea: 'ÁREA SELECCIONADA · {width} × {height} PX', areaSelected: 'Área seleccionada — elige otra', dragPreview: 'Arrastra sobre la vista previa', dragLarger: 'Selecciona un área más grande', areaReady: 'Colores del área listos', fileTooLarge: 'Elige un archivo de menos de 25 MB', invalidFile: 'Usa una imagen o un PDF', fileReady: 'Archivo listo para inspeccionar', fileError: 'No se pudo leer este archivo en tu navegador', demoReady: 'Ejemplo listo para explorar', openFileFirst: 'Abre primero una imagen o un PDF', dragPrompt: 'Arrastra sobre un detalle de la vista previa', txtDownloaded: 'Informe TXT descargado', pdfDownloaded: 'Informe PDF descargado', exampleComposition: 'Composición de ejemplo', untitled: 'Sin título', opacity: '{value} % de opacidad',
    fileColorsSuffix: 'colores', screenColorsFile: 'colores-pantalla', reportTitle: 'WUUCOLORS - RESULTADOS DE COLOR', reportGenerated: 'Generado: {date}', reportScreen: 'COLORES DE PANTALLA', reportFile: 'Archivo: {file}', reportType: 'Tipo: {type}', reportImage: 'Imagen', reportPdf: 'PDF, página {page} de {total}', reportDimensions: 'Dimensiones renderizadas: {width} x {height} px', reportPalette: 'PALETA DOMINANTE', reportScaled: 'Imagen reducida desde {width} x {height} px para la vista previa.', reportPixel: 'PÍXEL SELECCIONADO', reportAt: '{color} en x {x}, y {y}', reportArea: 'ÁREA SELECCIONADA', reportAreaSize: 'Área: x {x}, y {y}, {width} x {height} px', reportEstimates: 'Los porcentajes de la paleta son estimaciones de los píxeles visibles.', reportPdfNote: 'Los valores del PDF se toman de la página renderizada.', reportPrivacy: 'Todo el análisis se realizó en tu navegador.'
  }
};

Object.assign(messages.en, {
  heroIntro: 'Explore every color in images and PDFs, down to individual pixels.',
  panelLead: 'Explore palettes and exact pixel colors in images and PDFs.',
  screenFallback: 'See a color you like? Take a screenshot and upload it here.',
  dropTitle: 'Add an image or PDF.',
  step4Text: 'Download a TXT or PDF summary, or a CSV of every exact color.',
  supportedTypes: 'PNG, JPG, HEIC, HEIF, WEBP, AVIF, GIF, BMP, SVG or PDF.',
  accentColors: 'ACCENT COLORS', accentHelp: 'Small colors found beyond the main palette.',
  exactColors: 'EXACT COLORS', exactHelp: 'Every visible decoded pixel is counted. PDFs use the rendered page. Browse by HEX or export the complete list.',
  filterHex: 'Filter by HEX', previous: 'Previous', next: 'Next',
  downloadCsv: 'Download all colors (CSV)', csvDownloaded: 'Complete color list downloaded',
  scanning: 'Scanning every pixel · {percent}%', scanned: '{count} exact colors across {pixels} visible pixels',
  exactPending: 'Scanning pixels…', exactEmpty: 'No matching colors', exactRange: '{from}–{to}',
  openingHeic: 'Opening HEIC on this device…', scanFailed: 'This device could not finish the full scan. The preview is still available.',
  reportAccent: 'ACCENT COLORS', reportExact: 'EXACT SCAN',
  reportExactStats: '{count} distinct colors across {pixels} visible pixels. Download CSV for the complete list.',
  reportImagePixels: 'Image scanned at its original {width} × {height} pixel size.',
  reportPdfPixels: 'PDF colors are from the rendered page at {width} × {height} pixels.',
  colorsCountOne: '1 COLOR', originalImage: ' · ORIGINAL IMAGE',
  previewHintTouch: 'Tap for a pixel. Tap Select area or double tap the image for a box.',
  step2Text: 'Click for a pixel. With touch, tap Select area or double tap the image, then move or resize the box.',
  editableArea: 'Selected area. Drag to move, or use arrow keys.',
  resizeNorthwest: 'Resize selected area from top left', resizeNortheast: 'Resize selected area from top right',
  resizeSouthwest: 'Resize selected area from bottom left', resizeSoutheast: 'Resize selected area from bottom right',
  imageColors: 'Image colors', selectedAreaColors: 'Selected area colors', viewColors: 'View colors', hideColors: 'Hide colors', closeColors: 'Close colors'
});
Object.assign(messages.fr, {
  heroIntro: 'Explorez toutes les couleurs de vos images et PDF, jusqu’au moindre pixel.',
  panelLead: 'Explorez les palettes et les couleurs exactes des pixels de vos images et PDF.',
  screenFallback: 'Une couleur vous plaît ? Prenez une capture d’écran et importez-la ici.',
  dropTitle: 'Ajoutez une image ou un PDF.',
  step4Text: 'Téléchargez un résumé TXT ou PDF, ou un CSV de toutes les couleurs exactes.',
  supportedTypes: 'PNG, JPG, HEIC, HEIF, WEBP, AVIF, GIF, BMP, SVG ou PDF.',
  accentColors: 'COULEURS D’ACCENT', accentHelp: 'De petites couleurs au-delà de la palette principale.',
  exactColors: 'COULEURS EXACTES', exactHelp: 'Chaque pixel visible décodé est compté. Les PDF utilisent la page affichée. Parcourez les codes HEX ou exportez la liste complète.',
  filterHex: 'Filtrer par HEX', previous: 'Précédent', next: 'Suivant',
  downloadCsv: 'Télécharger toutes les couleurs (CSV)', csvDownloaded: 'Liste complète des couleurs téléchargée',
  scanning: 'Analyse de chaque pixel · {percent} %', scanned: '{count} couleurs exactes sur {pixels} pixels visibles',
  exactPending: 'Analyse des pixels…', exactEmpty: 'Aucune couleur correspondante', exactRange: '{from}–{to}',
  openingHeic: 'Ouverture du HEIC sur cet appareil…', scanFailed: 'Cet appareil n’a pas pu terminer l’analyse complète. L’aperçu reste disponible.',
  reportAccent: 'COULEURS D’ACCENT', reportExact: 'ANALYSE EXACTE',
  reportExactStats: '{count} couleurs distinctes sur {pixels} pixels visibles. Téléchargez le CSV pour la liste complète.',
  reportImagePixels: 'Image analysée à sa taille d’origine : {width} × {height} pixels.',
  reportPdfPixels: 'Couleurs du PDF issues de la page rendue à {width} × {height} pixels.',
  colorsCountOne: '1 COULEUR', originalImage: ' · IMAGE ORIGINALE',
  previewHintTouch: 'Touchez pour un pixel. Touchez Sélectionner une zone ou touchez deux fois l’image pour créer un cadre.',
  step2Text: 'Cliquez pour un pixel. Sur écran tactile, touchez Sélectionner une zone ou touchez deux fois l’image, puis déplacez ou redimensionnez le cadre.',
  editableArea: 'Zone sélectionnée. Glissez pour déplacer ou utilisez les flèches.',
  resizeNorthwest: 'Redimensionner depuis le coin supérieur gauche', resizeNortheast: 'Redimensionner depuis le coin supérieur droit',
  resizeSouthwest: 'Redimensionner depuis le coin inférieur gauche', resizeSoutheast: 'Redimensionner depuis le coin inférieur droit',
  imageColors: 'Couleurs de l’image', selectedAreaColors: 'Couleurs de la zone', viewColors: 'Voir les couleurs', hideColors: 'Masquer les couleurs', closeColors: 'Fermer les couleurs'
});
Object.assign(messages.es, {
  heroIntro: 'Explora todos los colores de imágenes y PDF, hasta cada píxel.',
  panelLead: 'Explora paletas y colores exactos de píxeles en imágenes y PDF.',
  screenFallback: '¿Ves un color que te gusta? Haz una captura de pantalla y súbela aquí.',
  dropTitle: 'Añade una imagen o un PDF.',
  step4Text: 'Descarga un resumen TXT o PDF, o un CSV con todos los colores exactos.',
  supportedTypes: 'PNG, JPG, HEIC, HEIF, WEBP, AVIF, GIF, BMP, SVG o PDF.',
  accentColors: 'COLORES DE ACENTO', accentHelp: 'Colores pequeños fuera de la paleta principal.',
  exactColors: 'COLORES EXACTOS', exactHelp: 'Se cuenta cada píxel visible decodificado. Los PDF usan la página renderizada. Explora por HEX o exporta la lista completa.',
  filterHex: 'Filtrar por HEX', previous: 'Anterior', next: 'Siguiente',
  downloadCsv: 'Descargar todos los colores (CSV)', csvDownloaded: 'Lista completa de colores descargada',
  scanning: 'Analizando cada píxel · {percent} %', scanned: '{count} colores exactos en {pixels} píxeles visibles',
  exactPending: 'Analizando píxeles…', exactEmpty: 'No hay colores coincidentes', exactRange: '{from}–{to}',
  openingHeic: 'Abriendo HEIC en este dispositivo…', scanFailed: 'Este dispositivo no pudo terminar el análisis completo. La vista previa sigue disponible.',
  reportAccent: 'COLORES DE ACENTO', reportExact: 'ANÁLISIS EXACTO',
  reportExactStats: '{count} colores distintos en {pixels} píxeles visibles. Descarga el CSV para la lista completa.',
  reportImagePixels: 'Imagen analizada a su tamaño original de {width} × {height} píxeles.',
  reportPdfPixels: 'Los colores del PDF proceden de la página renderizada a {width} × {height} píxeles.',
  colorsCountOne: '1 COLOR', originalImage: ' · IMAGEN ORIGINAL',
  previewHintTouch: 'Toca para un píxel. Pulsa Seleccionar área o toca dos veces la imagen para crear un recuadro.',
  step2Text: 'Pulsa para ver un píxel. En pantalla táctil, pulsa Seleccionar área o toca dos veces la imagen; después mueve o cambia el tamaño del recuadro.',
  editableArea: 'Área seleccionada. Arrastra para mover o usa las flechas.',
  resizeNorthwest: 'Cambiar tamaño desde la esquina superior izquierda', resizeNortheast: 'Cambiar tamaño desde la esquina superior derecha',
  resizeSouthwest: 'Cambiar tamaño desde la esquina inferior izquierda', resizeSoutheast: 'Cambiar tamaño desde la esquina inferior derecha',
  imageColors: 'Colores de la imagen', selectedAreaColors: 'Colores del área', viewColors: 'Ver colores', hideColors: 'Ocultar colores', closeColors: 'Cerrar colores'
});

const supported = new Set(Object.keys(messages));
function initialLanguage() {
  try { const saved = localStorage.getItem('wuucolors-language'); if (supported.has(saved)) return saved; } catch {}
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language || 'en'];
  const primary = preferred[0]?.toLowerCase().split('-')[0];
  return supported.has(primary) ? primary : 'en';
}
let language = initialLanguage();
export function currentLanguage() { return language; }
export function t(key, values = {}) {
  const template = messages[language][key] ?? messages.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
}
export function setLanguage(next) {
  if (!supported.has(next)) return;
  language = next;
  try { localStorage.setItem('wuucolors-language', next); } catch {}
  document.documentElement.lang = next;
  document.title = t('pageTitle');
  document.querySelector('meta[name="description"]').content = t('description');
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
  document.getElementById('languageSelect').value = next;
}
