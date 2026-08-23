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

  /* ------------------------------------------------------------------ */
  /* Tanzanite morph page transition                                     */
  /* Intercept internal link clicks -> morph the cover in -> navigate.   */
  /* The destination page's CSS auto-plays the reveal on arrival.        */
  /* ------------------------------------------------------------------ */
  (function pageTransition() {
    var leaving = false;
    var ORIGIN  = window.location.origin;

    function targetUrl(a) {
      if (!a) return null;
      var href = a.getAttribute("href") || "";
      if (!href || href.charAt(0) === "#") return null;                 // in-page anchor
      if (a.target === "_blank" || a.hasAttribute("download")) return null;
      if (/^(mailto:|tel:|sms:|javascript:)/i.test(href)) return null;
      if ((a.getAttribute("rel") || "").match(/external/i)) return null;
      var url;
      try { url = new URL(a.href, window.location.href); } catch (e) { return null; }
      if (url.origin !== ORIGIN) return null;                           // external site
      if (url.href === window.location.href) return null;               // same page
      if (url.pathname === window.location.pathname && url.hash) return null;
      return url;
    }

    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 ||
          e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest("a") : null;
      var url = targetUrl(a);
      if (!url) return;                    // external / download / anchor -> behave normally
      e.preventDefault();
      if (leaving) return;                 // ignore double-clicks during a transition
      leaving = true;

      // Warm the destination in cache (static pages are tiny; failure is harmless).
      try { fetch(url.href, { credentials: "same-origin" }).catch(function () {}); } catch (_) {}

      document.body.classList.add("tz-leaving");
      document.documentElement.style.overflow = "hidden";

      var wait = reducedMotion ? 180 : 520;               // ~= tz-cover duration
      setTimeout(function () { window.location.assign(url.href); }, wait);

      // Safety net: never trap the user if navigation stalls.
      setTimeout(function () {
        document.body.classList.remove("tz-leaving");
        document.documentElement.style.overflow = "";
        leaving = false;
      }, 4000);
    }, false);

    // Restored from the back/forward (bfcache) — make sure nothing stays covering.
    window.addEventListener("pageshow", function (ev) {
      if (ev.persisted) {
        document.body.classList.remove("tz-leaving");
        document.documentElement.style.overflow = "";
        leaving = false;
      }
    });
  })();

})();
