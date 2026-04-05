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
  const observer = new IntersectionObserver(
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

  // --- Placeholder form handling ---
  function initPlaceholderForm(selector, message) {
    const form = document.querySelector(selector);
    if (!form) return;
    form.addEventListener('submit', function (e) {
      if (form.action === '#' || form.action === window.location.href) {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const original = btn.textContent;
        btn.textContent = message;
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = original;
          btn.disabled = false;
        }, 2500);
      }
    });
  }

  initPlaceholderForm('.contact__form', 'Form not connected yet');
  initPlaceholderForm('.newsletter__form', 'Coming soon!');

  // --- Hero Collage ---
  const COLLAGE_PATH = 'assets/collage/';
  const FLIP_INTERVAL = 2500;
  const FLIP_STAGGER = 800;
  const FLIP_DURATION = 800;

  function buildImageList(count) {
    return Array.from({ length: count }, (_, i) =>
      COLLAGE_PATH + String(i + 1).padStart(2, '0') + '.jpg'
    );
  }

  function probeImages(callback) {
    let idx = 1;
    function probe() {
      const img = new Image();
      img.onload = function () { idx++; probe(); };
      img.onerror = function () { callback(buildImageList(idx - 1)); };
      img.src = COLLAGE_PATH + String(idx).padStart(2, '0') + '.jpg';
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
        const count = parseInt(text.trim(), 10);
        if (count > 0) callback(buildImageList(count));
        else probeImages(callback);
      })
      .catch(function () { probeImages(callback); });
  }

  function initCollage(allImages) {
    const container = document.getElementById('heroCollage');
    if (!container || allImages.length === 0) return null;

    // Fisher-Yates shuffle
    function shuffle(arr) {
      for (let j = arr.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        const tmp = arr[j];
        arr[j] = arr[k];
        arr[k] = tmp;
      }
      return arr;
    }

    shuffle(allImages);

    // Calculate grid based on viewport to keep cards roughly square
    const vw = container.offsetWidth;
    const vh = container.offsetHeight;
    const targetSize = Math.min(vw, vh) / 4;
    let cols = Math.round(vw / targetSize);
    let rows = Math.round(vh / targetSize);
    cols = Math.max(cols, 2);
    rows = Math.max(rows, 2);
    container.style.setProperty('--collage-cols', cols);
    container.style.setProperty('--collage-rows', rows);
    const cardCount = cols * rows;

    const displayImages = Array.from({ length: cardCount }, (_, i) =>
      allImages[i % allImages.length]
    );

    const cards = [];
    for (let i = 0; i < cardCount; i++) {
      const card = document.createElement('div');
      card.className = 'collage-card';

      const inner = document.createElement('div');
      inner.className = 'collage-card__inner';

      const front = document.createElement('div');
      front.className = 'collage-card__face collage-card__face--front';
      const frontImg = document.createElement('img');
      frontImg.src = displayImages[i];
      frontImg.alt = '';
      frontImg.loading = 'lazy';
      front.appendChild(frontImg);

      const back = document.createElement('div');
      back.className = 'collage-card__face collage-card__face--back';
      const backImg = document.createElement('img');
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

    let collageVisible = true;

    // Pause flips when hero scrolls out of view
    const heroEl = document.getElementById('hero');
    if (heroEl && 'IntersectionObserver' in window) {
      const visObs = new IntersectionObserver(function (entries) {
        collageVisible = entries[0].isIntersecting;
      }, { threshold: 0 });
      visObs.observe(heroEl);
    }

    function getNextImage(currentSrc) {
      let attempts = 0;
      let next;
      do {
        next = state.all[Math.floor(Math.random() * state.all.length)];
        attempts++;
      } while (next === currentSrc && attempts < 10);
      return next;
    }

    function flipRandomCard() {
      if (!collageVisible) return;

      const available = [];
      for (let i = 0; i < state.cards.length; i++) {
        if (!state.cards[i].isFlipped) available.push(i);
      }
      if (available.length === 0) return;

      const idx = available[Math.floor(Math.random() * available.length)];
      const card = state.cards[idx];

      const nextSrc = getNextImage(card.currentSrc);
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
      const delay = FLIP_INTERVAL + (Math.random() * FLIP_STAGGER * 2 - FLIP_STAGGER);
      setTimeout(function () {
        flipRandomCard();
        scheduleNext();
      }, delay);
    }

    scheduleNext();
  }

  // Init collage, respecting reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  loadCollageCount(function (allImages) {
    const collageState = initCollage(allImages);
    if (!prefersReducedMotion) {
      startCollageAnimation(collageState);
    }
  });
})();
