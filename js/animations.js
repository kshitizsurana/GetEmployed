document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  const heroTl = gsap.timeline();
  
  heroTl.from('.navbar', {
    y: -100,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  }, 0.2);

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
    ease: 'power3.out',
    onComplete: () => {
      const counters = document.querySelectorAll('.stat-number');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const suffix = counter.getAttribute('data-suffix') || '';
        
        gsap.to(counter, {
          innerText: target,
          duration: 2,
          snap: { innerText: 1 },
          ease: 'power1.out',
          onUpdate: function() {
            const value = Math.floor(this.targets()[0].innerText);
            counter.innerText = value.toLocaleString() + suffix;
          }
        });
      });
    }
  }, 0.8);

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

  const observeAndAnimate = (containerId, itemSelector, animProps) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const skeletons = container.querySelectorAll('.skeleton-card');
    if (skeletons.length > 0) {
      gsap.from(skeletons, {
        scrollTrigger: { trigger: container, start: 'top 85%' },
        ...animProps, opacity: 0
      });
    }

    const observer = new MutationObserver((mutations) => {
      let addedItems = [];
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && node.matches(itemSelector)) {
            addedItems.push(node);
          } else if (node.nodeType === 1 && node.querySelector) {
            const children = node.querySelectorAll(itemSelector);
            if (children.length) addedItems.push(...children);
          }
        });
      });
      
      if (addedItems.length > 0) {
        gsap.from(addedItems, {
          scrollTrigger: { trigger: container, start: 'top 85%' },
          ...animProps,
          opacity: 0
        });
      }
    });
    observer.observe(container, { childList: true, subtree: true });
  };

  observeAndAnimate('top-picks-list', '.top10-item', {
    x: 80,
    scale: 0.85,
    rotationY: -15,
    transformPerspective: 1000,
    duration: 1,
    stagger: 0.12,
    ease: 'elastic.out(1, 0.7)'
  });

  observeAndAnimate('cards-grid', '.job-card', {
    y: 60,
    duration: 0.8,
    stagger: 0.08,
    ease: 'back.out(1.2)'
  });

  gsap.from('.about-feature-card', {
    scrollTrigger: {
      trigger: '.about-features-grid',
      start: 'top 80%',
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
  });

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
  
  const cards3D = document.querySelectorAll('.job-card');
  cards3D.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6; 
      const rotateY = ((x - centerX) / centerX) * 6;
      
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        scale: 1.02,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.3)'
      });
    });
  });

});
