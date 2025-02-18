/* ==========================================================================
   afficher-arbre.js
   --------------------------------------------------------------------------
   Gère l'affichage interactif de l'Arbre de Vie Séphirotique :
   1. Charge et insère les données (JSON).
   2. Dessine l'Arbre (lignes, étiquettes, particules).
   3. Gère les tooltips et éléments spéciaux (symbole de l'infini, piliers).
   ========================================================================= */



/* ------------------------------ Éléments DOM (dom signifi  )) ------------------------------ */
const container = document.getElementById('container');
const canvas    = document.getElementById('pathCanvas');
const tooltip   = document.getElementById('tooltip');
const ctx = canvas.getContext('2d', { willReadFrequently: true });



/* --------------- Variables / Propriétés stockées en global --------------- */
window.pathsFromJSON = null;  // Pour stocker les chemins (cineroth) depuis JSON
let particles = [];           // Tableau pour l'animation des particules

// Paramètres pour l'animation des particules
const particleSize  = 6;
const particleSpeed = 0.25;


// Détecter la langue depuis l'URL ou le navigateur
const userLang = navigator.language || navigator.userLanguage; // Langue du navigateur
const params = new URLSearchParams(window.location.search); // Paramètres de l'URL
const lang = params.get('lang'); // Paramètre "lang" ?lang=fr ou ?lang=en

// Chemins vers les fichiers JSON
const files = {
  fr: 'assets/data/data-fr.json',
  en: 'assets/data/data-en.json',
  he: 'assets/data/data-he.json',
  default: 'assets/data/data-en.json', // Fichier par défaut
};

// Initialisation de la variable globale
let jsonDataFile;

// Logique pour définir le fichier à charger
if (lang) {
  

  if (lang === 'fr') {
    jsonDataFile = files.fr;
    console.log("Fichier chargé via paramètre URL : Français");
  } else if (lang === 'en') {
    jsonDataFile = files.en;
    console.log("Fichier chargé via paramètre URL : Anglais");
  } else if (lang === 'he') {
    jsonDataFile = files.he;
    console.log("Fichier chargé via paramètre URL : Hébreu");
  } else {
    jsonDataFile = files.default;
    console.log("Paramètre de langue non reconnu, fichier par défaut : Anglais");
  }
} else {
  // Si aucun paramètre `lang`, on détecte via la langue du navigateur
  if (userLang.startsWith('fr')) {
    jsonDataFile = files.fr;
    console.log("Fichier chargé via navigateur : Français");
  } else if (userLang.startsWith('en')) {
    jsonDataFile = files.en;
    console.log("Fichier chargé via navigateur : Anglais");
  } else if (userLang.startsWith('he')) {
    jsonDataFile = files.he;
    console.log("Fichier chargé via navigateur : Hébreu");
  } else {
    jsonDataFile = files.default;
    console.log("Langue non reconnue, fichier par défaut : Anglais");
  }
}

// Affichage du fichier sélectionné pour confirmation
console.log("Fichier JSON sélectionné :", jsonDataFile);

/* ==========================================================================
   1) CHARGER ET INSÉRER LES DONNÉES JSON
   ========================================================================== */

/**
 * Charge un fichier JSON et retourne l'objet correspondant.
 * @param {string} filePath - Chemin vers le JSON.
 * @returns {Promise<Object>} 
 */
async function loadJSON(filePath) {
  try {
    const response = await fetch(filePath);    

    console.log("filePath:", filePath);

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Le fichier chargé n'est pas un JSON valide.");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors du chargement du JSON :", error);
    throw error; // Propage l'erreur pour gestion ultérieure
  }
}

/**
 * Récupère data.json, met à jour le titre H1, les Séphiroth
 * et stocke les chemins dans window.pathsFromJSON.
 */
