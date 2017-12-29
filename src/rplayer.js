var DEFAULT_OPTIONS = {
        autoPlay: false,
        defaultVolume: 50,
        loop: false,
        poster: "",
        preload: "metadata",
        source: "",
        msg: ""
    },
    VIDEO_EVENTS = [
        "canplay",
        "loadedmetadata",
        "progress",
        "timeupdate",
        "abort",
        "error",
        "seeking",
        "seeked",
        "ended"
    ];

function isObject(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
}

function RPlayer(selector, options) {
    var target = dom.selectElement(selector),
        config;
    if (isObject(options)) {
        config = {
            autoPlay: !!options.autoPlay,
            defaultVolume: Math.abs(parseInt(options.defaultVolume)) || DEFAULT_OPTIONS.defaultVolume,
            loop: !!options.loop,
            poster: options.poster || DEFAULT_OPTIONS.poster,
            source: options.source,
            msg: options.msg || DEFAULT_OPTIONS.msg
        };
    } else {
        config = DEFAULT_OPTIONS;
    }
    if (!config.source) {
        new Error("没有设置视频链接");
    }
    if (!target) {
        throw new Error("未选中任何元素");
    }
    this.target = target;
    this.isFullScreen = false;
    this.video = new VideoControl(config);
    this.timer = null;
}

var fn = RPlayer.prototype,
    SLIDER_SIZE = 12;

fn.toggleFullScreen = function () {
    if (this.isFullScreen = !this.isFullScreen) {
        this.requestFullScreen();
    } else {
        this.exitFullScreen();
    }
};

fn.requestFullScreen = function () {
    this.isFullScreen = true;
    dom.fullScreen(this.container)
        .addClass(this.fullScreenBtn, "fullscreen")
        .addClass(this.container, "fullscreen");
};

fn.exitFullScreen = function () {
    this.isFullScreen = false;
    dom.fullScreen(this.container, true)
        .removeClass(this.fullScreenBtn, "fullscreen")
        .removeClass(this.container, "fullscreen");
};

fn.initFullScreenEvent = function () {
    var _this = this,
        fsApi = dom.fsApi;
    if (fsApi) {
        dom.on(doc, fsApi.fullscreenchange, function () {
            if (!doc[fsApi.fullscreenElement]) {
                _this.exitFullScreen();
            }
        }).on(doc, fsApi.fullscreenerror, function () {
            _this.exitFullScreen();
        });
    }
    dom.on(this.fullScreenBtn, "click", function () {
        _this.toggleFullScreen();
    });
    return this;
};

fn.changeVolume = function (volume) {
    volume = Math.floor(volume);
    this.video.setVolume(volume);
    this.changeVolumeStyle(volume);
    return this;
};

fn.changeVolumeStyle = function (volume) {
    var cls = this.showVolumePopBtn.className,
        reg = /volume-[^\s]*/;
    cls = cls.replace(reg, "");
    if (!volume) {
        cls += "volume-mute";
    } else if (volume <= 33) {
        cls += "volume-1";
    } else if (volume <= 66) {
        cls += "volume-2";
    } else {
        cls += "volume-3";
    }
    this.volumeSlider.style.bottom = this.volumeValue.style.height = volume + "%";
    this.showVolumePopBtn.className = this.muteBtn.className = cls;
    this.currentVolume.innerHTML = Math.ceil(volume);
    return this;
};

//点击显示/隐藏设置音量面板
fn.toggleVolumeSettingsPanel = function (evt) {
    var cls = "rplayer-hide";
    if (dom.hasClass(this.volumePopup)) {
        dom.addClass(this.volumePopup, cls);
    }
    dom.hasClass(this.volumePopup, cls) ?
        dom.removeClass(this.volumePopup, cls) :
        dom.addClass(this.volumePopup, cls);
    //阻止冒泡到document, document点击事件点击面板外任意地方隐藏面板，如不阻止冒泡则显示不出来
    evt.stopPropagation();
};

//移动slider改变音量
fn.slideVolumeSlider = function (evt) {
    if (evt.button) return; //按下的鼠标不是左键则不作处理(左键evt.button=0)
    var origTop = this.volumeSlider.offsetTop + SLIDER_SIZE,
        startY = evt.clientY,
        max = this.volumeValue.parentNode.offsetHeight,
        _this = this,
        move = function (evt) {
            var y = evt.clientY,
                distance = max - (y - startY + origTop);
            distance = distance < 0 ? 0 : distance > max ? max : distance;
            distance = distance / max * 100;
            _this.changeVolume(distance);
        };
    dom.on(_this.container, "mousemove", move)
        .on(doc, "mouseup", function () {
            dom.off(_this.container, "mousemove").off(doc, "mouseup");
        });
};

