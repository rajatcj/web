/* =========================================================
   NEW MODEL SECONDARY SCHOOL — SHARED JAVASCRIPT
   ========================================================= */

/* ======================================================
   NOTICES DATA STORE (shared across all pages)
   ====================================================== */
const DEFAULT_NOTICES = [
  {id:1, title:"Admission Open – Academic Year 2082 BS", desc:"Admissions are now open for all grades. Please visit the school office or contact us for the application form and further details. Eligible students are encouraged to apply early as seats are limited.", date:"2082-01-15", month:"Baisakh", day:"15", cat:"new", file:null, fileName:null, fileType:null},
  {id:2, title:"Annual Examination Schedule 2081", desc:"The annual examination for SEE and 10+2 students will commence as per the schedule issued by the National Examination Board. Students are advised to prepare accordingly and report any scheduling conflicts to the class teacher.", date:"2082-01-10", month:"Baisakh", day:"10", cat:"important", file:null, fileName:"exam_schedule.pdf", fileType:"pdf"},
  {id:3, title:"New Model Sports Meet 2082 – Prize Distribution", desc:"Congratulations to all winners of New Model Sports Meet 2082. The prize distribution ceremony was held successfully. Photos are available in the gallery. Thank you to all participants and supporters.", date:"2082-01-05", month:"Baisakh", day:"05", cat:"new", file:null, fileName:null, fileType:null},
  {id:4, title:"Scholarship Application Deadline – Last Date Notice", desc:"Students wishing to apply for the school scholarship must submit their applications by the end of this month. Contact the school office for eligibility criteria, required documents and application procedure.", date:"2081-12-28", month:"Chaitra", day:"28", cat:"important", file:null, fileName:null, fileType:null},
  {id:5, title:"Mathematics Olympiad – National Level Selection", desc:"Anij Pokhrel of Grade 10 has secured first position in Gandaki Province Mathematics Olympiad and has been selected for the National Level competition. We are immensely proud of this remarkable achievement!", date:"2081-12-20", month:"Chaitra", day:"20", cat:"new", file:null, fileName:null, fileType:null},
  {id:6, title:"Parent-Teacher Meeting – Upcoming Schedule", desc:"Parent-Teacher meetings are scheduled for the upcoming month. Parents are requested to confirm their attendance by contacting the school office. Individual student progress reports will be shared during the meeting.", date:"2081-12-15", month:"Chaitra", day:"15", cat:"important", file:null, fileName:null, fileType:null},
  {id:7, title:"School Holiday Notice – Eid al-Fitr", desc:"The school will remain closed in observance of Eid al-Fitr. Classes will resume on the next working day. Students are encouraged to use the holiday for revision and self-study.", date:"2081-12-10", month:"Chaitra", day:"10", cat:"new", file:null, fileName:null, fileType:null},
  {id:8, title:"New Computer Lab Equipment Installed", desc:"New Model is pleased to announce the installation of latest computer systems and high-speed internet in the Computer Laboratory. Students will benefit from updated hardware and software as part of our commitment to modern education.", date:"2081-12-01", month:"Chaitra", day:"01", cat:"new", file:null, fileName:null, fileType:null},
];

function loadNotices() {
  try {
    const stored = localStorage.getItem('nm_notices');
    if (stored) return JSON.parse(stored);
  } catch(e) {}
  return [...DEFAULT_NOTICES];
}

function saveNotices(notices) {
  try { localStorage.setItem('nm_notices', JSON.stringify(notices)); } catch(e) {}
}

let NOTICES = loadNotices();

/* ======================================================
   RENDER NOTICES (list element)
   ====================================================== */
function renderNoticeList(listId, limit) {
  const list = document.getElementById(listId);
  if (!list) return;
  const toShow = limit ? NOTICES.slice(0, limit) : NOTICES;
  list.innerHTML = '';
  toShow.forEach(n => {
    const hasFile = n.fileName;
    const li = document.createElement('li');
    li.className = 'notice-item';
    li.onclick = () => viewNotice(n.id);
    li.innerHTML = `
      <div class="notice-date">
        <div class="day">${n.day}</div>
        <div class="mon">${n.month.substring(0,3)}</div>
      </div>
      <div class="notice-info">
        <span class="notice-badge badge-${n.cat}">${n.cat.toUpperCase()}</span>
        <h4>${n.title}</h4>
        <p>${n.desc.substring(0, 90)}${n.desc.length > 90 ? '...' : ''}</p>
        ${hasFile ? `<div class="notice-attachment">📎 ${n.fileName}</div>` : ''}
      </div>`;
    list.appendChild(li);
  });
}

function viewNotice(id) {
  const n = NOTICES.find(x => x.id === id);
  if (!n) return;
  document.getElementById('nv-title').textContent = n.title;
  document.getElementById('nv-date').textContent = `${n.day} ${n.month} — ${n.cat.toUpperCase()}`;
  document.getElementById('nv-desc').textContent = n.desc;
  let att = '';
  if (n.file) {
    if (n.fileType === 'pdf') {
      att = `<a href="${n.file}" target="_blank" class="popup-pdf-link">📄 Open PDF: ${n.fileName}</a>`;
    } else {
      att = `<img src="${n.file}" alt="${n.title}" style="width:100%;border-radius:8px;margin-top:8px;"/>`;
    }
  } else if (n.fileName) {
    att = `<div class="notice-attachment">📎 ${n.fileName}</div>`;
  }
  document.getElementById('nv-attachment').innerHTML = att;
  document.getElementById('notice-view-modal').classList.add('active');
}

