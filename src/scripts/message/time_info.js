import dom from "../dom/index.js";
import {doc, convertTime} from "../global.js";

export default class TimeInfo {
    constructor() {
        this.currentEl = dom.createElement("span", {"class": "rplayer-current-time"});
        this.totalEl = dom.createElement("span", {"class": "rplayer-total-time"});
    }

    updateCurrentTime(time) {
        this.currentEl.innerHTML = convertTime(time);
        return this;
    }

    updateTotalTime(time) {
        this.totalEl.innerHTML = convertTime(time);
        return this;
    }

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
}