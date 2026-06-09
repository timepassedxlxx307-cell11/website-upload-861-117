(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var nav = document.querySelector("[data-main-nav]");
        var toggle = document.querySelector("[data-menu-toggle]");

        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function start() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    show(current + 1);
                }, 6200);
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }

            show(0);
            start();
        }

        var searchInput = document.querySelector("[data-search-input]");
        var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var emptyState = document.querySelector("[data-empty-state]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            if (!cards.length) {
                return;
            }
            var query = normalize(searchInput ? searchInput.value : "");
            var shown = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var match = !query || text.indexOf(query) !== -1;

                filters.forEach(function (select) {
                    var field = select.getAttribute("data-filter-select");
                    var selected = normalize(select.value);
                    var value = normalize(card.getAttribute("data-" + field));
                    if (selected && value.indexOf(selected) === -1) {
                        match = false;
                    }
                });

                card.style.display = match ? "" : "none";
                if (match) {
                    shown += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", shown === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", applyFilters);
        }

        filters.forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });

        applyFilters();
    });
}());
