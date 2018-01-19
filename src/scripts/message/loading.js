import dom from "../dom/index.js";

function Loading() {
    this.el = dom.createElement("div", {"class": "rplayer-loading rplayer-hide"});
}

Loading.prototype = {
    constructor: Loading,
    show() {
        dom.removeClass(this.el, "rplayer-hide");
        return this;
    },
    hide() {
        dom.addClass(this.el, "rplayer-hide");
        return this;
    },
    toggle: function () {
        dom.toggleClass(this.el, "rplayer-hide");
        return this;
    },
    init(target) {
        target.appendChild(this.el);
        return this;
    }
};

export default Loading;