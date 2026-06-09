var Hls = window.Hls;

var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

players.forEach(function (shell) {
  var video = shell.querySelector('video');
  var button = shell.querySelector('[data-play-button]');
  var stream = shell.getAttribute('data-stream');
  var hlsInstance = null;

  var start = function () {
    if (!video || !stream) {
      return;
    }

    if (button) {
      button.classList.add('is-hidden');
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = stream;
      }
      video.play().catch(function () {});
      return;
    }

    if (Hls && Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.play().catch(function () {});
      }
      return;
    }

    if (!video.src) {
      video.src = stream;
    }
    video.play().catch(function () {});
  };

  if (button) {
    button.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
  }
});
