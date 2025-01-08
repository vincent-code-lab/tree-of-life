/* ==========================================================================
   afficher-arbre.js
   --------------------------------------------------------------------------
   Gère l'affichage interactif de l'Arbre de Vie Séphirotique :
   1. Charge et insère les données (JSON).
   2. Dessine l'Arbre (lignes, étiquettes, particules).
   3. Gère les tooltips et éléments spéciaux (symbole de l’infini, piliers).
   ========================================================================= */

/* ------------------------------ Éléments DOM (dom signifi  )) ------------------------------ */
const container = document.getElementById('container');
const canvas    = document.getElementById('pathCanvas');
const tooltip   = document.getElementById('tooltip');
const ctx       = canvas.getContext('2d');

/* --------------- Variables / Propriétés stockées en global --------------- */
window.pathsFromJSON = null;  // Pour stocker les chemins (cineroth) depuis JSON
let particles = [];           // Tableau pour l’animation des particules

// Paramètres pour l’animation des particules
const particleSize  = 6;
const particleSpeed = 0.25;

/* ==========================================================================
   1) CHARGER ET INSÉRER LES DONNÉES JSON
   ========================================================================== */

/**
 * Charge un fichier JSON et retourne l’objet correspondant.
 * @param {string} filePath - Chemin vers le JSON.
 * @returns {Promise<Object>} 
 */
async function loadJSON(filePath) {
  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(`Erreur de chargement du JSON : ${response.status}`);
  }
  return await response.json();
}

/**
 * Récupère data.json, met à jour le titre H1, les Séphiroth
 * et stocke les chemins dans window.pathsFromJSON.
 */
