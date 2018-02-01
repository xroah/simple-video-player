import VideoProgress, {
    VIDEO_PROGRESS_UPDATED,
    VIDEO_PROGRESS_UPDATE,
    VIDEO_PROGRESS_BUFFER,
} from "./video/video_progress.js";
import VolumeControl, {VOLUME_CONTROL_MUTE, VOLUME_CONTROL_UPDATE} from "./video/volume_control.js";
import FullScreen from "./fullscreen.js";
import Popup from "../message/popup.js";
import TimeInfo from "../message/time_info.js";
import dom from "../dom/index.js";
import {KEY_MAP, PREVENT_CONTROLS_HIDE} from "../global.js";
import {
    VIDEO_VOLUME_CHANGE,
    VIDEO_LOAD_START,
    VIDEO_LOADED_META,
    VIDEO_PROGRESS,
    VIDEO_TIME_UPDATE,
    VIDEO_PAUSE,
    VIDEO_PLAYING,
    VIDEO_CLICK,
    VIDEO_DBLCLICK
} from "./video/video_control.js";

export default class Controls {
    constructor(parent, media, volume) {
        this.parentEl = parent;
        this.media = media;
        this.timer = null;
        //视频是否允许点击播放/改变进度
        //第一次开始加载是不允许改变
        this.hidePrevented = this.enabled = false;
        this.el = dom.createElement("div", {"class": "rplayer-controls"});
        this.playBtn = dom.createElement("button", {"class": "rplayer-play-btn"});
        this.volumeControl = new VolumeControl(volume);
        this.timeInfo = new TimeInfo();
        this.fullScreen = new FullScreen(parent);
        this.progress = new VideoProgress();
        this.volumePopup = new Popup("rplayer-popup-volume-info", true);
    }

    show(evt = {}) {
        let error = this.media.isError();
        //出错了则不显示控制条
        if (!error) {
            let mouseX = evt.clientX;
            let mouseY = evt.clientY;
            this.visible = true;
            dom.removeClass(this.el, "rplayer-hide");
            this.timingHide(mouseX, mouseY);
        }
        return this;
    }

    timingHide(mouseX = 0, mouseY = 0) {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.timer = setTimeout(() => {
            this.hide(mouseX, mouseY);
        }, 5000);
        return this;
    }

    hide(mouseX, mouseY) {
        if (!dom.isPositionInEl(this.el, mouseX, mouseY, true) && !this.hidePrevented) {
            dom.addClass(this.el, "rplayer-hide");
        }
        return this;
    }

    keyDown(evt) {
        let key = evt.key.toLowerCase(),
            regUpOrDown = /(?:up)|(?:down)/,
            regLeftOrRight = /(?:left)|(?:right)/,
            regEsc = /esc/,
            regSpace = /\s|(?:spacebar)/,
            tmp = KEY_MAP[key];
        if (tmp) {
            if (regLeftOrRight.test(key)) {
                this.progress.updateByStep(tmp);
            } else if (regUpOrDown.test(key)) {
                this.volumeControl.updateVolumeByStep(tmp);
            } else if (regEsc.test(key)) {
                this.fullScreen.exit();
            } else if (regSpace.test(key)) {
                this.togglePlay();
            }else {
                this.fullScreen.toggle();
            }
        }
        evt.preventDefault();
    }

    showVolumePopup(volume) {
        let text = `当前音量: ${volume}`;
        if (volume === 0) {
            text = "静音";
        }
        this.volumePopup.show(text);
        return this;
    }

    updateMeta(meta) {
        let duration = meta.duration,
            progress = this.progress;
        this.timeInfo.updateTotalTime(duration);
        progress.enable(this.enabled = true);
        progress.duration = duration;
    }

    updateTime(current) {
        this.timeInfo.updateCurrentTime(current);
        this.progress.trigger(VIDEO_PROGRESS_UPDATED, current)
    }

    updateProgress(time) {
        this.media.setCurrentTime(time);
        this.timeInfo.updateCurrentTime(time);
    }

    play() {
        dom.addClass(this.playBtn, "rplayer-paused");
        return this;
    }

    pause() {
        dom.removeClass(this.playBtn, "rplayer-paused");
        return this;
    }

    togglePlay() {
        if (this.enabled) {
            this.media.togglePlay();
            this.media.paused ? this.pause() : this.play();
        }
    }

    initEvent() {
        let media = this.media,
            progress = this.progress,
            toggle = this.togglePlay.bind(this),
            preventHide = function(evt, hidePrevented) {
                //如果接收到prevent hide事件，hidePrevented为false则定时隐藏控制条
                if (!(this.hidePrevented = hidePrevented)) {
                    this.timingHide();
                }
            };
        preventHide = preventHide.bind(this);
        media.on(VIDEO_VOLUME_CHANGE, (evt, volume) => this.showVolumePopup(volume))
            .on(VIDEO_LOAD_START, () => {
                this.pause();
                this.progress.enable(this.enabled = false)
            })
            .on(VIDEO_LOADED_META, (evt, meta) => this.updateMeta(meta))
            .on(VIDEO_TIME_UPDATE, (evt, current) => this.updateTime(current))
            .on(VIDEO_PROGRESS, (evt, buffered) => progress.trigger(VIDEO_PROGRESS_BUFFER, buffered))
            .on(VIDEO_PLAYING, this.play.bind(this))
            .on(VIDEO_PAUSE, this.pause.bind(this))
            .on(VIDEO_CLICK, toggle)
            .on(VIDEO_DBLCLICK, () => this.fullScreen.toggle());
        progress
            .on(VIDEO_PROGRESS_UPDATE, (evt, time) => this.updateProgress(time))
            .on(PREVENT_CONTROLS_HIDE, preventHide);
        this.volumeControl
            .on(VOLUME_CONTROL_MUTE, (evt, muted) => media.mute(muted))
            .on(VOLUME_CONTROL_UPDATE, (evt, volume) => media.setVolume(volume))
            .on(PREVENT_CONTROLS_HIDE, preventHide);
        dom.on(this.parentEl, "keydown", this.keyDown.bind(this))
            .on(this.parentEl, "mousemove", this.show.bind(this))
            .on(this.playBtn, "click", toggle);
        return this;
    }

    init() {
        let settingsPanel = dom.createElement("div", {"class": "rplayer-settings rplayer-rt"}),
            playControl = dom.createElement("div", {"class": "rplayer-play-control rplayer-lf"}),
            el = this.el;
        this.fullScreen.init(settingsPanel);
        this.volumeControl.init(settingsPanel);
        playControl.appendChild(this.playBtn);
        this.timeInfo.init(playControl);
        this.progress.init(el);
        this.volumePopup.init(el);
        el.appendChild(playControl);
        el.appendChild(settingsPanel);
        this.parentEl.appendChild(el);
        this.show();
        return this.initEvent();
    }
}