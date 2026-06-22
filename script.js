(function () {
  "use strict";

  /* ---- Active Link Highlighting ---- */
  (function setActiveLink() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-item").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path) {
        a.classList.add("active");
      } else {
        a.classList.remove("active");
      }
    });
  })();

  /* ---- Toast Notifications ---- */
  var toastEl = document.querySelector(".toast");
  var toastTimer;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2500);
  }

  /* ---- Copy-to-Clipboard Logic ---- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(
          function () { showToast("Copied to clipboard! ✅"); },
          function () { showToast("Error copying text"); }
        );
      } else {
        showToast("Copy not supported on this browser");
      }
    });
  });

  /* ---- FAQ Accordion Logic ---- */
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
