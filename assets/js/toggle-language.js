// Variable pour gérer le délai d'inactivité
let inactivityTimeout;
let userHasMovedMouse = false;

// Affiche le menu de sélection de langue
function showMenu() {
    document.getElementById('language-menu').style.display = 'flex';
    resetInactivityTimer();
}

// Cache le menu de sélection de langue
function hideMenu() {
    document.getElementById('language-menu').style.display = 'none';
}

// Réinitialise le minuteur d'inactivité
function resetInactivityTimer() {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(hideMenu, 5000);
}

// Bascule l'affichage du menu de langue
function toggleMenu() {
    const menu = document.getElementById('dropdown');
    const langMenu = document.getElementById('language-menu');
    const isOpen = menu.style.display === 'block';
    menu.style.display = isOpen ? 'none' : 'block';
    langMenu.classList.toggle('open', !isOpen);
    resetInactivityTimer();
}

// Change la langue de l'application
function changeLanguage(lang) {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.location.href = url;
}

// Récupère la langue du navigateur
function getBrowserLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    return lang.split('-')[0];
}

// Définit la langue initiale à partir des paramètres d'URL ou de la langue du navigateur
function setInitialLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    let lang = urlParams.get('lang');

    if (lang) {
        // Si la langue est définie via l'URL, on l'affiche immédiatement
        document.getElementById('language-menu').style.display = 'flex';
    } else {
        // Sinon, on choisit la langue du navigateur et on cache le menu
        lang = getBrowserLanguage();
        document.getElementById('language-menu').style.display = 'none';

        // On attend que l'utilisateur bouge la souris avant d'afficher le menu
        document.addEventListener("mousemove", () => {
            if (!userHasMovedMouse) {
                showMenu();
                userHasMovedMouse = true;
            }
        }, { once: true }); // L'événement ne s'exécutera qu'une seule fois
    }

    document.getElementById('current-lang').textContent = lang.toUpperCase();
}
// Écoute les événements pour initialiser la langue et gérer l'affichage du menu
document.addEventListener("DOMContentLoaded", setInitialLanguage);
document.addEventListener("mousemove", showMenu);
document.addEventListener("click", (event) => {
    const menu = document.getElementById('dropdown');
    const langMenu = document.getElementById('language-menu');
    if (!langMenu.contains(event.target)) {
        menu.style.display = 'none';
        langMenu.classList.remove('open');
    }
    resetInactivityTimer();
});
