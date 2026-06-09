(function () {
  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadHls() {
    if (window.Hls) return Promise.resolve(window.Hls);
    return import("./hls-vendor.js").then(function (module) {
      return module.H;
    }).catch(function () {
      return loadScript("https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js").then(function () {
        return window.Hls;
      });
    });
  }

  window.initMoviePlayer = function (source, title) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var button = document.querySelector("[data-player-button]");
    if (!video || !source) return;
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached) return Promise.resolve();
      attached = true;
      video.setAttribute("title", title || "");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }
      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported && Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }).catch(function () {
        video.src = source;
      });
    }

    function start() {
      attach().then(function () {
        if (cover) cover.classList.add("is-hidden");
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) promise.catch(function () {});
      });
    }

    if (cover) cover.addEventListener("click", start);
    if (button) button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) start();
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && hlsInstance.destroy) hlsInstance.destroy();
    });
  };
})();
