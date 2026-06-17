/* ============================================================
   MAIN.JS — Brahim Bassor Portfolio
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. NAVBAR — scroll shadow + active link
  ---------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    // Shadow on scroll
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active nav link based on scroll position
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* ----------------------------------------------------------
     2. HAMBURGER MENU
  ---------------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu on nav link click
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ----------------------------------------------------------
     3. TYPEWRITER ANIMATION
  ---------------------------------------------------------- */
  const subtitles = [
    'Ingénieur IA & Data Science',
    'NLP & Machine Learning',
    'Full-stack Developer',
  ];

  const typewriterEl = document.getElementById('typewriter-text');
  let subtitleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeTimeout;

  const TYPING_SPEED   = 70;
  const DELETING_SPEED = 35;
  const PAUSE_AFTER    = 2000;
  const PAUSE_BEFORE   = 400;

  // Respect reduced-motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    typewriterEl.textContent = subtitles[0];
  } else {
    function type() {
      const current = subtitles[subtitleIndex];

      if (!isDeleting) {
        typewriterEl.textContent = current.slice(0, charIndex + 1);
        charIndex++;

        if (charIndex === current.length) {
          isDeleting = true;
          typeTimeout = setTimeout(type, PAUSE_AFTER);
          return;
        }
      } else {
        typewriterEl.textContent = current.slice(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          subtitleIndex = (subtitleIndex + 1) % subtitles.length;
          typeTimeout = setTimeout(type, PAUSE_BEFORE);
          return;
        }
      }

      typeTimeout = setTimeout(type, isDeleting ? DELETING_SPEED : TYPING_SPEED);
    }

    typeTimeout = setTimeout(type, 800);
  }

  /* ----------------------------------------------------------
     4. INTERSECTION OBSERVER — reveal on scroll
  ---------------------------------------------------------- */
  if (!prefersReducedMotion) {
    const revealEls = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger children within same parent
            const siblings = entry.target.parentElement.querySelectorAll('.reveal:not(.visible)');
            let delay = 0;
            siblings.forEach((el) => {
              if (el === entry.target) {
                el.style.transitionDelay = delay + 'ms';
              }
              delay += 80;
            });

            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    // Show all immediately when reduced motion is preferred
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  }

  /* ----------------------------------------------------------
     5. SMOOTH SCROLL for all anchor links
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();

      const navbarHeight = navbar.offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     6. CONTACT FORM — client-side UX (mailto fallback)
  ---------------------------------------------------------- */
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = form.querySelector('#name').value.trim();
      const email   = form.querySelector('#email').value.trim();
      const message = form.querySelector('#message').value.trim();

      // Basic validation
      if (!name || !email || !message) {
        showFormFeedback('Veuillez remplir tous les champs.', 'error');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormFeedback('Adresse email invalide.', 'error');
        return;
      }

      // Disable button during "send"
      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector('.btn-text');
      const original = btnText.textContent;
      btnText.textContent = 'Envoi en cours…';

      // Mailto fallback (works without a backend on GitHub Pages)
      const subject  = encodeURIComponent(`Portfolio Contact — ${name}`);
      const body     = encodeURIComponent(`Nom: ${name}\nEmail: ${email}\n\n${message}`);
      const mailtoURL = `mailto:bassor.brahim1@gmail.com?subject=${subject}&body=${body}`;

      // Small delay for UX feel
      setTimeout(() => {
        window.location.href = mailtoURL;
        btnText.textContent = 'Message envoyé !';
        showFormFeedback('Votre client mail va s\'ouvrir. Merci !', 'success');

        setTimeout(() => {
          submitBtn.disabled = false;
          btnText.textContent = original;
          form.reset();
          removeFormFeedback();
        }, 4000);
      }, 800);
    });
  }

  function showFormFeedback(msg, type) {
    removeFormFeedback();
    const el = document.createElement('p');
    el.id = 'form-feedback';
    el.textContent = msg;
    el.style.cssText = `
      font-size: 0.875rem;
      margin-top: 0.75rem;
      padding: 10px 14px;
      border-radius: 8px;
      font-family: var(--font-sans);
      ${type === 'error'
        ? 'color:#b91c1c;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);'
        : 'color:#065f46;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);'}
    `;
    submitBtn.after(el);
  }

  function removeFormFeedback() {
    const el = document.getElementById('form-feedback');
    if (el) el.remove();
  }

  /* ----------------------------------------------------------
     7. AVATAR — graceful fallback placeholder initials
  ---------------------------------------------------------- */
  const avatarImg = document.querySelector('.hero__avatar img');
  if (avatarImg) {
    avatarImg.addEventListener('error', () => {
      avatarImg.closest('.hero__avatar').classList.add('hero__avatar--placeholder');
      avatarImg.remove();
    });
  }

})();
