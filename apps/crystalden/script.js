// script.js — Crystal Dental and Oral Medicine Centre

/* ── Navbar scroll behaviour ── */
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Hamburger menu ── */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('navMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });
  // Close on link click
  menu.querySelectorAll('.nav-link').forEach(link =>
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    })
  );
  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      menu.classList.remove('open');
      btn.classList.remove('open');
    }
  });
})();

/* ── Active nav link ── */
(function () {
  const path  = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ── Hero Carousel ── */
function initCarousel(trackId, prevId, nextId, dotsId) {
  const track = document.getElementById(trackId);
  if (!track) return;
  const slides = track.querySelectorAll('.carousel-slide');
  const dotsEl = document.getElementById(dotsId);
  let cur = 0, timer;

  const goTo = n => {
    cur = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${cur * 100}%)`;
    if (dotsEl) {
      dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) =>
        d.classList.toggle('active', i === cur));
    }
  };

  // Dots
  if (dotsEl) {
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Slide ${i + 1}`);
      d.addEventListener('click', () => { goTo(i); restart(); });
      dotsEl.appendChild(d);
    });
  }

  const next = () => goTo(cur + 1);
  const prev = () => goTo(cur - 1);
  const restart = () => { clearInterval(timer); timer = setInterval(next, 4500); };

  document.getElementById(prevId)?.addEventListener('click', () => { prev(); restart(); });
  document.getElementById(nextId)?.addEventListener('click', () => { next(); restart(); });

  timer = setInterval(next, 4500);
}
initCarousel('carouselTrack', 'carouselPrev', 'carouselNext', 'carouselDots');

/* ── Testimonials Slider ── */
function initTestiSlider(trackId, prevId, nextId) {
  const track = document.getElementById(trackId);
  if (!track) return;
  const slides = track.querySelectorAll('.testi-slide');
  let cur = 0, timer;

  const goTo = n => {
    cur = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${cur * 100}%)`;
  };

  document.getElementById(prevId)?.addEventListener('click', () => { goTo(cur - 1); restart(); });
  document.getElementById(nextId)?.addEventListener('click', () => { goTo(cur + 1); restart(); });

  const restart = () => { clearInterval(timer); timer = setInterval(() => goTo(cur + 1), 5500); };
  timer = setInterval(() => goTo(cur + 1), 5500);
}
initTestiSlider('testiTrack', 'testiPrev', 'testiNext');

/* ── Scroll Animations (IntersectionObserver) ── */
(function () {
  const els = document.querySelectorAll('.fade-in, .fade-left, .fade-right');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

/* ── Back to Top ── */
(function () {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () =>
    btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── Notification Popup ── */
(function () {
  const popup = document.getElementById('notifPopup');
  const close = document.getElementById('notifClose');
  if (!popup) return;
  setTimeout(() => popup.classList.add('show'), 3000);
  close?.addEventListener('click', () => popup.classList.remove('show'));
  setTimeout(() => popup.classList.remove('show'), 10000);
})();

/* ── WhatsApp Contact Form ── */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const msg =
`Hello Crystal Dental 👋

I would like to book an appointment.

*Name:* ${d.name || '—'}
*Phone:* ${d.phone || '—'}
*Email:* ${d.email || '—'}
*Service:* ${d.service || '—'}
*Preferred Date:* ${d.date || '—'}
*Preferred Time:* ${d.time || '—'}
*Message:* ${d.message || 'No additional message'}

Thank you!`;

    const encoded = encodeURIComponent(msg);
    const waNum   = '977061571436'; // +977 061571436 — update with client's WA number
    window.open(`https://wa.me/${waNum}?text=${encoded}`, '_blank');
  });
})();
