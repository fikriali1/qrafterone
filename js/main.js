const WAITLIST_ENDPOINT = "https://script.google.com/macros/s/AKfycbwGdBd1kWCxfQX2ldQVWkB_EPJAY-ctuaTDLcY3kM2X7Xx_R7-4aczbz2ppxFdetZlr/exec";

// TODO: connect to analytics
function trackEvent(name, data) { console.log("[track]", name, data); }

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

  /* ===== SHINY-CTA VISIBILITY (pause when offscreen) ===== */
  const shinyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-animating', entry.isIntersecting);
    });
  });
  document.querySelectorAll('.shiny-cta').forEach(el => shinyObserver.observe(el));

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

  let activeSection = null;
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activeSection = entry.target.id;
      } else if (entry.target.id === activeSection) {
        activeSection = null;
      }
    });
    navLinks.forEach(l => l.classList.remove('is-active'));
    if (activeSection) {
      const match = document.querySelector(`.nav__links a[href="#${activeSection}"]`);
      if (match) match.classList.add('is-active');
    }
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

  /* ===== WAITLIST MODAL ===== */
  const modal = document.getElementById('waitlist-modal');
  const modalContent = modal ? modal.querySelector('.modal') : null;
  const form = document.getElementById('waitlist-form');
  let modalTrigger = null;
  let modalSource = '';

  function openModal(trigger) {
    modalTrigger = trigger;
    modalSource = trigger.dataset.source || '';
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    const first = form.querySelector('input, select');
    if (first) first.focus();
    trackEvent('waitlist_open', { source: modalSource });
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 200);
    if (modalTrigger) { modalTrigger.focus(); modalTrigger = null; }
    form.reset();
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    modal.querySelector('.modal__success').hidden = true;
    modal.querySelector('.modal__error').hidden = true;
    modal.querySelector('.modal__body > form').style.display = '';
    modal.querySelector('.modal__intro').style.display = '';
    const otherField = form.querySelector('.form-field__other');
    if (otherField) otherField.hidden = true;
  }

  if (modal) {
    document.querySelectorAll('.js-open-waitlist').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn));
    });

    modal.querySelector('.modal__close').addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    // Focus trap
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusable = modal.querySelectorAll('input, select, button, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ===== WAITLIST FORM SUBMIT ===== */
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate required fields
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        if (field.type === 'checkbox') {
          field.classList.toggle('is-invalid', !field.checked);
          if (!field.checked) valid = false;
        } else {
          field.classList.toggle('is-invalid', !field.value.trim());
          if (!field.value.trim()) valid = false;
        }
      });

      const emailField = form.querySelector('[type="email"]');
      if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.classList.add('is-invalid');
        valid = false;
      }

      if (!valid) return;

      const checked = [...form.querySelectorAll('input[name="interestedFeatures"]:checked')];
      const interestedFeatures = checked.map(cb => {
        if (cb.dataset.other !== undefined) {
          const otherText = form.querySelector('.form-field__other').value.trim();
          return otherText ? 'Other: ' + otherText : 'Other';
        }
        return cb.value;
      });

      const payload = {
        name: form.name.value.trim(),
        businessName: form.businessName.value.trim(),
        email: form.email.value.trim(),
        businessType: form.businessType.value,
        branches: form.branches.value,
        country: form.country.value || '',
        interestedFeatures,
        interestedFeaturesOther: (() => {
          const otherCb = form.querySelector('input[name="interestedFeatures"][data-other]');
          if (otherCb && otherCb.checked) {
            return form.querySelector('.form-field__other').value.trim() || '';
          }
          return '';
        })(),
        consent: form.consent.checked,
        source: modalSource,
        submittedAt: new Date().toISOString()
      };

      const submitBtn = form.querySelector('.modal__submit');

      if (!WAITLIST_ENDPOINT) {
        console.log('[waitlist]', JSON.stringify(payload, null, 2));
        form.style.display = 'none';
        modal.querySelector('.modal__intro').style.display = 'none';
        modal.querySelector('.modal__success').hidden = false;
        trackEvent('waitlist_submit', payload);
        return;
      }

      submitBtn.classList.add('is-loading');
      submitBtn.textContent = 'Submitting…';

      try {
        const res = await fetch(WAITLIST_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.ok) throw new Error('Submission failed');
        form.style.display = 'none';
        modal.querySelector('.modal__intro').style.display = 'none';
        modal.querySelector('.modal__success').hidden = false;
        trackEvent('waitlist_submit', payload);
      } catch {
        modal.querySelector('.modal__error').hidden = false;
      } finally {
        submitBtn.classList.remove('is-loading');
        submitBtn.textContent = 'Join the waitlist';
      }
    });

    // Clear validation on input
    form.addEventListener('input', (e) => {
      e.target.classList.remove('is-invalid');
    });
  }

  /* ===== "OTHER" CHECKBOX TOGGLE ===== */
  const otherCheckbox = form ? form.querySelector('input[data-other]') : null;
  const otherInput = form ? form.querySelector('.form-field__other') : null;
  if (otherCheckbox && otherInput) {
    otherCheckbox.addEventListener('change', () => {
      otherInput.hidden = !otherCheckbox.checked;
      if (otherCheckbox.checked) otherInput.focus();
    });
  }

  /* ===== START FREE TRACKING ===== */
  document.querySelectorAll('.js-start-free').forEach(btn => {
    btn.addEventListener('click', () => {
      trackEvent('start_free_click', {});
    });
  });

});
