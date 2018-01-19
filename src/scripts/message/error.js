import dom from "../dom/index.js";
import {isFunction, noop} from "../global.js";

function VideoError() {
    this.el = dom.createElement("div", {"class": "rplayer-error rplayer-hide"});
    this.msgEl = dom.createElement("div", {"class": "rplayer-msg"});
    this.callback = noop();
}

VideoError.prototype = {
    constructor: VideoError,
    show(msg) {
        this.setMessage(msg);
        dom.removeClass(this.el, "rplayer-hide");
        return this;
    },
    hide() {
        dom.addClass(this.el, "rplayer-hide");
        return this;
    },
    setMessage(msg) {
        this.msgEl.innerHTML = msg;
        return this;
    },
    initEvent() {
        dom.on(this.msgEl, "click", this.callback);
        return this;
    },
    init(target, callback) {
        this.el.appendChild(this.msgEl);
        target.appendChild(this.el);
        if (isFunction(callback)) {
            this.callback = callback;
        }
        return this.initEvent();
    }
};

export default VideoError;