async function populateContent() {
  try {
    // 1) Récupération des données
    const data = await loadJSON('assets/data/data.json');

    // 2) Met à jour le titre principal
    const mainTitle = document.querySelector('h1');
    if (mainTitle) {
      mainTitle.textContent = data.pageTitle;
      if (data.tooltipTitle) {
        mainTitle.setAttribute('data-tooltip', data.tooltipTitle);
        mainTitle.addEventListener('mouseover', showTooltip);
        mainTitle.addEventListener('mouseout', hideTooltip);
      }
    }

    // 3) MàJ des Séphiroth
    data.sephiroth.forEach(seph => {
      const sephirahElem = document.getElementById(seph.id);
      if (!sephirahElem) return;

      // Exemple injecté : "1<br>Kether<br>כתר<br>Couronne"
      const numStr  = (seph.num !== undefined) ? `${seph.num}<br>` : '';
      sephirahElem.innerHTML = 
        `${numStr}${seph.name}<br>${seph.hebrew}<br>${seph.translation}<br>${seph.glyph}`;

      // Infobulle
      const pathInfo   = seph.path    ? `<br>${seph.path}.` : '';
      const planetInfo = seph.planet  ? `<br>${seph.glyph} ${seph.planet} : ${seph.astrology}.` : '';
      sephirahElem.setAttribute(
        'data-tooltip', 
        `${seph.tooltip}.${pathInfo}${planetInfo}`
      );
    });

    // 4) Stockage des chemins
    window.pathsFromJSON = data.cineroth;
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
    const startEl = document.getElementById(path.startId);
    const endEl   = document.getElementById(path.endId);

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

  window.pathsFromJSON.forEach(path => {
    if (path.startX === undefined || path.endX === undefined) return;

    // Milieu (pour placer l’étiquette)
    const midX = (path.startX + path.endX) / 2;
    const midY = (path.startY + path.endY) / 2;

    const labelDiv = document.createElement('div');
    labelDiv.className = 'label hebrew'; 
    labelDiv.id        = path.id;

    // Position
    labelDiv.style.left = `${midX}px`;
    labelDiv.style.top  = `${midY}px`;

    // Texte de l’étiquette
    labelDiv.textContent = `${path.num} ${path.letter.hebrew} (${path.letter.name})`;

    // Infobulle détaillée
    const letterMeaning = path.letter.meaning 
      ? `<strong>Signification lettre :</strong> ${path.letter.meaning}`
      : '';
    const descriptionInfo = path.description 
      ? `<br><strong>Description :</strong> ${path.description}`
      : '';
    const tarotInfo = (path.tarot)
      ? `<br><strong>Tarot:</strong> ${path.tarot.name} (${path.tarot.symbolism})`
      : '';
    const consciousnessInfo = (path.consciousness)
      ? `<br><strong>Conscience :</strong> ${path.consciousness}`
      : '';
    const yetsiraticInfo = (path.yetsiratic)
      ? `<br><strong>Yetsiratic :</strong> ${path.yetsiratic.glyph} ${path.yetsiratic.correspondence} (${path.yetsiratic.meaning})`
      : '';
    const cinerMeaningInfo = (path.cinerMeaning)
      ? `<br><strong>Signification du Ciner :</strong> ${path.cinerMeaning}`
      : '';

    // Concaténation
    const tooltipHTML = [
      letterMeaning, 
      descriptionInfo, 
      tarotInfo, 
      consciousnessInfo, 
      yetsiraticInfo, 
      cinerMeaningInfo
    ].join(''); // tous à la suite

    labelDiv.setAttribute('data-tooltip', tooltipHTML);

    // Écouteurs
    labelDiv.addEventListener('mouseover', showTooltip);
    labelDiv.addEventListener('mouseout',  hideTooltip);
    labelDiv.addEventListener('click',     handleClick);

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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    // Dessine les halos
    drawHalos();
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
   5) ANIMATION DES PARTICULES
   ========================================================================== */

/**
 * Initialise le tableau des particules (startX, endX, etc.).
 */
function initParticles() {
  particles = [];
  if (!window.pathsFromJSON) return;

  window.pathsFromJSON.forEach(path => {
    if (
      path.startX !== undefined && 
      path.startY !== undefined && 
      path.endX   !== undefined && 
      path.endY   !== undefined
    ) {
      // Ajoute UNE particule par chemin (ou plusieurs si vous le souhaitez)
      particles.push({
        startX:   path.startX,
        startY:   path.startY,
        endX:     path.endX,
        endY:     path.endY,
        x:        path.startX,
        y:        path.startY,
        progress: 0
      });
    }
  });
}

/**
 * Lance la boucle d’animation : 
 *  - Redessine le canvas
 *  - Fait avancer les particules 
 *  - Dessine les particules
 */
function animateParticles() {
  function drawFrame() {
    // 1) Redessine le canvas (lignes + halos)
    drawLinesOnCanvas();

    // 2) Met à jour & dessine chaque particule
    particles.forEach(p => {
      p.progress += particleSpeed / 100;
      if (p.progress > 1) p.progress = 0; // boucle
      
      // calcul position
      p.x = p.startX + (p.endX - p.startX) * p.progress;
      p.y = p.startY + (p.endY - p.startY) * p.progress;

      // dessin
      ctx.beginPath();
      ctx.arc(p.x, p.y, particleSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 223, 0, 0.8)';
      ctx.fill();
    });

    requestAnimationFrame(drawFrame);
  }

  drawFrame(); // démarre la boucle
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
   7) SYMBOLE DE L’INFINI ET TROIS PILIERS
   ========================================================================== */

/**
 * Crée le symbole de l’infini (∞) et l’ajoute au DOM dans le container,
 * puis le positionne par rapport à Kether (#item1) et au titre principal.
 */  const infinitySymbol = document.createElement('div');
function createInfinitySymbol() {
  // Création
 
  infinitySymbol.id = 'infinity-symbol';
  infinitySymbol.classList.add('infinity-symbol');
  infinitySymbol.textContent = "Aïn Soph (אין סוף)";
  infinitySymbol.style.position = 'absolute';
  infinitySymbol.setAttribute('data-tooltip', "Infinité divine absolue, l’Inconnaissable, l’Incommensurable, l’Inconcevable, au-delà de toute limite et de toute définition.<br>(Considéré comme l’Essence suprême et la Source ultime de toute existence)");
  
  container.appendChild(infinitySymbol);

  // Tooltip
  infinitySymbol.addEventListener('mouseover', showTooltip);
  infinitySymbol.addEventListener('mouseout', hideTooltip);

  // Position
  positionInfinitySymbol(infinitySymbol);
}

/**
 * Positionne le symbole de l’infini entre le bas du <h1> et le haut de #item1 (Kether).
 */
function positionInfinitySymbol(infinitySymbol) {
  const kether = document.getElementById('item1');
  const mainTitle = document.querySelector('h1');
  if (!kether || !mainTitle) return;

  const containerRect = container.getBoundingClientRect();
  const ketherRect    = kether.getBoundingClientRect();
  const titleRect     = mainTitle.getBoundingClientRect();

  const titleBottomY = titleRect.bottom - containerRect.top;
  const ketherTopY   = ketherRect.top    - containerRect.top;

  // Milieu vertical
  const midY = (titleBottomY + ketherTopY) / 2;

  // Centre horizontal de Kether
  const midX = (ketherRect.left - containerRect.left) + (ketherRect.width / 2);

  infinitySymbol.style.left = `${midX}px`;
  infinitySymbol.style.top  = `${midY}px`;
  infinitySymbol.style.transform = 'translate(-50%, -50%)';
}

/**
 * Crée les 3 colonnes (piliers) : Sévérité (gauche), Équilibre (centre), Miséricorde (droite).
 */



function createPillars() {
  // 1) Créer les 3 div
  const leftPillar = document.createElement('div');
  leftPillar.id = 'pillar-left';
  leftPillar.textContent = 'Qav Geburah (גבורה)';
  leftPillar.style.position = 'absolute';
  leftPillar.setAttribute('data-tooltip', "Pilier 'Sévérité' (Rigueur, justice, force et discipline)");

  const centerPillar = document.createElement('div');
  centerPillar.id = 'pillar-center';
  centerPillar.textContent = 'Qav Emsaï (אמצע)';
  centerPillar.style.position = 'absolute';
  centerPillar.setAttribute('data-tooltip', "Pilier 'Équilibre' (Médiation, harmonie, paix et stabilité)");

  const rightPillar = document.createElement('div');
  rightPillar.id = 'pillar-right';
  rightPillar.textContent = 'Qav Hesed (חסד)';
  rightPillar.style.position = 'absolute';
  rightPillar.setAttribute('data-tooltip', "Pilier 'Miséricorde' (Bonté, compassion, générosité et amour)");

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
  const offsetY = 30;
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
  pillarDiv.style.transform = 'translate(-50%, -50%)';
}

/* ==========================================================================
   8) INITIALISATION GLOBALE + RESIZE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Charge et insère le contenu JSON
  await populateContent();

  // 2) Calcule les coords (startX, endX)
  generatePathsCoordinates();

  // 3) Crée les étiquettes
  createLabelsFromPaths();

  // 4) Initialise l’animation des particules
  initParticles();
  animateParticles();

  // 5) Active le tooltip pour les séphiroth
  document.querySelectorAll('.sephirah').forEach(sephirah => {
    sephirah.addEventListener('mouseover', showTooltip);
    sephirah.addEventListener('mouseout',  hideTooltip);
  });

  // 6) Symbole de l’infini
  createInfinitySymbol();

  // 7) Les trois piliers
  createPillars();
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
  initParticles();
  // L’animation est déjà lancée, donc elle prendra effet dès la prochaine frame.

  // Repositionne le symbole de l’infini et les piliers
  positionInfinitySymbol(document.getElementById('infinity-symbol'));
  positionPillars(
    document.getElementById('pillar-left'),
    document.getElementById('pillar-center'),
    document.getElementById('pillar-right')
  );
});



















// Partie 2 : Animation des particules autour de Kether - comment des particules d'or ou des étoiles autour de Kether (Séphirah 1) pour symboliser la Couronne.


document.addEventListener('DOMContentLoaded', () => {
  initKetherParticles();
});

function initKetherParticles() {
  // ==========================
  // 1) PARAMÈTRES GLOBAUX
  // ==========================
  const PARTICLE_COUNT      = 600;   // Nombre de particules (ex: 60)
  const MIN_RADIUS          = 40;   // Rayon min autour de Kether (px) 20
  const MAX_RADIUS          = 70;   // Rayon max initial (px)70

  

  /*const MAX_DISTANCE        = 70;  // Distance max avant réinitialisation (px) 300*/
  function getRandomMaxDistance() {
    const randomValue = Math.random();
    if (randomValue < 0.7) {
      return Math.random() * 70;
    } else {
      return 71 + Math.random() * (1000 - 71);
    }
  }

  const MAX_DISTANCE = getRandomMaxDistance();
  
  // Vitesses
  const BASE_ROTATION_SPEED = 0.2;  // Vitesse de rotation minimale 0.2
  const EXTRA_ROTATION_SPEED= 0.5;  // Amplitude aléatoire en plus 0.5
  const BASE_FALL_SPEED     = 0.1;  // Vitesse de "chute" minimale 70
  const EXTRA_FALL_SPEED    = 0.3;  // Amplitude aléatoire en plus 0.3

  // Particule (visuel)
  const PARTICLE_SIZE       = 0.9;    // Taille des particules (px) 3
  const MIN_OPACITY         = 0.01;  // Opacité minimale 0.4
  const MAX_OPACITY         = 0.7;  // Opacité maximale 1.0

  // Couleur "or" (peut être ajustée)
  // Vous pouvez également générer des couleurs variables si vous le souhaitez.
  const GOLD_COLOR = '255, 255, 220'; // RVB du doré (FFD700) GOLD_COLOR = '255, 215, 0'; 
  

  // ==========================
  // 2) Initialisation Canvas
  // ==========================
  const canvas    = document.getElementById('ketherParticlesCanvas');
  const container = document.getElementById('container');
  const ketherEl  = document.getElementById('item1');
  if (!canvas || !container || !ketherEl) return;
  
  const ctx = canvas.getContext('2d');

  // Ajuste la taille du canvas selon le conteneur
  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);


  // ==========================
  // 3) Calcul de la position de Kether
  // ==========================
  function getKetherCenter() {
    const containerRect = container.getBoundingClientRect();
    const ketherRect    = ketherEl.getBoundingClientRect();
    const x = (ketherRect.left - containerRect.left) + ketherRect.width / 2;
    const y = (ketherRect.top  - containerRect.top ) + ketherRect.height / 2;
    return { x, y };
  }


  // ==========================
  // 4) Création des particules
  // ==========================
  const particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.random() * (2 * Math.PI);            // angle initial (0 à 2π)
    const radius = MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS);
    const rotationSpeed = BASE_ROTATION_SPEED + Math.random() * EXTRA_ROTATION_SPEED;
    const fallSpeed     = BASE_FALL_SPEED     + Math.random() * EXTRA_FALL_SPEED;

    // Opacité aléatoire dans la fourchette [MIN_OPACITY, MAX_OPACITY]
    const opacity = MIN_OPACITY + Math.random() * (MAX_OPACITY - MIN_OPACITY);

    particles.push({
      angle,
      radius,
      rotationSpeed,
      fallSpeed,
      opacity,
    });
  }


  // ==========================
  // 5) Boucle d’animation
  // ==========================
  function animate() {
    // a) Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // b) Récupérer la position actuelle de Kether
    const { x: cx, y: cy } = getKetherCenter();

    // c) Mettre à jour & dessiner chaque particule
    particles.forEach(p => {
      // Mise à jour de l'angle (rotation autour de Kether)
      // Ajustez le facteur de 0.01 si vous voulez plus/moins de rotation
      p.angle += p.rotationSpeed * 0.01;

      // Les particules s'éloignent doucement (chute) : on incrémente le rayon
      p.radius += p.fallSpeed;

      // Calculer la position en coordonnées cartésiennes
      const px = cx + Math.cos(p.angle) * p.radius;
      const py = cy + Math.sin(p.angle) * p.radius;

      // Dessiner la particule
      ctx.beginPath();
      ctx.arc(px, py, PARTICLE_SIZE, 0, Math.PI * 2);
      // Couleur dorée avec l’opacité aléatoire propre à la particule
      ctx.fillStyle = `rgba(${GOLD_COLOR}, ${p.opacity})`;
      ctx.fill();

      // Réinitialiser la particule si elle va trop loin
      if (p.radius > MAX_DISTANCE) {
        p.radius = MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS);
        p.angle = Math.random() * (2 * Math.PI);
      }
    });

    // d) Demander la frame suivante
    requestAnimationFrame(animate);
  }

  // Lancer l’animation
  animate();
}



















