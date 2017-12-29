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

function convertTime(d) {
    var changeLen = function (num) {
            return num < 10 ? "0" + num : num.toString();
        },
        str, h, m, s;
    d = Math.ceil(d);
    if (d <= 0) {
        str = "00:00";
    } else if (d < 60) {
        str = "00:" + changeLen(d);
    } else if (d < 3600) {
        m = Math.floor(d / 60);
        s = d % 60;
        str = changeLen(m) + ":" + changeLen(s);
    } else {
        h = Math.floor(d / 3600);
        str = d % 3600;
        m = Math.floor(str / 60);
        s = str % 60;
        str = changeLen(h) + ":" + changeLen(m) + ":" + changeLen(s);
    }
    return str;
}

function RPlayer(selector, options) {
    var target = dom.selectElement(selector);
    if (isObject(options)) {
        this.config = {
            autoPlay: !!options.autoPlay,
            defaultVolume: Math.abs(parseInt(options.defaultVolume)) || DEFAULT_OPTIONS.defaultVolume,
            loop: !!options.loop,
            poster: options.poster || DEFAULT_OPTIONS.poster,
            source: options.source,
            msg: options.msg || DEFAULT_OPTIONS.msg
        };
    } else {
        this.config = DEFAULT_OPTIONS;
    }
    if (!this.config.source) {
        // new Error("没有设置视频链接");
    }
    if (!target) {
        throw new Error("未选中任何元素");
    }
    this.target = target;
    this.playing = false;
    this.volume = this.config.defaultVolume
    this.muted = false;
    this.isFullScreen = false;
}

var fn = RPlayer.prototype,
    SLIDER_SIZE = 12,
    BASE_VOLUME = 100;

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

fn.exitFullScreen = function (btn) {
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

fn.setVolume = function (volume) {
    volume = Math.ceil(volume);
    this.videoEl.volume = volume / BASE_VOLUME;
    this.volume = volume;
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
    this.currentVolume.innerHTML = volume;
    this.videoEl.muted = this.muted = !volume;
    return this;
};

fn.initVolumeEvent = function () {
    var _this = this,
        timer;
    dom.on(this.showVolumePopBtn, "click", function (evt) {
        //点击显示/隐藏设置音量面板
        var cls = "rplayer-hide";
        if (dom.hasClass(_this.volumePopup)) {
            dom.addClass(_this.volumePopup, cls);
        }
        dom.hasClass(_this.volumePopup, cls) ? dom.removeClass(_this.volumePopup, cls) :
            dom.addClass(_this.volumePopup, cls);
        //阻止冒泡到document, document点击事件点击面板外任意地方隐藏面板，如不阻止冒泡则显示不出来
        evt.stopPropagation();
    }).on(this.volumeSlider, "mousedown", function (evt) {
        //移动slider改变音量
        if (evt.button) return; //按下的鼠标不是左键则不作处理(左键evt.button=0)
        var origTop = this.offsetTop + SLIDER_SIZE,
            startY = evt.clientY,
            max = _this.volumeValue.parentNode.offsetHeight,
            move = function (evt) {
                var y = evt.clientY,
                    distance = max - (y - startY + origTop);
                distance = distance < 0 ? 0 : distance > max ? max : distance;
                distance = distance / max * 100;
                _this.setVolume(distance);
            };
        dom.on(_this.container, "mousemove", move)
            .on(doc, "mouseup", function () {
                dom.off(_this.container, "mousemove").off(doc, "mouseup");
            });
    }).on(this.volumeProgress, "click", function (evt) {
        //点击音量轨道设置音量
        var rect = this.getBoundingClientRect(),
            y = evt.clientY;
        if (evt.target === _this.volumeSlider) return;
        rect = (rect.height - y + rect.top) / rect.height * 100;
        _this.setVolume(rect);
    }).on(_this.muteBtn, "click", function () {
        //点击静音键
        if (_this.muted = !_this.muted) {
            _this.changeVolumeStyle(0);
            _this.videoEl.mute = true;
        } else {
            _this.changeVolumeStyle(_this.volume);
            _this.videoEl.mute = false;
        }
    }).on(this.container, "keydown", function (evt) {
        var key = evt.key.toLowerCase(),
            volume = _this.volume,
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
                arrowright: STEP
            },
            tmp = keyMap[key];
        if (tmp) {
            evt.preventDefault();
            volume += tmp;
            volume = volume > 100 ? 100 : volume < 0 ? 0 : volume;
            _this.setVolume(volume);
            if (dom.hasClass(_this.volumePopup, "rplayer-hide")) {
                clearTimeout(timer);
                _this.volumePopupInfo.innerHTML = _this.currentVolume.innerHTML = _this.volume;
                dom.removeClass(_this.volumePopupInfo, "rplayer-hide");
                timer = setTimeout(function () {
                    dom.addClass(_this.volumePopupInfo, "rplayer-hide");
                }, 3000)
            }
        }
    });
    this.setVolume(this.config.defaultVolume);
    return this;
};

fn.togglePlay = function (btn) {
    if (this.playing = !this.playing) {
        dom.addClass(btn, "paused")
        this.videoEl.play();
    } else {
        this.videoEl.pause();
        dom.removeClass(btn, "paused")
    }
};

