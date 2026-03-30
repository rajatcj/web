/* ═══════════════════════════════════════════
   POKHARA SKIN & HAIR CLINIC — MASTER JS
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar Scroll Behavior ── */
  const navbar = document.querySelector('.navbar');
  const handleNavScroll = () => {
    if (window.scrollY > 60) {
      navbar?.classList.add('scrolled');
      navbar?.classList.remove('transparent');
    } else {
      navbar?.classList.remove('scrolled');
      if (navbar?.dataset.transparent === 'true') navbar.classList.add('transparent');
    }
  };
  if (navbar) {
    if (navbar.dataset.transparent === 'true') navbar.classList.add('transparent');
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();
  }

  /* ── Active Nav Link ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Hamburger Menu ── */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    if (mobileMenu) {
      if (mobileMenu.classList.contains('show')) {
        mobileMenu.style.opacity = '0';
        mobileMenu.style.transform = 'translateY(-20px)';
        setTimeout(() => mobileMenu.classList.remove('show'), 300);
      } else {
        mobileMenu.classList.add('show');
        requestAnimationFrame(() => {
          mobileMenu.style.opacity = '1';
          mobileMenu.style.transform = 'translateY(0)';
        });
      }
    }
  });
  document.addEventListener('click', e => {
    if (!hamburger?.contains(e.target) && !mobileMenu?.contains(e.target)) {
      hamburger?.classList.remove('open');
      if (mobileMenu?.classList.contains('show')) {
        mobileMenu.style.opacity = '0';
        mobileMenu.style.transform = 'translateY(-20px)';
        setTimeout(() => mobileMenu.classList.remove('show'), 300);
      }
    }
  });

  /* ── Scroll Animations (IntersectionObserver) ── */
  const animatedEls = document.querySelectorAll('.fade-up, .fade-left, .fade-right, .stagger');
  if (animatedEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    animatedEls.forEach(el => observer.observe(el));
  }

  /* ── Back to Top ── */
  const backToTop = document.querySelector('.back-to-top');
  window.addEventListener('scroll', () => {
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── Testimonials Slider ── */
  const track = document.querySelector('.testimonials-track');
  const dots = document.querySelectorAll('.slider-dot');
  let tsIndex = 0;
  const getSlideWidth = () => {
    const card = track?.children[0];
    if (!card) return 0;
    return card.offsetWidth + 24;
  };
  const goToSlide = (i) => {
    const max = track ? Math.max(0, track.children.length - (window.innerWidth > 768 ? 2 : 1)) : 0;
    tsIndex = Math.max(0, Math.min(i, max));
    if (track) track.style.transform = `translateX(-${tsIndex * getSlideWidth()}px)`;
    dots.forEach((d, j) => d.classList.toggle('active', j === tsIndex));
  };
  document.querySelector('.slider-prev')?.addEventListener('click', () => goToSlide(tsIndex - 1));
  document.querySelector('.slider-next')?.addEventListener('click', () => goToSlide(tsIndex + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => goToSlide(i)));
  let tsAuto = setInterval(() => {
    const max = track ? Math.max(0, track.children.length - (window.innerWidth > 768 ? 2 : 1)) : 0;
    goToSlide(tsIndex >= max ? 0 : tsIndex + 1);
  }, 5000);
  track?.addEventListener('mouseenter', () => clearInterval(tsAuto));
  track?.addEventListener('mouseleave', () => {
    tsAuto = setInterval(() => {
      const max = track ? Math.max(0, track.children.length - (window.innerWidth > 768 ? 2 : 1)) : 0;
      goToSlide(tsIndex >= max ? 0 : tsIndex + 1);
    }, 5000);
  });

  /* ── Image Carousel ── */
  const cTrack = document.querySelector('.carousel-track');
  let cIndex = 0;
  const getCarouselWidth = () => {
    const slide = cTrack?.children[0];
    if (!slide) return 0;
    return slide.offsetWidth + 20;
  };
  const goCarousel = (dir) => {
    if (!cTrack) return;
    const max = Math.max(0, cTrack.children.length - (window.innerWidth > 768 ? 3 : 1));
    cIndex = Math.max(0, Math.min(cIndex + dir, max));
    cTrack.style.transform = `translateX(-${cIndex * getCarouselWidth()}px)`;
  };
  document.querySelector('.carousel-prev')?.addEventListener('click', () => goCarousel(-1));
  document.querySelector('.carousel-next')?.addEventListener('click', () => goCarousel(1));
  let cAuto = setInterval(() => goCarousel(1), 4000);
  // auto-reset
  setInterval(() => {
    if (!cTrack) return;
    const max = Math.max(0, cTrack.children.length - (window.innerWidth > 768 ? 3 : 1));
    if (cIndex >= max) { cIndex = -1; goCarousel(1); }
  }, 4000);

  /* ── Service Categories Filter ── */
  const catBtns = document.querySelectorAll('.cat-btn');
  const serviceCards = document.querySelectorAll('.service-full-card');
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      serviceCards.forEach(card => {
        const show = cat === 'all' || card.dataset.cat === cat;
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          card.style.display = show ? '' : 'none';
          if (show) {
            requestAnimationFrame(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            });
          }
        }, 200);
      });
    });
  });

  /* ── Contact Form ── */
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    setTimeout(() => {
      contactForm.style.display = 'none';
      document.querySelector('.form-success').style.display = 'block';
    }, 1800);
  });

  /* ── Notification Popup ── */
  const popup = document.querySelector('.notification-popup');
  if (popup) {
    setTimeout(() => popup.classList.add('show'), 3000);
    document.querySelector('.notification-popup-close')?.addEventListener('click', () => {
      popup.classList.remove('show');
    });
    setTimeout(() => popup.classList.remove('show'), 9000);
  }

  /* ── Smooth anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