// Rayons de lumière autour de Tipheret - comment dessiner des rayons de lumière autour de Tipheret (Séphirah 6) pour symboliser la Beauté.

function drawSmoothSunlikeIrradiation() {
  const canvas = document.getElementById('flameCanvas');
  const container = document.getElementById('container');
  const tipheret = document.getElementById('item6');

  if (!canvas || !container || !tipheret) {
    console.error("Canevas ou élément Tipheret non trouvé.");
    return;
  }

  const ctx = canvas.getContext('2d');
  let centerX, centerY;
  const rays = [];
  const totalRays = 150;

  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const tipheretRect = tipheret.getBoundingClientRect();
    centerX = tipheretRect.left - rect.left + tipheretRect.width / 2;
    centerY = tipheretRect.top - rect.top + tipheretRect.height / 2;

    // Réajuster la position des rayons existants
    rays.forEach(ray => {
      const normalizedLength = ray.initialLength / ray.length;
      ray.length = Math.random() * 80 + 50; // Ajuster la longueur à la nouvelle échelle
      ray.initialLength = ray.length * normalizedLength; // Maintenir les proportions
    });
  }

  // Initialiser les rayons
  function initializeRays() {
    for (let i = 0; i < totalRays; i++) {
      rays.push({
        angle: (i / totalRays) * Math.PI * 2,
        length: Math.random() * 80 + 50, // Longueur aléatoire
        initialLength: Math.random() * 20 + 10,
        speed: Math.random() * 0.5 + 0.1, // Vitesse d'animation
      });
    }
  }

  function animateRays() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    rays.forEach(ray => {
      ray.initialLength += ray.speed;
      if (ray.initialLength > ray.length) {
        ray.initialLength = Math.random() * 20 + 10; // Réinitialisation
      }

      const endX = centerX + Math.cos(ray.angle) * ray.initialLength;
      const endY = centerY + Math.sin(ray.angle) * ray.initialLength;

      const gradient = ctx.createLinearGradient(centerX, centerY, endX, endY);
      gradient.addColorStop(0, 'rgba(255, 223, 0, 0.8)'); // gradient.addColorStop(0, 'rgba(255, 223, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 69, 0, 0.1)'); //   gradient.addColorStop(1, 'rgba(255, 69, 0, 0.1)');

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    requestAnimationFrame(animateRays);
  }

  // Initialisation au chargement
  resizeCanvas();
  initializeRays();
  animateRays();

  // Recalculer les dimensions et ajuster les rayons lors du redimensionnement
  window.addEventListener('resize', resizeCanvas);
}

