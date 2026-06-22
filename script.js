(function () {
  "use strict";

  /* ---- Side Menu Logic ---- */
  var menuToggle = document.getElementById("menuToggle");
  var menuDrawer = document.getElementById("menuDrawer");
  var overlay = document.getElementById("overlay");

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      menuDrawer.classList.add("open");
      overlay.classList.add("open");
    });
  }

  if (overlay) {
    overlay.addEventListener("click", function () {
      menuDrawer.classList.remove("open");
      overlay.classList.remove("open");
    });
  }

  /* ---- Back to Top Logic ---- */
  var backBtn = document.getElementById("backToTop");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      backBtn.classList.add("visible");
    } else {
      backBtn.classList.remove("visible");
    }
  });

  if (backBtn) {
    backBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---- Active Link Highlighting ---- */
  var path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-item").forEach(function (a) {
    if (a.getAttribute("href") === path) {
      a.classList.add("active");
    }
  });

  /* ---- Copy-to-Clipboard --- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      navigator.clipboard.writeText(value).then(function () {
        var toast = document.querySelector(".toast");
        toast.textContent = "Copied to clipboard! ✅";
        toast.classList.add("is-visible");
        setTimeout(function () { toast.classList.remove("is-visible"); }, 2000);
      });
    });
  });
})();
