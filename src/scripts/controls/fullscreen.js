import dom from "../dom/index.js";
import {doc} from "../global.js";
import fsApi from "../dom/fullscreen_api.js";

export default class FullScreen {
    constructor(el) {
        this.el = el;
        this.isFullScreen = false;
        this.btn = dom.createElement("button", {"class": "rplayer-fullscreen-btn rplayer-rt"});
    }
    request() {
        this.isFullScreen = true;
        fsApi ?
            this.el[fsApi.requestFullscreen]() :
            this.fullPage();
        dom.addClass(this.el, "rplayer-fullscreen")
            .addClass(this.btn, "rplayer-fullscreen");
        return this;
    }

    exit() {
        this.isFullScreen = false;
        fsApi ?
            doc[fsApi.exitFullscreen]() :
            this.fullPage(true);
        dom.removeClass(this.btn, "rplayer-fullscreen")
            .removeClass(this.el, "rplayer-fullscreen");
        return this;
    }

    toggle() {
        return (this.isFullScreen = !this.isFullScreen) ?
            this.request() :
            this.exit();
    }

    fullPage(exit) {
        //不支持全屏的浏览器铺满页面可视区域
        exit ?
            dom.removeClass(this.el, "rplayer-fixed") :
            dom.addClass(this.el, "rplayer-fixed");
        return this;
    }

    initEvent() {
        if (fsApi) {
            dom.on(doc, fsApi.fullscreenchange, () => {
                if (!doc[fsApi.fullscreenElement]) {
                    this.exit();
                }
            }).on(doc, fsApi.fullscreenerror, () => {
                this.exit();
            });
        }
        dom.on(this.btn, "click", this.toggle.bind(this));
        return this;
    }

    init(target) {
        target.appendChild(this.btn);
        return this.initEvent();
    }
}