// Appelez la fonction après le chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  drawSmoothSunlikeIrradiation();
});








/*

function drawFlamesForMalkuth() {
  const canvas = document.getElementById('malkuthFlameCanvas');
  const container = document.getElementById('container');
  const malkuth = document.getElementById('item10');

  if (!canvas || !container || !malkuth) {
    console.error("Canevas ou élément Malkhout non trouvé.");
    return;
  }

  const ctx = canvas.getContext('2d');
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  const malkuthRect = malkuth.getBoundingClientRect();
  const centerX = malkuthRect.left - rect.left + malkuthRect.width / 2;
  const centerY = malkuthRect.top - rect.top + malkuthRect.height / 2;

  // Particules de flammes
  const particles = [];
  const maxParticles = 150;

  function createParticle() {
    return {
      x: centerX + Math.random() * 60 - 30,
      y: centerY + Math.random() * 10 - 5,
      size: Math.random() * 20 + 10,
      opacity: Math.random() * 0.5 + 0.5,
      life: Math.random() * 50 + 50,
      dx: Math.random() * 2 - 1,
      dy: -Math.random() * 2 - 1,
      hue: Math.random() * 30 + 10, // Couleurs plus chaudes (rouges/orangées)
    };
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.dx;
      p.y += p.dy;
      p.size *= 0.95;
      p.opacity *= 0.95;
      p.life--;

      if (p.life <= 0 || p.size < 1) {
        particles.splice(i, 1);
      }
    }

    while (particles.length < maxParticles) {
      particles.push(createParticle());
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      gradient.addColorStop(0, `hsla(${p.hue}, 100%, 50%, ${p.opacity})`);
      gradient.addColorStop(0.5, `hsla(${p.hue + 10}, 100%, 50%, ${p.opacity * 0.7})`);
      gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function animateFlames() {
    updateParticles();
    drawParticles();
    requestAnimationFrame(animateFlames);
  }

  animateFlames();
}

// Appelez la fonction lors de l'initialisation
document.addEventListener('DOMContentLoaded', () => {
  drawFlamesForMalkuth();
}); */



