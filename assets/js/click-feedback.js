// Ensemble global qui contiendra les ID "visités"
const visitedElements = new Set();



document.addEventListener('click', (event) => {
  // On teste si la cible est un élément cliquable
  if (event.target.matches('.sephirah, .label, .column, #infinity-symbol, h1 span')) {
    const id = event.target.id;
    console.log('Click détecté');

    // a) On ajoute l'ID dans le Set
    if (id) {
      visitedElements.add(id);
    }

    // b) On applique la classe visited
    event.target.classList.add('visited');
  }
});