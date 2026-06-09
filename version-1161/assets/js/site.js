document.addEventListener("DOMContentLoaded", function () {
    var mobileToggle = document.querySelector("[data-mobile-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    var slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var urlParams = new URLSearchParams(window.location.search);
    var queryFromUrl = urlParams.get("q") || "";
    var searchInputs = Array.from(document.querySelectorAll("[data-search-input]"));
    var yearFilter = document.querySelector("[data-filter-year]");
    var typeFilter = document.querySelector("[data-filter-type]");
    var cards = Array.from(document.querySelectorAll(".movie-card"));
    var noResults = document.querySelector("[data-no-results]");

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function currentQuery() {
        var input = searchInputs.find(function (item) {
            return item.closest(".filter-panel");
        }) || searchInputs[0];
        return normalize(input ? input.value : "");
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var query = currentQuery();
        var selectedYear = yearFilter ? yearFilter.value : "";
        var selectedType = typeFilter ? typeFilter.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var year = card.getAttribute("data-year") || "";
            var type = card.getAttribute("data-type") || "";
            var matchedQuery = !query || text.indexOf(query) !== -1;
            var matchedYear = !selectedYear || year === selectedYear;
            var matchedType = !selectedType || type === selectedType;
            var matched = matchedQuery && matchedYear && matchedType;

            card.hidden = !matched;

            if (matched) {
                visible += 1;
            }
        });

        if (noResults) {
            noResults.classList.toggle("is-visible", visible === 0);
        }
    }

    searchInputs.forEach(function (input) {
        if (queryFromUrl && input.closest(".filter-panel")) {
            input.value = queryFromUrl;
        }

        input.addEventListener("input", applyFilters);
    });

    if (yearFilter) {
        yearFilter.addEventListener("change", applyFilters);
    }

    if (typeFilter) {
        typeFilter.addEventListener("change", applyFilters);
    }

    if (queryFromUrl) {
        applyFilters();
    }

    var playerVideo = document.querySelector("[data-player-video]");
    var playButton = document.querySelector("[data-play-button]");
    var playerStatus = document.querySelector("[data-player-status]");

    function setStatus(message) {
        if (playerStatus) {
            playerStatus.textContent = message;
        }
    }

    function startPlayback(video, source) {
        if (!video || !source) {
            return;
        }

        setStatus("正在加载播放源，请稍候。");

        if (video.hlsInstance) {
            video.hlsInstance.destroy();
            video.hlsInstance = null;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 60
            });

            video.hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().then(function () {
                    setStatus("播放源已绑定，可使用播放器控制条调节进度和音量。");
                }).catch(function () {
                    setStatus("播放源已就绪，请再次点击播放器开始播放。");
                });
            });
            hls.on(window.Hls.Events.ERROR, function (_, data) {
                if (data && data.fatal) {
                    setStatus("播放源暂时无法加载，请稍后重试或切换浏览器。");
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", function () {
                video.play().catch(function () {
                    setStatus("播放源已就绪，请点击播放器开始播放。");
                });
            }, { once: true });
        } else {
            video.src = source;
            video.play().catch(function () {
                setStatus("当前浏览器不支持 HLS 自动播放，请使用支持 HLS 的浏览器访问。");
            });
        }
    }

    if (playButton && playerVideo) {
        playButton.addEventListener("click", function () {
            startPlayback(playerVideo, playButton.getAttribute("data-video-src"));
        });
    }
});