fn.initVolumeEvent = function () {
    var _this = this,
        timer;
    dom.on(this.showVolumePopBtn, "click", this.toggleVolumeSettingsPanel.bind(this))
        .on(this.volumeSlider, "mousedown", this.slideVolumeSlider.bind(this))
        .on(this.volumeProgress, "click", function (evt) {
            //点击音量轨道设置音量
            var rect = this.getBoundingClientRect(),
                y = evt.clientY;
            if (evt.target === _this.volumeSlider) return;
            rect = (rect.height - y + rect.top) / rect.height * 100;
            _this.changeVolume(rect);
        }).on(_this.muteBtn, "click", function () {
        //点击静音键
        if (_this.video.isMuted()) {
            _this.video.mute();
            _this.changeVolumeStyle(0);
        } else {
            _this.video.unMute();
            _this.changeVolumeStyle(_this.video.getVolume());
        }
    });
    return this;
};

fn.togglePlay = function (btn) {
    if (this.video.isPaused()) {
        dom.addClass(btn, "paused")
        this.video.play();
    } else {
        this.video.pause();
        dom.removeClass(btn, "paused")
    }
};

fn.showPopupTimeInfo = function (evt, track, popup) {
    var duration = this.video.getDuration();
    if (duration) {
        var rect = track.getBoundingClientRect(),
            x = evt.clientX,
            distance = x - rect.left,
            width = popup.offsetWidth,
            left = distance - width / 2,
            max = rect.width - width;
        left = left < 0 ? 0 : left > max ? max : left;
        popup.innerHTML = this.video.convertTime(distance / rect.width * devicePixelRatio);
        popup.style.left = left + "px";
        dom.removeClass(popup, "rplayer-hide");
    }
};

fn.slideVideoSlider = function (evt) {
    //拖动滑块改变进度
    if (evt.button) return;
    var origLeft = this.offsetLeft,
        startX = evt.clientX,
        max = this.videoProgress.parentNode.offsetWidth,
        distance,
        _this = this,
        paused = this.video.isPaused(),
        move = function (evt) {
            var x = evt.clientX;
            distance = x - startX + origLeft;
            distance = distance < 0 ? 0 : distance > max ? max : distance;
            distance = distance / max;
            _this.videoProgress.style.width = _this.videoSlider.style.left = distance * 100 + "%";
            _this.video.pause();
        };
    dom.on(_this.container, "mousemove", move)
        .on(doc, "mouseup", function () {
            dom.off(_this.container, "mousemove").off(doc, "mouseup");
            _this.video.setCurrentTime(distance, true);
            if (!paused) {
                _this.video.play();
            }
        });
};

fn.showLoading = function () {
    dom.addClass(this.loading, "loading").removeClass(this.loading, "rplayer-hide");
};

fn.hideLoading = function () {
    dom.removeClass(this.loading, "loading").addClass(this.loading, "rplayer-hide");
};

fn.progress = function () {
    var b = this.video.getBuffered(),
        len = b.length;
    if (len & len < 100) {
        len = b.end(len - 1);
        len = len / this.video.getDuration() * 100;
        this.bufferedBar.style.width = len + "%";
    }
    if (this.video.getReadyState() < 3) {
        this.showLoading();
    }
};

fn.initPlayEvent = function () {
    var _this = this,
        videoEl = this.video.el;
    dom.on(this.playBtn, "click", function () {
        //点击播放/暂停
        _this.togglePlay(this);
    }).on(this.videoTrack, "click", function (evt) {
        //点击视频轨道改变进度
        var rect = this.getBoundingClientRect(),
            x = evt.clientX;
        if (evt.target === _this.videoSlider) return;
        rect = (x - rect.left) / rect.width;
        _this.video.setCurrentTime(rect, true);
        _this.videoProgress.style.width = _this.videoSlider.style.left = rect * 100 + "%";
    }).on(this.videoTrack, "mouseover mousemove", function (evt) {
        _this.showPopupTimeInfo(evt, this, _this.videoPopupTime);
    }).on(this.videoTrack, "mouseout", function () {
        dom.addClass(_this.videoPopupTime, "rplayer-hide");
    }).on(this.videoSlider, "mousedown", this.slideVideoSlider.bind(this))
        .on(videoEl, "loadedmetadata", function () {
            _this.totalTime.innerHTML = _this.video.convertTime(_this.video.getDuration());
        }).on(videoEl, "canplay seeked", function () {
        _this.hideLoading();
    }).on(videoEl, "progress", this.progress.bind(this))
        .on(videoEl, "timeupdate", function () {
            var progress = this.currentTime / this.duration * 100;
            _this.videoProgress.style.width = _this.videoSlider.style.left = progress + "%";
            _this.currentTime.innerHTML = _this.video.convertTime(_this.video.getCurrentTime());
        }).on(videoEl, "abort", function () {
        /*if (_this.playing) {
            this.play();
        }
        _this.videoProgress.style.width = _this.videoSlider.style.left = "0";*/
    }).on(videoEl, "error", function () {
        console.log("error")
    }).on(videoEl, "seeking", function () {
        _this.showLoading();
    }).on(videoEl, "ended", function () {
        _this.togglePlay(_this.playBtn);
        console.log("end")
    }).on(videoEl, "click", function () {
        _this.togglePlay(_this.playBtn);
    });
    return this;
};

