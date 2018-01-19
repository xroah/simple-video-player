import dom from "../../dom/index.js";
import Slider, {SLIDER_MOVE_DONE, SLIDER_STATUS_CHANGE} from "../slider.js";
import {
    VIDEO_LOADED_META,
    VIDEO_PROGRESS,
    VIDEO_TIME_UPDATE,
    VIDEO_LOAD_START
} from "./video_control.js";
import Popup from "../../message/popup.js";
import {convertTime} from "../../global.js";

function VideoProgress() {
    this.slider = new Slider();
    this.panel = dom.createElement("div", {"class": "rplayer-progress-panel"});
    this.bufferEl = dom.createElement("div", {"class": "rplayer-bufferd-bar"});
    this.popup = new Popup();
    this.currentTime = this.duration = 0;
}

VideoProgress.prototype = {
    constructor: VideoProgress,
    update(current) {
        if (this.currentTime !== current) {
            this.currentTime = current;
            let percent = current / this.duration * 100 || 0;
            this.slider.updateHPosition(percent + "%");
        }
        return this;
    },
    updateByStep(step) {
        let currentTime = this.currentTime,
            duration = this.duration;
        currentTime += step;
        this.currentTime = currentTime < 0 ? 0 : currentTime > duration ? duration : currentTime;
        this.media
            .setCurrentTime(this.currentTime)
            .trigger(VIDEO_TIME_UPDATE, this.currentTime);
        return this;
    },
    buffer(buffered) {
        dom.css(this.bufferEl, buffered + "%");
    },
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
    },
    mouseOut() {
      this.popup.hide();
    },
    initEvent() {
        //滑动改变进度/点击进度条改变进度
        this.slider.on(SLIDER_MOVE_DONE, (evt, distance) => {
            let time = distance * this.duration;
            this.media.setCurrentTime(time);
            this.media.trigger(VIDEO_TIME_UPDATE, time);
        });
        dom.on(this.panel, "mouseover mousemove", this.mouseMove.bind(this))
            .on(this.panel, "mouseout", this.mouseOut.bind(this));
        this.media
            .on(VIDEO_LOAD_START, () => this.slider.trigger(SLIDER_STATUS_CHANGE, false))
            .on(VIDEO_LOADED_META, (evt, meta) => {
                this.duration = meta.duration;
                this.slider.trigger(SLIDER_STATUS_CHANGE, true);
            })
            .on(VIDEO_TIME_UPDATE, (evt, current) => this.update(current))
            .on(VIDEO_PROGRESS, (evt, buffered) => this.buffer(buffered));
        return this;
    },
    init(target, media) {
        let el = this.panel;
        this.media = media;
        el.appendChild(this.bufferEl);
        this.slider.init(el);
        this.popup.init(el, "rplayer-popup-video-info");
        target.appendChild(el);
        return this.initEvent();
    }
};

/*fn.updateProgressByStep = function (step) {
    let currentTime = this.video.getCurrentTime(),
        duration = this.video.getDuration();
    currentTime += step;
    currentTime = currentTime < 0 ? 0 : currentTime > duration ? duration : currentTime;
    this.video.setCurrentTime(currentTime);
    currentTime = this.video.getPlayedPercentage();
    return this.videoSlider.trigger("position.change", "h", currentTime);
};*/

export default VideoProgress;