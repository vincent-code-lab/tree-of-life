/*******************************
 * Configuration mode méditation
 *******************************/
let meditation = false;       // Passe à 'true' si on détecte un appui prolongé
let isMeditationPlaying = false; // Variable pour suivre l'état de l'audio de méditation
let pressTimer = null;        // Timer pour déclencher la méditation
const LONG_PRESS_DELAY = 200; // Durée (ms) avant de basculer en méditation

const meditationSound = new Audio('assets/audio/meditation.mp3'); // Ajout de la variable pour le son de méditation
const gongSound = new Audio("assets/audio/gong.mp3");
meditationSound.preload = 'none';// Ne pas précharger le son
meditationSound.loop = true; // Permet de rejouer le son de méditation en boucle

// Lecture en boucle du fichier mp3
const backgroundMusic = new Audio('assets/audio/background/C&C.mp3');
backgroundMusic.loop = true; // Permet de rejouer le fichier dès qu'il se termine

// Tentative de lecture (certains navigateurs exigent une interaction utilisateur avant l'autoplay)
let backgroundMusicError = null;
backgroundMusic.play().catch((err) => {
  console.error('Impossible de lancer la musique de fond automatiquement :', err);
  backgroundMusicError = true;
});

// Gestion centralisée des sons pour les séphiroth et les lettres hébraïques
const sounds = {
    sephirah: new Audio('assets/audio/sephiroth.mp3'),
    hebrew: new Audio('assets/audio/lettre.mp3'),
    clicSephirah: new Audio('assets/audio/clic-sephiroth.mp3'),
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
  // Ajout des gestionnaires d'événements pour le titre h1 pour pouvoir lancer la méditation après un long press
  h1Title.addEventListener('mousedown', handleMouseDown);
  h1Title.addEventListener('mouseup', handleMouseUp);
  h1Title.addEventListener('mouseleave', handleMouseLeave);

    h1Title.addEventListener('click', () => {
        // Arrêter le son en cours de sephirat ou lettre s'il y en a un
        if (currentPlayingSound) {
            currentPlayingSound.pause();
            currentPlayingSound.currentTime = 0;
            currentPlayingSound = null;
            currentPlayingElement = null;
            isMeditationPlaying = false; // Réinitialise l'état lorsque le son se termine
        }

        // Si un son est déjà en cours de lecture
        if (currentSound) {
            currentSound.pause(); // Mettre le son en pause
            currentSound.currentTime = 0; // Réinitialiser le son à son début
            currentSound = null; // Réinitialiser la référence
            isMeditationPlaying = false; // Réinitialise l'état lorsque le son se termine
        } else {


          if (meditation) {
            soundPath = 'assets/audio/voice/meditation/1.mp3'; // Trouver le chemin du son correspondant
            meditation = false;
            isMeditationPlaying = true; // Met à jour l'état de lecture
            
        } else {
            soundPath = 'assets/audio/voice/arbre-de-vie-presentation.mp3'; // Trouver le chemin du son correspondant
        }
            // Jouer le son de présentation
            currentSound = new Audio(soundPath);
            currentSound.play();

            // Ajout d'un événement pour réinitialiser la référence une fois le son terminé
            currentSound.addEventListener('ended', () => {
                if (isMeditationPlaying) {
                    isMeditationPlaying = false; // Réinitialise l'état lorsque le son se termine                  
                    gongSound.play();
                }
                currentSound = null;
            });
        }
    });
    // On ajoute le support "Enter"
    enableKeyboardClick(h1Title);
}

// Liste des séphiroth et chemins avec leurs ID et les sons associés
const soundsItems = {
    item1: '1.mp3',
    item2: '2.mp3',
    item3: '3.mp3',
    item4: '4.mp3',
    item5: '5.mp3',
    item6: '6.mp3',
    item7: '7.mp3',
    item8: '8.mp3',
    item9: '9.mp3',
    item10: '10.mp3',
    daath: 'daath.mp3',
    item11: '11.mp3',
    item12: '12.mp3',
    item13: '13.mp3',
    item14: '14.mp3',
    item15: '15.mp3',
    item16: '16.mp3',
    item17: '17.mp3',
    item18: '18.mp3',     
    item19: '19.mp3',
    item20: '20.mp3',
    item21: '21.mp3',
    item22: '22.mp3',
    item23: '23.mp3',
    item24: '24.mp3',
    item25: '25.mp3',
    item26: '26.mp3',
    item27: '27.mp3',
    item28: '28.mp3',
    item29: '29.mp3',
    item30: '30.mp3',
    item31: '31.mp3',
    item32: '32.mp3'
};