async function populateContent() {
  try {
    // 1) Récupération des données JSON
     const data = await loadJSON(jsonDataFile);
   
    // 2) Met à jour le titre principal
    const mainTitle = document.querySelector('h1');
    if (mainTitle) {
      mainTitle.innerHTML = `<span tabindex="0">${data.pageTitle.pageTitleTxt}</span>`;
    
      if (data.pageTitle.tooltipTitleTxt) {
        // Attacher les événements au span également
        const titleSpan = mainTitle.querySelector('span');     
        // Événements sur span
        titleSpan.setAttribute('data-tooltip', data.pageTitle.tooltipTitleTxt+"<br><img class='tooltip-image' src='assets/img/tree/adam-kadmon.webp' alt='Adam Kadmon'></img>");
        titleSpan.addEventListener('mouseover', showTooltip);
        titleSpan.addEventListener('mouseout', hideTooltip);
      }
    }

    // 3) MàJ des Séphiroth
    data.sephiroth.forEach(seph => {
      const sephirahElem = document.getElementById(seph.id);
      if (!sephirahElem) return;

      // Exemple injecté : "1<br>Kether<br><strong>כתר</strong><br>Couronne"
      const numStr  = (seph.num !== undefined) ? `${seph.num}<br>` : '';
      sephirahElem.innerHTML = 
        `${numStr}${seph.name}<br>${seph.hebrew}<br>${seph.translation}<br>${seph.glyph}`;

      // Infobulle
      const pathInfo   = seph.path    ? `<hr class="tooltip-separator">${seph.path}` : '';
      const numerologyInfo   = seph.numerology    ? `<hr class="tooltip-separator">${seph.numerology}` : '';
      const planetInfo = seph.planet  ? `<hr class="tooltip-separator"><strong>${seph.glyph} ${seph.planet}</strong> : ${seph.astrology}` : '';
      //const tarotInfo = seph.num ? `<hr class="tooltip-separator"><strong>Tarot</strong> : <div class="grid-container"><figure><figcaption>Atsilouth : 3 de Bâtons</figcaption><img id="imgTarotSephirah" src="assets/img/tarot/wands/${seph.num}.jpg" alt="Carte de tarot"><figcaption id="figcaption">Atsilouth : 3 de Bâtons</figcaption></figure><figure><figcaption>Beriah : 3 de Coupes</figcaption><img id="imgTarotSephirah" src="assets/img/tarot/cups/${seph.num}.jpg" alt="Carte de tarot"></figure><figure><figcaption>Yetsirah : 3 d'Épées</figcaption><img id="imgTarotSephirah" src="assets/img/tarot/swords/${seph.num}.jpg" alt="Carte de tarot"></figure><figure><figcaption>Asiyah : 3 de Deniers</figcaption><img id="imgTarotSephirah" src="assets/img/tarot/pentacles/${seph.num}.jpg" alt="Carte de tarot"></figure></div>` : '';
      const tarotInfo = seph.num ? `<hr class="tooltip-separator">${seph.tarot}<br><div id="grille"><img id="imgTarotSephirah" src="assets/img/tarot/wands/${seph.num}.jpg" alt="Carte de tarot"><img id="imgTarotSephirah" src="assets/img/tarot/cups/${seph.num}.jpg" alt="Carte de tarot"><img id="imgTarotSephirah" src="assets/img/tarot/swords/${seph.num}.jpg" alt="Carte de tarot"><img id="imgTarotSephirah" src="assets/img/tarot/pentacles/${seph.num}.jpg" alt="Carte de tarot"></div>` : '';
      sephirahElem.setAttribute(
        'data-tooltip', 
        `${seph.name}, <strong>${seph.hebrew}</strong><br>${seph.tooltip}${numerologyInfo}${pathInfo}${planetInfo}${tarotInfo}`
      );
    });

    // 4) Stockage des chemins
    window.pathsFromJSON = data.cineroth ?? [];
    window.infinitySymbolFromJSON = data.infinitySymbol ?? [];
    window.pillarsFromJSON = data.pillars ?? [];    
  }
  catch (err) {
    console.error('Impossible de charger le JSON :', err);
  }
}

/* ==========================================================================
   2) CALCUL DES COORDONNÉES DE CHAQUE CHEMIN
   ========================================================================== */

/**
 * Calcule (startX, startY, endX, endY) pour chaque chemin,
 * en repérant la position de .startId et .endId dans le container.
 * @function generatePathsCoordinates
 */
function generatePathsCoordinates() {
  if (!window.pathsFromJSON) return;
  const containerRect = container.getBoundingClientRect();

  window.pathsFromJSON.forEach(path => {
    const startEl = document.getElementById(path.connection.startId);
    const endEl   = document.getElementById(path.connection.endId);

    if (startEl && endEl) {
      const startRect = startEl.getBoundingClientRect();
      const endRect   = endEl.getBoundingClientRect();

      path.startX = startRect.left - containerRect.left + startRect.width / 2;
      path.startY = startRect.top  - containerRect.top  + startRect.height / 2;
      path.endX   = endRect.left   - containerRect.left  + endRect.width / 2;
      path.endY   = endRect.top    - containerRect.top   + endRect.height / 2;
    }

  });
}

