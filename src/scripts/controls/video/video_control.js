import dom from "../../dom/index.js";
import {doc, isUndefined, ERROR_TYPE} from "../../global.js";
import Subscriber from "../../subscriber.js";
import md5 from "blueimp-md5";

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
        this.videoEl = dom.createElement("video", {"class": "rplayer-video"});
        this.paused = this.videoEl.paused;
    }

    setVolume(volume) {
        //音量只能设置0-1的值
        if (volume > 1) {
            volume = volume / 100;
        }
        this.videoEl.volume = volume;
        return this;
    }
    
    getVolume() {
        return Math.floor(this.videoEl.volume * 100);
    }

    mute(mute) {
        this.videoEl.muted = isUndefined(mute) ? true : !!mute;
        return this;
    }

    isMuted() {
        return this.videoEl.muted;
    }

    autoPlay(play) {
        this.videoEl.autoplay = !!play;
        return this;
    }

    play() {
        this.paused = false;
        if (this.getReadyState() >= 3) {
            //readyState<3（视频正在缓冲不能播放）时候反复点击播放按钮会报DomException错误
            //此时不执行video元素的播放/暂停,只改变paused（video元素paused为只读）状态
            //当触发canplay事件时，如果paused为false则进行播放
            this.videoEl.play();
        }
        return this;
    }

    pause() {
        this.paused = true;
        if (this.getReadyState() >= 3) {
            this.videoEl.pause();
        }
    }

    togglePlay() {
        this.paused ? this.play() : this.pause();
        return this;
    }

    isError() {
        let err = this.videoEl.error;
        return err ? err.code : err;
    }

    loop(isLoop) {
        this.videoEl.loop = !!isLoop;
        return this;
    }

    setPoster(poster) {
        this.videoEl.poster = poster;
        return this;
    }

    setPreload(preload) {
        this.videoEl.preload = preload;
        return this;
    }

    setCurrentTime(time, scale) {
        let duration = this.getDuration();
        if (scale) {
            time = duration * scale;
        }
        this.videoEl.currentTime = time;
        return this;
    }

    getCurrentTime() {
        return this.videoEl.currentTime;
    }

    getDuration() {
        return this.videoEl.duration;
    }

    getBuffered(percent) {
        let buffered = this.videoEl.buffered,
            len = buffered.length;
        if (percent) {
            //缓冲的百分比
            return len ? buffered = buffered.end(len - 1) / this.getDuration() * 100 : null;
        }
        return buffered;
    }

    getReadyState() {
        return this.videoEl.readyState;
    }

    showControls() {
        this.videoEl.controls = true;
        return this;
    }

    reload() {
        this.videoEl.load();
        return this;
    }

    changeSource(src) {
        if (this.source !== src) {
            this.source = src;
            this.initSource(src);
        }
        if (!this.paused) {
            this.play(true);
        }
        return this;
    }

    getSource() {
        return this.videoEl.currentSrc;
    }

    initSource(source) {
        let frag = doc.createDocumentFragment();
        if (typeof source === "string") {
            this.videoEl.src = source;
        } else if (Array.isArray(source)) {
            this.videoEl.innerHTML = "";
            source.forEach(function (src) {
                let sourceEl = dom.createElement("source", {src: src});
                frag.appendChild(sourceEl);
            });
            this.videoEl.appendChild(frag);
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

    //保存播放时间到sessionStorage,以便下次播放从中断处开始
    setPlayedTime() {
        let key = md5(this.getSource());
        sessionStorage.setItem(key, this.getCurrentTime());
        return this;
    }

    getPlayedTime() {
        let key = md5(this.getSource()),
            time = sessionStorage.getItem(key);
        if (time) {
            time = parseFloat(time);
        }
        return time;
    }

    resume() {
        let time = this.getPlayedTime();
        if (time) {
            this.setCurrentTime(time);
        }
        return this;
    }

    notify(type) {
        let args = {
                [VIDEO_LOADED_META]: [{duration: this.getDuration()}],
                [VIDEO_ERROR]: [this.handleError()],
                [VIDEO_VOLUME_CHANGE]: [this.isMuted() ? 0 : this.getVolume()]
            },
            a = args[type] || [];
        switch (type) {
            case VIDEO_LOAD_START:
                this.resume();
                break;
            case VIDEO_CAN_PLAY:
                !this.paused && this.videoEl.play();
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

    //timeupdate, progress事件触发比较频繁，做单独处理(在notify中每次都要做判断)
    onTimeUpdate() {
        this.setPlayedTime();
        return this.trigger(VIDEO_TIME_UPDATE, this.getCurrentTime());
    }

    onProgress() {
        return this.trigger(VIDEO_PROGRESS, this.getBuffered(true), this.getReadyState());
    }

    initEvent() {
        let videoEl = this.videoEl;
        dom.on(videoEl, "loadedmetadata", this.notify.bind(this, VIDEO_LOADED_META))
            .on(videoEl, "timeupdate", this.onTimeUpdate.bind(this))
            .on(videoEl, "seeking", this.notify.bind(this, VIDEO_SEEKING))
            .on(videoEl, "loadstart", this.notify.bind(this, VIDEO_LOAD_START))
            .on(videoEl, "progress", this.onProgress.bind(this))
            .on(videoEl, "canplay seeked", this.notify.bind(this, VIDEO_CAN_PLAY))
            .on(videoEl, "ended", this.notify.bind(this, VIDEO_ENDED))
            .on(videoEl, "error", this.notify.bind(this, VIDEO_ERROR))
            .on(videoEl, "playing", this.notify.bind(this, VIDEO_PLAYING))
            .on(videoEl, "pause", this.notify.bind(this, VIDEO_PAUSE))
            .on(videoEl, "volumechange", this.notify.bind(this, VIDEO_VOLUME_CHANGE))
            .on(videoEl, "dblclick", this.notify.bind(this, VIDEO_DBLCLICK))
            .on(videoEl, "click", this.notify.bind(this, VIDEO_CLICK))
            .on(videoEl, "contextmenu", evt => evt.preventDefault());
    }

    init(target) {
        let video = this.videoEl,
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
}