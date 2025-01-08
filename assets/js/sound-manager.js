// Lecture en boucle du fichier mp3
const backgroundMusic = new Audio('assets/audio/background/C&C.mp3');
backgroundMusic.loop = true; // Permet de rejouer le fichier dès qu'il se termine

// Tentative de lecture (certains navigateurs exigent une interaction utilisateur avant l'autoplay)
backgroundMusic.play().catch((err) => {
  console.error('Impossible de lancer la musique de fond automatiquement :', err);
});


// Gestion centralisée des sons pour les séphiroth et les lettres hébraïques
const sounds = {
    sephirah: new Audio('assets/audio/sephiroth.mp3'),
    hebrew: new Audio('assets/audio/lettre.mp3'),
  };
  
  // Préchargement et gestion des erreurs des fichiers audio
  Object.keys(sounds).forEach((key) => {
    const sound = sounds[key];
    sound.preload = 'auto';
    sound.onerror = () => console.error(`Erreur lors du chargement de ${key}.mp3`);
  });
  
  // Fonction générique pour jouer un son
  const playSound = (sound) => {
    if (!sound.paused) {
      sound.pause(); // Arrête la lecture en cours si nécessaire
    }
    sound.currentTime = 0; // Réinitialise à la première seconde
    sound.play().catch((err) => console.error('Erreur lors de la lecture du son :', err));
  };
  
  // Gestionnaire d'événements global
  document.querySelector('.container').addEventListener('mouseover', (event) => {
    if (event.target.classList.contains('sephirah')) {
      playSound(sounds.sephirah);
    } else if (event.target.classList.contains('hebrew')) {
      playSound(sounds.hebrew);
    }
  });
  



// Ajout d'un gestionnaire d'événements pour le titre h1
const h1Title = document.querySelector('h1');
let currentSound = null; // Variable pour stocker le son en cours de lecture

if (h1Title) {
  h1Title.addEventListener('click', () => {


    // Arrêter le son en cours de sephirat ou lettre s'il y en a un
    if (currentPlayingSound) {
        currentPlayingSound.pause();
        currentPlayingSound.currentTime = 0;
        currentPlayingSound = null;
        currentPlayingElement = null;
    }

    // Si un son est déjà en cours de lecture
    if (currentSound) {
      currentSound.pause(); // Mettre le son en pause
      currentSound.currentTime = 0; // Réinitialiser le son à son début
      currentSound = null; // Réinitialiser la référence
    } else {
      // Jouer le son de présentation
      currentSound = new Audio('assets/audio/voice/arbre-de-vie-presentation.mp3');
      currentSound.play();

      // Ajout d'un événement pour réinitialiser la référence une fois le son terminé
      currentSound.addEventListener('ended', () => {
        currentSound = null;
      });
    }
  });
}


// Liste des séphiroth et chemins avec leurs ID et les sons associés
const soundsItems = {
  item1: 'assets/audio/voice/1.mp3',
  item2: 'assets/audio/voice/2.mp3',
  item3: 'assets/audio/voice/3.mp3',
  item4: 'assets/audio/voice/4.mp3',
  item5: 'assets/audio/voice/5.mp3',
  item6: 'assets/audio/voice/6.mp3',
  item7: 'assets/audio/voice/7.mp3',
  item8: 'assets/audio/voice/8.mp3',
  item9: 'assets/audio/voice/9.mp3',
  item10: 'assets/audio/voice/10.mp3',
  daath: 'assets/audio/voice/daath.mp3',
  item11: 'assets/audio/voice/11.mp3',
  item12: 'assets/audio/voice/12.mp3',
  item13: 'assets/audio/voice/13.mp3',
  item14: 'assets/audio/voice/14.mp3',
  item15: 'assets/audio/voice/15.mp3',
  item16: 'assets/audio/voice/16.mp3',
  item17: 'assets/audio/voice/17.mp3',
  item18: 'assets/audio/voice/18.mp3',     
  item19: 'assets/audio/voice/19.mp3',
  item20: 'assets/audio/voice/20.mp3',
  item21: 'assets/audio/voice/21.mp3',
  item22: 'assets/audio/voice/22.mp3',
  item23: 'assets/audio/voice/23.mp3',
  item24: 'assets/audio/voice/24.mp3',
  item25: 'assets/audio/voice/25.mp3',
  item26: 'assets/audio/voice/26.mp3',
  item27: 'assets/audio/voice/27.mp3',
  item28: 'assets/audio/voice/28.mp3',
  item29: 'assets/audio/voice/29.mp3',
  item30: 'assets/audio/voice/30.mp3',
  item31: 'assets/audio/voice/31.mp3',
  item32: 'assets/audio/voice/32.mp3'
};

let currentPlayingSound = null; // Variable pour le son en cours
let currentPlayingElement = null; // ID de l'élément en cours