let currentPlayingSound = null; // Variable pour le son en cours
let currentPlayingElement = null; // ID de l'élément en cours

// Fonction pour gérer le clic sur une séphirah ou un chemin
function handleClick(event) {
    const elementId = event.target.id; // Récupérer l'ID de l'élément cliqué
    let soundPath;

    if (meditation) {
        soundPath = 'assets/audio/voice/meditation/' + soundsItems[elementId]; // Trouver le chemin du son correspondant
        meditation = false;
        isMeditationPlaying = true; // Met à jour l'état de lecture
    } else {
        soundPath = 'assets/audio/voice/' + soundsItems[elementId]; // Trouver le chemin du son correspondant
    }

    // Si le même élément est cliqué et que le son est en cours de lecture
    if (currentPlayingElement === elementId && currentPlayingSound) {
        currentPlayingSound.pause(); // Mettre le son en pause
        currentPlayingSound.currentTime = 0; // Réinitialiser le son
        currentPlayingSound = null; // Réinitialiser la référence
        currentPlayingElement = null; // Réinitialiser l'élément actif
        isMeditationPlaying = false; // Réinitialise l'état lorsque le son se termine
        return; // Ne rien faire d'autre
    }

    // Arrêter le son en cours s'il y en a un
    if (currentPlayingSound) {
        currentPlayingSound.pause();
        currentPlayingSound.currentTime = 0;
        currentPlayingSound = null;
        currentPlayingElement = null;
        isMeditationPlaying = false; // Réinitialise l'état lorsque le son se termine
    }


    // Arrêter le son en cours de h1 s'il y en a un
    if (currentSound) {
        currentSound.pause(); // Mettre le son en pause
        currentSound.currentTime = 0; // Réinitialiser le son à son début
        currentSound = null; // Réinitialiser la référence
        isMeditationPlaying = false; // Réinitialise l'état lorsque le son se termine
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
            if (isMeditationPlaying) {
                isMeditationPlaying = false; // Réinitialise l'état lorsque le son se termine                  
                gongSound.play();
            }
        });
    }
}


// Ajouter des gestionnaires d'événements à toutes les séphiroth
Object.keys(soundsItems).forEach((elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
        // 1) Long press (souris)
        element.addEventListener('mousedown', handleMouseDown);
        element.addEventListener('mouseup', handleMouseUp);
        element.addEventListener('mouseleave', handleMouseLeave);
        
        // 2) Long press (tactile)
        element.addEventListener('touchstart', handleMouseDown);
        element.addEventListener('touchend', handleMouseUp);
        element.addEventListener('touchcancel', handleMouseLeave);
        
        // 3) Le clic existant
        element.addEventListener('click', handleClick);

        // 4) Le support "Enter" au clavier (déjà présent via ta fonction)
        enableKeyboardClick(element);
    }
});

// Ajout d'un gestionnaire d'événements pour le symbole de l'infini
if (infinitySymbol) {

  infinitySymbol.addEventListener('mousedown', handleMouseDown);
  infinitySymbol.addEventListener('mouseup', handleMouseUp);
  infinitySymbol.addEventListener('mouseleave', handleMouseLeave);

    infinitySymbol.addEventListener('click', () => {
        const soundPath = 'assets/audio/voice/ain-soph.mp3'; // Chemin du son pour l'infini

        // Si le son de l'infini est déjà en lecture, l'arrêter
        if (currentPlayingElement === 'infinitySymbol' && currentPlayingSound) {
            currentPlayingSound.pause();
            currentPlayingSound.currentTime = 0;
            currentPlayingSound = null;
            currentPlayingElement = null;
            isMeditationPlaying = false; // Réinitialise l'état lorsque le son se termine
            return;
        }


        // Arrêter le son en cours de h1 s'il y en a un
        if (currentSound) {
            currentSound.pause();
            currentSound.currentTime = 0;
            currentSound = null;
            isMeditationPlaying = false; // Réinitialise l'état lorsque le son se termine
        }

        // Arrêter le son en cours de séphirah ou chemin s'il y en a un
        if (currentPlayingSound) {
            currentPlayingSound.pause();
            currentPlayingSound.currentTime = 0;
            currentPlayingSound = null;
            currentPlayingElement = null;
            isMeditationPlaying = false; // Réinitialise l'état lorsque le son se termine
        }


        // Jouer le son de l'infini
        currentPlayingSound = new Audio(soundPath);
        currentPlayingSound.play();
        currentPlayingElement = 'infinitySymbol'; // Marquer le symbole de l'infini comme élément actif

        // Réinitialiser quand le son est terminé
        currentPlayingSound.addEventListener('ended', () => {
            if (isMeditationPlaying) {
                isMeditationPlaying = false; // Réinitialise l'état lorsque le son se termine                  
                gongSound.play();
            }
            currentPlayingSound = null;
            currentPlayingElement = null;
        });
    });
    enableKeyboardClick(infinitySymbol);
}

