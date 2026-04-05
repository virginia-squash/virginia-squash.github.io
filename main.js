/* ============================================
   Virginia Squash — vasquash.com
   ============================================ */

(function () {
  'use strict';

  // --- Nav scroll behavior ---
  const nav = document.getElementById('nav');
  const hero = document.getElementById('hero');

  function updateNav() {
    const threshold = hero ? hero.offsetHeight - 100 : 200;
    nav.classList.toggle('scrolled', window.scrollY > threshold);
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // --- Mobile menu ---
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');

  toggle.addEventListener('click', function () {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on link click
  menu.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      menu.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // --- Scroll reveal ---
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });

  // --- Smooth scroll for anchor links (fallback for older browsers) ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --- Contact form handling ---
  var contactForm = document.querySelector('.contact__form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      // When Formspree is connected, remove this handler.
      // For now, prevent submission and show confirmation.
      if (contactForm.action === '#' || contactForm.action === window.location.href) {
        e.preventDefault();
        var btn = contactForm.querySelector('button[type="submit"]');
        var original = btn.textContent;
        btn.textContent = 'Form not connected yet';
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = original;
          btn.disabled = false;
        }, 2500);
      }
    });
  }

  // --- Newsletter form handling ---
  var newsletterForm = document.querySelector('.newsletter__form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      if (newsletterForm.action === '#' || newsletterForm.action === window.location.href) {
        e.preventDefault();
        var btn = newsletterForm.querySelector('button[type="submit"]');
        var original = btn.textContent;
        btn.textContent = 'Coming soon!';
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = original;
          btn.disabled = false;
        }, 2500);
      }
    });
  }
  // --- Hero Collage ---
  var COLLAGE_PATH = 'assets/collage/';
  var FLIP_INTERVAL = 2500;
  var FLIP_STAGGER = 800;
  var FLIP_DURATION = 800;

  function buildImageList(count) {
    var images = [];
    for (var i = 1; i <= count; i++) {
      images.push(COLLAGE_PATH + (i < 10 ? '0' + i : i) + '.jpg');
    }
    return images;
  }

  function probeImages(callback) {
    var idx = 1;
    function probe() {
      var img = new Image();
      img.onload = function () { idx++; probe(); };
      img.onerror = function () { callback(buildImageList(idx - 1)); };
      img.src = COLLAGE_PATH + (idx < 10 ? '0' + idx : idx) + '.jpg';
    }
    probe();
  }

  function loadCollageCount(callback) {
    fetch(COLLAGE_PATH + 'count.txt')
      .then(function (res) {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then(function (text) {
        var count = parseInt(text.trim(), 10);
        if (count > 0) callback(buildImageList(count));
        else probeImages(callback);
      })
      .catch(function () { probeImages(callback); });
  }

  function initCollage(allImages) {
    var container = document.getElementById('heroCollage');
    if (!container || allImages.length === 0) return null;

    // Fisher-Yates shuffle
    function shuffle(arr) {
      for (var j = arr.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var tmp = arr[j];
        arr[j] = arr[k];
        arr[k] = tmp;
      }
      return arr;
    }

    shuffle(allImages);

    // Calculate grid based on viewport to keep cards roughly square
    var vw = container.offsetWidth;
    var vh = container.offsetHeight;
    var targetSize = Math.min(vw, vh) / 4; // aim for ~4 cells along the short side
    var cols = Math.round(vw / targetSize);
    var rows = Math.round(vh / targetSize);
    cols = Math.max(cols, 2);
    rows = Math.max(rows, 2);
    container.style.setProperty('--collage-cols', cols);
    container.style.setProperty('--collage-rows', rows);
    var cardCount = cols * rows;

    // Assign initial images, cycling if needed
    var displayImages = [];
    for (var i = 0; i < cardCount; i++) {
      displayImages.push(allImages[i % allImages.length]);
    }

    var cards = [];
    for (var i = 0; i < cardCount; i++) {
      var card = document.createElement('div');
      card.className = 'collage-card';

      var inner = document.createElement('div');
      inner.className = 'collage-card__inner';

      var front = document.createElement('div');
      front.className = 'collage-card__face collage-card__face--front';
      var frontImg = document.createElement('img');
      frontImg.src = displayImages[i];
      frontImg.alt = '';
      frontImg.loading = 'lazy';
      front.appendChild(frontImg);

      var back = document.createElement('div');
      back.className = 'collage-card__face collage-card__face--back';
      var backImg = document.createElement('img');
      backImg.alt = '';
      back.appendChild(backImg);

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);
      container.appendChild(card);

      cards.push({
        el: card,
        frontImg: frontImg,
        backImg: backImg,
        currentSrc: displayImages[i],
        isFlipped: false
      });
    }

    // Fade in the collage
    requestAnimationFrame(function () {
      container.classList.add('loaded');
    });

    return { cards: cards, all: allImages };
  }

  function startCollageAnimation(state) {
    if (!state || !state.cards.length) return;

    var collageVisible = true;

    // Pause flips when hero scrolls out of view
    var heroEl = document.getElementById('hero');
    if (heroEl && 'IntersectionObserver' in window) {
      var visObs = new IntersectionObserver(function (entries) {
        collageVisible = entries[0].isIntersecting;
      }, { threshold: 0 });
      visObs.observe(heroEl);
    }

    function getNextImage(currentSrc) {
      var attempts = 0;
      var next;
      do {
        next = state.all[Math.floor(Math.random() * state.all.length)];
        attempts++;
      } while (next === currentSrc && attempts < 10);
      return next;
    }

    function flipRandomCard() {
      if (!collageVisible) return;

      var available = [];
      for (var i = 0; i < state.cards.length; i++) {
        if (!state.cards[i].isFlipped) available.push(i);
      }
      if (available.length === 0) return;

      var idx = available[Math.floor(Math.random() * available.length)];
      var card = state.cards[idx];

      var nextSrc = getNextImage(card.currentSrc);
      card.backImg.src = nextSrc;

      card.el.classList.add('flipped');
      card.isFlipped = true;

      setTimeout(function () {
        card.frontImg.src = nextSrc;
        card.currentSrc = nextSrc;
        card.el.classList.remove('flipped');
        card.isFlipped = false;
      }, FLIP_DURATION + 300);
    }

    function scheduleNext() {
      var delay = FLIP_INTERVAL + (Math.random() * FLIP_STAGGER * 2 - FLIP_STAGGER);
      setTimeout(function () {
        flipRandomCard();
        scheduleNext();
      }, delay);
    }

    scheduleNext();
  }

  // Init collage, respecting reduced motion
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  loadCollageCount(function (allImages) {
    var collageState = initCollage(allImages);
    if (!prefersReducedMotion) {
      startCollageAnimation(collageState);
    }
  });
})();
