(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobile = document.querySelector('[data-mobile-nav]');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var show = function (index) {
      active = index % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === active);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === active);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(active + 1);
      }, 5600);
    }
  }

  var filterForm = document.querySelector('[data-page-filter]');
  var filterInput = document.querySelector('[data-page-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  var currentChip = '';

  var applyFilter = function () {
    if (!filterList) {
      return;
    }
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    Array.prototype.slice.call(filterList.querySelectorAll('[data-card]')).forEach(function (card) {
      var haystack = card.getAttribute('data-search') || '';
      var genre = card.getAttribute('data-genre') || '';
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedChip = !currentChip || genre.indexOf(currentChip) !== -1 || haystack.indexOf(currentChip.toLowerCase()) !== -1;
      card.classList.toggle('is-hidden', !(matchedKeyword && matchedChip));
    });
  };

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      filterInput.value = q;
    }
    filterInput.addEventListener('input', applyFilter);
  }

  if (filterForm) {
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      currentChip = chip.getAttribute('data-filter-chip') || '';
      chips.forEach(function (item) {
        item.classList.toggle('is-active', item === chip);
      });
      applyFilter();
    });
  });

  applyFilter();
})();
