(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  const heroForm = document.querySelector('[data-hero-search]');

  if (heroForm) {
    heroForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = heroForm.querySelector('input');
      const keyword = input ? input.value.trim() : '';
      const query = keyword ? '?q=' + encodeURIComponent(keyword) : '';
      window.location.href = './search.html' + query;
    });
  }

  const filterPanels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  filterPanels.forEach(function (panel) {
    const keywordInput = panel.querySelector('[data-filter-keyword]');
    const regionSelect = panel.querySelector('[data-filter-region]');
    const yearSelect = panel.querySelector('[data-filter-year]');
    const cards = Array.from(document.querySelectorAll('[data-title]'));
    const empty = document.querySelector('[data-empty-state]');

    function applyFilter() {
      const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      const region = regionSelect ? regionSelect.value : '';
      const year = yearSelect ? yearSelect.value : '';
      let visibleCount = 0;

      cards.forEach(function (card) {
        const text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        const matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchesRegion = !region || card.getAttribute('data-region') === region;
        const matchesYear = !year || card.getAttribute('data-year') === year;
        const visible = matchesKeyword && matchesRegion && matchesYear;

        card.style.display = visible ? '' : 'none';

        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visibleCount === 0);
      }
    }

    [keywordInput, regionSelect, yearSelect].forEach(function (field) {
      if (field) {
        field.addEventListener('input', applyFilter);
        field.addEventListener('change', applyFilter);
      }
    });

    panel.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
  });

  const searchRoot = document.querySelector('[data-search-root]');

  if (searchRoot && Array.isArray(window.SearchIndex)) {
    const form = searchRoot.querySelector('[data-search-form]');
    const input = searchRoot.querySelector('[data-search-input]');
    const results = searchRoot.querySelector('[data-search-results]');
    const empty = searchRoot.querySelector('[data-search-empty]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    function render(query) {
      const keyword = query.trim().toLowerCase();
      const matches = window.SearchIndex.filter(function (item) {
        const text = [item.title, item.region, item.year, item.genre, item.oneLine].join(' ').toLowerCase();
        return !keyword || text.indexOf(keyword) !== -1;
      }).slice(0, 80);

      results.innerHTML = matches.map(function (item) {
        return [
          '<article class="movie-card" data-title="' + escapeHtml(item.title) + '">',
          '<a class="poster-link" href="' + escapeHtml(item.url) + '" aria-label="' + escapeHtml(item.title) + '">',
          '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '<span class="poster-badge">' + escapeHtml(item.type) + '</span>',
          '</a>',
          '<div class="movie-card-body">',
          '<div class="movie-card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
          '<h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>',
          '<p>' + escapeHtml(item.oneLine) + '</p>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');

      if (empty) {
        empty.classList.toggle('show', matches.length === 0);
      }
    }

    if (input) {
      input.value = initialQuery;
    }

    render(initialQuery);

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render(input ? input.value : '');
      });
    }

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
