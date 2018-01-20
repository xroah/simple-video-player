import dom from "../dom/index.js";
import {doc, convertTime} from "../global.js";
import {VIDEO_TIME_UPDATE, VIDEO_LOADED_META} from "../controls/video/video_control.js";

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
    initEvent() {
        this.media
            .on(VIDEO_TIME_UPDATE, (evt, current) => this.updateTime(current))
            .on(VIDEO_LOADED_META, (evt, meta) => this.updateTime(meta.duration, true));
        return this;
    },
    init(target, media) {
        let el = dom.createElement("span", {"class": "rplayer-time-info"}),
            text = doc.createTextNode("/");
        this.currentEl.innerHTML = this.totalEl.innerHTML = "00:00";
        this.media = media;
        el.appendChild(this.currentEl);
        el.appendChild(text);
        el.appendChild(this.totalEl);
        target.appendChild(el);
        return this.initEvent();
    }
};

export default TimeInfo;