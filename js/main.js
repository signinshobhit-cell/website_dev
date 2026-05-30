/**
 * FLEXYF COMMERCE - Main JavaScript
 * International Web Standards Compliant
 */

(function() {
  'use strict';

  // ========================================
  // DOM ELEMENTS
  // ========================================
  
  const navbar = document.querySelector('.navbar');
  const navbarToggle = document.querySelector('.navbar-toggle');
  const navbarNav = document.querySelector('.navbar-nav');
  const scrollAnimateElements = document.querySelectorAll('.scroll-animate');
  const themeToggle = document.querySelector('.theme-toggle');
  
  // ========================================
  // NAVIGATION
  // ========================================
  
  // Mobile Menu Toggle
  if (navbarToggle && navbarNav) {
    navbarToggle.addEventListener('click', function() {
      navbarNav.classList.toggle('active');
      this.setAttribute('aria-expanded', 
        navbarNav.classList.contains('active') ? 'true' : 'false'
      );
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!navbar.contains(e.target) && navbarNav.classList.contains('active')) {
        navbarNav.classList.remove('active');
        navbarToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  
  // Navbar Scroll Effect
  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar && navbar.classList.add('scrolled');
    } else {
      navbar && navbar.classList.remove('scrolled');
    }
  }
  
  window.addEventListener('scroll', handleNavbarScroll);
  handleNavbarScroll(); // Check on load
  
  // Smooth Scroll for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offsetTop = target.offsetTop - 80; // Account for fixed navbar
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
          
          // Close mobile menu if open
          if (navbarNav && navbarNav.classList.contains('active')) {
            navbarNav.classList.remove('active');
            navbarToggle && navbarToggle.setAttribute('aria-expanded', 'false');
          }
        }
      }
    });
  });
  
  // Active Navigation Link Highlighting
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }
  
  window.addEventListener('scroll', updateActiveNavLink);
  
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
  // THEME TOGGLE (Dark/Light Mode)
  // ========================================
  
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', 
        `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
      );
    }
  }
  
  // Check for saved theme preference or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }
  
  // ========================================
  // PARALLAX EFFECT FOR HERO
  // ========================================
  
  const hero = document.querySelector('.hero');
  
  if (hero) {
    window.addEventListener('scroll', function() {
      const scrolled = window.scrollY;
      const heroContent = hero.querySelector('.hero-content');
      
      if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
      }
    });
  }
  
  // ========================================
  // SERVICE CARDS INTERACTIVE EFFECTS
  // ========================================
  
  const serviceCards = document.querySelectorAll('.service-card');
  
  serviceCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      serviceCards.forEach(c => {
        if (c !== card) {
          c.style.opacity = '0.7';
          c.style.transform = 'scale(0.95)';
        }
      });
    });
    
    card.addEventListener('mouseleave', function() {
      serviceCards.forEach(c => {
        c.style.opacity = '1';
        c.style.transform = 'scale(1)';
      });
    });
  });
  
  // ========================================
  // PERFORMANCE OPTIMIZATION
  // ========================================
  
  // Lazy loading images
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.src = img.dataset.src || img.src;
    });
  } else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
  }
  
  // ========================================
  // ACCESSIBILITY ENHANCEMENTS
  // ========================================
  
  // Keyboard navigation for dropdown menus
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
  
  // Focus trap for mobile menu
  if (navbarToggle) {
    navbarToggle.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navbarNav && navbarNav.classList.contains('active')) {
        navbarNav.classList.remove('active');
        this.setAttribute('aria-expanded', 'false');
        this.focus();
      }
    });
  }
  
  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  // Debounce function for performance
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Throttle function for scroll events
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
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
