/* ============================================
   PARBAT DENTAL — script.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar Scroll ── */
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar && navbar.classList.toggle('scrolled', window.scrollY > 40);
    btTop && btTop.classList.toggle('visible', window.scrollY > 400);
  });

  /* ── Active Nav Link ── */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });

  /* ── Hamburger Menu ── */
  const ham  = document.querySelector('.hamburger');
  const mNav = document.querySelector('.mobile-menu');
  ham && ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    mNav.classList.toggle('open');
  });
  document.querySelectorAll('.mobile-menu a').forEach(a => {
    a.addEventListener('click', () => {
      ham.classList.remove('open');
      mNav.classList.remove('open');
    });
  });

  /* ── Back to Top ── */
  const btTop = document.getElementById('backToTop');
  btTop && btTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── Scroll Fade-In ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  /* ── Hero Carousel ── */
  initCarousel('#heroCarousel');

  /* ── Testimonials Slider ── */
  initTestiSlider();

  /* ── Notification Popup ── */
  setTimeout(() => {
    const notif = document.getElementById('notification');
    if (notif) {
      notif.classList.add('show');
      setTimeout(() => notif.classList.remove('show'), 6000);
    }
  }, 2500);

  const notifClose = document.getElementById('notifClose');
  notifClose && notifClose.addEventListener('click', () => {
    document.getElementById('notification').classList.remove('show');
  });

  /* ── Contact Form ── */
  const form = document.getElementById('contactForm');
  form && form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
    btn.style.background = '#4caf50';
    setTimeout(() => {
      btn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
      btn.style.background = '';
      form.reset();
    }, 3000);
  });

});

/* ── Generic Carousel ── */
function initCarousel(selector) {
  const wrap = document.querySelector(selector);
  if (!wrap) return;
  const track = wrap.querySelector('.carousel-track');
  const slides = wrap.querySelectorAll('.carousel-slide');
  const dots   = wrap.querySelectorAll('.carousel-dot');
  const prev   = wrap.querySelector('.carousel-prev');
  const next   = wrap.querySelector('.carousel-next');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goto(n) {
    slides[current].classList.remove('active');
    dots[current] && dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots[current] && dots[current].classList.add('active');
    slides[current].classList.add('active');
  }

  function autoPlay() { timer = setInterval(() => goto(current + 1), 4500); }
  function stopPlay() { clearInterval(timer); }

  goto(0);
  autoPlay();

  next  && next.addEventListener('click', () => { stopPlay(); goto(current+1); autoPlay(); });
  prev  && prev.addEventListener('click', () => { stopPlay(); goto(current-1); autoPlay(); });
  dots  && dots.forEach((d, i) => d.addEventListener('click', () => { stopPlay(); goto(i); autoPlay(); }));

  // Touch/swipe
  let sx = 0;
  track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; stopPlay(); });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) goto(dx < 0 ? current+1 : current-1);
    autoPlay();
  });
}

/* ── Testimonials Slider ── */
function initTestiSlider() {
  const wrap  = document.querySelector('.testi-slider');
  if (!wrap) return;
  const track = wrap.querySelector('.testi-track');
  const cards = wrap.querySelectorAll('.testi-card');
  if (!cards.length) return;

  const perView = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
  const max = Math.max(0, cards.length - perView);
  let idx = 0;

  const prev = document.getElementById('testiPrev');
  const next = document.getElementById('testiNext');

  function goto(n) {
    idx = Math.min(Math.max(n, 0), max);
    const w = cards[0].getBoundingClientRect().width + 24;
    track.style.transform = `translateX(-${idx * w}px)`;
  }

  prev && prev.addEventListener('click', () => goto(idx - 1));
  next && next.addEventListener('click', () => goto(idx + 1));

  setInterval(() => goto(idx < max ? idx + 1 : 0), 5000);

  let sx2 = 0;
  track.addEventListener('touchstart', e => sx2 = e.touches[0].clientX);
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - sx2;
    if (Math.abs(dx) > 40) goto(dx < 0 ? idx+1 : idx-1);
  });
}
