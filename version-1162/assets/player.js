import { H as Hls } from "./video-vendor-dru42stk.js";

function initPlayer(card) {
    const video = card.querySelector("video[data-src]");
    const overlay = card.querySelector("[data-player-start]");

    if (!video || !overlay) {
        return;
    }

    const source = video.getAttribute("data-src");
    let initialized = false;
    let hlsInstance = null;

    function setMessage(title, message) {
        overlay.classList.remove("is-hidden");
        overlay.innerHTML = "<strong>" + title + "</strong><em>" + message + "</em>";
    }

    function attachSource() {
        if (initialized) {
            return Promise.resolve();
        }

        initialized = true;

        if (!source) {
            setMessage("暂无播放源", "当前影片缺少可用的 m3u8 播放地址");
            return Promise.reject(new Error("Missing video source"));
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return Promise.resolve();
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);

            hlsInstance.on(Hls.Events.ERROR, function (_, data) {
                if (data && data.fatal) {
                    setMessage("播放初始化失败", "请刷新页面或稍后重试");
                    try {
                        hlsInstance.destroy();
                    } catch (error) {
                        console.warn(error);
                    }
                }
            });

            return Promise.resolve();
        }

        setMessage("浏览器不支持 HLS", "请使用新版 Chrome、Edge、Safari 或 Firefox 浏览器观看");
        return Promise.reject(new Error("HLS is not supported"));
    }

    function startPlayback() {
        attachSource()
            .then(function () {
                overlay.classList.add("is-hidden");
                return video.play();
            })
            .catch(function (error) {
                console.warn(error);
            });
    }

    overlay.addEventListener("click", startPlayback);
    video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
        if (!video.ended) {
            overlay.classList.remove("is-hidden");
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-player-card]").forEach(initPlayer);
});
