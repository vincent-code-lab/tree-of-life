// Variable globale pour définir si le son est activé par défaut au lancement
let isSoundEnabledByDefault = StoreManager.getSoundEnabled(); // Récupère l'état du son depuis le stockage local

// Tentative de lecture (certains navigateurs exigent une interaction utilisateur avant l'autoplay)
// Je mets le son en muet pour le fond d'écran pour que l'utilisateur l'active 
if (typeof backgroundMusicError !== 'undefined' && backgroundMusicError === true) {
  isSoundEnabledByDefault = false;
  StoreManager.setSoundEnabled(false);
}

// Variables globales pour la gestion du son
const soundControlButton = document.getElementById('soundControlToggle');
const soundControlIcon = document.getElementById('soundControlIcon');
const volumeSlider = document.getElementById('volumeSlider');
const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

let isMuted = !isSoundEnabledByDefault; // Initialise l'état "coupé" si isSoundEnabledByDefault est false
let previousVolume = 1.0; // Volume par défaut (maximum)

// Vérifie si backgroundMusic est défini dans sound-manager.js
if (typeof backgroundMusic !== 'undefined') {
  // Initialiser le volume de backgroundMusic et synchroniser le curseur
  backgroundMusic.volume = isSoundEnabledByDefault ? 1.0 : 0.0; // Volume max ou min selon la configuration
  backgroundMusic.muted = !isSoundEnabledByDefault; // Couper ou activer le son selon la configuration
  volumeSlider.value = isSoundEnabledByDefault ? 100 : 0; // Synchroniser le slider avec la configuration initiale

  // -- AJOUT : forcer l'affichage de l'icône en fonction de l'état actuel
  if (!isSoundEnabledByDefault) {
    // Son coupé
    soundControlIcon.className = 'fas fa-volume-mute'; 
  } else {
    // Son activé
    soundControlIcon.className = 'fas fa-volume-up';
  }
  // -- FIN AJOUT

  // Gestion de l'affichage du bouton sonore
  if (!isMobileDevice) {
    let soundMouseTimer;
    document.addEventListener('mousemove', () => {
      soundControlButton.classList.remove('hidden');
      clearTimeout(soundMouseTimer);
      soundMouseTimer = setTimeout(() => {
        soundControlButton.classList.add('hidden');
      }, 5000);
    });
  } else {
    soundControlButton.classList.remove('hidden'); // Toujours visible sur mobile
  }

  // Gestion du clic sur l'icône pour couper/rétablir le son
  soundControlIcon.addEventListener('click', toggleMute);

  volumeSlider.addEventListener('input', (event) => {
    const volume = parseFloat(event.target.value) / 100; // Convertir en valeur entre 0 et 1

    if (volume === 0) {
      // Si volume à zéro, couper et arrêter la musique
      backgroundMusic.volume = 0;
      backgroundMusic.muted = true;
      soundControlIcon.className = 'fas fa-volume-off';
      backgroundMusic.pause();
      isMuted = true;
    } else {
      // Si volume > 0, réactiver le son et reprendre la lecture si nécessaire
      backgroundMusic.volume = volume;
      if (isMuted) {
        // Se déclencher seulement si le son était coupé pour éviter des appels multiples
        backgroundMusic.muted = false;
        backgroundMusic.play().catch((err) => {
          console.error('Erreur lors de la reprise de la musique :', err);
        });
      }
      isMuted = false;
      soundControlIcon.className = 'fas fa-volume-up';
    }
  });

  // Synchroniser le curseur avec le volume réel au démarrage
  volumeSlider.value = backgroundMusic.volume * 100;

  // Gestion de la touche M pour couper/rétablir le son
  document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'm') {
      toggleMute();
    }
  });

// Fonction pour basculer entre son coupé/rétabli
function toggleMute() {
  if (isMuted) {
    // Rétablir le son
    isMuted = false;
    backgroundMusic.muted = false; // Désactiver le mode muet
    backgroundMusic.volume = previousVolume; // Restaurer le volume précédent
    volumeSlider.value = previousVolume * 100; // Restaurer la position du slider
    soundControlIcon.className = 'fas fa-volume-up';
    updateVolumeSlider(previousVolume); // Mettre à jour la barre visuellement
    // Reprendre la lecture de la musique de fond
    backgroundMusic.play().catch((err) => {
      console.error('Erreur lors de la reprise de la musique :', err);
    });
    StoreManager.setSoundEnabled(true);
  } else {
    // Couper le son
    isMuted = true;
    previousVolume = backgroundMusic.volume; // Stocker le volume actuel
    backgroundMusic.muted = true; // Activer le mode muet
    soundControlIcon.className = 'fas fa-volume-mute';
    volumeSlider.value = 0; // Mettre le slider à zéro
    updateVolumeSlider(0); // Mettre à jour la barre visuellement
    // Arrêter la lecture de la musique de fond
    backgroundMusic.pause();
    StoreManager.setSoundEnabled(false);
  }
}
}


// Fonction pour mettre à jour la couleur de la barre
function updateVolumeSlider(volume) {
  const volumePercentage = volume * 100; // Convertir en pourcentage
  volumeSlider.style.setProperty('--volume-level', `${volumePercentage}%`);
}

// Écouteur d'événement pour mettre à jour le style quand le volume change
volumeSlider.addEventListener('input', (event) => {
  const volume = parseFloat(event.target.value) / 100; // Convertir la valeur du slider en une valeur entre 0 et 1
  updateVolumeSlider(volume);
});

// Initialiser la barre avec le volume par défaut
updateVolumeSlider(parseFloat(volumeSlider.value) / 100);