fn.showPopupTimeInfo = function (evt, track, popup) {
    if (this.videoEl.duration) {
        var rect = track.getBoundingClientRect(),
            x = evt.clientX,
            distance = x - rect.left,
            width = popup.offsetWidth,
            left = distance - width / 2,
            max = rect.width - width;
        left = left < 0 ? 0 : left > max ? max : left;
        popup.innerHTML = convertTime(distance / rect.width * this.videoEl.duration);
        popup.style.left = left + "px";
        dom.removeClass(popup, "rplayer-hide");
    }
};

fn.initPlayEvent = function () {
    var _this = this;
    dom.on(this.playBtn, "click", function () {
        //点击播放/暂停
        _this.togglePlay(this);
    }).on(this.videoTrack, "click", function (evt) {
        //点击视频轨道改变进度
        var rect = this.getBoundingClientRect(),
            x = evt.clientX;
        if (evt.target === _this.videoSlider) return;
        rect = (x - rect.left) / rect.width;
        _this.videoEl.currentTime = _this.videoEl.duration * rect;
        _this.videoProgress.style.width = _this.videoSlider.style.left = rect * 100 + "%";
    }).on(this.videoTrack, "mouseover", function (evt) {
        _this.showPopupTimeInfo(evt, this, _this.videoPopupTime);
    }).on(this.videoTrack, "mousemove", function (evt) {
        _this.showPopupTimeInfo(evt, this, _this.videoPopupTime);
    }).on(this.videoTrack, "mouseout", function () {
        dom.addClass(_this.videoPopupTime, "rplayer-hide");
    }).on(this.videoSlider, "mousedown", function (evt) {
        //拖动滑块改变进度
        if (evt.button) return;
        var origLeft = this.offsetLeft,
            startX = evt.clientX,
            max = _this.videoProgress.parentNode.offsetWidth,
            distance,
            move = function (evt) {
                var x = evt.clientX;
                distance = x - startX + origLeft;
                distance = distance < 0 ? 0 : distance > max ? max : distance;
                distance = distance / max;
                _this.videoProgress.style.width = _this.videoSlider.style.left = distance * 100 + "%";
                _this.videoEl.pause();
            };
        dom.on(_this.container, "mousemove", move)
            .on(doc, "mouseup", function () {
                dom.off(_this.container, "mousemove").off(doc, "mouseup");
                _this.videoEl.currentTime = _this.videoEl.duration * distance;
                _this.videoEl.play();
            });
    }).on(this.videoEl, "loadedmetadata", function () {
        _this.totalTime.innerHTML = convertTime(this.duration);
    }).on(this.videoEl, "canplay", function () {
        dom.removeClass(_this.loading, "loading").addClass(_this.loading, "rplayer-hide");
    }).on(this.videoEl, "progress", function () {
        var b = this.buffered,
            len = b.length;
        if (len & len < 100) {
            len = b.end(len - 1);
            len = len / this.duration * 100;
            _this.bufferedBar.style.width = len + "%";
        }
        if (this.readyState < 3) {
            dom.addClass(_this.loading, "loading").removeClass(_this.loading, "rplayer-hide");
        }
        console.log(this.readyState)
    }).on(this.videoEl, "timeupdate", function () {
        var progress = this.currentTime / this.duration * 100;
        _this.videoProgress.style.width = _this.videoSlider.style.left = progress + "%";
        _this.currentTime.innerHTML = convertTime(this.currentTime);
    }).on(this.videoEl, "abort", function () {
        if (_this.playing) {
            this.play();
        }
        _this.videoProgress.style.width = _this.videoSlider.style.left = "0";
    }).on(this.videoEl, "error", function () {
        console.log("error")
    }).on(this.videoEl, "seeking", function () {
        dom.addClass(_this.loading, "loading").removeClass(_this.loading, "rplayer-hide");
    }).on(this.videoEl, "seeked", function () {
        dom.removeClass(_this.loading, "loading").addClass(_this.loading, "rplayer-hide");
    }).on(this.videoEl, "ended", function () {
        _this.togglePlay(_this.playBtn);
        console.log("end")
    }).on(this.videoEl, "click", function () {
        _this.togglePlay(_this.playBtn);
    });
    return this;
};

fn.initEvent = function () {
    var _this = this;
    console.log(this)
    dom.on(doc, "click", function (evt) {
        //点击设置音频面板外任何地方隐藏
        var tgt = evt.target;
        if (_this.volumePopup !== tgt && !_this.volumePopup.contains(tgt)) {
            dom.addClass(_this.volumePopup, "rplayer-hide");
        }
    });
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

fn.initSource = function (el) {
    var source = this.config.source
    if (typeof source === "string") {
        el.src = source;
    } else if (Array.isArray(source)) {
        source.forEach(function (src) {
            var sourceEl = doc.createElement("source");
            sourceEl.src = src;
            el.appendChild(sourceEl);
        });
    }
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

fn.initialize = function () {
    this.destroy();
    this.container = doc.createElement("div");
    this.container.tabIndex = 100;
    this.container.innerHTML = tpl;
    this.initSource(this.videoEl = doc.createElement("video"));
    this.videoEl.appendChild(doc.createTextNode(this.config.msg));
    dom.addClass(this.container, "rplayer-container").addClass(this.videoEl, "rplayer-video");
    this.container.appendChild(this.videoEl);
    this.target.appendChild(this.container);
    this.initElements()
        .initEvent();
    return this;
};

RPlayer.init = function (selector, options) {
    return new RPlayer(selector, options).initialize();
};