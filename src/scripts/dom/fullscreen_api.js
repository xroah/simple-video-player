let fsApi = (function () {
    let fullScreenApi = [
            //W3C
            [
                "requestFullscreen",
                "exitFullscreen",
                "fullscreenElement",
                "fullscreenEnabled",
                "fullscreenchange",
                "fullscreenerror"
            ],
            // WebKit
            [
                "webkitRequestFullscreen",
                "webkitExitFullscreen",
                "webkitFullscreenElement",
                "webkitFullscreenEnabled",
                "webkitfullscreenchange",
                "webkitfullscreenerror"
            ],
            // Firefox
            [
                "mozRequestFullScreen",
                "mozCancelFullScreen",
                "mozFullScreenElement",
                "mozFullScreenEnabled",
                "mozfullscreenchange",
                "mozfullscreenerror"
            ],
            // IE
            [
                "msRequestFullscreen",
                "msExitFullscreen",
                "msFullscreenElement",
                "msFullscreenEnabled",
                "MSFullscreenChange",
                "MSFullscreenError"
            ]

        ],
        fsApi = null,
        defApi = fullScreenApi[0],
        tmp, support;
    for (let i = 0, len = fullScreenApi.length; i < len; i++) {
        tmp = fullScreenApi[i];
        if (tmp[1] in document) {
            support = true;
            break;
        }
    }

    if (support) {
        fsApi = {};
        tmp.forEach(function (prop, i) {
            fsApi[defApi[i]] = prop;
        });
    }
    return fsApi;
})();

export default fsApi;