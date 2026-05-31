/**
 * Flexlyf Commerce - Main JavaScript
 * Premium International Trade Consultancy
 */

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initStatsCounter();
  initFAQAccordion();
  initBackToTop();
  initSmoothScroll();
  updateFooterYear();
});

// Navbar Scroll Effect
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// Mobile Menu Toggle
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when clicking a link
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// Scroll Animations (Fade In)
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// Stats Counter Animation
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        const target = parseInt(entry.target.getAttribute('data-target'));
        animateCounter(entry.target, target);
        entry.target.classList.add('counted');
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(stat => observer.observe(stat));
}

function animateCounter(element, target) {
  let current = 0;
  const increment = target / 50;
  const duration = 2000;
  const stepTime = duration / 50;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target + '+';
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current) + '+';
    }
  }, stepTime);
}

// FAQ Accordion
function initFAQAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  if (!faqQuestions.length) return;

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const answer = question.nextElementSibling;
      const isActive = question.classList.contains('active');

      // Close all other FAQs
      faqQuestions.forEach(q => {
        q.classList.remove('active');
        q.nextElementSibling.classList.remove('open');
      });

      // Toggle current FAQ
      if (!isActive) {
        question.classList.add('active');
        answer.classList.add('open');
      }
    });
  });
}

// Back to Top Button
function initBackToTop() {
  const backToTop = document.querySelector('.back-to-top');
  
  if (!backToTop) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Smooth Scroll for Anchor Links
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Update Footer Year Dynamically
function updateFooterYear() {
  const yearElements = document.querySelectorAll('.footer-year');
  const currentYear = new Date().getFullYear();
  
  yearElements.forEach(el => {
    el.textContent = currentYear;
  });
}

// Form Validation (Contact Page)
function validateForm(form) {
  const inputs = form.querySelectorAll('[required]');
  let isValid = true;

  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.style.borderColor = '#ef4444';
      isValid = false;
    } else {
      input.style.borderColor = '#E8EDF5';
      
      // Email validation
      if (input.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
          input.style.borderColor = '#ef4444';
          isValid = false;
        }
      }
    }
  });

  return isValid;
}

// Add form submission handler if contact form exists
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    if (!validateForm(this)) {
      e.preventDefault();
      alert('Please fill in all required fields correctly.');
    }
  });

  // Real-time validation
  const inputs = contactForm.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.hasAttribute('required') && !this.value.trim()) {
        this.style.borderColor = '#ef4444';
      } else {
        this.style.borderColor = '#E8EDF5';
      }
    });
  });
}

// Console message for developers
console.log('%cFlexlyf Commerce', 'color: #C9922A; font-size: 24px; font-weight: bold;');
console.log('%cPremium International Trade Consultancy', 'color: #0A1F44; font-size: 14px;');
console.log('%cBuilt with ❤️ for Indian MSMEs', 'color: #8A94A6; font-size: 12px;');
