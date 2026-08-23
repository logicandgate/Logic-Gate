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

      // Wave direction from where you clicked: right-side link -> sweep from the
      // right (default); left-side link -> sweep from the left.
      var cx = (typeof e.clientX === "number" && e.clientX)
             ? e.clientX
             : (a.getBoundingClientRect().left + a.offsetWidth / 2);
      document.body.classList.toggle("tz-from-left", cx < window.innerWidth / 2);
      document.body.classList.add("tz-leaving");
      document.documentElement.style.overflow = "hidden";

      var wait = reducedMotion ? 180 : 520;               // ~= tz-cover duration
      setTimeout(function () { window.location.assign(url.href); }, wait);

      // Safety net: never trap the user if navigation stalls.
      setTimeout(function () {
        document.body.classList.remove("tz-leaving", "tz-from-left");
        document.documentElement.style.overflow = "";
        leaving = false;
      }, 4000);
    }, false);

    // Restored from the back/forward (bfcache) — make sure nothing stays covering.
    window.addEventListener("pageshow", function (ev) {
      if (ev.persisted) {
        document.body.classList.remove("tz-leaving", "tz-from-left");
        document.documentElement.style.overflow = "";
        leaving = false;
      }
    });
  })();

})();

/* ================================================================= *
 * LOGIC & GATE — first-visit cinematic intro (homepage only).        *
 * Injected on the first homepage visit; flag stored in localStorage. *
 * Skip / Enter both dismiss it and reveal the homepage underneath.   *
 * Separate from the page-transition system (does not compete).       *
 * ================================================================= */
