(function () {
  const players = Array.from(document.querySelectorAll('[data-player-root]'));

  players.forEach(function (root) {
    const video = root.querySelector('video');
    const button = root.querySelector('[data-play-trigger]');
    const configNode = root.querySelector('script[type="application/json"]');
    let stream = '';
    let attached = false;
    let hls = null;

    try {
      stream = JSON.parse(configNode.textContent || '{}').stream || '';
    } catch (error) {
      stream = '';
    }

    function attachStream() {
      if (!video || !stream || attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        attached = true;
        return;
      }

      video.src = stream;
      attached = true;
    }

    function playVideo() {
      attachStream();

      if (!video) {
        return;
      }

      root.classList.add('is-playing');
      video.play().catch(function () {
        root.classList.remove('is-playing');
      });
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        root.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          root.classList.remove('is-playing');
        }
      });

      video.addEventListener('ended', function () {
        root.classList.remove('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