/* ==========================================================================
   3) CRÉATION DES LABELS (DIV) À PARTIR DES CHEMINS
   ========================================================================== */

/** 
 * Retire toutes les étiquettes (labels) du DOM.
 */
function clearLabels() {
  const labels = document.querySelectorAll('.label');
  labels.forEach(label => label.remove());
}

/**
 * Crée les étiquettes DOM pour chaque path (une seule fois, hors animation).
 * @function createLabelsFromPaths
 */
function createLabelsFromPaths() {
  if (!window.pathsFromJSON) return;

  // 1) Déclarer la fonction "generateTooltipHTML(path)" AU DÉBUT
  //    (ou la mettre à l'extérieur si tu préfères)
  function generateTooltipHTML(path) {
    const hebrewLetterAndMeaning = path.letter.hebrew 
      ? `<div class="tooltip-header">
           <div class="tooltip-hebrew-letter">${path.letter.hebrew}</div>
           <div class="tooltip-meaning"><strong>(${path.letter.name} :</strong> ${path.letter.meaning}, ${path.letter.number})</div>
         </div>` 
      : '';

    const sections = [
      hebrewLetterAndMeaning,
      path.connection.description && `<div class="tooltip-section"><strong>Description :</strong> ${path.connection.description}</div>`,
      path.cinerMeaning && `<div class="tooltip-section"><strong>Sentier :</strong> ${path.cinerMeaning}</div>`,
      path.consciousness && `<div class="tooltip-section">${path.consciousness}</div>`,
      path.consciousness && `<div class="tooltip-section"><strong>Numérologie :</strong> ${path.numerology}</div>`,
      path.yetsiratic && `<div class="tooltip-section"><strong>Correspondance :</strong> ${path.yetsiratic.glyph} ${path.yetsiratic.correspondence} (${path.yetsiratic.meaning})</div>`,
      // path.tarot && `<div class="tooltip-section"><strong>Tarot :</strong> ${path.tarot.name} (${path.tarot.symbolism})</div></div><embed id="imgTarotPath" src="assets/img/tarot/${path.tarot.number}.svg" alt="Carte de tarot" type="image/svg+xml"></embed>`,
      path.tarot && `<div class="tooltip-section"><strong>Tarot :</strong> ${path.tarot.name} (${path.tarot.symbolism})</div></div><image id="imgTarotPath" src="assets/img/tarot/${path.tarot.number}.webp" alt="Carte de tarot" ></image>`,
    ];

    // On assemble tout (en insérant <hr class="tooltip-separator"> entre chaque bloc)
    return sections.filter(Boolean).join('<hr class="tooltip-separator">');
  }

  // 2) On boucle sur tous les paths
  window.pathsFromJSON.forEach(path => {
    if (path.startX === undefined || path.endX === undefined) return;

    const midX = (path.startX + path.endX) / 2;
    const midY = (path.startY + path.endY) / 2;

    const labelDiv = document.createElement('div');
    labelDiv.className = 'label hebrew'; 
    labelDiv.id        = path.id;

    labelDiv.style.left = `${midX}px`;
    labelDiv.style.top  = `${midY}px`;

    labelDiv.textContent = `${path.num} ${path.letter.hebrew} (${path.letter.name})`;


        // RÉAPPLICATION DE L’ÉTAT VISITÉ, si on l’avait déjà cliqué auparavant :
        if (visitedElements.has(path.id)) {
          labelDiv.classList.add('visited');
        }
    

    // ---- AFFECTER ICI le data-tooltip (pas besoin d'un second .forEach plus bas)
    const tooltipHTML = generateTooltipHTML(path);
    labelDiv.setAttribute('data-tooltip', tooltipHTML);
    labelDiv.setAttribute('tabindex', '0');
    // ------------------------------------

    labelDiv.addEventListener('mouseover', showTooltip);
    labelDiv.addEventListener('mouseout',  hideTooltip);
    labelDiv.addEventListener('click',     handleClick);


// Ajout des gestionnaires d'événements pour le long press
    labelDiv.addEventListener('mousedown', handleMouseDown);
    labelDiv.addEventListener('mouseup', handleMouseUp);
    labelDiv.addEventListener('mouseleave', handleMouseLeave);


    container.appendChild(labelDiv);
  });
}


