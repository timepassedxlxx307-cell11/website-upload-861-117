(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) return;
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (slides.length === 0) return;
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function applyFilters(scope) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-card]"));
    var input = scope.querySelector("[data-filter-input]");
    var type = scope.querySelector("[data-type-filter]");
    var region = scope.querySelector("[data-region-filter]");
    var year = scope.querySelector("[data-year-filter]");
    var empty = scope.querySelector("[data-empty-message]");
    var query = normalize(input && input.value);
    var typeValue = normalize(type && type.value);
    var regionValue = normalize(region && region.value);
    var yearValue = normalize(year && year.value);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search"));
      var cardType = normalize(card.getAttribute("data-type"));
      var cardRegion = normalize(card.getAttribute("data-region"));
      var cardYear = normalize(card.getAttribute("data-year"));
      var matched = true;
      if (query && text.indexOf(query) === -1) matched = false;
      if (typeValue && cardType !== typeValue) matched = false;
      if (regionValue && cardRegion !== regionValue) matched = false;
      if (yearValue && cardYear !== yearValue) matched = false;
      card.style.display = matched ? "" : "none";
      if (matched) visible += 1;
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    if (scopes.length === 0) return;
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var controls = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-input], [data-type-filter], [data-region-filter], [data-year-filter]"));
      if (input && query) input.value = query;
      controls.forEach(function (control) {
        control.addEventListener("input", function () {
          applyFilters(scope);
        });
        control.addEventListener("change", function () {
          applyFilters(scope);
        });
      });
      applyFilters(scope);
    });
  }

  onReady(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
