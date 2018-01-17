(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.RPlayer = factory());
}(this, (function () { 'use strict';

var DEFAULT_OPTIONS = {
    autoPlay: false,
    defaultVolume: 50,
    loop: false,
    poster: "",
    preload: "metadata",
    source: "",
    msg: ""
};
var ERROR_TYPE = { //视频播放错误类型
    "1": "MEDIA_ERR_ABORTED",
    "2": "MEDIA_ERR_NETWORK",
    "3": "MEDIA_ERR_DECODE",
    "4": "MEDIA_ERR_SRC_NOT_SUPPORTED"
};
var TYPE = {
    function: "[object Function]",
    object: "[object Object]",
    string: "[object String]",
    undef: "[object Undefined]"
};
var doc = document;
var isType = function isType(type) {
    return function (obj) {
        return Object.prototype.toString.call(obj) === TYPE[type];
    };
};
var isFunction = isType("function");
var isObject = isType("object");
var isString = isType("string");
var isUndefined = isType("undef");
var isWindow = function isWindow(obj) {
    return obj && obj.window === obj;
};

var dom = {
    handlers: {}
};
var guid = 1;

dom.hasClass = function (el, cls) {
    if (!el) return false;
    if (el.classList) {
        return el.classList.contains(cls);
    }
    //如果className为XXX-active, cls为active,
    //如果不加空格判断则获取的结果不准确
    return (" " + el.className + " ").indexOf(" " + cls + " ") > -1;
};

dom.addClass = function (el, cls) {
    if (el && !this.hasClass(el, cls)) {
        if (el.classList) {
            el.classList.add(cls);
        } else {
            el.className += " " + cls;
        }
    }
    return this;
};

dom.removeClass = function (el, cls) {
    var reg = new RegExp("\\s+" + cls + "\\s+"),
        className = void 0;
    if (el && this.hasClass(el, cls)) {
        className = " " + el.className + " ";
        if (el.classList) {
            el.classList.remove(cls);
        } else {
            el.className = className.replace(reg, " ").trim();
        }
    }
    return this;
};

dom.toggleClass = function (el, cls) {
    var reg = new RegExp("\\s+" + cls + "\\s+"),
        className = void 0;
    if (el) {
        if (el.classList) {
            el.classList.toggle(cls);
        } else {
            className = " " + el.className + " ";
            cls = " " + cls + " ";
            if (className.indexOf(cls) > -1) {
                el.className = className.replace(reg, " ").trim();
            } else {
                el.className += " " + cls;
            }
        }
    }
    return this;
};

dom.css = function (el, prop, val) {
    var css = "";
    if (!isUndefined(val)) {
        el.style[prop] = val;
    } else {
        if (isObject(prop)) {
            for (val in prop) {
                css += val + ":" + prop[val] + ";";
            }
            el.style.cssText += css;
        } else if (isString(prop)) {
            return getComputedStyle(el).getPropertyValue(prop);
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
        dom.removeClass(el, "rplayer-fixed");
    } else {
        dom.addClass(el, "rplayer-fixed");
    }
};

//选择元素， 只选中一个
dom.selectElement = function (selector, context) {
    var ret = void 0,
        reg = /^#[^>~+\[\]\s:]+$/; //匹配id选择器
    context = context || doc;
    if (selector) {
        if (selector.nodeName || isWindow(selector)) {
            ret = selector;
        } else if (typeof selector === "string") {
            if (reg.test(selector)) {
                ret = doc.getElementById(selector.substring(1));
            } else {
                ret = context.querySelector(selector);
            }
        }
    }
    return ret;
};

//创建元素
dom.createElement = function (name, attrs) {
    var el = doc.createElement(name),
        key = void 0;
    if (isObject(attrs)) {
        for (key in attrs) {
            el.setAttribute(key, attrs[key]);
        }
    }
    return el;
};

//添加元素事件
dom._on = function (el, type, callback) {
    var id = el.guid,
        handler = void 0;
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
        i = void 0;
    if (el) {
        if (type) {
            //添加多个事件，以空格分开
            type = type.split(" ");
            i = type.length;
            if (isFunction(callback)) {
                for (; i--;) {
                    var t = type[i];
                    off ? this._off(el, t, callback) : this._on(el, t, callback);
                }
            } else if (off) {
                for (; i--;) {
                    this._off(el, type[i]);
                }
            }
        } else if (off) {
            this._off(el);
        }
    }
    return this;
};

//移除元素的事件
dom._off = function (el, type, callback) {
    var handlers = this.handlers[el.guid];
    if (handlers) {
        if (type && (handlers = handlers[type])) {
            if (callback) {
                for (var i = 0, len = handlers.length; i < len; i++) {
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
        } else if (!type) {
            //如果没有type, 则移除该元素的所有事件
            for (var key in handlers) {
                this._off(el, key);
            }
        }
    }
};

dom.off = function (selector, type, callback) {
    return this.on(selector, type, callback, true);
};

dom.once = function (selector, type, callback) {
    var _cb = void 0,
        _this = this;
    if (isFunction(callback)) {
        _cb = function cb() {
            var args = Array.prototype.slice.call(arguments);
            callback.apply(this, args);
            _this.off(selector, type, _cb);
        };
        this.on(selector, type, _cb);
    }
    return this;
};

dom.fsApi = function () {
    var fullScreenApi = [
    //W3C
    ["requestFullscreen", "exitFullscreen", "fullscreenElement", "fullscreenEnabled", "fullscreenchange", "fullscreenerror"],
    // WebKit
    ["webkitRequestFullscreen", "webkitExitFullscreen", "webkitFullscreenElement", "webkitFullscreenEnabled", "webkitfullscreenchange", "webkitfullscreenerror"],
    // Firefox
    ["mozRequestFullScreen", "mozCancelFullScreen", "mozFullScreenElement", "mozFullScreenEnabled", "mozfullscreenchange", "mozfullscreenerror"],
    // IE
    ["msRequestFullscreen", "msExitFullscreen", "msFullscreenElement", "msFullscreenEnabled", "MSFullscreenChange", "MSFullscreenError"]],
        fsApi = null,
        defApi = fullScreenApi[0],
        tmp = void 0,
        support = void 0;
    for (var i = 0, len = fullScreenApi.length; i < len; i++) {
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
}();

function CEvent(type) {
    this.type = type;
    this.data = null;
    this.timeStamp = 0;
}

function Subscriber() {
    this.handlers = {};
}

Subscriber.prototype = {
    constructor: Subscriber,
    on: function on(type, fn) {
        if (isFunction(fn)) {
            if (!isString(type)) {
                type = String(type);
            }
            if (!this.handlers[type]) {
                this.handlers[type] = [];
            }
            this.handlers[type].push(fn);
        }
        return this;
    },
    off: function off(type, fn) {
        var h = this.handlers[type];
        if (h) {
            if (isFunction(fn)) {
                for (var i = h.length; i--;) {
                    if (h[i] === fn) {
                        h.splice(i, 1);
                        break;
                    }
                }
            } else if (!fn) {
                this.handlers[type] = [];
            }
        }
        return this;
    },
    once: function once(type, fn) {
        if (isFunction(fn)) {
            var self = this,
                f = function f() {
                fn.apply(this, arguments);
                self.off(type, f);
            };
            this.on(type, f);
        }
    },
    trigger: function trigger(type) {
        var args = Array.prototype.slice.call(arguments, 1),
            h = this.handlers[type],
            e = void 0;
        if (h) {
            e = new CEvent(type);
            e.data = args;
            e.timeStamp = Date.now();
            args = [e].concat(args);
            for (var i = h.length; i--;) {
                h[i].apply(this, args);
            }
        }
        return this;
    }
};

function Slider(vertical) {
    Subscriber.call(this);
    this.vertical = isUndefined(vertical) ? false : !!vertical;
    this.moveDis = this.pos = null;
    this.moving = false;
}

var proto = Slider.prototype = Object.create(Subscriber.prototype);
proto.constructor = Slider;

proto.getPosition = function () {
    var parent = this.el.parentNode,
        rect = parent.getBoundingClientRect(),
        pos = getComputedStyle(this.el);
    return {
        width: parseFloat(pos.width),
        height: parseFloat(pos.height),
        origLeft: parseFloat(pos.left),
        origTop: parseFloat(pos.top),
        maxX: rect.width,
        maxY: rect.height
    };
};

proto.updateHPosition = function (val, scale) {
    scale && (val = val * 100 + "%");
    dom.css(this.bar, "width", val).css(this.el, "left", val);
    return this;
};

proto.updateVPosition = function (val, scale) {
    scale && (val = val * 100 + "%");
    dom.css(this.bar, "height", val).css(this.el, "bottom", val);
    return this;
};

proto.mouseDown = function (evt) {
    //只有按鼠标左键时处理(evt.button=0)
    if (!evt.button) {
        var x = evt.clientX,
            y = evt.clientY,
            pos = this.getPosition(),
            mouseMove = this.getMoveCallback().bind(this);
        this.pos = {
            width: pos.width,
            height: pos.height,
            offsetX: x - pos.origLeft,
            offsetY: y - pos.origTop,
            maxX: pos.maxX,
            maxY: pos.maxY
        };
        dom.addClass(this.el, "rplayer-moving").on(doc, "mousemove", mouseMove).on(doc, "mouseup", this.mouseUp.bind(this));
    }
};

proto.moveVertical = function (x, y) {
    var distance = void 0;
    distance = this.pos.maxY - (y - this.pos.offsetY) - this.pos.height;
    distance = distance < 0 ? 0 : distance > this.pos.maxY ? this.pos.maxY : distance;
    distance = distance / this.pos.maxY;
    this.updateVPosition(distance, true);
    return distance;
};

proto.moveHorizontal = function (x) {
    var distance = void 0;
    distance = x - this.pos.offsetX;
    distance = distance < 0 ? 0 : distance > this.pos.maxX ? this.pos.maxX : distance;
    distance = distance / this.pos.maxX;
    this.updateHPosition(distance, true);
    return distance;
};

proto.mouseMove = function (evt, fn) {
    var x = evt.clientX,
        y = evt.clientY,
        distance = fn.call(this, x, y);
    this.moving = true;
    this.trigger("slider.moving", this.moveDis = distance);
};

proto.getMoveCallback = function () {
    var _this = this;

    return this.vertical ? function (evt) {
        return _this.mouseMove(evt, _this.moveVertical);
    } : function (evt) {
        return _this.mouseMove(evt, _this.moveHorizontal);
    };
};

proto.mouseUp = function () {
    dom.off(doc, "mousemove moseup").removeClass(this.el, "rplayer-moving");
    this.moving && this.trigger("slider.move.done", this.moveDis);
};

proto.clickTrack = function (evt) {
    //移动滑块鼠标释放时会触发父元素点击事件,可能会导致鼠标释放后滑块位置改变
    //如果移动滑块则点击事件不做处理
    if (this.moving) {
        this.moving = false;
        return;
    }
    var rect = this.track.getBoundingClientRect(),
        x = evt.clientX,
        y = evt.clientY,
        eType = "slider.moving";
    if (this.vertical) {
        rect = (rect.height - y + rect.top) / rect.height;
        this.updateVPosition(rect, true);
    } else {
        rect = (x - rect.left) / rect.width;
        eType = "slider.move.done";
        this.updateHPosition(rect, true);
    }
    this.trigger(eType, rect);
};

proto.initEvent = function () {
    dom.on(this.el, "mousedown", this.mouseDown.bind(this)).on(this.track, "click", this.clickTrack.bind(this));
};

proto.destroy = function () {
    dom.off(this.track).off(this.el);
    delete this.track;
    delete this.bar;
    delete this.el;
};

proto.init = function (target, before) {
    var cls = {
        track: "rplayer-video-track",
        bar: "rplayer-video-progress",
        slider: "rplayer-video-slider"
    };
    if (this.vertical) {
        cls = {
            track: "rplayer-volume-progress",
            bar: "rplayer-volume-value",
            slider: "rplayer-volume-slider"
        };
    }
    this.track = dom.createElement("div", { class: "rplayer-progress " + cls.track });
    this.bar = dom.createElement("div", { class: "rplayer-bar " + cls.bar });
    this.el = dom.createElement("div", { class: "rplayer-slider " + cls.slider });
    this.track.appendChild(this.bar);
    this.track.append(this.el);
    before ? target.insertBefore(this.track, before) : target.appendChild(this.track);
    this.initEvent();
};

var tpl = '<div class="rplayer-loading rplayer-hide"></div>' + '<div class="rplayer-popup-info rplayer-popup-volume-info rplayer-hide">10:00</div>' + '<div class="rplayer-error rplayer-hide"><div class="rplayer-msg">出错了</div></div>';
var controls = '<div class="rplayer-popup-info rplayer-popup-video-info rplayer-hide">10:00</div>' + '        <div class="rplayer-progress-panel">' + '            <div class="rplayer-bufferd-bar"></div>' + '            <div class="rplayer-mark rplayer-hide"></div>' + '        </div>' + '        <div class="rplayer-play-control rplayer-lf">' + '            <button type="button" class="rplayer-play-btn"></button>' + '            <span class="rplayer-time-info">' + '               <span class="rplayer-current-time">00:00</span>/' + '               <span class="rplayer-total-time">00:00</span>' + '             </span>' + '        </div>' + '        <div class="rplayer-settings rplayer-rt">' + '            <button type="button" class="rplayer-fullscreen-btn rplayer-rt"></button>' + '            <div class="rplayer-audio-control rplayer-rt">' + '                <button type="button" class="rplayer-audio-btn volume-1"></button>' + '                <div class="rplayer-volume-popup rplayer-hide">' + '                    <span class="rplayer-current-volume">12</span>' + '                    <button class="rplayer-mute volume-1"></button>' + '                </div>' + '            </div>' + '        </div>';

function VideoControl(config) {
    this.config = config;
}

VideoControl.prototype = {
    constructor: VideoControl,
    setVolume: function setVolume(volume) {
        //音量只能设置0-1的值
        if (volume > 1) {
            volume = volume / 100;
        }
        volume > 1 && (volume = 1);
        this.el.volume = volume;
        this.el.muted = !volume;
        return this;
    },
    getVolume: function getVolume() {
        return Math.floor(this.el.volume * 100);
    },
    mute: function mute(_mute) {
        this.el.muted = isUndefined(_mute) ? true : !!_mute;
        return this;
    },
    isMuted: function isMuted() {
        return this.el.muted;
    },
    autoPlay: function autoPlay(play) {
        this.el.autoplay = !!play;
        return this;
    },
    isAutoPlay: function isAutoPlay() {
        return this.el.autoplay;
    },
    play: function play(_play) {
        if (isUndefined(_play) || !!_play) {
            this.el.play();
        } else {
            this.el.pause();
        }
        return this;
    },
    isPaused: function isPaused() {
        return this.el.paused;
    },
    isError: function isError() {
        var err = this.el.error;
        return err ? err.code : err;
    },
    loop: function loop(isLoop) {
        this.el.loop = !!isLoop;
        return this;
    },
    isLoop: function isLoop() {
        return this.el.loop;
    },
    setPoster: function setPoster(poster) {
        this.el.poster = poster;
        return this;
    },
    setPreload: function setPreload(preload) {
        this.el.preload = preload;
        return this;
    },
    setCurrentTime: function setCurrentTime(time, scale) {
        var duration = this.getDuration();
        if (scale) {
            time = duration * time;
        }
        this.el.currentTime = time;
        return this;
    },
    getCurrentTime: function getCurrentTime() {
        return this.el.currentTime;
    },
    getDuration: function getDuration() {
        return this.el.duration;
    },
    getPlayedPercentage: function getPlayedPercentage() {
        return this.getCurrentTime() / this.getDuration();
    },
    getBuffered: function getBuffered(percent) {
        var buffered = this.el.buffered,
            len = buffered.length;
        if (percent) {
            //缓冲的百分比
            return len ? buffered = buffered.end(len - 1) / this.getDuration() * 100 : null;
        }
        return buffered;
    },
    getReadyState: function getReadyState() {
        return this.el.readyState;
    },
    showControls: function showControls() {
        this.el.controls = true;
        return this;
    },
    convertTime: function convertTime(time) {
        var changeLen = function changeLen(num) {
            return num < 10 ? "0" + num : num.toString();
        },
            str = void 0,
            h = void 0,
            m = void 0,
            s = void 0;
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
    reload: function reload() {
        this.el.load();
        return this;
    },
    changeSource: function changeSource(src) {
        var paused = this.isPaused();
        if (this.source !== src) {
            this.source = src;
            this.initSource(src);
        }
        if (!paused) {
            this.play(true);
        }
        return this;
    },
    getSource: function getSource() {
        return this.el.currentSrc;
    },
    initSource: function initSource(source) {
        var frag = doc.createDocumentFragment();
        if (typeof source === "string") {
            this.el.src = source;
        } else if (Array.isArray(source)) {
            this.el.innerHTML = "";
            source.forEach(function (src) {
                var sourceEl = dom.createElement("source", { src: src });
                frag.appendChild(sourceEl);
            });
            this.el.appendChild(frag);
        }
        return this;
    },
    init: function init() {
        var video = dom.createElement("video"),
            text = doc.createTextNode(this.config.msg.toString());
        this.el = video;
        this.source = this.config.source;
        video.appendChild(text);
        dom.addClass(this.el, "rplayer-video");
        this.initSource(this.source).autoPlay(this.config.autoPlay).loop(this.config.loop).setPoster(this.config.poster).setPreload(this.config.preload).setVolume(this.config.defaultVolume);
        return this.el;
    }
};

var hideVolumePopTimer = null;
var hideControlsTimer = null;
var HIDE_CLASS = "rplayer-hide";
var DEFAULT_HEIGHT = 500;

function RPlayer(selector, options) {
    var target = dom.selectElement(selector),
        config = void 0;
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
        
    }
    if (!target) {
        throw new Error("未选中任何元素");
    }
    this.target = target;
    this.playedTime = 0;
    this.controlsDisabled = false;
    this.video = new VideoControl(config);
    this.controls = isUndefined(options.controls) ? true : !!options.controls;
    this.useNativeControls = isUndefined(options.useNativeControls) ? false : options.useNativeControls;
}

var fn = RPlayer.prototype = Object.create(Subscriber.prototype);
fn.constructor = RPlayer;

fn.toggleFullScreen = function () {
    if (this.isFullScreen = !this.isFullScreen) {
        this.requestFullScreen();
    } else {
        this.exitFullScreen();
    }
};

fn.requestFullScreen = function () {
    this.isFullScreen = true;
    dom.fullScreen(this.container).addClass(this.fullScreenBtn, "rplayer-fullscreen").addClass(this.container, "rplayer-fullscreen");
};

fn.exitFullScreen = function () {
    this.isFullScreen = false;
    dom.fullScreen(this.container, true).removeClass(this.fullScreenBtn, "rplayer-fullscreen").removeClass(this.container, "rplayer-fullscreen");
};

fn.initFullScreenEvent = function () {
    var _this = this;

    var fsApi = dom.fsApi;
    if (fsApi) {
        dom.on(doc, fsApi.fullscreenchange, function () {
            if (!doc[fsApi.fullscreenElement]) {
                _this.exitFullScreen();
            }
        }).on(doc, fsApi.fullscreenerror, function () {
            _this.exitFullScreen();
        });
    }
    return this;
};

fn.playEnd = function () {
    this.trigger("play.end");
    return this.video.isLoop() ? this.play() : this.pause();
};

fn.showError = function () {
    var el = this.errorMsg.parentNode;
    this.controlsDisabled = true;
    dom.removeClass(el, HIDE_CLASS);
    this.hideLoading().hideControls();
    return this;
};

fn.hideError = function () {
    var el = this.errorMsg.parentNode;
    this.controlsDisabled = false;
    dom.addClass(el, HIDE_CLASS);
    return this;
};

fn.error = function () {
    var err = this.video.isError(),
        currentTime = this.video.getCurrentTime(),
        msg = void 0;
    //出现错误保存当前播放进度，恢复后从当前进度继续播放
    this.playedTime = currentTime;
    err = ERROR_TYPE[err];
    switch (err) {
        case "MEDIA_ERR_ABORTED":
            msg = "出错了";
            break;
        case "MEDIA_ERR_NETWORK":
            msg = "网络错误或视频地址无效";
            break;
        case "MEDIA_ERR_DECODE":
        case "MEDIA_ERR_SRC_NOT_SUPPORTED":
            msg = "解码失败,不支持的视频格式或地址无效";
    }
    msg += ",点击刷新";
    this.errorMsg.innerHTML = msg;
    this.showError();
};

fn.refresh = function () {
    this.video.reload();
    this.hideError();
};

fn.initPlayEvent = function () {
    var _this2 = this;

    var videoEl = this.video.el;
    dom.on(videoEl, "loadstart stalled", function (evt) {
        if (_this2.playedTime && evt.type === "loadstart") {
            //出错了从出错的地方开始播放,重置播放时间
            _this2.video.setCurrentTime(_this2.playedTime);
            _this2.playedTime = 0;
        }
        _this2.showLoading().disableControls();
    }).on(videoEl, "progress", this.progress.bind(this)).on(videoEl, "canplay seeked", this.hideLoading.bind(this)).on(videoEl, "ended", this.playEnd.bind(this)).on(videoEl, "error", this.error.bind(this)).on(videoEl, "contextmenu", function (evt) {
        return evt.preventDefault();
    });

    return this;
};

fn.toggleVolumePopupInfo = function (volume) {
    //当音量设置面板隐藏是才显示当前音量
    if (dom.hasClass(this.volumePopup, HIDE_CLASS)) {
        clearTimeout(hideVolumePopTimer);
        this.volumePopupInfo.innerHTML = "当前音量: " + volume;
        this.currentVolume.innerHTML = volume;
        dom.removeClass(this.volumePopupInfo, HIDE_CLASS);
        hideVolumePopTimer = setTimeout(function () {
            return function () {
                dom.addClass(this.volumePopupInfo, HIDE_CLASS);
            };
        }, 3000);
    }
    return this;
};

fn.keyDown = function (evt) {
    //控制条被禁用，不做处理
    if (this.controlsDisabled) return;
    var key = evt.key.toLowerCase(),

    //up,down, left, right为IE浏览器中的上，下，左，右按键
    //arrowup,arrowdown, arrowleft, arrowright为其他浏览器中的上，下， 左， 右按键
    //按上下键音量加减5
    regUpOrDown = /(up)|(down)/,
        regLeftOrRight = /(left)|(right)/,
        regEsc = /esc/,
        VOLUME_STEP = 5,
        VIDEO_STEP = 10,
        keyMap = {
        up: VOLUME_STEP,
        arrowup: VOLUME_STEP,
        down: -VOLUME_STEP,
        arrowdown: -VOLUME_STEP,
        left: -VIDEO_STEP,
        arrowleft: -VIDEO_STEP,
        right: VIDEO_STEP,
        arrowright: VIDEO_STEP,
        esc: "esc",
        escape: "escape", //esc键盘
        enter: "enter"
    },
        tmp = keyMap[key];
    if (tmp) {
        if (regLeftOrRight.test(key)) {
            this.updateProgressByStep(tmp);
        } else if (regUpOrDown.test(key)) {
            this.updateVolumeByStep(tmp);
        } else if (regEsc.test(key)) {
            this.exitFullScreen();
        } else {
            this.toggleFullScreen();
        }
    } else if (key === " " || key === "spacebar") {
        //空格键
        this.togglePlay();
    }
    evt.preventDefault();
};

fn.handleClick = function (evt) {
    var tgt = evt.target;
    switch (tgt) {
        case this.showVolumePopBtn:
            this.toggleVolumeSettingsPanel(evt);
            break;
        case this.muteBtn:
            this.mute();
            break;
        case this.playBtn:
        case this.video.el:
            this.togglePlay();
            break;
        case this.fullScreenBtn:
            this.toggleFullScreen();
            break;
        case this.errorMsg:
            this.refresh();
            break;
    }
};

fn.initEvent = function () {
    dom.on(this.container, "click", this.handleClick.bind(this));
    this.initPlayEvent();
    return this;
};

fn.updateProgress = function () {
    //在拖动滑块改变播放进度时候不改变播放进度条位置，只改变播放的当前时间
    //防止影响滑块以及进度条的位置
    var progress = this.video.getPlayedPercentage();
    if (!this.videoSlider.moving) {
        this.videoSlider.updateHPosition(progress, true);
    }
    this.updateTime(true);
};

fn.updateVolume = function (volume, scale) {
    scale && (volume *= 100);
    volume = Math.floor(volume);
    this.video.setVolume(volume);
    this.updateVolumeStyle(volume);
    return this;
};

fn.mute = function () {
    var volume = this.video.getVolume();
    //点击静音键
    if (this.video.isMuted()) {
        this.video.mute(false);
    } else {
        this.video.mute(true);
        volume = 0;
    }
    this.updateVolumeStyle(volume);
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
    this.showVolumePopBtn.className = this.muteBtn.className = cls;
    this.currentVolume.innerHTML = volume;
    this.volumeSlider.updateVPosition(volume + "%");
    return this;
};

//点击显示/隐藏设置音量面板
fn.toggleVolumeSettingsPanel = function (evt) {
    if (!this.controlsDisabled) {
        dom.toggleClass(this.volumePopup, HIDE_CLASS);
    }
    //阻止冒泡到document, document点击事件点击面板外任意地方隐藏面板，如不阻止冒泡则显示不出来
    evt.stopPropagation();
};

fn.hideVolumeSettingsPanel = function () {
    dom.addClass(this.volumePopup, HIDE_CLASS);
    return this;
};

fn.initVolumeEvent = function () {
    var _this3 = this;

    dom.on(this.volumePopup, "mouseleave", this.hideVolumeSettingsPanel.bind(this)).on(doc, "click", function (evt) {
        var tgt = evt.target;
        //点击页面其他地方（点击的不是音量设置面板或者面板内的元素）则隐藏音量面板
        if (tgt !== _this3.volumePopup && !_this3.volumePopup.contains(tgt)) {
            _this3.hideVolumeSettingsPanel();
        }
    });
    return this;
};

fn.togglePlay = function () {
    if (!this.controlsDisabled) {
        this.video.isPaused() ? this.play() : this.pause();
    }
};

fn.play = function () {
    dom.addClass(this.playBtn, "paused");
    this.video.play(true);
    return this;
};

fn.pause = function () {
    this.video.play(false);
    dom.removeClass(this.playBtn, "paused");
    return this;
};

//鼠标在进度条上移动显示时间信息
fn.showPopupTimeInfo = function (evt) {
    var duration = this.video.getDuration(),
        popup = this.videoPopupTime,
        mark = this.mark;
    if (duration) {
        dom.removeClass(popup, HIDE_CLASS).removeClass(mark, HIDE_CLASS);
        var rect = this.progressPanel.getBoundingClientRect(),
            distance = evt.clientX - rect.left,
            width = popup.offsetWidth,
            left = distance - width / 2;
        width = rect.width - width;
        left = left < 0 ? 0 : left > width ? width : left;
        width = distance / rect.width;
        popup.innerHTML = this.video.convertTime(width * duration);
        dom.css(popup, "left", left + "px");
        dom.css(mark, "left", width * 100 + "%");
    }
    return this;
};

fn.hidePopupTimeInfo = function () {
    dom.addClass(this.videoPopupTime, HIDE_CLASS).addClass(this.mark, HIDE_CLASS);
    return this;
};

fn.showLoading = function () {
    dom.removeClass(this.loading, HIDE_CLASS);
    return this;
};

fn.hideLoading = function () {
    dom.addClass(this.loading, HIDE_CLASS);
    return this;
};

fn.progress = function () {
    var b = this.video.getBuffered(true);
    this.bufferedBar && dom.css(this.bufferedBar, "width", b + "%");
    if (this.video.getReadyState() < 3) {
        this.showLoading();
    }
};

fn.updateProgressByStep = function (step) {
    var currentTime = this.video.getCurrentTime(),
        duration = this.video.getDuration();
    currentTime += step;
    currentTime = currentTime < 0 ? 0 : currentTime > duration ? duration : currentTime;
    this.video.setCurrentTime(currentTime);
    this.updateProgress();
};

fn.updateTime = function (current) {
    var time = this.video.getDuration(),
        tmp = this.totalTime;
    if (current) {
        tmp = this.currentTime;
        time = this.video.getCurrentTime();
    }
    tmp.innerHTML = this.video.convertTime(time);
    return this;
};

fn.updateMetaInfo = function () {
    if (this.video.isAutoPlay()) {
        this.play();
    }
    this.updateTime().enableControls();
};

fn.hideControls = function () {
    dom.addClass(this.controlsPanel, HIDE_CLASS);
    return this;
};

fn.showControls = function () {
    var _this4 = this;

    var err = this.video.isError();
    //出错了则不显示控制条
    if (!err) {
        clearTimeout(hideControlsTimer);
        dom.removeClass(this.controlsPanel, HIDE_CLASS);
        if (dom.hasClass(this.volumePopup, HIDE_CLASS)) {
            hideControlsTimer = setTimeout(function () {
                _this4.hideControls();
            }, 5000);
        }
    }
    return this;
};

fn.enableControls = function () {
    dom.removeClass(this.controlsPanel, "rplayer-disabled");
    this.controlsDisabled = false;
    return this;
};

fn.disableControls = function () {
    dom.addClass(this.controlsPanel, "rplayer-disabled");
    this.controlsDisabled = true;
    return this;
};

fn.initControlEvent = function () {
    var _this5 = this;

    var videoEl = this.video.el;
    //滑动改变进度/点击进度条改变进度
    this.videoSlider.on("slider.move.done", function (evt, distance) {
        _this5.video.setCurrentTime(distance, true);
        _this5.updateTime(true);
    });
    this.volumeSlider.on("slider.moving", function (evt, distance) {
        _this5.updateVolume(distance, true);
    });
    dom.on(this.progressPanel, "mouseover mousemove", this.showPopupTimeInfo.bind(this)).on(this.progressPanel, "mouseout", this.hidePopupTimeInfo.bind(this)).on(this.container, "keydown", this.keyDown.bind(this)).on(this.container, "mousemove", this.showControls.bind(this)).on(videoEl, "loadedmetadata", this.updateMetaInfo.bind(this)).on(videoEl, "timeupdate", this.updateProgress.bind(this)).on(videoEl, "dblclick", this.toggleFullScreen.bind(this)).on(videoEl, "seeking", this.showLoading.bind(this));
    return this.initVolumeEvent().initFullScreenEvent();
};

fn.offEvent = function () {
    dom.off(doc).off(this.volumePopup).off(this.container).off(this.video.el);
    return this;
};

fn.removeProp = function () {
    for (var key in this) {
        delete this[key];
    }
    return this;
};

fn.destroy = function () {
    if (this.container) {
        this.videoSlider.destroy();
        this.volumeSlider.destroy();
        this.offEvent().removeProp();
    }
    return this;
};

fn.initEssentialElements = function () {
    var context = this.container;
    this.loading = dom.selectElement(".rplayer-loading", context);
    this.errorMsg = dom.selectElement(".rplayer-msg", context);
    return this;
};

fn.initElements = function () {
    var context = this.container;
    this.playBtn = dom.selectElement(".rplayer-play-btn", context);
    this.progressPanel = dom.selectElement(".rplayer-progress-panel", context);
    this.videoPopupTime = dom.selectElement(".rplayer-popup-video-info", context);
    this.currentTime = dom.selectElement(".rplayer-current-time", context);
    this.totalTime = dom.selectElement(".rplayer-total-time", context);
    this.bufferedBar = dom.selectElement(".rplayer-bufferd-bar", context);
    this.showVolumePopBtn = dom.selectElement(".rplayer-audio-btn", context);
    this.muteBtn = dom.selectElement(".rplayer-mute", context);
    this.volumePopup = dom.selectElement(".rplayer-volume-popup", context);
    this.volumePopupInfo = dom.selectElement(".rplayer-popup-volume-info", context);
    this.currentVolume = dom.selectElement(".rplayer-current-volume", context);
    this.fullScreenBtn = dom.selectElement(".rplayer-fullscreen-btn", context);
    this.mark = dom.selectElement(".rplayer-mark", context);
    this.volumeSlider = new Slider(true);
    this.videoSlider = new Slider();
    this.videoSlider.init(this.progressPanel);
    this.volumeSlider.init(this.volumePopup, this.muteBtn);
    return this;
};

fn.getSource = function () {
    return this.video.getSource();
};

fn.initControls = function () {
    this.controlsPanel = dom.createElement("div");
    dom.addClass(this.controlsPanel, "rplayer-controls");
    this.controlsPanel.innerHTML = controls;
    this.container.appendChild(this.controlsPanel);
    return this.initElements().updateVolumeStyle(this.video.getVolume()).initControlEvent();
};

fn.initialize = function () {
    if (!this.container) {
        //防止重复初始化
        var container = dom.createElement("div", {
            tabIndex: 100 //使元素能够获取焦点
        }),
            height = parseInt(getComputedStyle(this.target).height);
        this.isFullScreen = false;
        container.innerHTML = tpl;
        dom.css(container, "height", (height || DEFAULT_HEIGHT) + "px");
        this.container = container;
        container.appendChild(this.video.init());
        dom.addClass(this.container, "rplayer-container");
        //播放控制与原生控制二选一，如果设置了useNativeControls为true，则优先使用原生控制
        if (this.controls && !this.useNativeControls) {
            this.initControls();
        } else if (this.useNativeControls) {
            this.video.showControls();
        }
        this.target.appendChild(this.container);
        this.initEssentialElements().initEvent();
    }
    return this;
};

fn.updateSource = function (src) {
    this.video.changeSource(src);
};

RPlayer.init = function (selector, options) {
    return new RPlayer(selector, options).initialize();
};

return RPlayer;

})));
//# sourceMappingURL=rplayer.js.map
