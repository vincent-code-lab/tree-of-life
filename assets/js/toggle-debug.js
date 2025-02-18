/**
 * Ce script permet de contrôler dynamiquement la largeur de la bordure de débogage
 * en fonction d'un paramètre 'debug' passé dans l'URL. 
 * 
 * Utilisation :
 * Ajouter '?debug=1' ou '?debug=5' à l'URL pour définir la largeur de la bordure de débogage en pixels.
 * Par exemple : 'http://example.com?debug=5' définira une bordure de 5 pixels.
 */

// Fonction pour obtenir les paramètres de l'URL
function getParameterByName(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Récupérer la valeur du paramètre 'debug'
const debugBorderWidth = getParameterByName('debug') || '0'; // Défaut à 0px si non défini

// Appliquer la valeur à la variable CSS
if (debugBorderWidth !== '0') {
document.documentElement.style.setProperty('--debug-border-width', debugBorderWidth + 'px');
}