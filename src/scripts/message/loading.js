import dom from "../dom/index.js";

export default class Loading {
    constructor() {
        this.el = dom.createElement("div", {"class": "rplayer-loading rplayer-hide"});
    }

    show() {
        dom.removeClass(this.el, "rplayer-hide");
        return this;
    }

    hide() {
        dom.addClass(this.el, "rplayer-hide");
        return this;
    }

    toggle() {
        dom.toggleClass(this.el, "rplayer-hide");
        return this;
    }

    init(target) {
        target.appendChild(this.el);
        return this;
    }
}
