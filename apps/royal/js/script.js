/* ==========================================================
   Royal Interior Designer, Global Scripts
   ========================================================== */

// Company WhatsApp number (Nepal +977)
const COMPANY_WHATSAPP = '9779704681345';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroSlider();
  initTestimonialSlider();
  initRevealOnScroll();
  initBackToTop();
  initContactForm();
  initWelcomeNotif();
  initActiveNavLink();
  // Update copyright year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});

/* ---------- Sticky Navbar + Mobile Menu ---------- */
function initNavbar() {
  const nav = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const menu = document.querySelector('.nav-menu');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      menu.classList.toggle('open');
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      hamburger.classList.remove('active');
      menu.classList.remove('open');
    }));
  }
}

/* ---------- Hero Slider ---------- */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dots span');
  const prev = document.querySelector('.hero-prev');
  const next = document.querySelector('.hero-next');
  if (!slides.length) return;

  let i = 0, timer;
  const go = (n) => {
    slides[i].classList.remove('active');
    dots[i]?.classList.remove('active');
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('active');
    dots[i]?.classList.add('active');
  };
  const start = () => { timer = setInterval(() => go(i + 1), 5500); };
  const stop = () => clearInterval(timer);

  prev?.addEventListener('click', () => { go(i - 1); stop(); start(); });
  next?.addEventListener('click', () => { go(i + 1); stop(); start(); });
  dots.forEach((d, idx) => d.addEventListener('click', () => { go(idx); stop(); start(); }));
  start();
}

/* ---------- Testimonials Slider ---------- */
function initTestimonialSlider() {
  const track = document.querySelector('.testimonial-track');
  const cards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.testimonial-dots span');
  if (!track || !cards.length) return;

  let i = 0;
  const go = (n) => {
    i = (n + cards.length) % cards.length;
    track.style.transform = `translateX(-${i * 100}%)`;
    dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
  };
  dots.forEach((d, idx) => d.addEventListener('click', () => go(idx)));
  setInterval(() => go(i + 1), 6500);
}

/* ---------- Reveal on Scroll ---------- */
function initRevealOnScroll() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

/* ---------- Back to top ---------- */
function initBackToTop() {
  const btn = document.querySelector('.back-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------- Active nav link by current page ---------- */
function initActiveNavLink() {
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-menu a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });
}

/* ---------- Welcome notification ---------- */
function initWelcomeNotif() {
  const notif = document.getElementById('welcomeNotif');
  if (!notif) return;
  setTimeout(() => notif.classList.add('show'), 1600);
  setTimeout(() => notif.classList.remove('show'), 8000);
  notif.querySelector('button')?.addEventListener('click', () => notif.classList.remove('show'));
}

/* ---------- Contact form → WhatsApp ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Live character counter for message
  const msg = form.querySelector('#message');
  const counter = form.querySelector('#charCount');
  const MAX = 700; // keeps the pre-filled WhatsApp message readable
  if (msg && counter) {
    const update = () => {
      const len = msg.value.length;
      counter.textContent = `${len} / ${MAX}`;
      counter.classList.toggle('over', len > MAX);
    };
    msg.addEventListener('input', update);
    update();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const phone = (data.get('phone') || '').toString().trim();
    const service = (data.get('service') || '').toString().trim();
    const budget = (data.get('budget') || '').toString().trim();
    const location = (data.get('location') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim().slice(0, MAX);

    if (!name || !phone || !service) {
      showToast('Please fill in your name, phone and service.', 'warn');
      return;
    }

    const lines = [
      '*New Inquiry, Royal Interior Designer*',
      '',
      `👤 *Name:* ${name}`,
      email ? `✉️ *Email:* ${email}` : null,
      `📞 *Phone:* ${phone}`,
      `🛠️ *Service:* ${service}`,
      budget ? `💰 *Budget:* ${budget}` : null,
      location ? `📍 *Location:* ${location}` : null,
      message ? `\n📝 *Message:*\n${message}` : null,
      '',
      '— Sent via royalinterior.com.np'
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${COMPANY_WHATSAPP}?text=${encodeURIComponent(lines)}`;
    showToast('Opening WhatsApp…', 'success');
    setTimeout(() => window.open(url, '_blank'), 500);
  });
}

/* ---------- Toast (reuses the notif element) ---------- */
function showToast(text, type = 'info') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'notif';
    t.innerHTML = `<i class="fa-solid fa-circle-info"></i><div><strong>Royal Interior</strong><p></p></div><button aria-label="Close">&times;</button>`;
    document.body.appendChild(t);
    t.querySelector('button').addEventListener('click', () => t.classList.remove('show'));
  }
  t.classList.toggle('success', type === 'success');
  t.querySelector('p').textContent = text;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 4000);
}