(function lgIntro() {
  "use strict";

  var KEY = "lg_intro_seen_v1";

  /* Homepage only. */
  var page = location.pathname.split("/").pop();
  if (page !== "" && page !== "index.html") return;

  /* Play once ever (if storage is blocked, just once per load). */
  try { if (localStorage.getItem(KEY)) return; } catch (e) {}

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Feather-style SVG icons for the journey stages (match the site). */
  var ICO = {
    mine:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M11 3 8 9l4 12 4-12-3-6"/></svg>',
    earn:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M14.5 9.4a2.5 2.5 0 0 0-2.5-1.4c-1.4 0-2.5.9-2.5 2s1.1 1.7 2.5 2 2.5.9 2.5 2-1.1 2-2.5 2A2.6 2.6 0 0 1 9.5 14.6M12 6.4v11.2"/></svg>',
    upgrade: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 11 14 10 22 21 9 13 9 13 2"/></svg>',
    grow:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 14 15 9 10 1 18"/><polyline points="17 6 23 6 23 12"/></svg>'
  };

  var html =
    '<button class="lg-intro-skip" type="button" aria-label="Skip intro">Skip Intro &times;</button>' +
    '<div class="lg-intro-particles" aria-hidden="true"></div>' +
    '<div class="lg-intro-stage">' +
      '<div class="lg-intro-scene lg-s1"><div class="lg-intro-crystal"></div></div>' +
      '<div class="lg-intro-scene lg-s2"><span class="lg-intro-ring"></span><span class="lg-intro-ring lg-ring2"></span><div class="lg-intro-crystal lg-bright"></div></div>' +
      '<div class="lg-intro-scene lg-s3"><h1 class="lg-intro-logo">Logic <span class="amp">&amp;</span> Gate</h1><p class="lg-intro-tag">Your Logic. Our Design. Perfect Solution.</p></div>' +
      '<div class="lg-intro-scene lg-s4"><div class="lg-intro-journey">' +
        '<div class="lg-intro-node"><span class="lg-node-ico">' + ICO.mine + '</span><b>Mine</b></div>' +
        '<span class="lg-intro-line"></span>' +
        '<div class="lg-intro-node"><span class="lg-node-ico">' + ICO.earn + '</span><b>Earn</b></div>' +
        '<span class="lg-intro-line"></span>' +
        '<div class="lg-intro-node"><span class="lg-node-ico">' + ICO.upgrade + '</span><b>Upgrade</b></div>' +
        '<span class="lg-intro-line"></span>' +
        '<div class="lg-intro-node"><span class="lg-node-ico">' + ICO.grow + '</span><b>Grow</b></div>' +
      '</div></div>' +
      '<div class="lg-intro-scene lg-s5"><div class="lg-intro-net"></div><h2 class="lg-intro-h">You’re not alone.</h2><p class="lg-intro-sub">Join a growing community.</p></div>' +
      '<div class="lg-intro-scene lg-s6"><div class="lg-intro-crystal lg-small"></div><h2 class="lg-intro-welcome">Welcome to Logic &amp; Gate</h2><p class="lg-intro-sub">Your journey starts here.</p><button class="lg-intro-enter" type="button">Enter Logic &amp; Gate</button></div>' +
    '</div>';

  var root = document.createElement("div");
  root.className = "lg-intro";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-label", "Welcome to Logic and Gate");
  root.innerHTML = html;
  document.body.appendChild(root);
  document.documentElement.style.overflow = "hidden";

  /* floating particles (fewer on mobile via CSS) */
  var pWrap = root.querySelector(".lg-intro-particles");
  var pCount = reduce ? 0 : 16;
  for (var i = 0; i < pCount; i++) {
    var p = document.createElement("span");
    p.className = "lg-intro-p";
    p.style.left = (6 + Math.random() * 88) + "%";
    p.style.top  = (10 + Math.random() * 80) + "%";
    p.style.animationDelay = (Math.random() * 5).toFixed(2) + "s";
    p.style.animationDuration = (5 + Math.random() * 3).toFixed(2) + "s";
    pWrap.appendChild(p);
  }

  /* community network nodes */
  var net = root.querySelector(".lg-intro-net");
  if (net) {
    var pos = [[50,50],[15,24],[85,22],[20,82],[80,78],[50,8],[8,56],[92,58]];
    for (var n = 0; n < pos.length; n++) {
      var dot = document.createElement("i");
      dot.style.left = pos[n][0] + "%";
      dot.style.top  = pos[n][1] + "%";
      dot.style.animationDelay = (n * 0.18).toFixed(2) + "s";
      net.appendChild(dot);
    }
  }

  var scenes = root.querySelectorAll(".lg-intro-scene");
  var timers = [];
  var done = false;

  function activate(idx) {
    for (var k = 0; k < scenes.length; k++) {
      scenes[k].classList.toggle("is-active", k === idx);
    }
  }
  function finish() {
    if (done) return;
    done = true;
    for (var t = 0; t < timers.length; t++) clearTimeout(timers[t]);
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
    root.classList.add("lg-hide");
    document.documentElement.style.overflow = "";
    setTimeout(function () { if (root.parentNode) root.parentNode.removeChild(root); }, 700);
  }

  root.querySelector(".lg-intro-skip").addEventListener("click", finish);
  var enterBtn = root.querySelector(".lg-intro-enter");
  if (enterBtn) enterBtn.addEventListener("click", finish);
  document.addEventListener("keydown", function (e) {
    if (!done && e.key === "Escape") finish();
  });
  var skipBtn = root.querySelector(".lg-intro-skip");
  if (skipBtn) { try { skipBtn.focus(); } catch (e) {} }

  if (reduce) {
    activate(scenes.length - 1);   /* jump straight to Welcome, simple fade */
    return;
  }

  /* scene hold times: s1..s5 (Scene 6 waits for the user) */
  var durations = [1000, 1000, 1200, 1200, 1000];
  activate(0);
  var at = 0;
  for (var s = 1; s < scenes.length; s++) {
    at += durations[s - 1];
    (function (idx, when) {
      timers.push(setTimeout(function () { activate(idx); }, when));
    })(s, at);
  }
})();
