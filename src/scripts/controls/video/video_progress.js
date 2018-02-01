import dom from "../../dom/index.js";
import Slider, {SLIDER_MOVE_DONE} from "../slider.js";
import Popup from "../../message/popup.js";
import {convertTime, PREVENT_CONTROLS_HIDE} from "../../global.js";
import Subscriber from "../../subscriber.js";

//滑动/点击改变进度后设置视频播放时间
export const VIDEO_PROGRESS_UPDATE = "video.progress.update";
//视频播放时时间改变
export const VIDEO_PROGRESS_UPDATED = "video.progress.updated";
export const VIDEO_PROGRESS_BUFFER = "video.progress.buffer";

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

    enable(enable) {
        this.slider.enabled = !!enable;
        return this;
    }

    buffer(buffered) {
        dom.css(this.bufferEl, buffered + "%");
    }

    mouseMove(evt) {
        if (this.duration) {
            //移动时防止多次触发事件
            if (!this.popup.visible) {
                this.trigger(PREVENT_CONTROLS_HIDE, true);
            }
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
        this.trigger(PREVENT_CONTROLS_HIDE, false);
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
            .on(VIDEO_PROGRESS_BUFFER, (evt, buffer) => this.buffer(buffer))
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