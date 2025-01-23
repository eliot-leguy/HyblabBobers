"use strict";

/**
 * Fonction pour charger le contenu HTML dans un élément spécifique.
 * @param {string} url - L'URL du fichier HTML à charger.
 * @param {string} elementId - L'ID de l'élément où le contenu sera injecté.
 * @returns {Promise} - Une promesse qui se résout une fois le contenu chargé.
 */

function loadContent(url, elementId) {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      document.getElementById(elementId).innerHTML = data;
    })
    .catch(error => console.error(`Erreur lors du chargement de ${url}:`, error));
}

document.addEventListener('DOMContentLoaded', function() {
  // Charger tous les contenus HTML des slides
  Promise.all([
    loadContent('html/accueil.html', 'content-accueil'),
    loadContent('html/chat.html', 'content-chat'),
    loadContent('html/fin.html', 'content-fin')
  ]).then(() => {

    // Init of the (touch friendly) Swiper slider
    const swiper = new Swiper("#mySwiper", {
      direction: "vertical",
      mousewheel: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });
    // Function to enable or disable Swiper controls
    function toggleSwiper(enable) {
      if (enable) {
        swiper.mousewheel.enable();
        swiper.allowTouchMove = true;
      } else {
        swiper.mousewheel.disable();
        swiper.allowTouchMove = false;
      }
    }


    swiper.on("slideChange", function () {
      switch( swiper.activeIndex ) {
        case 0:
          initSlide1();
          toggleSwiper(true);
          break;
        case 1:
          initSlide2();
          showCircle();
          toggleSwiper(false);
          break;
        case 2:
          initSlide3();
          toggleSwiper(true);
          break;
      }
    });

    let timeout;
    const circleContainer = document.getElementById('circle-container');

    // Show the animated circles if no user activity for 3 seconds
    function showCircle() {
      circleContainer.style.display = 'block';
    }

    // Hide the circles and reset the timer on user activity
    function hideCircle() {
      circleContainer.style.display = 'none';
      clearTimeout(timeout);
      timeout = setTimeout(showCircle, 7000); // Reset the timer
    }

    // Add event listeners for user activity
    ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, hideCircle);
    });

    // Start the timer on page load
    timeout = setTimeout(showCircle, 7000);



    // Wait for the content to preload and display 1st slide
    // Here we simulate a loading time of one second
    setTimeout(() => { 
      // fade out the loader "slide"
      // and send it to the back (z-index = -1)
      anime({
        delay: 10,
        targets: '#loader',
        opacity: '0',
        'z-index' : -1,
        easing: 'easeOutQuad',
      });
      
      // Init first slide
      initSlide1();
    }, 10);
  }).catch(error => {
    console.error('Erreur lors du chargement des contenus:', error);
  });
});