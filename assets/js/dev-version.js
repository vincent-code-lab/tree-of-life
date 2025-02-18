  // Configuration de la version
  const APP_VERSION = '1.0.0';
  const versionElement = document.createElement('div');
  versionElement.id = 'app-version';
  versionElement.style.cssText = 'position: fixed; top: 7%; left: 10px; padding: 5px 10px; border-radius: 4px; font-size: 8px; z-index: 9999; color: white; transition: background-color 0.3s ease;';
  
  // Fonction pour mettre à jour la couleur du fond selon le temps écoulé
  function updateVersionColor(lastModified) {
      const now = Date.now();
      const diffInSeconds = (now - lastModified) / 1000;
      
      if (diffInSeconds <= 60) { // Moins de 60 secondes
          versionElement.style.backgroundColor = 'rgba(0, 155, 0, 0.8)'; // Vert
      } else { // Plus de 60 secondes
          versionElement.style.backgroundColor = 'rgba(155, 0, 0, 0.8)'; // Rouge
      }
  }
  
  // Fonction pour ajouter des paramètres de version aux ressources
  function addVersionToResources() {
      const timestamp = Date.now();
      const lastModifiedTime = new Date(document.lastModified).getTime();
      
      if (!document.body.contains(versionElement)) {
          document.body.appendChild(versionElement);
      }
      
      versionElement.textContent = `v${APP_VERSION}, (${new Date(timestamp).toLocaleTimeString()}) [${document.lastModified}]`;
      updateVersionColor(lastModifiedTime); // Utiliser la vraie date de dernière modification
      
      // Sélectionner les liens CSS locaux (excluant Google Fonts et CDN)
      const cssLinks = document.querySelectorAll('link[rel="stylesheet"]:not([href*="fonts.googleapis.com"]):not([href*="cdnjs.cloudflare.com"])');
      const scriptLinks = document.querySelectorAll('script[src]');
      const preloadLinks = document.querySelectorAll('link[rel="preload"]:not([href*="fonts.googleapis.com"]):not([href*="cdnjs.cloudflare.com"])');
      
      // Ajouter le timestamp comme paramètre de version
      cssLinks.forEach(link => {
          const currentSrc = link.getAttribute('href');
          link.setAttribute('href', `${currentSrc.split('?')[0]}?v=${APP_VERSION}-${timestamp}`);
      });
      
      scriptLinks.forEach(script => {
          const currentSrc = script.getAttribute('src');
          if (currentSrc) {
              script.setAttribute('src', `${currentSrc.split('?')[0]}?v=${APP_VERSION}-${timestamp}`);
          }
      });

      preloadLinks.forEach(link => {
          const currentSrc = link.getAttribute('href');
          link.setAttribute('href', `${currentSrc.split('?')[0]}?v=${APP_VERSION}-${timestamp}`);
      });

      console.log(`Application mise à jour - version : ${APP_VERSION}-${new Date(timestamp).toLocaleTimeString()}`);
  }

  // Fonction pour vérifier les mises à jour
  function checkForUpdates() {
      fetch(window.location.href + '?check=' + Date.now())
          .then(response => {
              if (response.ok) {
                  // Vérifier la dernière modification du fichier via les en-têtes
                  const lastModified = response.headers.get('last-modified');
                  if (lastModified) {
                      const lastModifiedTime = new Date(lastModified).getTime();
                      updateVersionColor(lastModifiedTime);
                  }
                  addVersionToResources();
              }
          })
          .catch(error => console.error('Erreur de vérification de mise à jour:', error));
  }

  // Vérifier les mises à jour toutes les 5 minutes
  setInterval(checkForUpdates, 300000);

  // Vérifier la couleur toutes les 10 secondes
  setInterval(() => {
      let lastModified = new Date(document.lastModified).getTime();
      updateVersionColor(lastModified);
  }, 10000);

  // Appliquer la version initiale
  window.addEventListener('load', () => {
      const lastModifiedTime = new Date(document.lastModified).getTime();
      updateVersionColor(lastModifiedTime); // Mettre à jour la couleur immédiatement
      addVersionToResources();
  });



  document.addEventListener("DOMContentLoaded", function() {
      addVersionToResources();
  });
