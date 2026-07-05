/**
 * Flexlyf Commerce - Main JavaScript
 * Premium International Trade Consultancy
 * Optimized for peak performance and 60fps frame rates
 */

// DOM Content Loaded Execution Desk
document.addEventListener('DOMContentLoaded', function() {
  initGlobalScrollEffects(); // Combined throttled scroll listener
  initMobileMenu();
  initScrollAnimations();
  initStatsCounter();
  initFAQAccordion();
  initSmoothScroll();
  updateFooterYear();
  initContactFormValidation();
});

// Optimized Window Scroll Architecture (Combines Navbar and Back-To-Top to save event threads)
function initGlobalScrollEffects() {
  const navbar = document.querySelector('.navbar');
  const backToTop = document.querySelector('.back-to-top');
  let scrollTimeout;

  if (!navbar && !backToTop) return;

  // Use a passive scroll listener to prevent touch/scroll performance degradation on mobile
  window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        // Navbar scroll state check
        if (navbar) {
          if (currentScrollY > 80) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
        }

        // Back-To-Top visibility button check
        if (backToTop) {
          if (currentScrollY > 500) {
            backToTop.style.display = 'flex';
            // Use a tiny micro-timeout for CSS visibility transitions to trigger cleanly
            setTimeout(() => backToTop.classList.add('visible'), 10);
          } else {
            backToTop.classList.remove('visible');
            setTimeout(() => {
              if(!backToTop.classList.contains('visible')) backToTop.style.display = 'none';
            }, 300);
          }
        }

        scrollTimeout = null;
      });
      scrollTimeout = true;
    }
  }, { passive: true });

  // Back-to-top execution click link hook
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// Mobile Menu Toggle Modules
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close navigation tray smoothly when selecting a deep-anchored link strip
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// Memory-Leaking Proof Scroll Animations Observer
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optimization: Unobserve elements once visible to save ongoing browser layout evaluation loops
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// High-Performance Stats Counter Observation
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        const targetValue = parseInt(entry.target.getAttribute('data-target'), 10) || 0;
        animateFluidCounter(entry.target, targetValue);
        observerInstance.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  statNumbers.forEach(stat => observer.observe(stat));
}

// Hardware-Accelerated progressive Easing Counter engine (Replaces choppy setInterval loops)
function animateFluidCounter(element, target) {
  const duration = 2000; // Counter runtime frame speed in ms
  const startTime = performance.now();
  const isPercentage = element.textContent.includes('%') || element.getAttribute('data-target').includes('%');

  function updateFrame(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Progressive Quad out easing mathematical curve formula mapping
    const easeOutQuad = progress * (2 - progress);
    const currentCount = Math.floor(easeOutQuad * target);

    element.textContent = currentCount + (isPercentage ? '%' : '+');

    if (progress < 1) {
      requestAnimationFrame(updateFrame);
    } else {
      element.textContent = target + (isPercentage ? '%' : '+');
    }
  }

  requestAnimationFrame(updateFrame);
}

// Clean FAQ Single-Open Accordion Toggling Logic
function initFAQAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  if (!faqQuestions.length) return;

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      const isActive = faqItem.classList.contains('active');

      // Close all alternative active elements
      document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));

      // If selection wasn't open, cycle state flag on
      if (!isActive) {
        faqItem.classList.add('active');
      }
    });
  });
}

// Ultra-Smooth Page Anchor Intercept Controls
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const hrefValue = this.getAttribute('href');
      if (hrefValue === '#') return;

      const targetElement = document.querySelector(hrefValue);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Dynamic Calendar Setup Nodal Logic
function updateFooterYear() {
  const yearElements = document.querySelectorAll('.footer-year, #year');
  const currentYear = new Date().getFullYear();
  yearElements.forEach(el => {
    el.textContent = currentYear;
  });
}

// Secure Field Form Validation Architecture Setup
function initContactFormValidation() {
  const contactForm = document.getElementById('contactForm') || document.querySelector('form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', function(e) {
    const inputs = this.querySelectorAll('[required]');
    let isFormValid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.style.borderColor = '#ef4444';
        isFormValid = false;
      } else {
        input.style.borderColor = '#C4C7CC';
        
        if (input.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input.value)) {
            input.style.borderColor = '#ef4444';
            isFormValid = false;
          }
        }
      }
    });

    if (!isFormValid) {
      e.preventDefault();
      alert('Please complete all required fields correctly to connect with our Trade Desk.');
    }
  });

  // Setup reactive border transitions for active form inputs blur out fields
  contactForm.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('blur', function() {
      if (this.hasAttribute('required') && !this.value.trim()) {
        this.style.borderColor = '#ef4444';
      } else {
        this.style.borderColor = '#C4C7CC';
      }
    });
  });
}

// Corporate Technical Branding Log Message Node Group
console.log('%cFlexlyf Commerce', 'color: #2B7A1A; font-size: 24px; font-weight: bold;');
console.log('%cPremium International Trade Advisory Services', 'color: #064E3B; font-size: 14px;');
console.log('%cBuilt with Performance Precision for Indian MSMEs', 'color: #6B7280; font-size: 12px;');
// ... Your existing javascript code is up here ...
// ... Dynamic text animations, mobile menu toggles, etc. ...

function someExistingFunction() {
    // Existing logic
}

// ==========================================
// PASTE THE NEW CODE AT THE ABSOLUTE BOTTOM:
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {
        link.classList.remove("active"); 
        
        const href = link.getAttribute("href");
        
        if (currentPath === href || (currentPath === "/" && href === "/")) {
            link.classList.add("active");
        }
    });
});
