(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupHero() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
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

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupLibrary() {
    var library = document.getElementById("movieLibrary");
    var search = document.getElementById("movieSearch");
    var items = library ? Array.prototype.slice.call(library.querySelectorAll(".movie-filter-item")) : [];
    if (!library || !items.length) {
      return;
    }
    var state = {
      q: "",
      region: "all",
      year: "all"
    };
    var params = new URLSearchParams(window.location.search);
    if (params.get("q")) {
      state.q = normalize(params.get("q"));
      if (search) {
        search.value = params.get("q");
      }
    }
    if (params.get("region")) {
      state.region = params.get("region");
    }
    if (params.get("year")) {
      state.year = params.get("year");
    }

    function syncButtons() {
      Array.prototype.slice.call(document.querySelectorAll("[data-filter-group]")).forEach(function (row) {
        var group = row.getAttribute("data-filter-group");
        Array.prototype.slice.call(row.querySelectorAll(".filter-button")).forEach(function (button) {
          button.classList.toggle("is-active", button.getAttribute("data-value") === state[group]);
        });
      });
    }

    function apply() {
      items.forEach(function (item) {
        var text = normalize(item.getAttribute("data-search"));
        var region = item.getAttribute("data-region") || "other";
        var year = item.getAttribute("data-year") || "";
        var matched = true;
        if (state.q && text.indexOf(state.q) === -1) {
          matched = false;
        }
        if (state.region !== "all" && region !== state.region) {
          matched = false;
        }
        if (state.year !== "all" && year !== state.year) {
          matched = false;
        }
        item.classList.toggle("is-hidden", !matched);
      });
      syncButtons();
    }

    if (search) {
      search.addEventListener("input", function () {
        state.q = normalize(search.value);
        apply();
      });
    }

    Array.prototype.slice.call(document.querySelectorAll(".filter-button")).forEach(function (button) {
      button.addEventListener("click", function () {
        var row = button.closest("[data-filter-group]");
        if (!row) {
          return;
        }
        state[row.getAttribute("data-filter-group")] = button.getAttribute("data-value");
        apply();
      });
    });

    apply();
  }

  window.SitePlayer = {
    mount: function (videoId, source) {
      ready(function () {
        var video = document.getElementById(videoId);
        if (!video) {
          return;
        }
        var shell = video.closest(".player-shell");
        var cover = shell ? shell.querySelector(".player-cover") : null;
        var attached = false;
        var hls = null;

        function message(text) {
          if (!shell) {
            return;
          }
          var box = shell.querySelector(".player-message");
          if (!box) {
            box = document.createElement("div");
            box.className = "player-message";
            shell.appendChild(box);
          }
          box.textContent = text;
        }

        function attach() {
          if (attached) {
            return;
          }
          attached = true;
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                message("播放暂时不可用，请稍后再试");
              }
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
          } else {
            message("播放暂时不可用，请稍后再试");
          }
        }

        function start() {
          attach();
          video.controls = true;
          if (cover) {
            cover.classList.add("is-hidden");
          }
          var action = video.play();
          if (action && typeof action.catch === "function") {
            action.catch(function () {
              if (cover) {
                cover.classList.remove("is-hidden");
              }
            });
          }
        }

        if (cover) {
          cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          }
        });
        window.addEventListener("pagehide", function () {
          if (hls) {
            hls.destroy();
          }
        });
      });
    }
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupLibrary();
  });
})();
