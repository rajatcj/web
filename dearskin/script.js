/* =============================================
   DEAR SKIN - Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ── Sticky Nav ──────────────────────────────
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Active Nav Link ──────────────────────────
  const navLinks = document.querySelectorAll('.nav-links a');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ── Hamburger Menu ───────────────────────────
  const burger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Image Carousel ───────────────────────────
  initCarousels();

  // ── Testimonials Slider ──────────────────────
  initTestimonialsSlider();

  // ── Scroll Animations ───────────────────────
  initScrollAnimations();

  // ── Back to Top ──────────────────────────────
  initBackToTop();

  // ── Notification Popup ───────────────────────
  initNotificationPopup();

  // ── Counter Animation ────────────────────────
  initCounters();

  // ── Contact Form ─────────────────────────────
  initContactForm();

  // ── Newsletter Form ──────────────────────────
  initNewsletterForm();

  // ── Mobile Nav Links Active ──────────────────
  const mobileLinks = document.querySelectorAll('.nav-mobile a');
  mobileLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.style.color = 'var(--orange-primary)';
    }
  });

});

/* =============================================
   CAROUSELS
   ============================================= */
function initCarousels() {
  document.querySelectorAll('.carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dotsContainer = carousel.querySelector('.carousel-dots');
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');

    if (!track || !slides.length) return;

    let current = 0;
    let autoInterval;

    // Create dots
    if (dotsContainer) {
      slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      });
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
          d.classList.toggle('active', i === current);
        });
      }
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });

    function startAuto() {
      autoInterval = setInterval(next, 5000);
    }
    function resetAuto() {
      clearInterval(autoInterval);
      startAuto();
    }

    startAuto();

    // Touch support
    let startX = 0;
    carousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
        resetAuto();
      }
    });
  });
}

/* =============================================
   TESTIMONIALS SLIDER
   ============================================= */
function initTestimonialsSlider() {
  const slider = document.querySelector('.testimonials-slider');
  if (!slider) return;

  const track = slider.querySelector('.testimonials-track');
  const cards = slider.querySelectorAll('.testimonial-card');
  const prevBtn = slider.parentElement.querySelector('.t-btn.t-prev');
  const nextBtn = slider.parentElement.querySelector('.t-btn.t-next');

  if (!track || !cards.length) return;

  let current = 0;
  const getVisible = () => window.innerWidth <= 768 ? 1 : 2;

  function goTo(index) {
    const vis = getVisible();
    const max = Math.max(0, cards.length - vis);
    current = Math.max(0, Math.min(index, max));
    const cardWidth = cards[0].getBoundingClientRect().width + 28;
    track.style.transform = `translateX(-${current * cardWidth}px)`;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  window.addEventListener('resize', () => goTo(current));

  // Auto
  setInterval(() => {
    const vis = getVisible();
    const max = cards.length - vis;
    if (current >= max) goTo(0);
    else goTo(current + 1);
  }, 6000);
}

/* =============================================
   SCROLL ANIMATIONS
   ============================================= */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-up, .fade-in');

  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* =============================================
   BACK TO TOP
   ============================================= */
function initBackToTop() {
  const btn = document.querySelector('.back-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =============================================
   NOTIFICATION POPUP
   ============================================= */
function initNotificationPopup() {
  const popup = document.querySelector('.notif-popup');
  if (!popup) return;

  setTimeout(() => popup.classList.add('show'), 3500);

  const closeBtn = popup.querySelector('.notif-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => popup.classList.remove('show'));
  }

  setTimeout(() => popup.classList.remove('show'), 9000);
}

/* =============================================
   COUNTER ANIMATION
   ============================================= */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        let start = 0;
        const duration = 2000;
        const step = target / (duration / 16);

        const timer = setInterval(() => {
          start = Math.min(start + step, target);
          el.textContent = Math.floor(start) + suffix;
          if (start >= target) clearInterval(timer);
        }, 16);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* =============================================
   CONTACT FORM
   ============================================= */
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const btn = form.querySelector('.form-submit-btn');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
      btn.style.background = 'linear-gradient(135deg, #28a745, #20c35e)';

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.style.background = '';
        form.reset();
      }, 3000);
    }, 1800);
  });
}

/* =============================================
   NEWSLETTER FORM
   ============================================= */
function initNewsletterForm() {
  const form = document.querySelector('.footer-newsletter-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = form.querySelector('button');
    const input = form.querySelector('input');
    btn.innerHTML = '✓ Subscribed!';
    btn.style.background = '#28a745';
    input.value = '';
    setTimeout(() => {
      btn.innerHTML = 'Subscribe';
      btn.style.background = '';
    }, 3000);
  });
}
