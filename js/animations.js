document.addEventListener('DOMContentLoaded', () => {
  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);





  // --- Hero Animations ---
  const heroTl = gsap.timeline();
  
  // Animate Navbar
  heroTl.from('.navbar', {
    y: -100,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  }, 0.2);

  // Animate Hero Content
  heroTl.from('.hero-title', {
    y: 50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  }, 0.4)
  .from('.hero-desc', {
    y: 30,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  }, 0.6)
  .from('.hero-buttons > *', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out'
  }, 0.7)
  .from('.hero-stats > div', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out'
  }, 0.8);



  // --- Magnetic Buttons ---
  const magneticButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(btn, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
    
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.3)'
      });
    });
  });

  // --- Scroll Animations for Sections ---
  // Section Headers
  gsap.utils.toArray('.section-heading').forEach(heading => {
    gsap.from(heading, {
      scrollTrigger: {
        trigger: heading,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
  });

  gsap.utils.toArray('.section-subtext').forEach(sub => {
    gsap.from(sub, {
      scrollTrigger: {
        trigger: sub,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 30,
      opacity: 0,
      duration: 1,
      delay: 0.1,
      ease: 'power3.out'
    });
  });

  // Job Cards Stagger
  const jobSections = document.querySelectorAll('.opportunities-section, .top-picks');
  jobSections.forEach(section => {
    const cards = section.querySelectorAll('.job-card');
    if (cards.length > 0) {
      gsap.from(cards, {
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.2)'
      });
    }
  });

  // About Info Cards Stagger
  gsap.from('.about-info-card', {
    scrollTrigger: {
      trigger: '.about-grid',
      start: 'top 80%',
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
  });

  // Footer Parallax & Reveal
  gsap.from('.site-footer .container > *', {
    scrollTrigger: {
      trigger: '.site-footer',
      start: 'top 90%',
    },
    y: 40,
    opacity: 0,
    duration: 1,
    stagger: 0.1,
    ease: 'power3.out'
  });
  


  // --- 3D Tilt Effect for Job Cards ---
  const cards3D = document.querySelectorAll('.job-card');
  cards3D.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
      const rotateY = ((x - centerX) / centerX) * 10;
      
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        transformOrigin: 'center center',
        duration: 0.4,
        ease: 'power2.out'
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.3)'
      });
    });
  });

});
