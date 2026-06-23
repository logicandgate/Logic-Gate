/* Logic & Gate — site script v3. No backend, no tracking, no storage. */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* Active nav link — works for both bottom-nav and desktop .desk-nav   */
  /* ------------------------------------------------------------------ */
  (function setActiveLinks() {
    var page = window.location.pathname.split("/").pop() || "index.html";

    /* bottom nav */
    document.querySelectorAll(".bn-item").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      a.classList.toggle("active",
        href === page || (page === "" && href === "index.html")
      );
    });

    /* desktop nav */
    document.querySelectorAll(".desk-nav a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      a.classList.toggle("active",
        href === page || (page === "" && href === "index.html")
      );
    });
  })();

  /* ------------------------------------------------------------------ */
  /* Header: scroll shadow + scroll-progress bar                         */
  /* ------------------------------------------------------------------ */
  var header   = document.querySelector(".site-header");
  var progress = document.querySelector(".scroll-progress");
  var backBtn  = document.querySelector(".back-to-top");

  function onScroll() {
    var y    = window.scrollY || document.documentElement.scrollTop;
    var docH = document.documentElement.scrollHeight - window.innerHeight;

    if (header)  header.classList.toggle("is-scrolled", y > 8);
    if (progress) progress.style.width = (docH > 0 ? Math.min(100, (y / docH) * 100) : 0) + "%";
    if (backBtn)  backBtn.classList.toggle("is-visible", y > 440);
  }

  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------ */
  /* Back to top                                                          */
  /* ------------------------------------------------------------------ */
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll reveal                                                        */
  /* ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll(".reveal");

  if (revealEls.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.10, rootMargin: "0px 0px -36px 0px" }
      );
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Toast + copy-to-clipboard                                            */
  /* ------------------------------------------------------------------ */
  var toastEl   = document.querySelector(".toast");
  var toastTimer;

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 1900);
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(
          function () { showToast("Copied — " + value); },
          function () { showToast("Select & copy manually"); }
        );
      } else {
        showToast("Select & copy manually");
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /* FAQ: only one open at a time                                         */
  /* ------------------------------------------------------------------ */
  var faqItems = document.querySelectorAll("details.faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

})();
