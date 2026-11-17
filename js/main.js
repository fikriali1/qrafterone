document.addEventListener('DOMContentLoaded', () => {

  /* ===== VARIABLE FONT NAV HOVER ===== */
  document.querySelectorAll('.nav__links a').forEach(link => {
    const text = link.textContent.trim();
    link.textContent = '';
    link.setAttribute('data-vfh', '');

    const chars = text.split('');
    const mid = (chars.length - 1) / 2;
    const staggerMs = 30;

    chars.forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? ' ' : char;
      span.style.setProperty('--vfh-delay', Math.abs(i - mid) * staggerMs + 'ms');
      link.appendChild(span);
    });

    link.addEventListener('mouseenter', () => {
      link.querySelectorAll('span').forEach(s => s.classList.add('is-hover'));
    });
    link.addEventListener('mouseleave', () => {
      link.querySelectorAll('span').forEach(s => s.classList.remove('is-hover'));
    });
  });

  /* ===== FAQ ACCORDION ===== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-item__question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      faqItems.forEach(i => {
        i.classList.remove('is-open');
        i.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
        i.querySelector('.faq-item__toggle').textContent = '+';
      });

      if (!isOpen) {
        item.classList.add('is-open');
        item.querySelector('.faq-item__question').setAttribute('aria-expanded', 'true');
        item.querySelector('.faq-item__toggle').textContent = '−';
      }
    });
  });

  /* ===== SCROLL REVEAL ===== */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  /* ===== SCROLL SPY (active nav link) ===== */
  const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');
  const sections = [];

  navLinks.forEach(link => {
    const id = link.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    if (section) sections.push({ id, el: section });
  });

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('is-active'));
        const match = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
        if (match) match.classList.add('is-active');
      }
    });
  }, {
    threshold: 0,
    rootMargin: '-40% 0px -60% 0px'
  });

  sections.forEach(s => spyObserver.observe(s.el));

  /* ===== MOBILE NAV ===== */
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile-menu');
  const barsIcon = '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>';
  const closeIcon = '<line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/>';

  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.querySelector('svg').innerHTML = barsIcon;
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.querySelector('svg').innerHTML = isOpen ? closeIcon : barsIcon;
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('is-open') &&
          !mobileMenu.contains(e.target) &&
          !hamburger.contains(e.target)) {
        closeMenu();
      }
    });
  }

});
