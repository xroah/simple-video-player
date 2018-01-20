import dom from "../../dom/index.js";
import Slider, {SLIDER_MOVE_DONE, SLIDER_STATUS_CHANGE} from "../slider.js";
import Popup from "../../message/popup.js";
import {convertTime} from "../../global.js";
import Subscriber from "../../subscriber.js";

export const VIDEO_PROGRESS_UPDATE = "video.progress.update";
export const VIDEO_PROGRESS_UPDATED = "video.progress.updated";
export const VIDEO_PROGRESS_ENABLE = "video.progress.enable";
export const VIDEO_PROGRESS_BUFFER = "video.progress.buffer";
export const VIDEO_PROGRESS_DURATION = "video.progress.duration";

export default class VideoProgress extends Subscriber {
    constructor() {
        super();
        this.slider = new Slider();
        this.panel = dom.createElement("div", {"class": "rplayer-progress-panel"});
        this.bufferEl = dom.createElement("div", {"class": "rplayer-bufferd-bar"});
        this.popup = new Popup("rplayer-popup-video-info");
        this.currentTime = this.duration = 0;
    }

    update(current, sliderMove) {
        if (this.currentTime !== current) {
            this.currentTime = current;
            let percent = current / this.duration * 100 || 0;
            !sliderMove && this.slider.updateHPosition(percent + "%");
        }
        return this;
    }

    updateByStep(step) {
        let currentTime = this.currentTime,
            duration = this.duration;
        if (duration) {
            currentTime += step;
            this.currentTime = currentTime < 0 ? 0 : currentTime > duration ? duration : currentTime;
            this.trigger(VIDEO_PROGRESS_UPDATE, this.currentTime);
        }
        return this;
    }

    buffer(buffered) {
        dom.css(this.bufferEl, buffered + "%");
    }

    mouseMove(evt) {
        if (this.duration) {
            this.popup.show();
            let rect = this.panel.getBoundingClientRect(),
                distance = evt.clientX - rect.left,
                width = this.popup.width(),
                left = distance - width / 2;
            width = rect.width - width;
            left = left < 0 ? 0 : left > width ? width : left;
            width = distance / rect.width;
            this.popup
                .updatePosition({left: left + "px"})
                .updateText(convertTime(width * this.duration));
        }
    }

    mouseOut() {
        this.popup.hide();
    }

    initEvent() {
        //滑动改变进度/点击进度条改变进度
        this.slider.on(SLIDER_MOVE_DONE, (evt, distance) => {
            let time = distance * this.duration;
            this.update(time);
            this.trigger(VIDEO_PROGRESS_UPDATE, time);
        });
        dom.on(this.panel, "mouseover mousemove", this.mouseMove.bind(this))
            .on(this.panel, "mouseout", this.mouseOut.bind(this));
        this.on(VIDEO_PROGRESS_UPDATED, (evt, time) => this.update(time))
            .on(VIDEO_PROGRESS_ENABLE, (evt, enabled) => this.slider.trigger(SLIDER_STATUS_CHANGE, enabled))
            .on(VIDEO_PROGRESS_BUFFER, (evt, buffer) => this.buffer(buffer))
            .on(VIDEO_PROGRESS_DURATION, (evt, duration) => this.duration = duration);
        return this;
    }

    init(target) {
        let el = this.panel;
        el.appendChild(this.bufferEl);
        this.slider.init(el);
        this.popup.init(el);
        target.appendChild(el);
        return this.initEvent();
    }
}