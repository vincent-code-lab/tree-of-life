// Gestionnaire de retour haptique
const HapticFeedback = {
    // Vérifier si l'API de vibration est disponible
    isSupported: 'vibrate' in navigator,
    
    // Patterns de vibration différents selon le type d'élément
    patterns: {
      sephirah: [60],         // Vibration courte pour les séphiroth
      title: [40, 50, 40],    // Pattern spécial pour le titre
      sound: [37],            // Vibration très courte pour les contrôles audio
      fullscreen: [50],       // Vibration pour le plein écran
      infinity: [30, 40, 30], // Pattern pour l'Ain Soph (∞)
      // Nouveaux patterns directionnels pour les colonnes
      pillarLeft: [70, 20, 10],    // Plus fort à gauche, diminue vers la droite
      pillarCenter: [30, 60, 30],  // Équilibré au centre
      pillarRight: [10, 20, 70],   // Plus fort à droite, diminue vers la gauche
      default: [30]           // Pattern par défaut
    },
  
    // Méthode principale pour déclencher la vibration
    trigger(elementType = 'default') {
      if (!this.isSupported) return;
      
      try {
        navigator.vibrate(this.patterns[elementType] || this.patterns.default);
      } catch (err) {
        console.warn('Erreur de vibration:', err);
      }
    },
  
    // Méthode pour attacher les événements
    init() {
      // Séphiroth
      document.querySelectorAll('.sephirah').forEach(sephirah => {
        sephirah.addEventListener('touchstart', () => {
          this.trigger('sephirah');
        }, { passive: true });
        
        sephirah.addEventListener('mousedown', () => {
          this.trigger('sephirah');
        });
      });
  
      // Titre principal
      const mainTitle = document.getElementById('main-title');
      if (mainTitle) {
        mainTitle.addEventListener('touchstart', () => {
          this.trigger('title');
        }, { passive: true });
        mainTitle.addEventListener('mousedown', () => {
          this.trigger('title');
        });
      }
  
      // Contrôles audio
      const soundControls = document.getElementById('soundControlToggle');
      if (soundControls) {
        soundControls.addEventListener('touchstart', () => {
          this.trigger('sound');
        }, { passive: true });
        soundControls.addEventListener('mousedown', () => {
          this.trigger('sound');
        });
      }

      // Nouveau code pour l'infini (Ain Soph)
      const infinitySymbol = document.querySelector('.infinity-symbol');
      if (infinitySymbol) {
        infinitySymbol.addEventListener('touchstart', () => {
          this.trigger('infinity');
        }, { passive: true });
      }

      // Nouveau code pour les colonnes avec patterns directionnels
      const pillarLeft = document.querySelector('.pillar-left');
      if (pillarLeft) {
        pillarLeft.addEventListener('touchstart', () => {
          this.trigger('pillarLeft');
        }, { passive: true });
      }

      const pillarCenter = document.querySelector('.pillar-center');
      if (pillarCenter) {
        pillarCenter.addEventListener('touchstart', () => {
          this.trigger('pillarCenter');
        }, { passive: true });
      }

      const pillarRight = document.querySelector('.pillar-right');
      if (pillarRight) {
        pillarRight.addEventListener('touchstart', () => {
          this.trigger('pillarRight');
        }, { passive: true });
      }
    }
  };
  
  // Initialisation après le chargement complet de la page
  window.addEventListener('load', () => {
    HapticFeedback.init();
    
    // Log pour debug
    console.log('Retour haptique initialisé:', {
      supported: HapticFeedback.isSupported,
      elements: {
        sephiroth: document.querySelectorAll('.sephirah').length,
        title: !!document.getElementById('main-title'),
        sound: !!document.getElementById('soundControlToggle'),
        pillarLeft: !!document.querySelector('.pillar-left'),
        pillarCenter: !!document.querySelector('.pillar-center'),
        pillarRight: !!document.querySelector('.pillar-right')
      }
    });
  });