// Partie 4 : Animation des flammes autour de Geburah - comment dessiner des flammes autour de Geburah (Séphirah 5) pour symboliser la Sévérité.
let geburahAnimationFrame = null; // Identifiant de l'animation
let geburahAnimationTimeout = null; // Timeout pour arrêter l'animation après 50 secondes

function drawFlamesForGeburah() {
  const canvas = document.getElementById('geburahFlameCanvas');
  const container = document.getElementById('container');
  const geburah = document.getElementById('item5');

  if (!canvas || !container || !geburah) {
    console.error("Canevas ou élément Guevurah non trouvé.");
    return;
  }

  const ctx = canvas.getContext('2d');
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  const geburahRect = geburah.getBoundingClientRect();
  const centerX = geburahRect.left - rect.left + geburahRect.width / 2;
  const centerY = geburahRect.top - rect.top + geburahRect.height / 2;

  const particles = [];
  const maxParticles = 150;

  function createParticle() {
    return {
      x: centerX + Math.random() * 60 - 30,
      y: centerY + Math.random() * 10 - 5,
      size: Math.random() * 20 + 10,
      opacity: Math.random() * 0.5 + 0.5,
      life: Math.random() * 50 + 50,
      dx: Math.random() * 2 - 1,
      dy: -Math.random() * 2 - 1,
      hue: Math.random() * 20,
    };
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.dx;
      p.y += p.dy;
      p.size *= 0.95;
      p.opacity *= 0.95;
      p.life--;

      if (p.life <= 0 || p.size < 1) {
        particles.splice(i, 1);
      }
    }

    while (particles.length < maxParticles) {
      particles.push(createParticle());
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      gradient.addColorStop(0, `hsla(${p.hue}, 100%, 50%, ${p.opacity})`);
      gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function animateFlames() {
    updateParticles();
    drawParticles();
    geburahAnimationFrame = requestAnimationFrame(animateFlames);
  }

  animateFlames();
}

function stopFlamesForGeburah() {
  if (geburahAnimationFrame) {
    cancelAnimationFrame(geburahAnimationFrame);
    geburahAnimationFrame = null;

    const canvas = document.getElementById('geburahFlameCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Supprime le timeout
  if (geburahAnimationTimeout) {
    clearTimeout(geburahAnimationTimeout);
    geburahAnimationTimeout = null;
  }
}


function handleGeburahClick() {
  // Arrêter l'animation en cours si elle existe
  stopFlamesForGeburah();

  // Démarrer l'animation
  drawFlamesForGeburah();

  // Planifier l'arrêt de l'animation après 50 secondes
  geburahAnimationTimeout = setTimeout(() => {
    stopFlamesForGeburah();
  }, 70000); // 50 secondes
}

// Ajouter l'écouteur d'événement pour le clic sur Guevurah
document.addEventListener('DOMContentLoaded', () => {
  const geburahElement = document.getElementById('item5');
  if (geburahElement) {
    geburahElement.addEventListener('click', handleGeburahClick);
  }
});










// Partie 5 : Animation des particules flottantes autour de Hesed - comment dessiner des particules flottantes autour de Hesed (Séphirah 4) pour symboliser la Miséricorde.

let hesedAnimationFrame = null; // Identifiant de l'animation
let hesedAnimationTimeout = null; // Timeout pour arrêter l'animation après 50 secondes

function drawFloatingParticlesForHesed() {
  const canvas = document.getElementById('hesedWaterCanvas');
  const container = document.getElementById('container');
  const hesed = document.getElementById('item4');

  if (!canvas || !container || !hesed) {
    console.error("Canevas ou élément Hesed non trouvé.");
    return;
  }

  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  // Initialisation et ajustement dynamique
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const hesedRect = hesed.getBoundingClientRect();

  function getCenterCoordinates() {
    const rect = container.getBoundingClientRect();
    const hesedRect = hesed.getBoundingClientRect();
    return {
      x: hesedRect.left - rect.left + hesedRect.width / 2,
      y: hesedRect.top - rect.top + hesedRect.height / 2,
    };
  }

  // Particules
  const particles = [];
  const maxParticles = 60;

  function createParticle() {
    const { x, y } = getCenterCoordinates();
    return {
      x: x + Math.random() * 150 - 75, // Zone réduite autour de Hesed
      y: y + Math.random() * 150 - 75,
      opacity: Math.random() * 0.8 + 0.2,
      size: Math.random() * 3 + 1,
      life: Math.random() * 100 + 80,
      speedX: Math.random() * 0.4 - 0.2,
      speedY: Math.random() * 0.4 - 0.2,
    };
  }

  function updateParticles() {
    particles.forEach((particle, index) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.opacity -= 0.005;

      if (particle.opacity <= 0 || particle.life <= 0) {
        particles.splice(index, 1);
      } else {
        particle.life--;
      }
    });

    while (particles.length < maxParticles) {
      particles.push(createParticle());
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
      ctx.fill();
    });
  }

  function animateParticles() {
    updateParticles();
    drawParticles();
    hesedAnimationFrame = requestAnimationFrame(animateParticles);
  }

  animateParticles();
}

function stopFloatingParticlesForHesed() {
  if (hesedAnimationFrame) {
    cancelAnimationFrame(hesedAnimationFrame);
    hesedAnimationFrame = null;

    const canvas = document.getElementById('hesedWaterCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Supprime le timeout
  if (hesedAnimationTimeout) {
    clearTimeout(hesedAnimationTimeout);
    hesedAnimationTimeout = null;
  }
}


function handleHesedClick() {
  // Arrêter l'animation en cours si elle existe
  stopFloatingParticlesForHesed();

  // Démarrer l'animation
  drawFloatingParticlesForHesed();

  // Planifier l'arrêt de l'animation après 50 secondes
  hesedAnimationTimeout = setTimeout(() => {
    stopFloatingParticlesForHesed();
  }, 70000); // 50 secondes
}

// Ajouter l'écouteur d'événement pour le clic sur Hesed
document.addEventListener('DOMContentLoaded', () => {
  const hesedElement = document.getElementById('item4');
  if (hesedElement) {
    hesedElement.addEventListener('click', handleHesedClick);
  }
});














// hallo de lumière autour de Netzach - comment dessiner un halo de lumière autour de Netzach (Séphirah 7) pour symboliser la Victoire.
let tipheretAnimationFrame = null; // Identifiant de l'animation
let tipheretAnimationTimeout = null; // Timeout pour arrêter l'animation après une minute

function drawOnClickAura() {
  const canvas = document.getElementById('flameCanvas2');
  if (!canvas) {
    console.error("Canevas introuvable !");
    return;
  }

  const ctx = canvas.getContext('2d');
  const container = document.getElementById('container');
  const tipheret = document.getElementById('item6');

  let centerX, centerY, fixedRadius;

  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const tipheretRect = tipheret.getBoundingClientRect();
    centerX = tipheretRect.left - rect.left + tipheretRect.width / 2;
    centerY = tipheretRect.top - rect.top + tipheretRect.height / 2;

    fixedRadius = Math.min(canvas.width, canvas.height) * 0.12; // Légèrement plus grand
  }

  const particles = [];
  const maxParticles = 120;

  function createParticle() {
    const angle = Math.random() * 2 * Math.PI; // Angle aléatoire
    const distance = fixedRadius + Math.random() * 15 - 7; // Particules proches
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      size: Math.random() * 6 + 3, // Particules légèrement plus grandes
      opacity: Math.random() * 0.7 + 0.3,
      life: Math.random() * 150 + 100,
      dx: Math.random() * 0.4 - 0.2,
      dy: Math.random() * 0.4 - 0.2,
      hue: 50 + Math.random() * 10,
    };
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.dx;
      p.y += p.dy;
      p.opacity *= 0.98;
      p.size *= 0.98;
      p.life--;

      if (p.life <= 0 || p.opacity <= 0) {
        particles.splice(i, 1);
      }
    }

    while (particles.length < maxParticles) {
      particles.push(createParticle());
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Halo central synchronisé avec Tipheret
    const haloGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, fixedRadius + 30);
    haloGradient.addColorStop(0, 'rgba(255, 223, 0, 0.8)');
    haloGradient.addColorStop(0.7, 'rgba(255, 200, 50, 0.4)');
    haloGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Particules lumineuses
    particles.forEach(p => {
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.opacity})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function animate() {
    updateParticles();
    drawParticles();
    tipheretAnimationFrame = requestAnimationFrame(animate);
  }

  function startAnimation() {
    resizeCanvas();
    animate();
    tipheretAnimationTimeout = setTimeout(stopAnimation, 60000); // Arrêter après une minute
  }

  function stopAnimation() {
    if (tipheretAnimationFrame) {
      cancelAnimationFrame(tipheretAnimationFrame);
      tipheretAnimationFrame = null;

      ctx.clearRect(0, 0, canvas.width, canvas.height); // Effacer le canevas
    }

    if (tipheretAnimationTimeout) {
      clearTimeout(tipheretAnimationTimeout);
      tipheretAnimationTimeout = null;
    }
  }

  // Gérer le redimensionnement de la fenêtre
  window.addEventListener('resize', () => {
    if (tipheretAnimationFrame) {
      resizeCanvas(); // Recalculer les dimensions et la position
    }
  });

  // Événement de clic pour démarrer l'animation
  tipheret.addEventListener('click', startAnimation);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', drawOnClickAura);

















// function drawBalancedCrystal() {
//   const canvas = document.getElementById('crystalsCanvas');
//   const ctx = canvas.getContext('2d');
//   const container = document.getElementById('container');
//   const netzach = document.getElementById('item7');

//   if (!canvas || !ctx || !netzach) {
//       console.error("Canvas ou élément Netzach introuvable !");
//       return;
//   }

//   // Ajuster la taille du canevas
//   const containerRect = container.getBoundingClientRect();
//   canvas.width = containerRect.width;
//   canvas.height = containerRect.height;

//   // Récupérer la position de Netzach
//   const netzachRect = netzach.getBoundingClientRect();
//   const centerX = netzachRect.left - containerRect.left + netzachRect.width / 2;
//   const centerY = netzachRect.top - containerRect.top + netzachRect.height / 2;
//   const crystalRadius = netzachRect.width * 1.05; // Taille ajustée pour plus de discrétion

//   // Générer des facettes harmonieuses (moins irrégulières)
//   const facets = 8; // Nombre de facettes
//   const points = [];
//   for (let i = 0; i < facets; i++) {
//       const angle = (Math.PI * 2 / facets) * i;
//       const radius = crystalRadius * (0.9 + Math.random() * 0.1); // Variations subtiles
//       const x = centerX + Math.cos(angle) * radius;
//       const y = centerY + Math.sin(angle) * radius;
//       points.push({ x, y });
//   }

//   // Dessiner la pierre avec un dégradé radial subtil
//   const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, crystalRadius);
//   gradient.addColorStop(0, 'rgba(144, 238, 144, 0.3)'); // Vert clair
//   gradient.addColorStop(1, 'rgba(34, 139, 34, 0.1)');   // Vert forêt léger

//   ctx.beginPath();
//   ctx.moveTo(points[0].x, points[0].y);
//   points.forEach(point => {
//       ctx.lineTo(point.x, point.y);
//   });
//   ctx.closePath();

//   ctx.fillStyle = gradient;
//   ctx.fill();

//   // Contour discret pour les facettes
//   ctx.strokeStyle = 'rgba(50, 205, 50, 0.5)';
//   ctx.lineWidth = 1.5;
//   ctx.stroke();

//   // Ajouter un léger halo autour de la pierre pour adoucir son intégration
//   ctx.beginPath();
//   ctx.arc(centerX, centerY, crystalRadius * 1.2, 0, Math.PI * 2);
//   const haloGradient = ctx.createRadialGradient(centerX, centerY, crystalRadius * 1.1, centerX, centerY, crystalRadius * 1.5);
//   haloGradient.addColorStop(0, 'rgba(144, 238, 144, 0.1)');
//   haloGradient.addColorStop(1, 'rgba(0, 128, 0, 0)');
//   ctx.fillStyle = haloGradient;
//   ctx.fill();
// }



// document.addEventListener('DOMContentLoaded', () => {
//     drawBalancedCrystal();
// });

// window.addEventListener('resize', () => {
//     drawBalancedCrystal();
// });
