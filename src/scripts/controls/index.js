import VideoProgress from "./video/video_progress.js";
import VolumeControl from "./volume_control.js";
import FullScreen from "./video/fullscreen.js";
import Popup from "../message/popup.js";
import TimeInfo from "../message/time_info.js";
import PlayControl from "./video/play_control.js";
import dom from "../dom/index.js";
import {KEY_MAP} from "../global.js";
import {
    VIDEO_DBLCLICK,
    VIDEO_VOLUME_CHANGE,
    VIDEO_LOADED_META,
    VIDEO_TIME_UPDATE
} from "./video/video_control.js";


function Controls(parent, media, volume) {
    this.parentEl = parent;
    this.media = media;
    this.timer = null;
    this.el = dom.createElement("div", {"class": "rplayer-controls"});
    this.volumeControl = new VolumeControl(volume);
    this.playControl = new PlayControl();
    this.timeInfo = new TimeInfo();
    this.fullScreen = new FullScreen();
    this.progress = new VideoProgress();
    this.volumePopup = new Popup("rplayer-popup-volume-info", true);
}

Controls.prototype = {
    constructor: Controls,
    show() {
        let error = this.media.isError();
        if (!error) {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            dom.removeClass(this.el, "rplayer-hide");
            if(!this.hideDisabled) {
                this.timer = setTimeout(() => {
                    this.hide();
                }, 5000)
            }
        }
        return this;
    },
    hide() {
        dom.addClass(this.el, "rplayer-hide");
        return this;
    },
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
    },
    showVolumePopup(volume) {
        let text = `当前音量: ${volume}`;
        if (volume === 0) {
            text = "静音";
        }
        this.volumePopup.show(text);
        return this;
    },
    initEvent() {
        this.media
            .on(VIDEO_TIME_UPDATE, (evt, current) => this.timeInfo.updateCurrentTime(current))
            .on(VIDEO_LOADED_META, (evt, meta) => this.timeInfo.updateTotalTime(meta.duration, true))
            .on(VIDEO_VOLUME_CHANGE, (evt, muted, volume) => this.showVolumePopup(muted, volume))
            .on(VIDEO_DBLCLICK, () => this.fullScreen.toggle());
        dom.on(this.parentEl, "keydown", this.keyDown.bind(this))
            .on(this.parentEl, "mousemove", this.show.bind(this));
        return this;
    },
    init() {
        let settingsPanel = dom.createElement("div", {"class": "rplayer-settings rplayer-rt"}),
            playControl = dom.createElement("div", {"class": "rplayer-play-control rplayer-lf"}),
            el = this.el;
        this.fullScreen.init(this.container, settingsPanel);
        this.volumeControl.init(settingsPanel, this.media);
        this.playControl.init(playControl, this.media);
        this.timeInfo.init(playControl);
        this.progress.init(el, this.media);
        this.volumePopup.init(el);
        el.appendChild(settingsPanel);
        el.appendChild(playControl);
        this.parentEl.appendChild(el);
        return this.initEvent();
    }
};

export default Controls;