/* ==========================================================================
   4) DESSIN SUR LE CANVAS : LIGNES + HALOS
   ========================================================================== */

/**
 * Efface le canevas en le réinitialisant.
 */
function clearCanvas() {
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
   // Ajout de l'effet de traînée subtil au lieu d'un effacement brutal
   ctx.globalCompositeOperation = 'destination-out';
   ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Ajuste pour plus ou moins de persistance
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   ctx.globalCompositeOperation = 'lighter'; // Mode de fusion lumineux
}

/**
 * Dessine les lignes (chemins) et les halos autour des Séphiroth, 
 * en se basant sur path.startX / path.endX déjà calculés.
 */
function drawLinesOnCanvas() {
  // Ajuste la taille du canvas à chaque fois
  const rect = container.getBoundingClientRect();
  canvas.width  = rect.width;
  canvas.height = rect.height;

  // Nettoyage
  clearCanvas();

  // Dessine les chemins
  if (window.pathsFromJSON) {
    ctx.strokeStyle = 'gold';
    ctx.lineWidth   = 2;

    window.pathsFromJSON.forEach(path => {
      if (
        path.startX !== undefined && 
        path.startY !== undefined && 
        path.endX   !== undefined && 
        path.endY   !== undefined
      ) {
        ctx.beginPath();
        ctx.moveTo(path.startX, path.startY);
        ctx.lineTo(path.endX,   path.endY);
        ctx.stroke();
      }
    });

    // Vérifie si le premier élément de classe 'sephirah' a une largeur de 90px
    const firstSephirah = document.querySelector('.sephirah');
    if (firstSephirah && firstSephirah.offsetWidth >= 90) {
      // Dessine les halos
      drawHalos();
    }
  }
}

/**
 * Dessine 3 cercles concentriques autour des points start/end de chaque chemin.
 */
