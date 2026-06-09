(function () {
    "use strict";

    function toArray(value) {
        return Array.prototype.slice.call(value || []);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initImages() {
        toArray(document.querySelectorAll(".poster-img")).forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
            }, { once: true });
        });
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");

        if (!button || !nav) {
            return;
        }

        button.addEventListener("click", function () {
            document.body.classList.toggle("menu-open");
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = toArray(hero.querySelectorAll("[data-hero-slide]"));
        var dots = toArray(hero.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer = null;

        if (slides.length <= 1) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initSiteSearchForms() {
        toArray(document.querySelectorAll("[data-site-search]")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");

                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    input && input.focus();
                }
            });
        });
    }

    function cardSearchText(card) {
        return normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.textContent
        ].join(" "));
    }

    function updateResultCount(page, visible, total) {
        var count = page.querySelector("[data-result-count]");

        if (count) {
            count.textContent = "显示 " + visible + " / " + total + " 部影片";
        }
    }

    function initListPages() {
        toArray(document.querySelectorAll("[data-list-page]")).forEach(function (page) {
            var input = page.querySelector("[data-list-filter]");
            var list = page.querySelector("[data-card-list]");

            if (!list) {
                return;
            }

            var cards = toArray(list.children);
            var searchParams = new URLSearchParams(window.location.search);
            var query = searchParams.get("q") || "";

            function filterCards() {
                var value = normalize(input && input.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var match = !value || cardSearchText(card).indexOf(value) !== -1;
                    card.classList.toggle("hidden-by-filter", !match);
                    if (match) {
                        visible += 1;
                    }
                });

                updateResultCount(page, visible, cards.length);
            }

            if (input) {
                if (query) {
                    input.value = query;
                }

                input.addEventListener("input", filterCards);
                filterCards();
            }

            initSort(page, list);
        });
    }

    function initSort(page, list) {
        var controls = page.querySelector("[data-sort-controls]");

        if (!controls) {
            return;
        }

        controls.addEventListener("click", function (event) {
            var button = event.target.closest("button[data-sort]");

            if (!button) {
                return;
            }

            var sortKey = button.getAttribute("data-sort");
            var cards = toArray(list.children);

            controls.querySelectorAll("button").forEach(function (item) {
                item.classList.toggle("is-active", item === button);
            });

            cards.sort(function (a, b) {
                var valueA = Number(a.getAttribute("data-" + sortKey)) || 0;
                var valueB = Number(b.getAttribute("data-" + sortKey)) || 0;
                return valueB - valueA;
            });

            cards.forEach(function (card) {
                list.appendChild(card);
            });
        });
    }

    function initBackToTop() {
        var button = document.querySelector("[data-back-to-top]");

        if (!button) {
            return;
        }

        function update() {
            button.classList.toggle("is-visible", window.scrollY > 500);
        }

        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        window.addEventListener("scroll", update, { passive: true });
        update();
    }

    document.addEventListener("DOMContentLoaded", function () {
        initImages();
        initMobileMenu();
        initHero();
        initSiteSearchForms();
        initListPages();
        initBackToTop();
    });
})();
