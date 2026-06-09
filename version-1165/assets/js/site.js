(function () {
    const mobileToggle = document.querySelector('[data-mobile-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const next = hero.querySelector('[data-hero-next]');
        const prev = hero.querySelector('[data-hero-prev]');
        let current = 0;
        let timer = null;

        const showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        const start = function () {
            stop();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        };

        const stop = function () {
            if (timer) {
                window.clearInterval(timer);
            }
        };

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.dataset.heroDot || 0));
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    const normalize = function (value) {
        return String(value || '').toLowerCase().trim();
    };

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        const input = scope.querySelector('[data-filter-input]');
        const typeSelect = scope.querySelector('[data-filter-type]');
        const sortSelect = scope.querySelector('[data-sort-select]');
        const grid = scope.parentElement.querySelector('[data-filter-grid]');
        const empty = scope.parentElement.querySelector('[data-empty-state]');

        if (!grid) {
            return;
        }

        const cards = Array.from(grid.querySelectorAll('[data-card]'));

        const filterCards = function () {
            const keyword = normalize(input ? input.value : '');
            const type = normalize(typeSelect ? typeSelect.value : '');
            let visible = 0;

            cards.forEach(function (card) {
                const searchText = normalize(card.dataset.search);
                const cardType = normalize(card.dataset.type);
                const matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
                const matchType = !type || cardType === type;
                const show = matchKeyword && matchType;
                card.classList.toggle('hidden-card', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        };

        const sortCards = function () {
            if (!sortSelect) {
                return;
            }

            const value = sortSelect.value;
            const sorted = cards.slice().sort(function (a, b) {
                if (value === 'year-desc') {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                }

                if (value === 'year-asc') {
                    return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                }

                if (value === 'title') {
                    return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-CN');
                }

                return cards.indexOf(a) - cards.indexOf(b);
            });

            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        };

        if (input) {
            input.addEventListener('input', filterCards);
        }

        if (typeSelect) {
            typeSelect.addEventListener('change', filterCards);
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                sortCards();
                filterCards();
            });
        }
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        const video = player.querySelector('video');
        const trigger = player.querySelector('[data-player-trigger]');
        const stream = player.dataset.stream;
        let hls = null;
        let loaded = false;

        const attach = function () {
            if (!video || !stream || loaded) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                loaded = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                loaded = true;
            }
        };

        const play = function () {
            attach();
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
            if (video) {
                video.controls = true;
                const promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        video.controls = true;
                    });
                }
            }
        };

        if (trigger) {
            trigger.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!loaded || video.paused) {
                    play();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });

    const globalInput = document.querySelector('[data-global-search-input]');
    const globalButton = document.querySelector('[data-global-search-button]');
    const globalResults = document.querySelector('[data-global-search-results]');
    const globalCount = document.querySelector('[data-global-search-count]');

    if (globalInput && globalResults && Array.isArray(window.MOVIE_SEARCH_INDEX)) {
        const source = window.MOVIE_SEARCH_INDEX;

        const renderCard = function (movie) {
            const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '' +
                '<article class="movie-card">' +
                    '<a class="card-poster" href="' + escapeHtml(movie.url) + '">' +
                        '<img src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                        '<span class="poster-shade"></span>' +
                        '<span class="play-hover">▶</span>' +
                        '<span class="type-badge">' + escapeHtml(movie.type) + '</span>' +
                    '</a>' +
                    '<div class="card-body">' +
                        '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                        '<p>' + escapeHtml(movie.oneLine || movie.genre || '') + '</p>' +
                        '<div class="card-tags">' + tags + '</div>' +
                        '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>' +
                    '</div>' +
                '</article>';
        };

        const search = function () {
            const keyword = normalize(globalInput.value);
            const params = new URLSearchParams(window.location.search);

            if (keyword) {
                params.set('q', globalInput.value.trim());
                history.replaceState(null, '', window.location.pathname + '?' + params.toString());
            }

            if (!keyword) {
                globalResults.innerHTML = '';
                if (globalCount) {
                    globalCount.textContent = '请输入关键词开始搜索';
                }
                return;
            }

            const matched = source.filter(function (movie) {
                return normalize(movie.text).indexOf(keyword) !== -1;
            }).slice(0, 120);

            globalResults.innerHTML = matched.map(renderCard).join('');

            if (globalCount) {
                globalCount.textContent = '找到 ' + matched.length + ' 条结果';
            }
        };

        const initial = new URLSearchParams(window.location.search).get('q');
        if (initial) {
            globalInput.value = initial;
            search();
        }

        globalInput.addEventListener('input', search);

        if (globalButton) {
            globalButton.addEventListener('click', search);
        }
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
})();
