/**
 * FLEXYF COMMERCE - Main JavaScript
 * International Web Standards Compliant
 */

(function() {
  'use strict';

  // ========================================
  // DOM ELEMENTS
  // ========================================
  
  const header = document.querySelector('.header');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const scrollAnimateElements = document.querySelectorAll('.fade-in');
  
  // ========================================
  // NAVIGATION
  // ========================================
  
  // Mobile Menu Toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');
      const isExpanded = navMenu.classList.contains('active');
      navToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!header.contains(e.target) && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  
  // Header Scroll Effect
  function handleHeaderScroll() {
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }
  
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // Check on load
  
  // Smooth Scroll for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const headerHeight = header ? header.offsetHeight : 80;
          const offsetTop = target.offsetTop - headerHeight;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
          
          // Close mobile menu if open
          if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle && navToggle.setAttribute('aria-expanded', 'false');
          }
        }
      }
    });
  });
  
  // ========================================
  // SCROLL ANIMATIONS
  // ========================================
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  scrollAnimateElements.forEach(element => {
    scrollObserver.observe(element);
  });
  
  // ========================================
  // COUNTER ANIMATION FOR STATS
  // ========================================
  
  function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16); // 60fps
    
    function updateCounter() {
      start += increment;
      if (start < target) {
        element.textContent = Math.floor(start).toLocaleString();
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target.toLocaleString();
      }
    }
    
    updateCounter();
  }
  
  // Observe stat numbers for animation
  const statNumbers = document.querySelectorAll('.stat-number');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        const target = parseInt(entry.target.getAttribute('data-target'));
        if (target) {
          animateCounter(entry.target, target);
          entry.target.classList.add('animated');
        }
      }
    });
  }, { threshold: 0.5 });
  
  statNumbers.forEach(stat => {
    statObserver.observe(stat);
  });
  
  // ========================================
  // FORM HANDLING
  // ========================================
  
  const contactForm = document.querySelector('.contact-form form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Basic form validation
      const formData = new FormData(this);
      const data = Object.fromEntries(formData);
      
      // Simple validation
      let isValid = true;
      const requiredFields = this.querySelectorAll('[required]');
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error');
        } else {
          field.classList.remove('error');
        }
      });
      
      // Email validation
      const emailField = this.querySelector('input[type="email"]');
      if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
          isValid = false;
          emailField.classList.add('error');
        }
      }
      
      if (isValid) {
        // Show success message (in production, send to server)
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
      } else {
        alert('Please fill in all required fields correctly.');
      }
    });
    
    // Remove error class on input
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
      input.addEventListener('input', function() {
        this.classList.remove('error');
      });
    });
  }
  
  // ========================================
  // FAQ ACCORDION
  // ========================================
  
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const item = this.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isActive = item.classList.contains('active');
      
      // Close all other items
      document.querySelectorAll('.faq-item.active').forEach(activeItem => {
        activeItem.classList.remove('active');
        activeItem.querySelector('.faq-answer').style.maxHeight = null;
      });
      
      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
  
  // ========================================
  // INITIALIZATION
  // ========================================
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Flexlyf Commerce website loaded successfully!');
    
    // Add loaded class to body for CSS transitions
    document.body.classList.add('loaded');
    
    // Initialize any other components here
  });
  
})();
