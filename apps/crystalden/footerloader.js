// footerloader.js — Dynamic footer injection for Crystal Dental (all pages except index.html)

(function () {
  const footerHTML = `
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="index.html" class="nav-logo" aria-label="Crystal Dental Home">
          <img src="./assets/logo.png"
               alt="Crystal Dental and Oral Medicine Centre logo" width="44" height="44">
          <div class="nav-logo-text">
            Crystal Dental
            <span>& Oral Medicine Centre</span>
          </div>
        </a>
        <p>Established in 2021, Crystal Dental and Oral Medicine Centre is committed to providing world-class dental care in the heart of Pokhara. Your smile is our mission.</p>
        <div class="footer-social">
          <a href="https://www.facebook.com/crystaldentalpokhara/" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="https://wa.me/977061571436" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
          <a href="tel:061571436" aria-label="Call us"><i class="fas fa-phone"></i></a>
        </div>
      </div>
      <div class="footer-col">
        <h5>Quick Links</h5>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="about.html">About Us</a></li>
          <li><a href="services.html">Services</a></li>
          <li><a href="team.html">Our Doctors</a></li>
          <li><a href="testimonials.html">Testimonials</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Services</h5>
        <ul>
          <li><a href="services.html#general">General Dentistry</a></li>
          <li><a href="services.html#cosmetic">Cosmetic Dentistry</a></li>
          <li><a href="services.html#orthodontics">Orthodontics</a></li>
          <li><a href="services.html#oral-medicine">Oral Medicine</a></li>
          <li><a href="services.html#surgery">Oral Surgery</a></li>
          <li><a href="services.html#implants">Dental Implants</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5>Contact</h5>
        <div class="footer-contact-item">
          <i class="fas fa-map-marker-alt"></i>
          <span>Nagdhunga Main Road, opposite Charak Hospital, Pokhara, Nepal</span>
        </div>
        <div class="footer-contact-item">
          <i class="fas fa-phone"></i>
          <a href="tel:061571436">061-571436</a>
        </div>
        <div class="footer-contact-item">
          <i class="fab fa-whatsapp"></i>
          <a href="https://wa.me/977061571436" target="_blank" rel="noopener">WhatsApp Us</a>
        </div>
        <div class="footer-contact-item">
          <i class="fas fa-clock"></i>
          <span>Sun–Fri: 9:00 AM – 6:00 PM</span>
        </div>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;width:100%;">
      <p>&copy; ${new Date().getFullYear()} Crystal Dental and Oral Medicine Centre. All rights reserved.</p>
      <p>Designed with <i class="fas fa-heart" style="color:var(--crimson-lt);"></i> in Pokhara, Nepal</p>
    </div>
  </div>
</footer>`;

  // Insert footer before closing </body>
  document.body.insertAdjacentHTML('beforeend', footerHTML);
})();
