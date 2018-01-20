import dom from "./dom/index.js";
import {DEFAULT_OPTIONS, isObject, isUndefined, removeProp} from "./global.js";
import Subscriber from "./subscriber.js";
import Loading from "./message/loading.js";
import VideoError from "./message/error.js";
import VideoControl, {
    VIDEO_CAN_PLAY,
    VIDEO_ENDED,
    VIDEO_ERROR,
    VIDEO_LOAD_START,
    VIDEO_PROGRESS,
    VIDEO_SEEKING,
} from "./controls/video/video_control.js";
import Controls from "./controls/index.js";

const DEFAULT_HEIGHT = 500;

function handleConfig(options) {
    return isObject(options) ?
        {
            autoPlay: !!options.autoPlay,
            loop: !!options.loop,
            defaultVolume: Math.abs(parseInt(options.defaultVolume)) || DEFAULT_OPTIONS.defaultVolume,
            msg: options.msg || DEFAULT_OPTIONS.msg,
            poster: options.poster || DEFAULT_OPTIONS.poster,
            preload: options.preload || DEFAULT_OPTIONS.preload,
            source: options.source,
            useNativeControls: isUndefined(options.useNativeControls) ? false : options.useNativeControls
        } : DEFAULT_OPTIONS;
}

export default class RPlayer extends Subscriber {
    constructor(selector, options) {
        super();
        let target = dom.selectElement(selector),
            config = handleConfig(options);
        Subscriber.call(this);
        if (!config.source) {
            throw new Error("没有设置视频链接");
        }
        if (!target) {
            throw new Error("未选中任何元素");
        }
        this.target = target;
        this.loading = new Loading();
        this.video = new VideoControl(config);
        this.container = dom.createElement("div", {
            "tabIndex": 100, //使元素能够获取焦点
            "class": "rplayer-container"
        });
        //播放控制与原生控制二选一，如果设置了useNativeControls为true，则优先使用原生控制
        if((isUndefined(options.controls) ? true : !!options.controls) && !config.useNativeControls) {
            this.controls = new Controls(this.container, this.video, config.defaultVolume);
        }
    }

    buffer(buffered, readyState) {
        if (readyState < 3) {
            this.loading.show();
        }
    }

    playEnd() {
        this.trigger("play.end");
    }

    handleError(error) {
        if (!this.error) {
            this.error = new VideoError();
            this.error.init(this.container, this.refresh.bind(this));
        }
        this.loading.hide();
        this.error.show(error.message);
        return this;
    }

    refresh() {
        this.video.reload();
        this.error.hide();
    };

    initEvent() {
        this.video
            .on(VIDEO_LOAD_START, () => this.loading.show())
            .on(VIDEO_PROGRESS, (evt, buffered, readyState) => this.buffer(buffered, readyState))
            .on(VIDEO_SEEKING, () => this.loading.show())
            .on(VIDEO_CAN_PLAY, () => this.loading.hide())
            .on(VIDEO_ENDED, this.playEnd.bind(this))
            .on(VIDEO_ERROR, (evt, error) => this.handleError(error));
        return this;
    };

    getSource() {
        return this.video.getSource();
    };

    updateSource(src) {
        this.video.changeSource(src);
    };

    initialize() {
        let container = this.container,
            height = parseInt(getComputedStyle(this.target).height);
        if (!container.parentNode) {
            dom.css(container, "height", (height || DEFAULT_HEIGHT) + "px");
            this.video.init(container);
            this.loading.init(container);
            this.controls && this.controls.init();
            this.target.appendChild(container);
            this.initEvent();
        }
        return this;
    };
}

RPlayer.init = function (selector, options) {
    return new RPlayer(selector, options).initialize();
};