// Fonction pour gérer le clic sur une séphirah ou un chemin
function handleClick(event) {
    const elementId = event.target.id; // Récupérer l'ID de l'élément cliqué
    const soundPath = soundsItems[elementId]; // Trouver le chemin du son correspondant

    // Si le même élément est cliqué et que le son est en cours de lecture
    if (currentPlayingElement === elementId && currentPlayingSound) {
        currentPlayingSound.pause(); // Mettre le son en pause
        currentPlayingSound.currentTime = 0; // Réinitialiser le son
        currentPlayingSound = null; // Réinitialiser la référence
        currentPlayingElement = null; // Réinitialiser l'élément actif
        return; // Ne rien faire d'autre
    }

    // Arrêter le son en cours s'il y en a un
    if (currentPlayingSound) {
        currentPlayingSound.pause();
        currentPlayingSound.currentTime = 0;
        currentPlayingSound = null;
        currentPlayingElement = null;
    }

    // Arrêter le son en cours de h1 s'il y en a un
    if (currentSound) {
      currentSound.pause(); // Mettre le son en pause
      currentSound.currentTime = 0; // Réinitialiser le son à son début
      currentSound = null; // Réinitialiser la référence
    }

    // Jouer le nouveau son
    if (soundPath) {
        currentPlayingSound = new Audio(soundPath); // Créer un nouvel objet audio
        currentPlayingSound.play(); // Jouer le son
        currentPlayingElement = elementId; // Mettre à jour l'élément actif

        // Réinitialiser quand le son est terminé
        currentPlayingSound.addEventListener('ended', () => {
            currentPlayingSound = null;
            currentPlayingElement = null;
        });
    }
}

// Ajouter des gestionnaires d'événements à toutes les séphiroth
Object.keys(soundsItems).forEach((elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener('click', handleClick);
    }
});

  

// Ajout d'un gestionnaire d'événements pour le symbole de l'infini
if (infinitySymbol) {
  infinitySymbol.addEventListener('click', () => {
    const soundPath = 'assets/audio/voice/ain-soph.mp3'; // Chemin du son pour l'infini

    // Si le son de l'infini est déjà en lecture, l'arrêter
    if (currentPlayingElement === 'infinitySymbol' && currentPlayingSound) {
      currentPlayingSound.pause();
      currentPlayingSound.currentTime = 0;
      currentPlayingSound = null;
      currentPlayingElement = null;
      return;
    }

    // Arrêter le son en cours de h1 s'il y en a un
    if (currentSound) {
      currentSound.pause();
      currentSound.currentTime = 0;
      currentSound = null;
    }

    // Arrêter le son en cours de séphirah ou chemin s'il y en a un
    if (currentPlayingSound) {
      currentPlayingSound.pause();
      currentPlayingSound.currentTime = 0;
      currentPlayingSound = null;
      currentPlayingElement = null;
    }

    // Jouer le son de l'infini
    currentPlayingSound = new Audio(soundPath);
    currentPlayingSound.play();
    currentPlayingElement = 'infinitySymbol'; // Marquer le symbole de l'infini comme élément actif

    // Réinitialiser quand le son est terminé
    currentPlayingSound.addEventListener('ended', () => {
      currentPlayingSound = null;
      currentPlayingElement = null;
    });
  });
}



// Ajout du click pour lancer un son sur les 3 colonnes 
document.querySelectorAll('.column').forEach(column => {
  column.addEventListener('click', handleColumnClick);
});

/**
 * Gère le clic sur une colonne pour jouer un son.
 */ 
function handleColumnClick(event) {
  const columnId = event.target.id;
  let soundPath;

  switch (columnId) {
    case 'pillar-left':
      soundPath = 'assets/audio/voice/column1.mp3';
      break;
    case 'pillar-center':
      soundPath = 'assets/audio/voice/column2.mp3';
      break;
    case 'pillar-right':
      soundPath = 'assets/audio/voice/column3.mp3';
      break;
  }

  // Si le même élément est cliqué et que le son est en cours de lecture
  if (currentPlayingElement === columnId && currentPlayingSound) {
    currentPlayingSound.pause(); // Mettre le son en pause
    currentPlayingSound.currentTime = 0; // Réinitialiser le son
    currentPlayingSound = null; // Réinitialiser la référence
    currentPlayingElement = null; // Réinitialiser l'élément actif
    return; // Ne rien faire d'autre
  }

  // Arrêter le son en cours de h1 s'il y en a un
  if (currentSound) {
    currentSound.pause();
    currentSound.currentTime = 0;
    currentSound = null;
  }

  // Arrêter le son en cours de séphirah, lettre hébraïque ou symbole de l'infini s'il y en a un
  if (currentPlayingSound) {
    currentPlayingSound.pause();
    currentPlayingSound.currentTime = 0;
    currentPlayingSound = null;
    currentPlayingElement = null;
  }

  // Jouer le nouveau son
  if (soundPath) {
    currentPlayingSound = new Audio(soundPath); // Créer un nouvel objet audio
    currentPlayingSound.play(); // Jouer le son
    currentPlayingElement = columnId; // Mettre à jour l'élément actif

    // Réinitialiser quand le son est terminé
    currentPlayingSound.addEventListener('ended', () => {
      currentPlayingSound = null;
      currentPlayingElement = null;
    });
  }
}



function highlightElement(element) {
  element.classList.add('active-sound');
  setTimeout(() => element.classList.remove('active-sound'), 1000);
}

element.addEventListener('click', () => {
  highlightElement(element);
  playSound(sounds[element.id]);
});