fn.toggleVolumePopupInfo = function (volume) {
    var _this = this;
    if (dom.hasClass(this.volumePopup, "rplayer-hide")) {
        clearTimeout(this.timer);
        this.volumePopupInfo.innerHTML = this.currentVolume.innerHTML = volume;
        dom.removeClass(this.volumePopupInfo, "rplayer-hide");
        this.timer = setTimeout(function () {
            dom.addClass(_this.volumePopupInfo, "rplayer-hide");
        }, 3000);
    }
};

fn.keyDown = function (evt) {
    var key = evt.key.toLowerCase(),
        volume = this.video.getVolume(),
        //up,down, left, right为IE浏览器中的上，下按键
        //arrowup,arrowdown, arrowleft, arrowright为其他浏览器中的上，下按键
        //按上下键音量加减5
        STEP = 5,
        keyMap = {
            up: STEP,
            arrowup: STEP,
            down: -STEP,
            arrowdown: -STEP,
            left: -STEP,
            arrowleft: -STEP,
            right: STEP,
            arrowright: STEP,
            esc: "esc",
            escape: "escape"
        },
        tmp = keyMap[key];
    if (tmp) {
        evt.preventDefault();
        volume += tmp;
        console.log(volume)
        volume = volume > 100 ? 100 : volume < 0 ? 0 : volume;
        this.changeVolume(volume);
        this.toggleVolumePopupInfo(volume);
    }
};

fn.initEvent = function () {
    var _this = this;
    dom.on(doc, "click", function (evt) {
        //点击设置音频面板外任何地方隐藏
        var tgt = evt.target;
        if (_this.volumePopup !== tgt && !_this.volumePopup.contains(tgt)) {
            dom.addClass(_this.volumePopup, "rplayer-hide");
        }
    }).on(this.container, "keydown", this.keyDown.bind(this));
    return this.initPlayEvent()
        .initVolumeEvent()
        .initFullScreenEvent();

};

fn.destroy = function () {
    if (this.container) {
        this.target.removeChild(this.container);
        this.container = null;
    }
    return this;
};

fn.initElements = function () {
    var context = this.container;
    this.playBtn = dom.selectElement(".rplayer-play-btn", context);
    this.videoTrack = dom.selectElement(".rplayer-video-track", context);
    this.videoSlider = dom.selectElement(".rplayer-video-slider", context);
    this.videoProgress = dom.selectElement(".rplayer-video-progress", context);
    this.videoPopupTime = dom.selectElement(".rplayer-video-popup-info", context);
    this.currentTime = dom.selectElement(".rplayer-current-time", context);
    this.totalTime = dom.selectElement(".rplayer-total-time", context);
    this.loading = dom.selectElement(".rplayer-loading", context);
    this.bufferedBar = dom.selectElement(".rplayer-bufferd-bar", context);
    this.showVolumePopBtn = dom.selectElement(".rplayer-audio-btn", context);
    this.muteBtn = dom.selectElement(".rplayer-mute", context);
    this.volumePopup = dom.selectElement(".rplayer-volume-popup", context);
    this.volumePopupInfo = dom.selectElement(".rplayer-popup-volume-info", context);
    this.volumeSlider = dom.selectElement(".rplayer-volume-slider", context);
    this.volumeProgress = dom.selectElement(".rplayer-volume-progress", context);
    this.volumeValue = dom.selectElement(".rplayer-volume-value", context);
    this.currentVolume = dom.selectElement(".rplayer-current-volume", context);
    this.fullScreenBtn = dom.selectElement(".rplayer-fullscreen-btn", this.container);
    return this;
};

fn.initPlayState = function () {

};

fn.initialize = function () {
    this.destroy();
    this.container = doc.createElement("div");
    this.container.tabIndex = 100;
    this.container.innerHTML = tpl;
    dom.addClass(this.container, "rplayer-container");
    this.container.appendChild(this.video.init());
    this.target.appendChild(this.container);
    this.initElements()
        .initEvent()
        .changeVolume(this.video.config.defaultVolume);
    return this;
};

RPlayer.init = function (selector, options) {
    return new RPlayer(selector, options).initialize();
};