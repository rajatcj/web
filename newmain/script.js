// Toggling Skill Tabs
(function() {
    if (window.innerWidth < 1024) return; // PC only

    const botFace = document.getElementById("bot-face");
    const eyes = botFace.querySelectorAll(".eye-white");
    const balls = botFace.querySelectorAll(".eye-ball");
    const capture = document.querySelector(".mouse-capture");

    let cursorOutside = true; // initial load → happy
    let cursorHovering = false;
    let inactivityTimer = null;

    function showHappy() {
        botFace.style.backgroundImage = "url('./assets/botuhappy.png')";
        eyes.forEach(eye => eye.classList.add('hidden-eyes'));
    }

    function showNormal() {
        botFace.style.backgroundImage = "none";
        eyes.forEach(eye => eye.classList.remove('hidden-eyes'));
    }

    function updateBackground() {
        if (cursorOutside || cursorHovering) {
            showHappy();
        } else {
            showNormal();
        }
    }

    function resetInactivityTimer() {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            showHappy();
        }, 2000); // 2s inactivity
    }

    function moveEyes(e) {
        cursorOutside = (e.clientX < 0 || e.clientY < 0 ||
                         e.clientX > window.innerWidth || e.clientY > window.innerHeight);
        updateBackground();
        resetInactivityTimer();

        if (eyes[0].classList.contains('hidden-eyes')) return; // hide pupils when happy

        balls.forEach((ball, i) => {
            const eye = eyes[i];
            const rect = eye.getBoundingClientRect();

            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;

            const dx = e.clientX - eyeCenterX;
            const dy = e.clientY - eyeCenterY;

            const maxMove = rect.width / 4;
            const distance = Math.min(Math.hypot(dx, dy), maxMove);
            const angle = Math.atan2(dy, dx);

            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;

            ball.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
        });
    }

    // Hovering bot face → happy instantly
    botFace.addEventListener("mouseenter", () => {
        cursorHovering = true;
        showHappy();
    });
    botFace.addEventListener("mouseleave", () => {
        cursorHovering = false;
        updateBackground();
    });

    // Track cursor
    document.addEventListener("mousemove", moveEyes);
    capture.addEventListener("mousemove", moveEyes);

    // Map iframe cursors to main page coordinates
    document.querySelectorAll("iframe").forEach(iframe => {
        try {
            iframe.contentWindow.document.addEventListener("mousemove", e => {
                const rect = iframe.getBoundingClientRect();
                const mainX = rect.left + e.clientX;
                const mainY = rect.top + e.clientY;
                moveEyes({ clientX: mainX, clientY: mainY });
            });
        } catch (err) {}
    });

    // Reset eyes when leaving window
    document.addEventListener("mouseleave", () => {
        balls.forEach(ball => ball.style.transform = "translate(-50%, -50%)");
        cursorOutside = true;
        updateBackground();
    });

    document.addEventListener("mouseenter", () => {
        cursorOutside = false;
        updateBackground();
    });

    // Initial load → happy
    showHappy();
})();



const tabs = document.querySelectorAll('[data-target]');
const tabContent = document.querySelectorAll('[data-content]');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = document.querySelector(tab.dataset.target);

        tabContent.forEach(tabContents => {
            tabContents.classList.remove('skills-active');
        })

        target.classList.add('skills-active');

        tabs.forEach(tab => {
            tab.classList.remove('skills-active');
        })

        tab.classList.add('skills-active');
    })
})

//Mix it up Sorting

let mixerPortfolio = mixitup('.work-container', {
    selectors: {
        target: '.work-card'
    },
    animation: {
        duration: 300
    }
});

// Active link changing

const linkWork = document.querySelectorAll('.work-item');

function activeWork() {
    linkWork.forEach(l => l.classList.remove('active-work'))
    this.classList.add('active-work')
}

linkWork.forEach(l => l.addEventListener('click', activeWork));

//Portfolio Popup

document.addEventListener('click', (e) => {
    if(e.target.classList.contains('work-button')){
        togglePortfolioPopup();
        portfolioItemDetails(e.target.parentElement);
    }
})

function togglePortfolioPopup() {
    document.querySelector('.portfolio-popup').classList.toggle('open');
}

document.querySelector('.portfolio-popup-close').addEventListener('click', togglePortfolioPopup);

function portfolioItemDetails(portfolioItem) {
    document.querySelector('.pp-thumbnail img').src = portfolioItem.querySelector('.work-img').src;
    document.querySelector('.portfolio-popup-subtitle span').innerHTML = portfolioItem.querySelector('.work-title').innerHTML;
    document.querySelector('.portfolio-popup-body').innerHTML = portfolioItem.querySelector('.portfolio-item-details').innerHTML;
}

//Services Popup
const modalViews = document.querySelectorAll('.services-modal');
const modelBtns = document.querySelectorAll('.services-button');
const modalCloses = document.querySelectorAll('.services-modal-close');

let modal = function(modalClick) {
    modalViews[modalClick].classList.add('active-modal');
}

modelBtns.forEach((modelBtn, i) => {
    modelBtn.addEventListener('click', () => {
        modal(i);
    })
})

modalCloses.forEach((modalClose) => {
    modalClose.addEventListener('click', () => {
        modalViews.forEach((modalView) => {
            modalView.classList.remove('active-modal');
        })
    })
})

//Swiper Testimonial

let swiper = new Swiper(".testimonials-container", {
    spaceBetween: 24,
    loop: true,
    grabCursor: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
        576: {
            slidesPerView: 2,
        },
        768: {
            slidesPerView: 2,
            spaceBetween: 48,
        },
    },
});

// Input Animation

const inputs = document.querySelectorAll('.input');

function focusFunc() {
    let parent = this.parentNode;
    parent.classList.add('focus');
}

function blurFunc() {
    let parent = this.parentNode;
    if(this.value == "") {
        parent.classList.remove('focus');
    }
}

inputs.forEach((input) => {
    input.addEventListener('focus', focusFunc);
    input.addEventListener('blur', blurFunc);
})

// Scroll Section Active Link

const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', navHighlighter);

function navHighlighter() {
    let scrollY = window.pageYOffset;
    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 50;
        const sectionId = current.getAttribute('id');

        if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector('.nav-menu a[href*=' + sectionId + ']').classList.add('active-link');
        }else {
            document.querySelector('.nav-menu a[href*=' + sectionId + ']').classList.remove('active-link');
        }
    })
}

// Activating Sidebar

const navMenu = document.getElementById('sidebar');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');

if(navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-sidebar');
    })
}

if(navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-sidebar');
    })
}



