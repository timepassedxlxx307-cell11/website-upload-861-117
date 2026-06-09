(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function shortText(value, limit) {
    var text = String(value || '').replace(/\s+/g, ' ').trim();
    if (text.length <= limit) {
      return text;
    }
    return text.slice(0, limit).replace(/[，。,.；;\s]+$/, '') + '…';
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '×' : '☰';
    });
  }

  function initCarousel() {
    selectAll('[data-carousel]').forEach(function (carousel) {
      var slides = selectAll('.hero-slide', carousel);
      var dots = selectAll('[data-carousel-dot]', carousel);
      var thumbs = selectAll('[data-carousel-thumb]', carousel);
      var prev = carousel.querySelector('[data-carousel-prev]');
      var next = carousel.querySelector('[data-carousel-next]');
      var index = 0;
      var timer;

      function go(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
        thumbs.forEach(function (thumb, thumbIndex) {
          thumb.classList.toggle('is-active', thumbIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          go(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          go(Number(dot.getAttribute('data-carousel-dot')) || 0);
          start();
        });
      });

      thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
          go(Number(thumb.getAttribute('data-carousel-thumb')) || 0);
          start();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          go(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          go(index + 1);
          start();
        });
      }

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      go(0);
      start();
    });
  }

  function initFilters() {
    selectAll('[data-filter-panel]').forEach(function (panel) {
      var input = panel.querySelector('[data-filter-text]');
      var year = panel.querySelector('[data-filter-year]');
      var type = panel.querySelector('[data-filter-type]');
      var grid = panel.parentElement.querySelector('[data-filter-grid]');
      if (!grid) {
        return;
      }
      var cards = selectAll('.movie-card', grid);

      function apply() {
        var text = normalize(input && input.value);
        var selectedYear = normalize(year && year.value);
        var selectedType = normalize(type && type.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre')
          ].join(' '));
          var matchText = !text || haystack.indexOf(text) !== -1;
          var matchYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
          var cardType = normalize(card.getAttribute('data-type'));
          var matchType = !selectedType || cardType.indexOf(selectedType) !== -1;
          card.hidden = !(matchText && matchYear && matchType);
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (type) {
        type.addEventListener('change', apply);
      }
    });
  }

  function createSearchCard(movie) {
    var tagHtml = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-frame" href="' + escapeHtml(movie.url) + '" style="--poster-image: url(\'' + escapeHtml(movie.cover) + '\');" aria-label="' + escapeHtml(movie.title) + '">',
      '<span class="play-mark">▶</span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta"><a href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.year) + '</span></div>',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(shortText(movie.oneLine, 76)) + '</p>',
      '<div class="tag-row">' + tagHtml + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    if (!results || !form || !input || !window.MOVIE_CATALOG) {
      return;
    }

    function getQuery() {
      var params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    }

    function render(query) {
      var term = normalize(query);
      input.value = query;
      var source = window.MOVIE_CATALOG;
      var matched = source.filter(function (movie) {
        if (!term) {
          return movie.featured;
        }
        return normalize(movie.searchText).indexOf(term) !== -1;
      }).slice(0, 96);
      if (!matched.length) {
        results.innerHTML = '<div class="empty-state">没有找到相关影片，可以尝试更换关键词。</div>';
        return;
      }
      results.innerHTML = matched.map(createSearchCard).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
      render(query);
    });

    selectAll('[data-search-keyword]').forEach(function (button) {
      button.addEventListener('click', function () {
        var keyword = button.getAttribute('data-search-keyword') || '';
        input.value = keyword;
        form.dispatchEvent(new Event('submit'));
      });
    });

    render(getQuery());
  }

  function attachVideo(video, streamUrl) {
    if (!streamUrl) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }
    video.src = streamUrl;
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.play-layer');
      if (!video) {
        return;
      }
      var streamUrl = video.getAttribute('data-stream-url') || '';
      var ready = false;

      function play() {
        if (!ready) {
          attachVideo(video, streamUrl);
          ready = true;
        }
        shell.classList.add('is-playing');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          shell.classList.remove('is-playing');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initCarousel();
    initFilters();
    initSearchPage();
    initPlayers();
  });
}());
