/**
 * Joue un son lié au mode plein écran.
 * @param {string} audioPath - Chemin du fichier audio.
 */
function playFullscreenSound(audioPath) {
    try {
        const fullscreenAudio = new Audio(audioPath);
        fullscreenAudio.play().catch((err) => console.warn("Impossible de lire le son :", err));
    } catch (err) {
        console.error("Erreur lors de la tentative de lecture du son :", err);
    }
}

/**
 * Active le mode plein écran.
 * @param {HTMLElement} element - Élément HTML à afficher en plein écran.
 */
function enterFullscreen(element) {
    try {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { // Compatibilité Safari
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // Compatibilité IE/Edge
            element.msRequestFullscreen();
        }
    } catch (err) {
        console.error("Erreur lors de l'entrée en mode plein écran :", err);
    }
}

/**
 * Désactive le mode plein écran.
 */
function exitFullscreen() {
    try {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { // Compatibilité Safari
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // Compatibilité IE/Edge
            document.msExitFullscreen();
        }
    } catch (err) {
        console.error("Erreur lors de la sortie du mode plein écran :", err);
    }
}

/**
 * Met à jour l'état du mode plein écran et les éléments associés.
 * @param {boolean} isFullscreen - Indique si le mode plein écran est activé.
 */
function setFullscreenState(isFullscreen) {
    updateFullscreenIcon(isFullscreen);
    playFullscreenSound(isFullscreen ? 'assets/audio/pleinecran.mp3' : 'assets/audio/quitterpleinecran.mp3');
}

/**
 * Bascule entre le mode plein écran activé/désactivé.
 */
function toggleFullscreen() {
    try {
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            enterFullscreen(document.documentElement);
            setFullscreenState(true);
        } else {
            exitFullscreen();
            setFullscreenState(false);
        }
    } catch (err) {
        console.error("Erreur lors de la bascule du mode plein écran :", err);
    }
}

/**
 * Met à jour l'icône du bouton plein écran.
 * @param {boolean} isFullscreen - Indique si le mode plein écran est activé.
 */
function updateFullscreenIcon(isFullscreen) {
    const fullscreenIcon = document.getElementById('fullscreenIcon');
    if (fullscreenIcon) {
        try {
            if (isFullscreen) {
                fullscreenIcon.classList.remove('fa-expand');
                fullscreenIcon.classList.add('fa-compress');
            } else {
                fullscreenIcon.classList.remove('fa-compress');
                fullscreenIcon.classList.add('fa-expand');
            }
        } catch (err) {
            console.error("Erreur lors de la mise à jour de l'icône :", err);
        }
    }
}

// Variables et éléments globaux
const fullscreenButton = document.getElementById('fullscreenToggle');
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let mouseTimer;

/**
 * Affiche ou masque le bouton plein écran en fonction de l'activité souris (pour ordinateurs uniquement).
 */
if (!isMobile) {
    document.addEventListener('mousemove', () => {
        try {
            fullscreenButton?.classList.remove('hidden');
            clearTimeout(mouseTimer);
            mouseTimer = setTimeout(() => {
                fullscreenButton?.classList.add('hidden');
            }, 5000); // Masquer après 5 secondes d'inactivité
        } catch (err) {
            console.error("Erreur lors de la gestion du bouton plein écran :", err);
        }
    });
} else {
    // Toujours afficher le bouton sur mobile
    fullscreenButton?.classList.remove('hidden');
}

// Ajout des événements
fullscreenButton?.addEventListener('click', toggleFullscreen);
document.addEventListener('dblclick', toggleFullscreen);
document.addEventListener('fullscreenchange', () => {
    setFullscreenState(!!document.fullscreenElement);
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'f' || event.key === 'F') {
        toggleFullscreen();
    }
});

/**
 * [Optionnel] Fonction pour afficher une notification du mode plein écran.
 * @param {boolean} isFullscreen - Indique si le mode plein écran est activé.
 */
function showFullscreenNotification(isFullscreen) {
    const notification = document.createElement('div');
    notification.innerText = isFullscreen ? 'Mode plein écran activé' : 'Mode plein écran désactivé';
    notification.style = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 9999;
        transition: opacity 0.5s ease-in-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => { notification.style.opacity = 0; }, 2000);
    setTimeout(() => { notification.remove(); }, 2500);
}
