import dom from "./dom/index.js";
import {doc, DEFAULT_OPTIONS, KEY_MAP, isObject, isUndefined, removeProp} from "./global.js";
import Subscriber from "./subscriber.js";
import Slider from "./controls/slider.js";
import {tpl, controls} from "./template.js";
import Loading from "./message/loading.js";
import VideoError from "./message/error.js";
import FullScreen from "./controls/video/fullscreen.js";
import VideoControl, {
    VIDEO_CAN_PLAY,
    VIDEO_DBLCLICK,
    VIDEO_ENDED,
    VIDEO_ERROR,
    VIDEO_LOAD_START,
    VIDEO_LOADED_META,
    VIDEO_PROGRESS,
    VIDEO_SEEKING,
    VIDEO_TIME_UPDATE
} from "./controls/video/video_control.js";
import VolumeControl from "./controls/volume_control.js";
import PlayControl from "./controls/video/play_control.js";
import TimeInfo from "./message/time_info.js";

let hideVolumePopTimer = null,
    hideControlsTimer = null;
const HIDE_CLASS = "rplayer-hide";
const DEFAULT_HEIGHT = 500;

function RPlayer(selector, options) {
    let target = dom.selectElement(selector),
        config;
    Subscriber.call(this);
    if (isObject(options)) {
        config = {
            autoPlay: !!options.autoPlay,
            defaultVolume: Math.abs(parseInt(options.defaultVolume)) || DEFAULT_OPTIONS.defaultVolume,
            loop: !!options.loop,
            msg: options.msg || DEFAULT_OPTIONS.msg,
            poster: options.poster || DEFAULT_OPTIONS.poster,
            preload: options.preload || DEFAULT_OPTIONS.preload,
            source: options.source
        };
    } else {
        config = DEFAULT_OPTIONS;
    }
    if (!config.source) {
        throw new Error("没有设置视频链接");
    }
    if (!target) {
        throw new Error("未选中任何元素");
    }
    this.target = target;
    this.video = new VideoControl(config);
    this.loading = new Loading();
    this.error = new VideoError();
    this.volumeControl = new VolumeControl(config.defaultVolume);
    this.playControl = new PlayControl();
    this.timeInfo = new TimeInfo();
    this.fullScreen = new FullScreen();
    this.controls = isUndefined(options.controls) ? true : !!options.controls;
    this.useNativeControls = isUndefined(options.useNativeControls) ? false : options.useNativeControls;
}

let fn = RPlayer.prototype = Object.create(Subscriber.prototype);
fn.constructor = RPlayer;

fn.toggleVolumePopupInfo = function (volume) {
    clearTimeout(hideVolumePopTimer);
    this.volumePopupInfo.innerHTML = "当前音量: " + volume;
    dom.removeClass(this.volumePopupInfo, HIDE_CLASS);
    hideVolumePopTimer = setTimeout(() => dom.addClass(this.volumePopupInfo, HIDE_CLASS), 3000);
    return this;
};

