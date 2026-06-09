/* ============================================
   RC INTERIOR PVT. LTD — MAIN JAVASCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // NAVIGATION — sticky + hamburger
  // ============================================
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ============================================
  // TESTIMONIALS SLIDER
  // ============================================
  function initSlider(sliderEl) {
    if (!sliderEl) return;
    const track = sliderEl.querySelector('.testimonials-track');
    const cards = sliderEl.querySelectorAll('.testimonial-card');
    const dots = sliderEl.querySelectorAll('.slider-dot');
    const prevBtn = sliderEl.querySelector('.slider-btn.prev');
    const nextBtn = sliderEl.querySelector('.slider-btn.next');
    if (!track || cards.length === 0) return;

    let current = 0;
    let timer;

    function goTo(index) {
      current = (index + cards.length) % cards.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function autoPlay() { timer = setInterval(() => goTo(current + 1), 5000); }
    function stopAuto() { clearInterval(timer); }

    if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); autoPlay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); autoPlay(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { stopAuto(); goTo(i); autoPlay(); }));

    // Swipe
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stopAuto(); });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
      autoPlay();
    });

    goTo(0);
    autoPlay();
  }

  document.querySelectorAll('.testimonials-wrap').forEach(initSlider);

  // ============================================
  // PORTFOLIO DRAG SCROLL
  // ============================================
  const portfolioScroll = document.querySelector('.portfolio-scroll');
  if (portfolioScroll) {
    let isDown = false, startX, scrollLeft;

    portfolioScroll.addEventListener('mousedown', e => {
      isDown = true;
      portfolioScroll.classList.add('grabbing');
      startX = e.pageX - portfolioScroll.offsetLeft;
      scrollLeft = portfolioScroll.scrollLeft;
    });
    document.addEventListener('mouseup', () => { isDown = false; portfolioScroll.classList.remove('grabbing'); });
    portfolioScroll.addEventListener('mouseleave', () => { isDown = false; portfolioScroll.classList.remove('grabbing'); });
    portfolioScroll.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - portfolioScroll.offsetLeft;
      portfolioScroll.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });

    // Auto-scroll
    let autoDir = 1;
    function autoScrollPortfolio() {
      if (!isDown) {
        portfolioScroll.scrollLeft += autoDir * 0.4;
        const maxScroll = portfolioScroll.scrollWidth - portfolioScroll.clientWidth;
        if (portfolioScroll.scrollLeft >= maxScroll) autoDir = -1;
        if (portfolioScroll.scrollLeft <= 0) autoDir = 1;
      }
      requestAnimationFrame(autoScrollPortfolio);
    }
    autoScrollPortfolio();
  }

  // ============================================
  // SCROLL REVEAL
  // ============================================
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => revealObserver.observe(el));

  // ============================================
  // BACK TO TOP
  // ============================================
  const backTop = document.getElementById('backTop');
  if (backTop) {
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('visible', window.scrollY > 400);
    });
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ============================================
  // NOTIFICATION POPUP
  // ============================================
  const notif = document.getElementById('notification');
  if (notif) {
    setTimeout(() => {
      notif.classList.add('show');
      setTimeout(() => notif.classList.remove('show'), 6000);
    }, 3500);
    const closeBtn = notif.querySelector('.notif-close');
    if (closeBtn) closeBtn.addEventListener('click', () => notif.classList.remove('show'));
  }

  // ============================================
  // WHATSAPP CONTACT FORM
  // ============================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('name')?.value.trim() || '';
      const phone = document.getElementById('phone')?.value.trim() || '';
      const email = document.getElementById('email')?.value.trim() || '';
      const service = document.getElementById('service')?.value || '';
      const message = document.getElementById('message')?.value.trim() || '';
      const budget = document.getElementById('budget')?.value || '';

      const text = `Hello RC Interior! 🏠

*New Enquiry from Website*

👤 *Name:* ${name}
📞 *Phone:* ${phone}
📧 *Email:* ${email}
🛠️ *Service Interested In:* ${service}
${budget ? `💰 *Budget Range:* ${budget}` : ''}

💬 *Message:*
${message}

I would like to know more about your interior design services. Please get in touch with me at your earliest convenience.

Thank you!`;

      const encodedText = encodeURIComponent(text);
      const whatsappNumber = '9779851132423';
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
      window.open(whatsappURL, '_blank');
    });
  }

  // ============================================
  // COUNTER ANIMATION
  // ============================================
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current) + (el.getAttribute('data-suffix') || '');
    }, 16);
  }

});