'use strict';
(function () {
  const navbar          = document.getElementById('navbar');
  const hamburgerBtn    = document.getElementById('hamburger-btn');
  const navLinks        = document.getElementById('nav-links');
  const searchContainer = document.getElementById('search-container');
  const searchToggleBtn = document.getElementById('search-toggle-btn');
  const searchInput     = document.getElementById('search-input');
  const heroCTA         = document.getElementById('hero-cta');
  const heroGhostCTA    = document.getElementById('hero-cta-ghost');
  const heroTitle       = document.getElementById('hero-heading');

  function throttle(callback, limit) {
    let waiting = false;
    return function () {
      if (!waiting) {
        callback.apply(this, arguments);
        waiting = true;
        setTimeout(function () {
          waiting = false;
        }, limit);
      }
    };
  }
  function onScroll() {
    const y = window.scrollY;
    if (y > 60) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
    const docH    = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docH > 0 ? Math.round((y / docH) * 100) : 0;
    navbar?.style.setProperty('--scroll-percent', `${percent}%`);
    const sections = ['hero', 'row-top-picks', 'saved', 'opportunities', 'about'];
    let currentId = 'hero';
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) {
        currentId = id;
      }
    }
    const navMap = {
      hero: 'nav-home',
      'row-top-picks': 'nav-browse',
      saved: 'nav-saved',
      opportunities: 'nav-browse',
      about: 'nav-about',
    };
    document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
    const activeNav = document.getElementById(navMap[currentId]);
    if (activeNav) activeNav.classList.add('active');
  }
  window.addEventListener('scroll', throttle(onScroll, 30), { passive: true });
  onScroll(); 
  heroCTA?.addEventListener('click', () => {
    document.getElementById('opportunities')
      ?.scrollIntoView({ behavior: 'smooth' });
  });
  // ---- About Modal ----
  const aboutModal    = document.getElementById('about-modal');
  const aboutBackdrop = document.getElementById('about-backdrop');

  function openAbout() {
    aboutModal?.classList.add('active');
    aboutBackdrop?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeAbout() {
    aboutModal?.classList.remove('active');
    aboutBackdrop?.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Hero "About Us" button
  heroGhostCTA?.addEventListener('click', openAbout);

  // Navbar ABOUT button
  document.getElementById('nav-about-btn')?.addEventListener('click', openAbout);

  // Close on backdrop click
  aboutBackdrop?.addEventListener('click', closeAbout);

  // Close button inside modal
  document.getElementById('about-modal-close')?.addEventListener('click', closeAbout);

  // "Explore Roles" button inside modal scrolls to jobs & closes
  document.getElementById('about-explore-btn')?.addEventListener('click', () => {
    closeAbout();
    setTimeout(() => {
      document.getElementById('opportunities')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  });

  // Esc key closes
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAbout();
  });
  if (searchToggleBtn && searchContainer) {
    searchToggleBtn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = searchContainer.classList.toggle('active');
      searchToggleBtn.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        setTimeout(() => searchInput?.focus(), 180);
      }
    });
    document.addEventListener('click', e => {
      if (!searchContainer.contains(e.target)) {
        searchContainer.classList.remove('active');
        searchToggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
    searchInput?.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        searchContainer.classList.remove('active');
        searchToggleBtn.setAttribute('aria-expanded', 'false');
        searchToggleBtn.focus();
      }
    });
  }
  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('mobile-active');
      hamburgerBtn.classList.toggle('active', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-active');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', e => {
      if (navLinks.classList.contains('mobile-active') &&
          !navLinks.contains(e.target) &&
          !hamburgerBtn.contains(e.target)) {
        navLinks.classList.remove('mobile-active');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.querySelectorAll('.content-row').forEach(row => {
    const container = row.querySelector('.scroll-container');
    const leftBtn   = row.querySelector('.scroll-arrow--left');
    const rightBtn  = row.querySelector('.scroll-arrow--right');
    if (!container) return;
    const step = () => Math.round(container.offsetWidth * 0.75);
    leftBtn?.addEventListener('click',  () => container.scrollBy({ left: -step(), behavior: 'smooth' }));
    rightBtn?.addEventListener('click', () => container.scrollBy({ left:  step(), behavior: 'smooth' }));
    function updateArrows() {
      if (!leftBtn || !rightBtn) return;
      const atStart = container.scrollLeft <= 8;
      const atEnd   = container.scrollLeft + container.offsetWidth >= container.scrollWidth - 8;
      leftBtn.style.visibility  = atStart ? 'hidden' : 'visible';
      rightBtn.style.visibility = atEnd   ? 'hidden' : 'visible';
    }
    container.addEventListener('scroll', throttle(updateArrows, 60), { passive: true });
    window.addEventListener('resize',   throttle(updateArrows, 100), { passive: true });
    updateArrows();
  });
  document.querySelectorAll('.tab[data-cat]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab[data-cat]').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.dispatchEvent(new CustomEvent('categorychange', {
        detail: { category: tab.dataset.cat }
      }));
    });
  });
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
