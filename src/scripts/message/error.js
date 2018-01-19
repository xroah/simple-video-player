import dom from "../dom/index.js";

function VideoError() {
    this.el = dom.createElement("div", {"class": "rplayer-error rplayer-hide"});
    this.msgEl = dom.createElement("div", {"class": "rplayer-msg"});
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
    init(target) {
        this.el.appendChild(this.msgEl);
        target.appendChild(this.el);
        return this;
    }
};

export default VideoError;