function VideoControl(config) {
    /*{
        autoPlay: !!options.autoPlay,
            defaultVolume: Math.abs(parseInt(options.defaultVolume)) || DEFAULT_OPTIONS.defaultVolume,
        loop: !!options.loop,
        poster: options.poster || DEFAULT_OPTIONS.poster,
        source: options.source,
        msg: options.msg || DEFAULT_OPTIONS.msg
    };*/
    this.config = config;
};

VideoControl.prototype = {
    constructor: VideoControl,
    setVolume: function (volume) {
        //音量只能设置0-1的值
        if (volume >= 1) {
            volume = volume / 100;
        }
        this.el.volume = volume;
        this.el.muted = !volume;
        return this;
    },
    getVolume: function () {
        return Math.floor(this.el.volume * 100);
    },
    mute: function (mute) {
        this.el.muted = !!mute;
        return this;
    },
    isMuted: function () {
        return this.el.muted;
    },
    autoPlay: function (play) {
        this.el.autoplay = !!play;
        return this;
    },
    isAutoPlay: function () {
        return this.el.autoplay;
    },
    play: function (play) {
        play ? this.el.play() : this.el.pause();
        return this;
    },
    isPaused: function () {
        return this.el.paused;
    },
    isError: function () {
        var err = this.el.error;
        return err ? err.code : err;
    },
    loop: function (isLoop) {
        this.el.loop = !!isLoop;
        return this;
    },
    isLoop: function () {
        return this.el.loop;
    },
    setPoster: function (poster) {
        this.el.poster = poster;
        return this;
    },
    setPreload: function (preload) {
        this.el.preload = preload;
        return this;
    },
    setCurrentTime: function (time, isPercent) {
        var duration = this.getDuration();
        if (isPercent) {
            time = duration * time;
        }
        this.el.currentTime = time;
        return this;
    },
    getCurrentTime: function () {
        return this.el.currentTime;
    },
    getDuration: function () {
        return this.el.duration;
    },
    getPlayedPercentage: function () {
        return this.getCurrentTime() / this.getDuration();
    },
    getBuffered: function (percent) {
        var buffered = this.el.buffered,
            len = buffered.length;
        if (percent && len) {
            //缓冲的百分比
            buffered = buffered.end(len - 1) / this.getDuration();
        }
        return buffered;
    },
    getReadyState: function () {
        return this.el.readyState;
    },
    showControls: function () {
        this.el.controls = true;
        return this;
    },
    convertTime: function (time) {
        var changeLen = function (num) {
                return num < 10 ? "0" + num : num.toString();
            },
            str, h, m, s;
        time = Math.ceil(time);
        if (time <= 0) {
            str = "00:00";
        } else if (time < 60) {
            str = "00:" + changeLen(time);
        } else if (time < 3600) {
            m = Math.floor(time / 60);
            s = time % 60;
            str = changeLen(m) + ":" + changeLen(s);
        } else {
            h = Math.floor(time / 3600);
            str = time % 3600;
            m = Math.floor(str / 60);
            s = str % 60;
            str = changeLen(h) + ":" + changeLen(m) + ":" + changeLen(s);
        }
        return str;
    },
    reload: function () {
        this.el.load();
        return this;
    },
    changeSource: function (src) {
        var paused = this.isPaused();
        console.log(this.source, src)
        if (this.source !== src) {
            this.source = src;
            this.initSource(src);
        }
        if (!paused) {
            this.play(true);
        }
        return this;
    },
    getSource: function () {
        return this.el.currentSrc;
    },
    initSource: function (source) {
        var frag = doc.createDocumentFragment();
        if (typeof source === "string") {
            this.el.src = source;
        } else if (Array.isArray(source)) {
            this.el.innerHTML = "";
            source.forEach(function (src) {
                var sourceEl = doc.createElement("source");
                sourceEl.src = src;
                frag.appendChild(sourceEl);
            });
            this.el.appendChild(frag);
        }
        return this;
    },
    init: function () {
        var video = doc.createElement("video"),
            text = doc.createTextNode(this.config.msg.toString());
        this.el = video;
        this.source = this.config.source;
        video.appendChild(text);
        dom.addClass(this.el, "rplayer-video");
        this.initSource(this.source)
            .autoPlay(this.config.autoPlay)
            .loop(this.config.loop)
            .setPoster(this.config.poster)
            .setPreload(this.config.preload)
            .setVolume(this.config.defaultVolume);
        return this.el;
    }
};