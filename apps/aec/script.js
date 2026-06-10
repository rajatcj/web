/* Astak Eng. & Constructions, vanilla JS */
(function () {
  'use strict';

  // ===== Nav: sticky + mobile toggle =====
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.hamburger');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  if (burger) {
    burger.addEventListener('click', () => nav.classList.toggle('open'));
    document.querySelectorAll('.nav-links a').forEach(a =>
      a.addEventListener('click', () => nav.classList.remove('open'))
    );
  }

  // ===== Mark active nav link =====
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });

  // ===== Year =====
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // ===== Scroll reveal =====
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  // ===== Back to top =====
  const top = document.querySelector('.to-top');
  if (top) {
    window.addEventListener('scroll', () => top.classList.toggle('show', window.scrollY > 400), { passive: true });
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ===== Carousel =====
  document.querySelectorAll('[data-carousel]').forEach(root => {
    const track = root.querySelector('.carousel-track');
    const slides = root.querySelectorAll('.carousel-slide');
    const dotsWrap = root.querySelector('.carousel-dots');
    let i = 0, timer;
    slides.forEach((_, n) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', 'Go to slide ' + (n + 1));
      b.addEventListener('click', () => go(n, true));
      dotsWrap.appendChild(b);
    });
    const dots = dotsWrap.querySelectorAll('button');
    function go(n, manual) {
      i = (n + slides.length) % slides.length;
      track.style.transform = `translateX(${-i * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle('active', k === i));
      if (manual) restart();
    }
    function next() { go(i + 1); }
    function restart() { clearInterval(timer); timer = setInterval(next, 5500); }
    root.querySelector('.next').addEventListener('click', () => go(i + 1, true));
    root.querySelector('.prev').addEventListener('click', () => go(i - 1, true));
    go(0); restart();
    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', restart);
  });

  // ===== Testimonials =====
  document.querySelectorAll('[data-testi]').forEach(root => {
    const slides = root.querySelectorAll('.testi-slide');
    const dotsWrap = root.querySelector('.testi-dots');
    let i = 0, timer;
    slides.forEach((_, n) => {
      const b = document.createElement('button');
      b.addEventListener('click', () => { go(n); restart(); });
      dotsWrap.appendChild(b);
    });
    const dots = dotsWrap.querySelectorAll('button');
    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('active', k === i));
      dots.forEach((d, k) => d.classList.toggle('active', k === i));
    }
    function restart() { clearInterval(timer); timer = setInterval(() => go(i + 1), 6000); }
    go(0); restart();
  });

  // ===== Toast =====
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      t.innerHTML = '<i class="fa-solid fa-circle-check"></i><span></span>';
      document.body.appendChild(t);
    }
    t.querySelector('span').textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 3600);
  }
  // Welcome popup once per session
  if (!sessionStorage.getItem('aec_hi')) {
    setTimeout(() => toast('Welcome, let’s craft your dream interior.'), 1200);
    sessionStorage.setItem('aec_hi', '1');
  }

  // ===== Contact form -> WhatsApp =====
  const form = document.getElementById('contact-form');
  if (form) {
    const WA_NUMBER = '9779843772026';
    const MAX_MSG = 400; // keep concise for WhatsApp
    const msg = form.querySelector('#message');
    const counter = form.querySelector('#msg-count');
    if (msg && counter) {
      msg.setAttribute('maxlength', MAX_MSG);
      const upd = () => counter.textContent = `${msg.value.length} / ${MAX_MSG}`;
      msg.addEventListener('input', upd); upd();
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const name = (f.get('name') || '').toString().trim();
      const phone = (f.get('phone') || '').toString().trim();
      const email = (f.get('email') || '').toString().trim();
      const service = (f.get('service') || '').toString().trim();
      const budget = (f.get('budget') || '').toString().trim();
      const location = (f.get('location') || '').toString().trim();
      const message = (f.get('message') || '').toString().trim();
      if (!name || !phone) { toast('Please enter your name and phone.'); return; }

      const lines = [
        '*New Enquiry, Astak Eng. & Constructions*',
        `• Name: ${name}`,
        `• Phone: ${phone}`,
        email && `• Email: ${email}`,
        service && `• Service: ${service}`,
        budget && `• Budget: ${budget}`,
        location && `• Location: ${location}`,
        message && `• Message: ${message}`
      ].filter(Boolean);
      const text = encodeURIComponent(lines.join('\n'));
      const url = `https://wa.me/${WA_NUMBER}?text=${text}`;
      toast('Opening WhatsApp…');
      window.open(url, '_blank', 'noopener');
    });
  }
})();
