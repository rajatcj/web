/* ============================================================
   CERA DENTAL CLINIC — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll behaviour ── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Hamburger / mobile menu ── */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-menu-close');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
  }
  if (mobileClose) {
    mobileClose.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobileMenu?.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobileMenu?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ── Image carousel ── */
  initCarousel('.carousel', '.carousel-track', '.carousel-btn.prev', '.carousel-btn.next', '.carousel-dot', true);

  function initCarousel(wrapSel, trackSel, prevSel, nextSel, dotSel, autoplay) {
    const wrap = document.querySelector(wrapSel);
    if (!wrap) return;
    const track = wrap.querySelector(trackSel);
    const slides = wrap.querySelectorAll('.carousel-slide');
    const dots = wrap.querySelectorAll(dotSel);
    if (!track || slides.length === 0) return;

    let current = 0;
    const total = slides.length;

    const goTo = (idx) => {
      current = (idx + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    };

    wrap.querySelector(prevSel)?.addEventListener('click', () => goTo(current - 1));
    wrap.querySelector(nextSel)?.addEventListener('click', () => goTo(current + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    if (autoplay) {
      let timer = setInterval(() => goTo(current + 1), 5000);
      wrap.addEventListener('mouseenter', () => clearInterval(timer));
      wrap.addEventListener('mouseleave', () => { timer = setInterval(() => goTo(current + 1), 5000); });
    }
    goTo(0);
  }

  /* ── Testimonials slider ── */
  const tslider = document.querySelector('.tslider');
  if (tslider) {
    const track = tslider.querySelector('.tslider-track');
    const slides = tslider.querySelectorAll('.tslide');
    const dots = document.querySelectorAll('.tslider-dot');
    const prevBtn = document.querySelector('.tslider-btn.tprev');
    const nextBtn = document.querySelector('.tslider-btn.tnext');
    let cur = 0;

    const goTo = (idx) => {
      cur = (idx + slides.length) % slides.length;
      track.style.transform = `translateX(-${cur * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === cur));
    };

    prevBtn?.addEventListener('click', () => goTo(cur - 1));
    nextBtn?.addEventListener('click', () => goTo(cur + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    let autoT = setInterval(() => goTo(cur + 1), 6000);
    tslider.addEventListener('mouseenter', () => clearInterval(autoT));
    tslider.addEventListener('mouseleave', () => { autoT = setInterval(() => goTo(cur + 1), 6000); });
    goTo(0);
  }

  /* ── Scroll animations ── */
  const animEls = document.querySelectorAll('[data-animate]');
  if (animEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    animEls.forEach(el => observer.observe(el));
  }

  /* ── Back to top ── */
  const btt = document.getElementById('backToTop');
  if (btt) {
    window.addEventListener('scroll', () => {
      btt.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── Notification popup ── */
  const notif = document.getElementById('notification');
  if (notif) {
    setTimeout(() => {
      notif.classList.add('show');
      setTimeout(() => notif.classList.remove('show'), 6000);
    }, 3500);
    notif.querySelector('.notif-close')?.addEventListener('click', () => notif.classList.remove('show'));
  }

  /* ── WhatsApp contact form ── */
  const waForm = document.getElementById('appointmentForm');
  if (waForm) {
    waForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = waForm.querySelector('#name')?.value.trim() || '';
      const phone = waForm.querySelector('#phone')?.value.trim() || '';
      const service = waForm.querySelector('#service')?.value || '';
      const date = waForm.querySelector('#date')?.value || '';
      const time = waForm.querySelector('#time')?.value || '';
      const message = waForm.querySelector('#message')?.value.trim() || '';

      const waNumber = '9779768059598';
      const text = encodeURIComponent(
        `Hello Cera Dental Clinic! 🦷\n\n` +
        `I'd like to book an appointment.\n\n` +
        `*Name:* ${name}\n` +
        `*Phone:* ${phone}\n` +
        `*Service:* ${service}\n` +
        `*Preferred Date:* ${date}\n` +
        `*Preferred Time:* ${time}\n` +
        (message ? `*Additional Notes:* ${message}\n` : '') +
        `\nThank you!`
      );
      window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
    });
  }

  /* ── Active nav link ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Smooth anchor scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Counter animation ── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count);
          let count = 0;
          const step = target / 60;
          const timer = setInterval(() => {
            count += step;
            if (count >= target) { count = target; clearInterval(timer); }
            el.textContent = Math.round(count) + (el.dataset.suffix || '');
          }, 25);
          cObs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => cObs.observe(c));
  }

});
