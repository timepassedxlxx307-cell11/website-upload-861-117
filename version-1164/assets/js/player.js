(function () {
    window.setupMoviePlayer = function (streamUrl) {
        var video = document.querySelector("[data-player-video]");
        var layer = document.querySelector("[data-player-layer]");
        var button = document.querySelector("[data-player-button]");
        var started = false;
        var hlsInstance = null;

        function bindSource() {
            if (!video || !streamUrl || started) {
                return;
            }

            started = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function playVideo() {
            if (!video) {
                return;
            }

            bindSource();
            video.controls = true;

            if (layer) {
                layer.classList.add("is-hidden");
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (layer) {
            layer.addEventListener("click", playVideo);
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                playVideo();
            });
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!started || video.paused) {
                    playVideo();
                }
            });
        }

        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    };
}());
