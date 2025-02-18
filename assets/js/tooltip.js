/* ==========================================================================
   INFOS-BULLES (version complète) 
   Avec inertie, survol possible, et positionnement sûr
   ========================================================================== */

/* 
  1) Variables globales de délai 
     pour gérer l'apparition & la disparition
*/
let tooltipShowTimeout   = null;
let tooltipHideTimeout   = null;

// Ajuste ces délais selon tes préférences
const SHOW_DELAY = 200;  // 200ms avant affichage
const HIDE_DELAY = 200;  // 200ms avant disparition

/* 
  2) Sélection de l'élément .tooltip 
     et de toutes les .sephirah (qui possèdent data-tooltip)

const tooltip = document.getElementById('tooltip');*/
const sephirothElems = document.querySelectorAll('.sephirah');

// 3) Gestion du survol des Séphiroth
sephirothElems.forEach(seph => {
  // Survol de la séphirah -> Affichage avec délai
  seph.addEventListener('mouseover', (event) => {
    // Annule la disparition programmée, s'il y en a une
    if (tooltipHideTimeout) {
      clearTimeout(tooltipHideTimeout);
      tooltipHideTimeout = null;
    }
    // Programme l'affichage après SHOW_DELAY
    tooltipShowTimeout = setTimeout(() => {
      const content = event.currentTarget.getAttribute('data-tooltip');
      if (!content) return; // Pas de tooltip si data-tooltip est vide
      tooltip.innerHTML = content;
      tooltip.style.display = 'block'; // on l'affiche

      positionTooltip(event.pageX, event.pageY);
    }, SHOW_DELAY);
  });

  // Sortie de la séphirah -> Disparition avec délai - PROVOQUE UN BUG SI ON SORT De LA SEPHIRAH et qu'un autre tooltip est affiché (elle disparaît)
 /* seph.addEventListener('mouseout', () => {
    // Annule l'apparition en cours
    if (tooltipShowTimeout) {
      clearTimeout(tooltipShowTimeout);
      tooltipShowTimeout = null;
    }
    // Programme la disparition
    tooltipHideTimeout = setTimeout(() => {
      tooltip.style.display = 'none';
    }, HIDE_DELAY);
  });*/
});

/* 
  4) Permettre le survol de la bulle elle-même 
     => Si on entre dans la bulle, on annule la disparition
     => Si on sort de la bulle, on relance la disparition
*/

tooltip.addEventListener('mouseover', () => {
  // Annuler la disparition
  if (tooltipHideTimeout) {
    clearTimeout(tooltipHideTimeout);
    tooltipHideTimeout = null;
  }
});
tooltip.addEventListener('mouseout', () => {
  // Reprogrammer la disparition
  tooltipHideTimeout = setTimeout(() => {
    tooltip.style.display = 'none';
  }, HIDE_DELAY);
});

/* 
  5) Positionnement du tooltip 
     Evite qu'il ne sorte de la fenêtre
*/
function positionTooltip(pageX, pageY) {
  // On place d'abord le tooltip à une position provisoire
  const offset = 10; // Décalage par rapport au curseur
  tooltip.style.left = (pageX + offset) + 'px';
  tooltip.style.top  = (pageY + offset) + 'px';

  // On calcule les dimensions
  const rect = tooltip.getBoundingClientRect();
  const vw   = window.innerWidth;
  const vh   = window.innerHeight;

  let left = pageX + offset;
  let top  = pageY + offset;

  // Si ça déborde à droite
  if (left + rect.width > vw) {
    left = pageX - rect.width - offset;
  }
  // Si ça déborde en bas
  if (top + rect.height > vh) {
    top = pageY - rect.height - offset;
  }

  // Contrôle du trop haut ou trop à gauche
  if (left < 0) left = offset;
  if (top < 0)  top = offset;

  // Appliquer la position ajustée
  tooltip.style.left = left + 'px';
  tooltip.style.top  = top + 'px';
}

/* 
  6) (Optionnel) Mise à jour continue si on veut que 
     la bulle suive la souris
*/
// Si tu veux que le tooltip suive la souris même en se déplaçant,
// tu peux ajouter ceci :
document.addEventListener('mousemove', (e) => {
  if (tooltip.style.display === 'block') {
    positionTooltip(e.pageX, e.pageY);
  }
});
