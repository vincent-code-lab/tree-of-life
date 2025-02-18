/**
 * Gestionnaire de stockage local pour l'application Tree of Life
 */
class StoreManager {
    static KEYS = {
        SOUND_ENABLED: 'soundEnabled',
        // Ajoutez d'autres clés ici au fur et à mesure
    };

    /**
     * Obtient une valeur du stockage local
     * @param {string} key - La clé de la valeur à récupérer
     * @param {any} defaultValue - La valeur par défaut si la clé n'existe pas
     * @returns {any} La valeur stockée ou la valeur par défaut
     */
    static get(key, defaultValue) {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
    }

    /**
     * Enregistre une valeur dans le stockage local
     * @param {string} key - La clé sous laquelle stocker la valeur
     * @param {any} value - La valeur à stocker
     */
    static set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * Obtient l'état du son
     * @returns {boolean} true si le son est activé, false sinon
     */
    static getSoundEnabled() {
        return this.get(this.KEYS.SOUND_ENABLED, true);
    }

    /**
     * Définit l'état du son
     * @param {boolean} enabled - true pour activer le son, false pour le désactiver
     */
    static setSoundEnabled(enabled) {
        this.set(this.KEYS.SOUND_ENABLED, enabled);
    }

    /**
     * Efface toutes les données stockées dans le localStorage
     */
    static clearAllData() {
        localStorage.clear();
        console.log('Toutes les données stockées ont été effacées');
    }
}






/**
 * Gestion de la réinitialisation des données stockées
 */
document.addEventListener('DOMContentLoaded', () => {
    const resetButton = document.getElementById('resetDataButton');
    
    if (resetButton) {
        // Afficher le bouton
        resetButton.classList.remove('hidden');

        // Ajouter l'événement de clic
        resetButton.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données stockées ? Cette action est irréversible.')) {
                // Effacer les données
                StoreManager.clearAllData();
                
                // Recharger la page pour appliquer les changements
                window.location.reload();
            }
        });
    }
});