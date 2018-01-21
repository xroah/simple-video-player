import VideoProgress, {
    VIDEO_PROGRESS_ENABLE,
    VIDEO_PROGRESS_UPDATED,
    VIDEO_PROGRESS_UPDATE,
    VIDEO_PROGRESS_BUFFER,
    VIDEO_PROGRESS_DURATION
} from "./video/video_progress.js";
import VolumeControl, {VOLUME_CONTROL_MUTE, VOLUME_CONTROL_UPDATE} from "./volume_control.js";
import FullScreen from "./video/fullscreen.js";
import Popup from "../message/popup.js";
import TimeInfo from "../message/time_info.js";
import PlayControl, {PLAY_CONTROL_PAUSE, PLAY_CONTROL_PLAY, PLAY_CONTROL_TOGGLE} from "./video/play_control.js";
import dom from "../dom/index.js";
import {KEY_MAP} from "../global.js";
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
        this.el = dom.createElement("div", {"class": "rplayer-controls"});
        this.volumeControl = new VolumeControl(volume);
        this.playControl = new PlayControl();
        this.timeInfo = new TimeInfo();
        this.fullScreen = new FullScreen(parent);
        this.progress = new VideoProgress();
        this.volumePopup = new Popup("rplayer-popup-volume-info", true);
    }

    show(evt = {}) {
        let error = this.media.isError();
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (!error) {
            let mouseX = evt.clientX;
            let mouseY = evt.clientY;
            this.visible = true;
            dom.removeClass(this.el, "rplayer-hide");
            this.timer = setTimeout(() => {
                this.hide(mouseX, mouseY);
            }, 5000);
        }
        return this;
    }

    hide(mouseX, mouseY) {
        console.log(dom.isPositionInEl(this.el, mouseX, mouseY, true))
        if (!dom.isPositionInEl(this.el, mouseX, mouseY, true)) {
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
                this.playControl.toggle();
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

    initEvent() {
        let media = this.media,
            playCtrl = this.playControl,
            progress = this.progress;
        media.on(VIDEO_VOLUME_CHANGE, (evt, volume) => this.showVolumePopup(volume))
            .on(VIDEO_PLAYING, () => playCtrl.trigger(PLAY_CONTROL_PLAY))
            .on(VIDEO_PAUSE, () => playCtrl.trigger(PLAY_CONTROL_PAUSE))
            .on(VIDEO_LOAD_START, () => progress.trigger(VIDEO_PROGRESS_ENABLE, false))
            .on(VIDEO_LOADED_META, (evt, meta) => {
                let duration = meta.duration;
                this.timeInfo.updateTotalTime(duration);
                progress.trigger(VIDEO_PROGRESS_ENABLE, true);
                progress.trigger(VIDEO_PROGRESS_DURATION, duration);
            })
            .on(VIDEO_TIME_UPDATE, (evt, current) => {
                this.timeInfo.updateCurrentTime(current);
                progress.trigger(VIDEO_PROGRESS_UPDATED, current)
            })
            .on(VIDEO_PROGRESS, (evt, buffered) => progress.trigger(VIDEO_PROGRESS_BUFFER, buffered))
            .on(VIDEO_CLICK, () => media.togglePlay())
            .on(VIDEO_DBLCLICK, () => this.fullScreen.toggle());
        playCtrl.on(PLAY_CONTROL_TOGGLE, (evt, paused) => media.play(paused));
        progress.on(VIDEO_PROGRESS_UPDATE, (evt, time) => {
            media.setCurrentTime(time);
            this.timeInfo.updateCurrentTime(time);
        });
        this.volumeControl
            .on(VOLUME_CONTROL_MUTE, (evt, muted) => media.mute(muted))
            .on(VOLUME_CONTROL_UPDATE, (evt, volume) => media.setVolume(volume));
        dom.on(this.parentEl, "keydown", this.keyDown.bind(this))
            .on(this.parentEl, "mousemove", this.show.bind(this));
        return this;
    }

    init() {
        let settingsPanel = dom.createElement("div", {"class": "rplayer-settings rplayer-rt"}),
            playControl = dom.createElement("div", {"class": "rplayer-play-control rplayer-lf"}),
            el = this.el;
        this.initEvent();
        this.fullScreen.init(this.parentEl, settingsPanel);
        this.volumeControl.init(settingsPanel);
        this.playControl.init(playControl);
        this.timeInfo.init(playControl);
        this.progress.init(el);
        this.volumePopup.init(el);
        el.appendChild(settingsPanel);
        el.appendChild(playControl);
        this.parentEl.appendChild(el);
        this.show();
        return this;
    }
}