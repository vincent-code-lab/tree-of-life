// Vérifier si le navigateur supporte `hardwareConcurrency`
const isLowPerformance = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

// Ajouter une classe CSS si l'appareil est jugé "lent"
if (isLowPerformance) {
    document.body.classList.add('low-performance');
    console.warn("Mode faible performance activé : Désactivation des effets visuels avancés.");
}

/*document.body.classList.add('low-performance');*/
// console.warn("Mode faible performance activé : Désactivation des effets visuels avancés.");