function closeNoticeView() {
  document.getElementById('notice-view-modal').classList.remove('active');
}

function openNoticeModal() {
  document.getElementById('notice-modal').classList.add('active');
}

function closeNoticeModal() {
  document.getElementById('notice-modal').classList.remove('active');
}

function updateFileLabel(input) {
  const label = document.getElementById('nm-file-label');
  if (label) label.textContent = input.files[0] ? input.files[0].name : 'Click to attach PDF or Image';
}

function addNotice() {
  const title = document.getElementById('nm-title').value.trim();
  if (!title) { alert('Please enter a notice title.'); return; }
  const cat = document.getElementById('nm-cat').value;
  const desc = document.getElementById('nm-desc').value.trim();
  const fileInput = document.getElementById('nm-file');
  const file = fileInput.files[0] || null;
  const months = ['Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];
  const now = new Date();
  const mon = months[now.getMonth()];
  const day = String(now.getDate()).padStart(2, '0');

  const newNotice = {
    id: Date.now(),
    title, desc: desc || 'Click to read full notice.',
    date: `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`,
    month: mon, day, cat,
    file: file ? URL.createObjectURL(file) : null,
    fileName: file ? file.name : null,
    fileType: file ? (file.type.includes('pdf') ? 'pdf' : 'image') : null
  };

  NOTICES.unshift(newNotice);
  saveNotices(NOTICES);

  // Re-render wherever notice lists exist
  renderNoticeList('notice-list', null);
  renderNoticeList('notice-list-home', 6);

  closeNoticeModal();
  document.getElementById('nm-title').value = '';
  document.getElementById('nm-desc').value = '';
  if (document.getElementById('nm-file-label'))
    document.getElementById('nm-file-label').textContent = 'Click to attach PDF or Image';
  fileInput.value = '';
}

/* ======================================================
   POPUP SYSTEM
   ====================================================== */
let adminFile = null, adminFileName = null, adminFileType = null;

function previewAdminFile(input) {
  if (input.files[0]) {
    adminFile = input.files[0];
    adminFileName = adminFile.name;
    adminFileType = adminFile.type.includes('pdf') ? 'pdf' : 'image';
    const el = document.getElementById('pa-file-name');
    if (el) el.textContent = 'Attached: ' + adminFileName;
  }
}

function toggleAdmin() {
  document.getElementById('popup-admin-panel').classList.toggle('open');
}

function launchCustomPopup() {
  const title = (document.getElementById('pa-title').value.trim()) || 'Important Announcement';
  const text = document.getElementById('pa-text').value.trim();
  let bodyHTML = '';
  if (text) bodyHTML += `<p>${text}</p>`;
  if (adminFile) {
    const url = URL.createObjectURL(adminFile);
    if (adminFileType === 'image') {
      bodyHTML += `<img src="${url}" alt="Attachment" style="width:100%;border-radius:8px;margin-top:12px;"/>`;
    } else {
      bodyHTML += `<a href="${url}" target="_blank" class="popup-pdf-link">📄 Open PDF: ${adminFileName}</a>`;
    }
  }
  document.getElementById('popup-title').textContent = title;
  document.getElementById('popup-body').innerHTML = bodyHTML || '<p>Please check the notice board for further details.</p>';
  document.getElementById('popup-overlay').classList.add('active');
  document.getElementById('popup-admin-panel').classList.remove('open');
}

function closePopup() {
  document.getElementById('popup-overlay').classList.remove('active');
}

/* ======================================================
   MOBILE NAV
   ====================================================== */
function toggleMobileNav() {
  document.getElementById('mobile-nav').classList.toggle('open');
}

/* ======================================================
   FADE-IN OBSERVER
   ====================================================== */
function initFadeIn() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

/* ======================================================
   CAROUSEL (home page only)
   ====================================================== */
function initCarousel() {
  const track = document.getElementById('carousel');
  if (!track) return;
  const slides = track.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('carousel-dots');
  let current = 0;

  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.onclick = () => goTo(i);
    dotsContainer.appendChild(d);
  });

  function goTo(n) {
    current = n;
    track.style.transform = `translateX(-${n * 100}%)`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === n));
  }

  window.nextSlide = () => goTo((current + 1) % slides.length);
  window.prevSlide = () => goTo((current - 1 + slides.length) % slides.length);
  setInterval(window.nextSlide, 5000);
}

/* ======================================================
   INIT ON DOM READY
   ====================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initFadeIn();
  initCarousel();

  // render any notice lists present on page
  renderNoticeList('notice-list', null);
  renderNoticeList('notice-list-home', 6);

  // backdrop close for modals
  const popupOverlay = document.getElementById('popup-overlay');
  if (popupOverlay) popupOverlay.addEventListener('click', e => { if (e.target === popupOverlay) closePopup(); });

  const noticeModal = document.getElementById('notice-modal');
  if (noticeModal) noticeModal.addEventListener('click', e => { if (e.target === noticeModal) closeNoticeModal(); });

  const noticeViewModal = document.getElementById('notice-view-modal');
  if (noticeViewModal) noticeViewModal.addEventListener('click', e => { if (e.target === noticeViewModal) closeNoticeView(); });
});