// Ajout du click pour lancer un son sur les 3 colonnes 
document.querySelectorAll('.column').forEach(column => {

  // Ajout des gestionnaires d'événements pour le long press
  column.addEventListener('mousedown', handleMouseDown);
  column.addEventListener('mouseup', handleMouseUp);
  column.addEventListener('mouseleave', handleMouseLeave);
  
  // Ajout du gestionnaire d'événements pour le clic
  column.addEventListener('click', handleColumnClick);
    // Ajout du déclenchement Enter
    enableKeyboardClick(column);
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
        isMeditationPlaying = false; // Réinitialise l'état lorsque le son se termine
        return; // Ne rien faire d'autre
    }

    // Arrêter le son en cours de h1 s'il y en a un
    if (currentSound) {
        currentSound.pause();
        currentSound.currentTime = 0;
        currentSound = null;
        isMeditationPlaying = false; // Réinitialise l'état lorsque le son se termine
    }


    // Arrêter le son en cours de séphirah, lettre hébraïque ou symbole de l'infini s'il y en a un
    if (currentPlayingSound) {
        currentPlayingSound.pause();
        currentPlayingSound.currentTime = 0;
        currentPlayingSound = null;
        currentPlayingElement = null;
        isMeditationPlaying = false; // Réinitialise l'état lorsque le son se termine
    }


    // Jouer le nouveau son
    if (soundPath) {
        currentPlayingSound = new Audio(soundPath); // Créer un nouvel objet audio
        currentPlayingSound.play(); // Jouer le son
        currentPlayingElement = columnId; // Mettre à jour l'élément actif

        // Réinitialiser quand le son est terminé
        currentPlayingSound.addEventListener('ended', () => {
            if (isMeditationPlaying) {
                isMeditationPlaying = false; // Réinitialise l'état lorsque le son se termine                  
                gongSound.play();
            }
            currentPlayingSound = null;
            currentPlayingElement = null;
           
        });
    }
}




/**
 * Rend un élément focusable au clavier (tabindex=0) et déclenche un 'click'
 * lorsqu'on appuie sur la touche "Enter" pendant qu'il a le focus.
 *
 * @param {HTMLElement} element L'élément qui doit réagir à la touche Entrée
 */
function enableKeyboardClick(element) {
    // S'assure que l'élément est focusable
    element.setAttribute('tabindex', '0');

    // Ajoute l'écouteur sur keydown (ou keyup si vous préférez)
    element.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            // Empêche éventuellement d’autres actions par défaut
            event.preventDefault();
            // Déclenche l’événement click() sur cet élément
            element.click();
        }
    });
}

/**
 * Quand on commence à appuyer (ou toucher), on lance le minuteur.
 * Si l'appui dure plus de LONG_PRESS_DELAY, on passe en méditation.
 */
function handleMouseDown() {
    // Démarre le minuteur qui va activer meditation si on tient assez longtemps
    pressTimer = setTimeout(() => {
        meditation = true;
        meditationSound.play(); // Joue le son de méditation
        
    }, LONG_PRESS_DELAY);
}

/**
 * Quand on relâche le clic ou qu'on arrête de toucher,
 * on annule le minuteur pour ne pas passer en méditation si l'appui est court.
 */
function handleMouseUp() {
    clearTimeout(pressTimer);
    meditationSound.pause(); // Arrête le son de méditation
    meditationSound.currentTime = 0; // Réinitialise le son de méditation
   
}

/**
 * Quand la souris sort de l'élément avant le mouseup
 * (ou en cas de touchcancel), on annule le minuteur.
 */
function handleMouseLeave() {
    clearTimeout(pressTimer);
    meditationSound.pause(); // Arrête le son de méditation
    meditationSound.currentTime = 0; // Réinitialise le son de méditation
}