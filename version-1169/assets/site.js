(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "./search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var previous = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
      });
    }

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-title]"));
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (input && query) {
        input.value = query;
      }

      function applyFilters() {
        var q = normalize(input && input.value);
        var selectedType = normalize(type && type.value);
        var selectedYear = normalize(year && year.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.cardTitle,
            card.dataset.cardGenre,
            card.dataset.cardRegion,
            card.dataset.cardType,
            card.dataset.cardYear
          ].join(" "));
          var cardType = normalize(card.dataset.cardType);
          var cardYear = normalize(card.dataset.cardYear);
          var matchText = !q || text.indexOf(q) !== -1;
          var matchType = !selectedType || cardType.indexOf(selectedType) !== -1;
          var matchYear = !selectedYear || cardYear === selectedYear;
          card.hidden = !(matchText && matchType && matchYear);
        });
      }

      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });
      applyFilters();
    });
  });
})();
