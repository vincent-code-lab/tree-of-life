/* ==========================================================================
   animation-tree.js
   --------------------------------------------------------------------------
   Gère les animations des Séphiroth lors du clic :
   - Geburah (item5) : Flammes rouges
   - Hesed (item4) : Particules flottantes blanches
   - Tipheret (item6) : Rayons dorés
   ========================================================================= */

  


   
// Gestionnaire global des animations
const SephirotAnimations = {
    animations: {
        geburah: {
            frame: null,
            timeout: null
        },
        hesed: {
            frame: null,
            timeout: null
        },
        tipheret: {
            frame: null,
            timeout: null
        }
    },

    // Geburah Animation (feu)
    drawFlamesForGeburah() {
      if (this.animations.geburah.frame) return; // Ne démarre pas si déjà en cours
        const canvas = document.getElementById('geburahFlameCanvas');
        const container = document.getElementById('container');
        const geburah = document.getElementById('item5');

        if (!canvas || !container || !geburah) {
            console.error("Canvas ou élément Geburah non trouvé.");
            return;
        }

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const geburahRect = geburah.getBoundingClientRect();
        const centerX = geburahRect.left - rect.left + geburahRect.width / 2;
        const centerY = geburahRect.top - rect.top + geburahRect.height / 2;

        const particles = [];
        const maxParticles = 150;

        const createParticle = () => ({
            x: centerX + Math.random() * 60 - 30,
            y: centerY + Math.random() * 10 - 5,
            size: Math.random() * 20 + 10,
            opacity: Math.random() * 0.5 + 0.5,
            life: Math.random() * 50 + 50,
            dx: Math.random() * 2 - 1,
            dy: -Math.random() * 2 - 1,
            hue: Math.random() * 20,
        });

        const updateParticles = () => {
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
        };

        const drawParticles = () => {
            ctx.globalCompositeOperation = 'destination-out';

            particles.forEach(p => {
                ctx.beginPath();
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                gradient.addColorStop(0, `hsla(${p.hue}, 100%, 50%, ${p.opacity})`);
                gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
                ctx.fillStyle = gradient;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        const animate = () => {
            updateParticles();
            drawParticles();
            this.animations.geburah.frame = requestAnimationFrame(animate);
        };

        animate();
    },

    stopFlamesForGeburah() {
        if (this.animations.geburah.frame) {
            cancelAnimationFrame(this.animations.geburah.frame);
            this.animations.geburah.frame = null;

            const canvas = document.getElementById('geburahFlameCanvas');
            if (canvas) {
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }


        if (this.animations.geburah.timeout) {
            clearTimeout(this.animations.geburah.timeout);
            this.animations.geburah.timeout = null;
        }
    },


    // Hesed Animation (particules flottantes)
    drawFloatingParticlesForHesed() {
      if (this.animations.hesed.frame) return; // Ne démarre pas si déjà en cours
        const canvas = document.getElementById('hesedWaterCanvas');
        const container = document.getElementById('container');
        const hesed = document.getElementById('item4');

        if (!canvas || !container || !hesed) {
            console.error("Canvas ou élément Hesed non trouvé.");
            return;
        }

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const hesedRect = hesed.getBoundingClientRect();
        const centerX = hesedRect.left - rect.left + hesedRect.width / 2;
        const centerY = hesedRect.top - rect.top + hesedRect.height / 2;

        const particles = [];
        const maxParticles = 60;

        const createParticle = () => ({
            x: centerX + Math.random() * 150 - 75,
            y: centerY + Math.random() * 150 - 75,
            opacity: Math.random() * 0.8 + 0.2,
            size: Math.random() * 3 + 1,
            life: Math.random() * 100 + 80,
            speedX: Math.random() * 0.4 - 0.2,
            speedY: Math.random() * 0.4 - 0.2,
        });

        const updateParticles = () => {
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.speedX;
                p.y += p.speedY;
                p.opacity -= 0.005;
                p.life--;

                if (p.opacity <= 0 || p.life <= 0) {
                    particles.splice(i, 1);
                }
            }

            while (particles.length < maxParticles) {
                particles.push(createParticle());
            }
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.fill();
            });
        };

        const animate = () => {
            updateParticles();
            drawParticles();
            this.animations.hesed.frame = requestAnimationFrame(animate);
        };

        animate();
    },

    stopFloatingParticlesForHesed() {
        if (this.animations.hesed.frame) {
            cancelAnimationFrame(this.animations.hesed.frame);
            this.animations.hesed.frame = null;

            const canvas = document.getElementById('hesedWaterCanvas');
            if (canvas) {
              const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        if (this.animations.hesed.timeout) {
            clearTimeout(this.animations.hesed.timeout);
            this.animations.hesed.timeout = null;
        }
    },

    // Tipheret Animation  (rayons dorés)
    drawOnClickAura() {
      if (this.animations.tipheret.frame) return; // Ne démarre pas si déjà en cours
        const canvas = document.getElementById('flameCanvas2');
        const container = document.getElementById('container');
        const tipheret = document.getElementById('item6');


        if (!canvas || !container || !tipheret) {
            console.error("Canvas ou élément Tipheret non trouvé.");
            return;
        }

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const tipheretRect = tipheret.getBoundingClientRect();
        const centerX = tipheretRect.left - rect.left + tipheretRect.width / 2;
        const centerY = tipheretRect.top - rect.top + tipheretRect.height / 2;
        const fixedRadius = Math.min(canvas.width, canvas.height) * 0.12;

        const particles = [];
        const maxParticles = 120;

        const createParticle = () => {
            const angle = Math.random() * 2 * Math.PI;
            const distance = fixedRadius + Math.random() * 15 - 7;
            return {
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                size: Math.random() * 6 + 3,
                opacity: Math.random() * 0.7 + 0.3,
                life: Math.random() * 150 + 100,
                dx: Math.random() * 0.4 - 0.2,
                dy: Math.random() * 0.4 - 0.2,
                hue: 50 + Math.random() * 10,
            };
        };

        const updateParticles = () => {
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
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const haloGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, fixedRadius + 30);
            haloGradient.addColorStop(0, 'rgba(255, 223, 0, 0.8)');
            haloGradient.addColorStop(0.7, 'rgba(255, 200, 50, 0.4)');
            haloGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = haloGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                ctx.beginPath();
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.opacity})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = gradient;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        const animate = () => {
            updateParticles();
            drawParticles();
            this.animations.tipheret.frame = requestAnimationFrame(animate);
        };

        animate();
    },

    stopOnClickAura() {
        if (this.animations.tipheret.frame) {
            cancelAnimationFrame(this.animations.tipheret.frame);
            this.animations.tipheret.frame = null;

            const canvas = document.getElementById('flameCanvas2');
            if (canvas) {
              const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        if (this.animations.tipheret.timeout) {
            clearTimeout(this.animations.tipheret.timeout);
            this.animations.tipheret.timeout = null;
        }
    },

    // Initialisation des écouteurs d'événements
    init() {
        // Geburah
        const geburahElement = document.getElementById('item5');
        if (geburahElement) {
            geburahElement.addEventListener('click', () => {
              console.log('Geburah clicked');
                this.stopFlamesForGeburah();
                this.drawFlamesForGeburah();
                this.animations.geburah.timeout = setTimeout(
                    () => this.stopFlamesForGeburah(), 
                    70000
                );
            });
        }

        // Hesed
        const hesedElement = document.getElementById('item4');
        if (hesedElement) {
            hesedElement.addEventListener('click', () => {
                this.stopFloatingParticlesForHesed();
                this.drawFloatingParticlesForHesed();
                this.animations.hesed.timeout = setTimeout(
                    () => this.stopFloatingParticlesForHesed(),
                    70000
                );
            });
        }

        // Tipheret
        const tipheretElement = document.getElementById('item6');
        if (tipheretElement) {
            tipheretElement.addEventListener('click', () => {
                this.stopOnClickAura();
                this.drawOnClickAura();
                this.animations.tipheret.timeout = setTimeout(
                    () => this.stopOnClickAura(),
                    70000
                );
            });
        }
    }
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    SephirotAnimations.init();
});














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












// SOLEIL Rayons de lumière autour de Tipheret - comment dessiner des rayons de lumière autour de Tipheret (Séphirah 6) pour symboliser la Beauté.

function drawSmoothSunlikeIrradiation() {
    const canvas = document.getElementById('tipherethSunCanvas');
    const container = document.getElementById('container');
    const tipheret = document.getElementById('item6');
  
    if (!canvas || !container || !tipheret) {
      console.error("Canevas ou élément Tipheret non trouvé.");
      return;
    }
  
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let centerX, centerY;
    const rays = [];
    const totalRays = 150;
  
    // Variables pour l'animation
    let animationFrameId = null; // Gardera la valeur retournée par requestAnimationFrame
    let isAnimationRunning = false; // Pour savoir si l’animation tourne ou non
  
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
        ray.length = Math.random() * 80 + 50;
        ray.initialLength = ray.length * normalizedLength; 
      });
    }
  
    // Initialiser les rayons
    function initializeRays() {
      for (let i = 0; i < totalRays; i++) {
        rays.push({
          angle: (i / totalRays) * Math.PI * 2,
          length: Math.random() * 80 + 50, 
          initialLength: Math.random() * 20 + 10,
          speed: Math.random() * 0.5 + 0.1, 
        });
      }
    }
  
    // Déclaration des particules
    const lightParticles = [];
    const maxLightParticles = 25;
  
    const createLightParticle = () => ({
      x: centerX,
      y: centerY,
      size: Math.random() * 1 + 2,
      opacity: Math.random() * 0.5 + 0.5,
      life: Math.random() * 100 + 50,
      angle: Math.random() * 2 * Math.PI,
      speed: Math.random() * 2 + 1,
    });
  
    const updateLightParticles = () => {
      for (let i = lightParticles.length - 1; i >= 0; i--) {
        const p = lightParticles[i];
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.opacity *= 0.98;
        p.life--;
  
        if (p.life <= 0 || p.opacity <= 0) {
          lightParticles.splice(i, 1);
        }
      }
  
      while (lightParticles.length < maxLightParticles) {
        lightParticles.push(createLightParticle());
      }
    };
  
    const drawLightParticles = () => {
      lightParticles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 223, 0, ${p.opacity})`;
        ctx.fill();
      });
    };
  
    function animateRays() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      rays.forEach(ray => {
        ray.initialLength += ray.speed;
        if (ray.initialLength > ray.length) {
          ray.initialLength = Math.random() * 20 + 10; 
        }
  
        const endX = centerX + Math.cos(ray.angle) * ray.initialLength;
        const endY = centerY + Math.sin(ray.angle) * ray.initialLength;
  
        const gradient = ctx.createLinearGradient(centerX, centerY, endX, endY);
        gradient.addColorStop(0, 'rgba(255, 223, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 69, 0, 0.1)');
  
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
  
      updateLightParticles();
      drawLightParticles();
  
      // Boucler l’animation si toujours en cours
      animationFrameId = requestAnimationFrame(animateRays);
    }
  
    // Lance l'animation (appelée quand on veut la démarrer ou reprendre)
    function startAnimation() {
      if (!isAnimationRunning) {
        isAnimationRunning = true;
        animateRays(); // Démarre la boucle
      }
    }
  
    // Stoppe l'animation (appelée quand on veut la mettre en pause)
    function stopAnimation() {
      if (isAnimationRunning) {
        isAnimationRunning = false;
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }
  
    // Gestion de la visibilité de la page
    function handleVisibilityChange() {
      if (document.hidden) {
        // Page masquée => on met en pause l’animation
        stopAnimation();
      } else {
        // Page visible => on relance l’animation
        startAnimation();
      }
    }
  
    // Initialisation au chargement
    resizeCanvas();
    initializeRays();
  
    // Lancer l’animation une première fois
    startAnimation();
  
    // Recalculer les dimensions et ajuster les rayons lors du redimensionnement
    window.addEventListener('resize', resizeCanvas);
  
    // Ajouter le listener pour la page visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
  
  // Appel dans le DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    drawSmoothSunlikeIrradiation();
  });
  




// Partie 2 : Animation des particules autour de Kether - comment des particules d'or ou des étoiles autour de Kether (Séphirah 1) pour symboliser la Couronne.


// On attend que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    initKetherParticles();
  });

  function initKetherParticles() {
    // ==========================
    // 1) PARAMÈTRES GLOBAUX
    // ==========================
    const PARTICLE_COUNT      = 600;   // Nombre de particules defaut 60
    const MIN_RADIUS          = 40;    // Rayon min autour de Kether (px) defaut 40
    const MAX_RADIUS          = 70;    // Rayon max initial (px) defaut 70

    // Génération d'une distance max variable
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
    const BASE_ROTATION_SPEED = 0.2;  // Vitesse de rotation minimale
    const EXTRA_ROTATION_SPEED= 0.5;  // Amplitude supplémentaire aléatoire
    const BASE_FALL_SPEED     = 0.1;  // Vitesse de "chute" minimale
    const EXTRA_FALL_SPEED    = 0.3;  // Amplitude supplémentaire aléatoire

    // Particule (visuel)
    const PARTICLE_SIZE       = 0.9;   // Taille des particules (px)
    const MIN_OPACITY         = 0.01;  // Opacité minimale
    const MAX_OPACITY         = 0.7;   // Opacité maximale

    // Couleur "or" (peut être ajustée)
    const GOLD_COLOR = '255, 255, 220'; // => rgba(255, 255, 220, opacité)

    // ==========================
    // 2) Initialisation Canvas
    // ==========================
    const canvas    = document.getElementById('ketherParticlesCanvas');
    const container = document.getElementById('container');
    const ketherEl  = document.getElementById('item1');
    if (!canvas || !container || !ketherEl) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    function resizeCanvas() {
      const rect = container.getBoundingClientRect();
      canvas.width  = rect.width;
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
      const angle = Math.random() * (2 * Math.PI);
      const radius = MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS);
      const rotationSpeed = BASE_ROTATION_SPEED + Math.random() * EXTRA_ROTATION_SPEED;
      const fallSpeed     = BASE_FALL_SPEED     + Math.random() * EXTRA_FALL_SPEED;
      const opacity = MIN_OPACITY + Math.random() * (MAX_OPACITY - MIN_OPACITY);

      particles.push({
        angle,
        radius,
        rotationSpeed,
        fallSpeed,
        opacity
      });
    }

    // ==========================
    // 5) Boucle d'animation (avec pause/reprise)
    // ==========================
    let animationFrameId = null;  // ID de la frame en cours
    let isAnimationRunning = false;

    function animate() {
      // a) Effacer le canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // b) Récupérer la position actuelle de Kether
      const { x: cx, y: cy } = getKetherCenter();

      // c) Mettre à jour & dessiner chaque particule
      particles.forEach(p => {
        // Mise à jour de l'angle (rotation autour de Kether)
        p.angle += p.rotationSpeed * 0.01;
        // Les particules s'éloignent (chute)
        p.radius += p.fallSpeed;

        // Position en coordonnées cartésiennes
        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * p.radius;

        // Dessiner la particule
        ctx.beginPath();
        ctx.arc(px, py, PARTICLE_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GOLD_COLOR}, ${p.opacity})`;
        ctx.fill();

        // Réinitialiser la particule si elle va trop loin
        if (p.radius > MAX_DISTANCE) {
          p.radius = MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS);
          p.angle = Math.random() * (2 * Math.PI);
        }
      });

      // d) Animer en boucle si on tourne toujours
      animationFrameId = requestAnimationFrame(animate);
    }

    // Lance l'animation si elle n'est pas déjà en cours
    function startAnimation() {
      if (!isAnimationRunning) {
        isAnimationRunning = true;
        animate(); // Démarre la boucle d'animation
      }
    }

    // Stoppe l'animation si elle est en cours
    function stopAnimation() {
      if (isAnimationRunning) {
        isAnimationRunning = false;
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }

    // Gestion de la visibilité de l'onglet
    function handleVisibilityChange() {
      if (document.hidden) {
        stopAnimation(); // Arrête l'animation si l'onglet est masqué
      } else {
        startAnimation(); // Relance l'animation si l'onglet est visible
      }
    }

    // Démarre l'animation au départ
    startAnimation();

    // Écouteur pour la visibilité
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
  



  /* ==========================================================================
   5) ANIMATION DES PARTICULES sur les lignes de l'arbre
   ========================================================================== */
   

   let animationFrameId= null;  // ID de la frame en cours (requestAnimationFrame)
   let isAnimationRunning = false;

/**
 * Initialise le tableau des particules (startX, endX, etc.).
 */
function initParticules() {
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
   * Lance la boucle d'animation : 
   *  - Redessine le canvas
   *  - Fait avancer les particules 
   *  - Dessine les particules
   */
  
  function animateParticles() {
    function drawFrame() {
         // Si on a demandé l'arrêt, on quitte la fonction immédiatement
      if (!isAnimationRunning) return;

        // 🔥 Ajout du mode de fusion pour effet de traînée à voir si je garde ou pas
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Garde une trace subtile
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter'; // Effet lumineux

      // 1) Redessine le canvas (lignes + halos)

      if (!isMeditationPlaying && !meditation) {
        drawLinesOnCanvas();
      }
  



      // 2) Met à jour & dessine chaque particule
      particles.forEach(p => {
        p.progress += particleSpeed / 100;
       /* p.progress += 0.002; // Moins rapide pour plus de fluidité*/
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
  
        // 3) On boucle l’animation
      animationFrameId = requestAnimationFrame(drawFrame);
    }
  
    drawFrame(); // démarre la boucle
  }


  /***********************************************
   * Fonctions pour démarrer / arrêter l'animation
   ***********************************************/
  function startParticlesAnimation() {
    if (!isAnimationRunning) {
      isAnimationRunning = true;
      animateParticles();
    }
  }

  function stopParticlesAnimation() {
    if (isAnimationRunning) {
      isAnimationRunning = false;
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  /***********************************************
   * Gestion de la visibilité de la page
   ***********************************************/
  function handleVisibilityChange() {
    if (document.hidden) {
        stopParticlesAnimation(); // Arrête l’animation si l’onglet est masqué
    } else {
        if (!isAnimationRunning) { // Vérifie si l'animation est déjà en cours
            startParticlesAnimation(); // Relance l’animation uniquement si elle n'est pas déjà en marche
        }
    }
}

  document.addEventListener('visibilitychange', handleVisibilityChange);
