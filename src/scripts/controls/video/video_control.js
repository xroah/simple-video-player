import dom from "../../dom/index.js";
import {doc, isUndefined, ERROR_TYPE, removeProp} from "../../global.js";
import Subscriber from "../../subscriber.js";

export const VIDEO_LOADED_META = "video.loaded.meta";
export const VIDEO_TIME_UPDATE = "video.time.update";
export const VIDEO_SEEKING = "video.seeking";
export const VIDEO_LOAD_START = "video.load.start";
export const VIDEO_PROGRESS = "video.progress";
export const VIDEO_CAN_PLAY = "video.can.play";
export const VIDEO_ENDED = "video.ended";
export const VIDEO_ERROR = "video.error";
export const VIDEO_PLAYING = "video.playing";
export const VIDEO_PAUSE = "video.pause";
export const VIDEO_DBLCLICK = "video.dblclick";
export const VIDEO_CLICK = "video.click";
export const VIDEO_VOLUME_CHANGE = "video.volume.change";

export default class VideoControl extends Subscriber {
    constructor(config) {
        super();
        this.config = config;
        this.playedTime = null;
        this.el = dom.createElement("video", {"class": "rplayer-video"});
        this.paused = this.el.paused;
    }

    setVolume(volume) {
        //音量只能设置0-1的值
        if (volume > 1) {
            volume = volume / 100;
        }
        this.el.volume = volume;
        return this;
    }
    
    getVolume() {
        return Math.floor(this.el.volume * 100);
    }

    mute(mute) {
        this.el.muted = isUndefined(mute) ? true : !!mute;
        return this;
    }

    isMuted() {
        return this.el.muted;
    }

    autoPlay(play) {
        this.el.autoplay = !!play;
        return this;
    }

    play() {
        this.paused = false;
        if (this.el.networkState !== 2) {
            //networkState=2（视频正在缓冲不能播放）时候反复点击播放按钮会报DomException错误
            //此时不执行video元素的播放/暂停,只改变paused（video元素paused为只读）状态
            //当触发canplay事件时，如果paused为true则进行播放
            this.el.play();
        }
        return this;
    }

    pause() {
        this.paused = true;
        if (this.el.networkState !== 2) {
            this.el.pause();
        }
    }

    togglePlay() {
        this.paused ? this.play() : this.pause();
        return this;
    }

    isError() {
        let err = this.el.error;
        return err ? err.code : err;
    }

    loop(isLoop) {
        this.el.loop = !!isLoop;
        return this;
    }

    setPoster(poster) {
        this.el.poster = poster;
        return this;
    }

    setPreload(preload) {
        this.el.preload = preload;
        return this;
    }

    setCurrentTime(time, scale) {
        let duration = this.getDuration();
        if (scale) {
            time = duration * scale;
        }
        this.el.currentTime = time;
        return this;
    }

    getCurrentTime() {
        return this.el.currentTime;
    }

    getDuration() {
        return this.el.duration;
    }

    getBuffered(percent) {
        let buffered = this.el.buffered,
            len = buffered.length;
        if (percent) {
            //缓冲的百分比
            return len ? buffered = buffered.end(len - 1) / this.getDuration() * 100 : null;
        }
        return buffered;
    }

    getReadyState() {
        return this.el.readyState;
    }

    showControls() {
        this.el.controls = true;
        return this;
    }

    reload() {
        this.el.load();
        return this;
    }

    changeSource(src) {
        let paused = this.paused;
        if (this.source !== src) {
            this.source = src;
            this.initSource(src);
        }
        if (!paused) {
            this.play(true);
        }
        return this;
    }

    getSource() {
        return this.el.currentSrc;
    }

    initSource(source) {
        let frag = doc.createDocumentFragment();
        if (typeof source === "string") {
            this.el.src = source;
        } else if (Array.isArray(source)) {
            this.el.innerHTML = "";
            source.forEach(function (src) {
                let sourceEl = dom.createElement("source", {src: src});
                frag.appendChild(sourceEl);
            });
            this.el.appendChild(frag);
        }
        return this;
    }

    handleError() {
        let code = this.isError(),
            err, message;
        //出现错误保存当前播放进度，恢复后从当前进度继续播放
        err = ERROR_TYPE[code];
        switch (err) {
            case "MEDIA_ERR_ABORTED":
                message = "出错了";
                break;
            case "MEDIA_ERR_NETWORK":
                message = "网络错误或视频地址无效";
                break;
            case "MEDIA_ERR_DECODE":
            case "MEDIA_ERR_SRC_NOT_SUPPORTED":
                message = "解码失败,不支持的视频格式或地址无效";
        }
        message += ",点击刷新";
        return {
            code,
            message
        };
    }

    notify(type) {
        let args = {
                [VIDEO_LOADED_META]: [{duration: this.getDuration()}],
                [VIDEO_TIME_UPDATE]: [this.getCurrentTime()],
                [VIDEO_PROGRESS]: [this.getBuffered(true), this.getReadyState()],
                [VIDEO_ERROR]: [this.handleError()],
                [VIDEO_VOLUME_CHANGE]: [this.isMuted() ? 0 : this.getVolume()]
            },
            a = args[type] || [];
        switch (type) {
            case VIDEO_LOAD_START:
                if (this.playedTime) {
                    this.setCurrentTime(this.playedTime);
                    this.playedTime = 0;
                }
                break;
            case VIDEO_CAN_PLAY:
                !this.paused && this.el.play();
                break;
            case VIDEO_PLAYING:
                this.paused = false;
                break;
            case VIDEO_PAUSE:
                this.paused = true;
                break;
            case VIDEO_ERROR:
                this.playedTime = this.getCurrentTime();
        }
        return this.trigger(type, ...a);
    }

    initEvent() {
        let el = this.el;
        dom.on(el, "loadedmetadata", this.notify.bind(this, VIDEO_LOADED_META))
            .on(el, "timeupdate", this.notify.bind(this, VIDEO_TIME_UPDATE))
            .on(el, "seeking", this.notify.bind(this, VIDEO_SEEKING))
            .on(el, "loadstart", this.notify.bind(this, VIDEO_LOAD_START))
            .on(el, "progress", this.notify.bind(this, VIDEO_PROGRESS))
            .on(el, "canplay seeked", this.notify.bind(this, VIDEO_CAN_PLAY))
            .on(el, "ended", this.notify.bind(this, VIDEO_ENDED))
            .on(el, "error", this.notify.bind(this, VIDEO_ERROR))
            .on(el, "playing", this.notify.bind(this, VIDEO_PLAYING))
            .on(el, "pause", this.notify.bind(this, VIDEO_PAUSE))
            .on(el, "volumechange", this.notify.bind(this, VIDEO_VOLUME_CHANGE))
            .on(el, "dblclick", this.notify.bind(this, VIDEO_DBLCLICK))
            .on(el, "click", this.notify.bind(this, VIDEO_CLICK))
            .on(el, "contextmenu", evt => evt.preventDefault());
    }

    init(target) {
        let video = this.el,
            text = doc.createTextNode(this.config.msg.toString());
        this.source = this.config.source;
        if (this.config.useNativeControls) {
            this.showControls();
        }
        video.appendChild(text);
        target.appendChild(video);
        this.initSource(this.source)
            .autoPlay(this.config.autoPlay)
            .loop(this.config.loop)
            .setPoster(this.config.poster)
            .setPreload(this.config.preload)
            .initEvent();
        return this;
    }

    destroy() {
        dom.off(this.el);
        this.off();
        removeProp(this);
    }
}