;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.RPlayer = factory();
  }
}(this, function() {
"use strict";
var doc = document,
    guid = 1,
    SLIDER_SIZE = 12,
    DEFAULT_OPTIONS = {
    autoPlay: false,
    defaultVolume: 50,
    loop: false,
    poster: "",
    preload: "metadata",
    source: "",
    msg: ""
};
var dom = {
        handlers: {}
    };

function isFunction(fn) {
    return Object.prototype.toString.call(fn) === "[object Function]";
}

dom.hasClass = function (el, cls) {
    if (el.classList) {
        return el.classList.contains(cls);
    }
    return new RegExp(cls).test(el.className);
};

dom.addClass = function (el, cls) {
    if (!this.hasClass(el, cls)) {
        if (el.classList) {
            el.classList.add(cls);
        } else {
            el.className += " " + cls;
        }
    }
    return this;
};

dom.removeClass = function (el, cls) {
    var reg = new RegExp("\\s*" + cls + "\\s*");
    if (this.hasClass(el, cls)) {
        if (el.classList) {
            el.classList.remove(cls);
        } else {
            el.className = el.className.replace(reg, " ").trim();
        }
    }
    return this;
};

dom.fullScreen = function (el, exit) {
    var fsApi = this.fsApi;
    if (fsApi) {
        exit ? doc[fsApi.exitFullscreen]() : el[fsApi.requestFullscreen]();
    } else {
        this.fullPage(el, exit);
    }
    return this;
};

//不支持全屏的浏览器，在网页内铺满窗口
dom.fullPage = function (el, exit) {
    if (exit) {
        dom.removeClass(el, "fixed");
    } else {
        dom.addClass(el, "fixed");
    }
};

//选择元素， 只选中一个
dom.selectElement = function (selector, context) {
    var ret,
        reg = /^#[^>~+\[\]\s]+$/; //匹配id选择器
    context = context || doc;
    if (selector) {
        if (selector.nodeName) {
            ret = selector;
        } else if (typeof selector === "string") {
            if (reg.test(selector)) {
                ret = doc.getElementById(selector.substring(1));
                console.log(selector, ret)
            } else {
                ret = context.querySelector(selector);
            }
        }
    }
    return ret;
};

dom._on = function (el, type, callback) {
    var id = el.guid,
        handler;
    if (!id) {
        id = guid++;
        Object.defineProperty(el, "guid", {
            value: id
        });
    }
    handler = this.handlers[id];
    if (!handler) {
        handler = this.handlers[id] = {};
        handler[type] = [];
    } else if (!handler[type]) {
        handler[type] = [];
    }
    handler[type].push(callback);
    el.addEventListener(type, callback);
};

dom.on = function (selector, type, callback, off) {
    var el = this.selectElement(selector),
        i, t;
    if (el) {
        type = type.split(" ");
        i = type.length;
        if (isFunction(callback)) {
            for (; i--;) {
                t = type[i];
                off ? this._off(el, t, callback) :
                    this._on(el, t, callback);
            }
        } else {
            this._off(el, type);
        }
    }
    return this;
};

dom._off = function (el, type, callback) {
    var id = el.guid,
        handlers = dom.handlers[id],
        i = 0, len;
    if (handlers && (handlers = handlers[type])) {
        len = handlers.length;
        if (callback) {
            for (; i < len; i++ ) {
                if (handlers[i] === callback) {
                    handlers.splice(i, 1);
                    el.removeEventListener(type, callback);
                    break;
                }
            }
        } else {
            handlers.forEach(function (fn) {
                el.removeEventListener(type, fn);
            });
            dom.handlers[type] = [];
        }
    };
};

dom.off = function (selector, type, callback) {
    return this.on(selector, type, callback, true);
};

dom.once = function (selector, type, callback) {
    var cb, _this = this;
    if (isFunction(callback)) {
        cb = function () {
            var args = Array.prototype.slice.call(arguments);
            callback.apply(this, args);
            _this.off(selector, type, cb);
        };
        this.on(selector, type, cb);
    }
};

function isSupportFullScreen() {
    var fullScreenApi = [
            //W3C
            [
                "requestFullscreen",
                "exitFullscreen",
                "fullscreenElement",
                "fullscreenEnabled",
                "fullscreenchange",
                "fullscreenerror"
            ],
            // WebKit
            [
                "webkitRequestFullscreen",
                "webkitExitFullscreen",
                "webkitFullscreenElement",
                "webkitFullscreenEnabled",
                "webkitfullscreenchange",
                "webkitfullscreenerror"
            ],
            // Firefox
            [
                "mozRequestFullScreen",
                "mozCancelFullScreen",
                "mozFullScreenElement",
                "mozFullScreenEnabled",
                "mozfullscreenchange",
                "mozfullscreenerror"
            ],
            // IE
            [
                "msRequestFullscreen",
                "msExitFullscreen",
                "msFullscreenElement",
                "msFullscreenEnabled",
                "MSFullscreenChange",
                "MSFullscreenError"
            ]

        ],
        fsApi = null,
        defApi = fullScreenApi[0],
        i = 0,
        len = fullScreenApi.length,
        tmp, support;
    for (; i < len; i++) {
        tmp = fullScreenApi[i];
        if (tmp[1] in document) {
            support = true;
            break;
        }
    }

    if (support) {
        fsApi = {};
        tmp.forEach(function (prop, i) {
            fsApi[defApi[i]] = prop;
        });
    }
    return fsApi;
};

dom.fsApi = isSupportFullScreen();

var tpl = '<div class="rplayer-loading rplayer-hide"></div>' +
    '    <div class="rplayer-controls">' +
    '        <div class="rplayer-popup-info rplayer-video-popup-info rplayer-hide">10:00</div>' +
    '        <div class="rplayer-progress-panel">' +
    '            <div class="rplayer-progress rplayer-video-track">' +
    '                <div class="rplayer-bufferd-bar"></div>' +
    '                <div class="rplayer-progress-track">' +
    '                    <div class="rplayer-bar rplayer-video-progress"></div>' +
    '                    <div class="rplayer-slider rplayer-video-slider"></div>' +
    '                </div>' +
    '            </div>' +
    '        </div>' +
    '        <div class="rplayer-play-control rplayer-lf">' +
    '            <button type="button" class="rplayer-play-btn"></button>' +
    '            <span class="rplayer-time-info">' +
    '                        <span class="rplayer-current-time">00:00</span>/' +
    '                        <span class="rplayer-total-time">00:00</span>' +
    '                    </span>' +
    '        </div>' +
    '        <div class="rplayer-settings rplayer-rt">' +
    '            <button type="button" class="rplayer-fullscreen-btn rplayer-rt"></button>' +
    '            <div class="rplayer-audio-control rplayer-rt">' +
    '                <div class="rplayer-popup-info rplayer-popup-volume-info rplayer-hide">10:00</div>' +
    '                <button type="button" class="rplayer-audio-btn volume-1"></button>' +
    '                <div class="rplayer-volume-popup rplayer-hide">' +
    '                    <span class="rplayer-current-volume">12</span>' +
    '                    <div class="rplayer-progress rplayer-volume-progress">' +
    '                        <div class="rplayer-audio-track">' +
    '                            <div class="rplayer-bar rplayer-volume-value"></div>' +
    '                            <div class="rplayer-slider rplayer-volume-slider"></div>' +
    '                        </div>' +
    '                    </div>' +
    '                    <button class="rplayer-mute volume-1"></button>' +
    '                </div>' +
    '            </div>' +
    '        </div>' +
    '    </div>';
function VideoControl (config) {
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
    mute: function () {
        this.el.muted = true;
        return this;
    },
    unMute: function () {
        this.el.muted = false;
      return this;
    },
    isMuted: function () {
        return this.el.muted;
    },
    play: function () {
        this.el.play();
        return this;
    },
    pause: function () {
        this.el.pause();
        return this;
    },
    isPaused: function () {
        return this.el.paused;
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
    getBuffered: function () {
        return this.el.buffered;
    },
    getReadyState: function () {
        return this.el.readyState;
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
        if (this.source !== src) {
            this.source = src;
            this.initSource();
        }
        if (!paused) {
            this.play();
        }
        return this;
    },
    initSource: function () {
        var source = this.config.source,
            frag = doc.createDocumentFragment();
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
        video.appendChild(text);
        dom.addClass(this.el, "rplayer-video");
        this.initSource()
            .setVolume(this.config.defaultVolume);
        return this.el;
    }
};
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

var fn = RPlayer.prototype;

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

fn.updateVolume = function (volume) {
    volume = Math.floor(volume);
    this.video.setVolume(volume);
    this.updateVolumeStyle(volume);
    return this;
};

fn.updateVolumeByStep = function (step) {
    var volume = this.video.getVolume();
    volume += step;
    volume = volume > 100 ? 100 : volume < 0 ? 0 : volume;
    this.updateVolume(volume);
    this.toggleVolumePopupInfo(volume);
};

fn.updateVolumeStyle = function (volume) {
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
            _this.updateVolume(distance);
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
            //if (evt.target === _this.volumeSlider) return;
            rect = (rect.height - y + rect.top) / rect.height * 100;
            _this.updateVolume(rect);
        }).on(_this.muteBtn, "click", function () {
        //点击静音键
        if (_this.video.isMuted()) {
            _this.video.unMute();
            _this.updateVolumeStyle(_this.video.getVolume());
        } else {
            _this.video.mute();
            _this.updateVolumeStyle(0);
        }
    });
    return this;
};

fn.togglePlay = function () {
    if (this.video.isPaused()) {
        dom.addClass(this.playBtn, "paused")
        this.video.play();
    } else {
        this.video.pause();
        dom.removeClass(this.playBtn, "paused")
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
        popup.innerHTML = this.video.convertTime(distance / rect.width * duration);
        popup.style.left = left + "px";
        dom.removeClass(popup, "rplayer-hide");
    }
};

//拖动滑块改变进度
fn.slideVideoSlider = function (evt) {
    if (evt.button) return;
    var origLeft = this.videoSlider.offsetLeft,
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
            _this.updateProgressPosition(distance);
            _this.video.pause();
        };
    dom.on(_this.container, "mousemove", move)
        .on(doc, "mouseup", function () {
            dom.off(_this.container, "mousemove").off(doc, "mouseup");
            distance && _this.video.setCurrentTime(distance, true);
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
    if (len && len < 100) {
        len = b.end(len - 1);
        len = len / this.video.getDuration() * 100;
        this.bufferedBar.style.width = len + "%";
    }
    if (this.video.getReadyState() < 3) {
        this.showLoading();
    }
};

fn.updateProgressPosition = function (progress) {
    progress = progress || this.video.getPlayedPercentage();
    this.videoProgress.style.width = this.videoSlider.style.left = progress * 100 + "%";
    return this;
};

fn.updateProgressByStep = function (step) {
    var currentTime = this.video.getCurrentTime(),
        duration = this.video.getDuration();
    currentTime += step;
    currentTime = currentTime < 0 ? 0 : currentTime > duration ? duration : currentTime;
    this.video.setCurrentTime(currentTime);
    this.updateProgressPosition().updateCurrentTime();
};

fn.updateCurrentTime = function () {
    this.currentTime.innerHTML = this.video.convertTime(this.video.getCurrentTime());
    return this;
};

fn.updateTotalTime = function () {
    this.totalTime.innerHTML = this.video.convertTime(this.video.getDuration());
    return this;
};

fn.initPlayEvent = function () {
    var _this = this,
        videoEl = this.video.el;
    dom.on(this.playBtn, "click", function () {
        //点击播放/暂停
        _this.togglePlay();
    }).on(this.videoTrack, "click", function (evt) {
        //点击视频轨道改变进度
        var rect = this.getBoundingClientRect(),
            x = evt.clientX;
        //if (evt.target === _this.videoSlider) return;
        rect = (x - rect.left) / rect.width;
        _this.video.setCurrentTime(rect, true);
        _this.updateProgressPosition(rect);
    }).on(this.videoTrack, "mouseover mousemove", function (evt) {
        _this.showPopupTimeInfo(evt, this, _this.videoPopupTime);
    }).on(this.videoTrack, "mouseout", function () {
        dom.addClass(_this.videoPopupTime, "rplayer-hide");
    }).on(this.videoSlider, "mousedown", this.slideVideoSlider.bind(this))
        .on(videoEl, "loadedmetadata", function () {
            _this.updateTotalTime();
        }).on(videoEl, "canplay seeked", function () {
        _this.hideLoading();
    }).on(videoEl, "progress", this.progress.bind(this))
        .on(videoEl, "timeupdate", function () {
            _this.updateProgressPosition().updateCurrentTime();
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
        _this.togglePlay();
        console.log("end")
    }).on(videoEl, "click", function () {
        _this.togglePlay();
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
        //up,down, left, right为IE浏览器中的上，下按键
        //arrowup,arrowdown, arrowleft, arrowright为其他浏览器中的上，下按键
        //按上下键音量加减5
        regUpOrDown = /(up)|(down)/,
        regLeftOrRight = /(left)|(right)/,
        //regEsc = /esc/,
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
    console.log(tmp)
    if (tmp) {
        if (regLeftOrRight.test(key)) {
            this.updateProgressByStep(tmp);
        } else if (regUpOrDown.test(key)) {
            this.updateVolumeByStep(tmp);
        } else {// if (regEsc.test(key)) {
            this.toggleFullScreen();
        }
        evt.preventDefault();
    } else if (key === " " || key === "space") {
        this.togglePlay();
        evt.preventDefault();
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
        .updateVolume(this.video.config.defaultVolume);
    return this;
};

RPlayer.init = function (selector, options) {
    return new RPlayer(selector, options).initialize();
};
return RPlayer;
}));