function drawHalos() {
  if (!window.pathsFromJSON) return;

  window.pathsFromJSON.forEach(path => {
    const points = [
      { x: path.startX, y: path.startY },
      { x: path.endX,   y: path.endY   }
    ];
    points.forEach(pt => {
      if (pt.x !== undefined && pt.y !== undefined) {
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 20 * i, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 223, 0, ${0.3 / i})`;
          ctx.lineWidth   = 2;
          ctx.stroke();
        }
      }
    });
  });
}


/* ==========================================================================
   6) TOOLTIP ET CLIC
   ========================================================================== */

/**
 * Affiche le tooltip lors du survol.
 */
function showTooltip(event) {
  const tooltipText = event.target.getAttribute('data-tooltip');
  if (tooltipText) {
    tooltip.innerHTML = tooltipText;
    tooltip.style.display = 'block';
    tooltip.style.left    = `${event.pageX + 10}px`;
    tooltip.style.top     = `${event.pageY + 10}px`;
  }
}

/**
 * Cache le tooltip quand la souris quitte l'élément.
 */
function hideTooltip() {
  tooltip.style.display = 'none';
}

/**
 * Gère le clic (ex: jouer un son).
 */
function handleClick(event) {
  // TODO: logiques sons, etc.
  // console.log('Clic sur label :', event.target.id);
}

/* ==========================================================================
   7) SYMBOLE DE L'INFINI ET TROIS PILIERS
   ========================================================================== */

/**
 * Crée le symbole de l'infini (∞) et l'ajoute au DOM dans le container,
 * puis le positionne par rapport à Kether (#item1) et au titre principal.L
 */  const infinitySymbol = document.createElement('div');
function createInfinitySymbol() {
  // Création 
  infinitySymbol.id = 'infinity-symbol';
  infinitySymbol.classList.add('infinity-symbol');
  infinitySymbol.textContent = infinitySymbolFromJSON.infinitySymbolTxt; /*"[ Aïn Soph (אין סוף) ]";*/
  infinitySymbol.style.position = 'absolute';
  infinitySymbol.setAttribute('data-tooltip', infinitySymbolFromJSON.tooltipinfiniSymbolTxt+'<br><img class="tooltip-image2" src="assets/img/tree/ain-soph.webp">'); /* "Source ultime de l'existence.<br>L'Infini divin, au-delà des limites et de toute compréhension.");*/
  infinitySymbol.setAttribute('tabindex', '0'); // Ajout du tabindex
  container.appendChild(infinitySymbol);
  // Tooltip
  infinitySymbol.addEventListener('mouseover', showTooltip);
  infinitySymbol.addEventListener('mouseout', hideTooltip);
  // Position
  positionInfinitySymbol(infinitySymbol);
}

/**
 * Positionne le symbole de l'infini entre le bas du <h1> et le haut de #item1 (Kether).
 */
function positionInfinitySymbol(infinitySymbol) {

  const mainTitle = document.querySelector('h1');
  const kether = document.getElementById('item1');

  // Si aucun h1 ou aucun Kether, on sort
  if (!kether || !mainTitle) return;

  // Reçoit les dimensions du titre, du container et du Kether
  const titleRect     = mainTitle.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const ketherRect    = kether.getBoundingClientRect();

  // Position du titre par rapport à la fenêtre
  const titleBottomY = titleRect.bottom - containerRect.top;
  const ketherTopY   = ketherRect.top    - containerRect.top;

  // Milieu vertical 
  const midY = (titleBottomY + ketherTopY) /2.8;

  // Centre horizontal de Kether (en fonction de sa largeur)
  const midX = (ketherRect.left - containerRect.left) + (ketherRect.width / 2);

  // Positionnement
  infinitySymbol.style.left = `${midX}px`;
  infinitySymbol.style.top  = `${midY}px`;
}

/**
 * Crée les 3 colonnes (piliers) : Sévérité (gauche), Équilibre (centre), Miséricorde (droite).
 */



function createPillars() {
  // 1) Créer les 3 div
  const leftPillar = document.createElement('div');
  leftPillar.id = 'pillar-left';
  leftPillar.textContent = window.pillarsFromJSON.pillarLeftTxt;
  leftPillar.style.position = 'absolute';
  leftPillar.setAttribute('data-tooltip', window.pillarsFromJSON.tooltipPillarLeftTxt);
  leftPillar.setAttribute('tabindex', '0'); // Ajout du tabindex

  const centerPillar = document.createElement('div');
  centerPillar.id = 'pillar-center';
  centerPillar.textContent = window.pillarsFromJSON.pillarCenterTxt;
  centerPillar.style.position = 'absolute';
  centerPillar.setAttribute('data-tooltip', window.pillarsFromJSON.tooltipPillarCenterTxt);
  centerPillar.setAttribute('tabindex', '0'); // Ajout du tabindex

  const rightPillar = document.createElement('div');
  rightPillar.id = 'pillar-right';
  rightPillar.textContent = window.pillarsFromJSON.pillarRightTxt;
  rightPillar.style.position = 'absolute';
  rightPillar.setAttribute('data-tooltip', window.pillarsFromJSON.tooltipPillarRightTxt);
  rightPillar.setAttribute('tabindex', '0'); // Ajout du tabindex

  // Ajout au container
  container.appendChild(leftPillar);
  container.appendChild(centerPillar);
  container.appendChild(rightPillar);

  // Position
  positionPillars(leftPillar, centerPillar, rightPillar);

    // Attache des gestionnaires de clic
    attachColumnClickHandlers();

  // Tooltip éventuel
  [leftPillar, centerPillar, rightPillar].forEach(pillar => {
    pillar.classList.add('column');
    pillar.addEventListener('mouseover', showTooltip);
    pillar.addEventListener('mouseout',  hideTooltip);
    // Ajout des gestionnaires d'événements pour le long press
    pillar.addEventListener('mousedown', handleMouseDown);
    pillar.addEventListener('mouseup', handleMouseUp);
    pillar.addEventListener('mouseleave', handleMouseLeave);
  });
}

function attachColumnClickHandlers() {
  const leftColumn = document.getElementById('pillar-left');
  const centerColumn = document.getElementById('pillar-center');
  const rightColumn = document.getElementById('pillar-right');

  if (leftColumn) {
    leftColumn.addEventListener('click', handleColumnClick);
  }
  if (centerColumn) {
    centerColumn.addEventListener('click', handleColumnClick);
  }
  if (rightColumn) {
    rightColumn.addEventListener('click', handleColumnClick);
  }
}




/**
 * Positionne les 3 piliers sous la séphirah la plus basse de chaque pilier.
 */
function positionPillars(leftPillar, centerPillar, rightPillar) {
  // IDs des séphiroth par pilier (à adapter si besoin)
  const leftIDs   = ['item3', 'item5', 'item8'];        
  const centerIDs = ['item1', 'daath', 'item6', 'item9', 'item10'];
  const rightIDs  = ['item2', 'item4', 'item7'];

  // Trouve la plus basse
  const leftBottom   = findBottomSephirah(leftIDs);
  const centerBottom = findBottomSephirah(centerIDs);
  const rightBottom  = findBottomSephirah(rightIDs);

  // On choisit un offset vertical
  const offsetY = 32;
  let centerLineY = 0;

  // 1) Pilier central
  if (centerBottom) {
    const containerRect = container.getBoundingClientRect();
    const refRect       = centerBottom.getBoundingClientRect();

    centerLineY = (refRect.top - containerRect.top) + refRect.height + offsetY;

    // X = milieu de la séphirah
    const centerX = (refRect.left - containerRect.left) + (refRect.width / 2);
    placePillarAt(centerPillar, centerX, centerLineY);
  }

  // 2) Pilier gauche
  if (leftBottom) {
    const containerRect = container.getBoundingClientRect();
    const refRect       = leftBottom.getBoundingClientRect();
    const leftX         = (refRect.left - containerRect.left) + (refRect.width / 2);
    placePillarAt(leftPillar, leftX, centerLineY);
  }

  // 3) Pilier droit
  if (rightBottom) {
    const containerRect = container.getBoundingClientRect();
    const refRect       = rightBottom.getBoundingClientRect();
    const rightX        = (refRect.left - containerRect.left) + (refRect.width / 2);
    placePillarAt(rightPillar, rightX, centerLineY);
  }
}

/**
 * Renvoie l'élément Séphirah dont le `top` est le plus grand (le plus bas dans le container).
 */
function findBottomSephirah(sephirahIDs) {
  let bottomElement = null;
  let bottomValue = -Infinity;
  const containerRect = container.getBoundingClientRect();

  sephirahIDs.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const topInContainer = rect.top - containerRect.top;

    if (topInContainer > bottomValue) {
      bottomValue = topInContainer;
      bottomElement = el;
    }
  });
  return bottomElement;
}

/**
 * Place un pilier à (x, y) dans le container, en le centrant sur ce point.
 */
function placePillarAt(pillarDiv, x, y) {
  pillarDiv.style.left = `${x}px`;
  pillarDiv.style.top  = `${y}px`;
  /*pillarDiv.style.transform = 'translate(-50%, -50%)';*/
}

/* ==========================================================================
   8) INITIALISATION GLOBALE + RESIZE
   ========================================================================== */
// on attent que le DOM soit chargé
document.addEventListener('DOMContentLoaded', async () => {
  // 1) Charge et insère le contenu JSON
  await populateContent();


  // scaleTreeToFit();  // Juste après avoir inséré & positionné l’Arbre 

  // 2) Calcule les coords (startX, endX)
  generatePathsCoordinates();

  // 3) Crée les étiquettes
  createLabelsFromPaths();

  // 4) Initialise l'animation des particules
  // 1) Redessine le canvas (lignes + halos)
  drawLinesOnCanvas();

  initParticules();
  animateParticles();
   // 2) Démarrer l’animation
   startParticlesAnimation(); 

  // 6) Symbole de l'infini
  createInfinitySymbol();

  // 7) Les trois piliers
  createPillars();

 // 5) Active le tooltip pour les séphiroth
  document.querySelectorAll('.sephirah').forEach(sephirah => {
    sephirah.addEventListener('mouseover', showTooltip);
    sephirah.addEventListener('mouseout',  hideTooltip);
  });


    // Ajout du code pour cacher l'élément de chargement
    document.getElementById('loading').style.display = 'none';

    // scaleTreeToFit();
});

/**
 * Quand on redimensionne la fenêtre :
 *  - Recalcule les positions
 *  - Recrée les étiquettes
 *  - Réinitialise les particules
 */
window.addEventListener('resize', () => {
  generatePathsCoordinates();
  clearLabels();
  createLabelsFromPaths();
  // 1) Redessine le canvas (lignes + halos)
  drawLinesOnCanvas();
  initParticules();
  // L'animation est déjà lancée, donc elle prendra effet dès la prochaine frame.

  // Repositionne le symbole de l'infini et les piliers
  positionInfinitySymbol(document.getElementById('infinity-symbol'));
  positionPillars(
    document.getElementById('pillar-left'),
    document.getElementById('pillar-center'),
    document.getElementById('pillar-right')
  );
});





















