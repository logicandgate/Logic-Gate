/* Logic & Gate — Android-Optimized Site Script */
(function () {
  "use strict";

  // Prefers-reduced-motion check
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ===== Mobile Navigation (Enhanced for Android) ===== */
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  
  // Note: Bottom nav replaces hamburger on inner pages, but keeping toggle for potential future use
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      const open = navLinks.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      
      // Prevent body scroll when menu open
      document.body.style.overflow = open ? "hidden" : "";
    });
    
    // Close nav when clicking links
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ===== Active Nav Link Highlight ===== */
  (function setActiveLink() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(link => {
      const href = link.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  })();

  /* ===== Header Scroll Effects ===== */
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress");
  
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    
    // Header shadow on scroll
    if (header) {
      header.classList.toggle("is-scrolled", y > 8);
    }
    
    // Scroll progress bar
    if (progress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (y / docHeight) * 100) : 0;
      progress.style.width = pct + "%";
    }
    
    // Back-to-top button
    const backBtn = document.querySelector(".back-to-top");
    if (backBtn) {
      backBtn.classList.toggle("is-visible", y > 400);
    }
  }
  
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ===== Back to Top ===== */
  const backBtn = document.querySelector(".back-to-top");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });
  }

  /* ===== Scroll Reveal (Optimized) ===== */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(el => el.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
      );
      
      revealEls.forEach(el => observer.observe(el));
    }
  }

  /* ===== Toast & Copy-to-Clipboard ===== */
  const toastEl = document.querySelector(".toast");
  let toastTimer;
  
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, 2000);
  }

  document.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", function () {
      const value = btn.getAttribute("data-copy");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(
          () => showToast(`Copied ${value}`),
          () => showToast("Couldn't copy — select and copy manually")
        );
      } else {
        showToast("Copy not supported — select and copy manually");
      }
    });
  });

  /* ===== FAQ: Single Open Accordion ===== */
  const faqItems = document.querySelectorAll("details.faq-item");
  faqItems.forEach(item => {
    item.addEventListener("toggle", function () {
      if (this.open) {
        faqItems.forEach(other => {
          if (other !== this) other.open = false;
        });
      }
    });
  });

  /* ===== Android-Specific Optimizations ===== */
  // Disable text selection on non-text elements for better touch feel
  document.addEventListener("selectstart", function(e) {
    if (!e.target.matches('input, textarea, [contenteditable]')) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Prevent pull-to-refresh on Android Chrome when at top
  let lastTouchY = null;
  document.addEventListener("touchstart", function(e) {
    if (e.touches.length === 1) {
      lastTouchY = e.touches[0].clientY;
    }
  }, { passive: true });
  
  document.addEventListener("touchmove", function(e) {
    if (e.touches.length === 1 && lastTouchY !== null) {
      const touchY = e.touches[0].clientY;
      const diffY = touchY - lastTouchY;
      
      // Prevent pull-to-refresh when at top and dragging down
      if (window.scrollY === 0 && diffY > 0) {
        e.preventDefault();
      }
      lastTouchY = touchY;
    }
  }, { passive: false });
  
  // Add 300ms click delay removal for faster touch response
  // (Modern browsers handle this, but keeping for compatibility)
  if ('PointerEvent' in window) {
    // Pointer events already handle this well
  } else {
    // Fallback for older Android browsers
    FastClick.attach(document.body);
  }
})();

// FastClick polyfill (lightweight version for Android touch delay)
if (typeof FastClick === 'undefined') {
  var FastClick = function(layer, options) {
    'use strict';
    var oldOnClick;

    options = options || {};

    /**
     * Whether a click is currently being tracked.
     */
    var trackingClick = false;


    /**
     * Timestamp for when click tracking started.
     */
    var trackingClickTime = 0;


    /**
     * The element being tracked for a click.
     */
    var targetElement = null;


    /**
     * X-coordinate of touch start event.
     */
    var touchX = null;


    /**
     * Y-coordinate of touch start event.
     */
    var touchY = null;


    /**
     * ID of the last touch, retrieved from Touch.identifier.
     */
    var lastTouchIdentifier = 0;


    /**
     * FastClick boundary.
     *
     * @param {Element|string} layer
     * @param {Object} options
     */
    function FastClick(layer, options) {
      var layer, options;

      if (!layer || !layer.nodeType) {
        throw new TypeError('Layer must be a document node or element');
      }

      /** @type {Element} */
      this.layer = layer;

      if (options.tapDelay !== undefined) {
        this.tapDelay = options.tapDelay;
      }

      if (options.tapTimeout !== undefined) {
        this.tapTimeout = options.tapTimeout;
      }

      if (!this.tapDelay) {
        this.tapDelay = 200;
      }

      if (!this.tapTimeout) {
        this.tapTimeout = 700;
      }

      this._bind = function(eventName, eventHandler) {
        if ('addEventListener' in layer) {
          layer.addEventListener
