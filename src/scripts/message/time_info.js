import dom from "../dom/index.js";
import {doc, convertTime} from "../global.js";

function TimeInfo() {
    this.currentEl = dom.createElement("span", {"class": "rplayer-current-time"});
    this.totalEl = dom.createElement("span", {"class": "rplayer-total-time"});
}

TimeInfo.prototype = {
    constructor: TimeInfo,
    updateTime(time = 0, total) {
        let el = total ? this.totalEl : this.currentEl;
        el.innerHTML = convertTime(time);
        return this;
    },
    updateCurrentTime(time) {
        this.currentEl.innerHTML = convertTime(time);
        return this;
    },
    updateTotalTime(time) {
        this.totalEl.innerHTML = convertTime(time);
        return this;
    },
    init(target) {
        let el = dom.createElement("span", {"class": "rplayer-time-info"}),
            text = doc.createTextNode("/");
        this.currentEl.innerHTML = this.totalEl.innerHTML = "00:00";
        el.appendChild(this.currentEl);
        el.appendChild(text);
        el.appendChild(this.totalEl);
        target.appendChild(el);
        return this;
    }
};

export default TimeInfo;