fn.keyDown = function (evt) {
    //控制条被禁用，不做处理
    let key = evt.key.toLowerCase(),
        regUpOrDown = /(?:up)|(?:down)/,
        regLeftOrRight = /(?:left)|(?:right)/,
        regEsc = /esc/,
        regSpace = /\s|(?:spacebar)/,
        tmp = KEY_MAP[key];
    if (tmp) {
        if (regLeftOrRight.test(key)) {
            this.updateProgressByStep(tmp);
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
};

//鼠标在进度条上移动显示时间信息
fn.showPopupTimeInfo = function (evt) {
    let duration = this.video.getDuration(),
        popup = this.videoPopupTime,
        mark = this.mark;
    if (duration) {
        dom.removeClass(popup, HIDE_CLASS)
            .removeClass(mark, HIDE_CLASS);
        let rect = this.progressPanel.getBoundingClientRect(),
            distance = evt.clientX - rect.left,
            width = popup.offsetWidth,
            left = distance - width / 2;
        width = rect.width - width;
        left = left < 0 ? 0 : left > width ? width : left;
        width = distance / rect.width;
        //popup.innerHTML = this.video.convertTime(width * duration);
        dom.css(popup, "left", left + "px");
        dom.css(mark, "left", width * 100 + "%");
    }
    return this;
};

fn.hidePopupTimeInfo = function () {
    dom.addClass(this.videoPopupTime, HIDE_CLASS)
        .addClass(this.mark, HIDE_CLASS);
    return this;
};

fn.updateProgressByStep = function (step) {
    let currentTime = this.video.getCurrentTime(),
        duration = this.video.getDuration();
    currentTime += step;
    currentTime = currentTime < 0 ? 0 : currentTime > duration ? duration : currentTime;
    this.video.setCurrentTime(currentTime);
    currentTime = this.video.getPlayedPercentage();
    return this.videoSlider.trigger("position.change", "h", currentTime);
};

fn.hideControls = function () {
    dom.addClass(this.controlsPanel, HIDE_CLASS);
    return this;
};

fn.showControls = function () {
    //出错了则不显示控制条
    if (!this.video.isError()) {
        clearTimeout(hideControlsTimer);
        dom.removeClass(this.controlsPanel, HIDE_CLASS);
        hideControlsTimer = setTimeout(() => this.hideControls(), 5000);
    }
    return this;
};

fn.initControlEvent = function () {
    //滑动改变进度/点击进度条改变进度
    this.videoSlider.on("slider.move.done", (evt, distance) => {
        this.video.setCurrentTime(distance, true);
    });
    this.video
        .on(VIDEO_PROGRESS, (evt, buffered, readyState) => this.buffer(buffered, readyState))
        .on(VIDEO_DBLCLICK, () => this.fullScreen.toggle());
    dom.on(this.progressPanel, "mouseover mousemove", this.showPopupTimeInfo.bind(this))
        .on(this.progressPanel, "mouseout", this.hidePopupTimeInfo.bind(this))
        .on(this.container, "keydown", this.keyDown.bind(this))
        .on(this.container, "mousemove", this.showControls.bind(this));
    return this;
};

fn.buffer = function (buffered, readyState) {
    this.bufferedBar && dom.css(this.bufferedBar, "width",  buffered + "%");
    if (readyState < 3) {
        this.loading.show();
    }
};

fn.playEnd = function () {
    this.trigger("play.end");
};

fn.handleError = function (error) {
    this.loading.hide();
    this.error.show(error.message);
    return this;
};

fn.refresh = function () {
    this.video.reload();
    this.error.hide();
};

fn.initEvent = function () {
    this.video
        .on(VIDEO_LOAD_START, () => this.loading.show())
        .on(VIDEO_SEEKING, () => this.loading.show())
        .on(VIDEO_CAN_PLAY, () => this.loading.hide())
        .on(VIDEO_ENDED, this.playEnd.bind(this))
        .on(VIDEO_ERROR, (evt, error) => this.handleError(error));
    return this;
};

fn.initControls = function () {
    let context = this.container,
        settingsPanel = dom.createElement("div", {"class": "rplayer-settings rplayer-rt"}),
        playControl = dom.createElement("div", {"class": "rplayer-play-control rplayer-lf"});
    this.controlsPanel = dom.createElement("div");
    dom.addClass(this.controlsPanel, "rplayer-controls");
    this.controlsPanel.innerHTML = controls;
    this.fullScreen.init(this.container, settingsPanel);
    this.volumeControl.init(settingsPanel, this.video);
    this.playControl.init(playControl, this.video);
    this.timeInfo.init(playControl, this.video);
    this.controlsPanel.appendChild(settingsPanel);
    this.controlsPanel.appendChild(playControl);
    this.container.appendChild(this.controlsPanel);
    this.progressPanel = dom.selectElement(".rplayer-progress-panel", context);
    this.videoPopupTime = dom.selectElement(".rplayer-popup-video-info", context);
    this.bufferedBar = dom.selectElement(".rplayer-bufferd-bar", context);
    this.volumePopupInfo = dom.selectElement(".rplayer-popup-volume-info", context);
    this.mark = dom.selectElement(".rplayer-mark", context);
    this.videoSlider = new Slider();
    this.videoSlider.init(this.progressPanel);
    return this.initControlEvent();
};


fn.offEvent = function () {
    dom.off(doc)
        .off(this.container)
        .off(this.video.el);
    return this;
};

fn.destroy = function () {
    if (this.container) {
        this.videoSlider.destroy();
        this.video.destroy();
        removeProp(this);
        this.offEvent();
    }
    return this;
};

fn.getSource = function () {
    return this.video.getSource();
};

fn.updateSource = function (src) {
    this.video.changeSource(src);
};

fn.initialize = function () {
    if (!this.container) { //防止重复初始化
        let container = dom.createElement("div", {
                tabIndex: 100 //使元素能够获取焦点
            }),
            height = parseInt(getComputedStyle(this.target).height);
        container.innerHTML = tpl;
        dom.css(container, "height", (height || DEFAULT_HEIGHT) + "px");
        this.container = container;
        this.video.init(container);
        this.loading.init(container);
        this.error.init(container, this.refresh.bind(this));
        dom.addClass(container, "rplayer-container");
        //播放控制与原生控制二选一，如果设置了useNativeControls为true，则优先使用原生控制
        if (this.controls && !this.useNativeControls) {
            this.initControls();
        } else if (this.useNativeControls) {
            this.video.showControls();
        }
        this.target.appendChild(container);
        this.initEvent();
    }
    return this;
};

RPlayer.init = function (selector, options) {
    return new RPlayer(selector, options).initialize();
};

export default RPlayer;