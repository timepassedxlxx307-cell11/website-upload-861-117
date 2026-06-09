(function () {
  function startVideo(video, source) {
    if (!video || !source) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.src) {
        video.src = source;
      }
      video.play().catch(function () {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsPlayer) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              video._hlsPlayer = null;
            }
          }
        });
        video._hlsPlayer = hls;
      } else {
        video.play().catch(function () {});
      }
      return;
    }
    if (!video.src) {
      video.src = source;
    }
    video.play().catch(function () {});
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-video");
    var poster = document.querySelector(".player-poster");
    var box = document.querySelector(".player-box");

    function play() {
      if (poster) {
        poster.classList.add("is-hidden");
      }
      if (box) {
        box.classList.add("is-playing");
      }
      startVideo(video, source);
    }

    if (poster) {
      poster.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!video.src || video.paused) {
          play();
        }
      });
    }
  };
})();
