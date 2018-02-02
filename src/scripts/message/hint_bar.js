import dom from "../dom";
import {convertTime} from "../global.js";
import Subscriber from "../subscriber.js";

export const VIDEO_NEED_RESTART = "video.need.restart";

export default class HintBar extends Subscriber{
    constructor(props) {
        super(props);
        this.textEl = dom.createElement("span");
        this.restartEl = dom.createElement("a", {
            "href": "#",
            "class": "rplayer-restart",
            "html": "从头观看"
        });
        this.bar = dom.createElement("div", {"class": "rplayer-hint-bar rplayer-hide"});
        this.closeBtn = dom.createElement("a", {
            "class": "rplayer-close rplayer-rt",
            "html": "&times",
            "href": "#"
        });
        this.timer = null;
    }

    show(time) {
        dom.removeClass(this.bar, "rplayer-hide");
        this.textEl.innerHTML = `你上次观看到&nbsp;${convertTime(time)}`;
        if(this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.timer = setTimeout(() => this.hide(), 5000);
        return this;
    }

    hide() {
        dom.addClass(this.bar, "rplayer-hide");
        return this;
    }

    initEvent() {
        dom.on(this.bar, "click", evt => {
            let tgt = evt.target;
            if (tgt === this.restartEl) {
                this.trigger(VIDEO_NEED_RESTART);
                this.hide();
            } else if(tgt === this.closeBtn) {
                this.hide();
            }
        });
        return this;
    }

    init(target) {
        this.bar.appendChild(this.textEl);
        this.bar.appendChild(this.restartEl);
        this.bar.appendChild(this.closeBtn);
        target.appendChild(this.bar);
        return this.initEvent();
    }
}