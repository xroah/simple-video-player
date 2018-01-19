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
var VOLUME_STEP = 5;
var VIDEO_STEP = 10;
var KEY_MAP = {
    "up": VOLUME_STEP, //IE
    "arrowup": VOLUME_STEP,
    "down": -VOLUME_STEP, //IE
    "arrowdown": -VOLUME_STEP,
    "left": -VIDEO_STEP, //IE
    "arrowleft": -VIDEO_STEP,
    "right": VIDEO_STEP, //IE
    "arrowright": VIDEO_STEP,
    "esc": "esc", //IE
    "escape": "escape",
    " ": "space",
    "spacebar": "space", //IE
    "enter": "enter"
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

function extend(target, source) {
    if (arguments.length) {
        for (var key in source) {
            var copy = source[key],
                t = target[key];
            if (isObject(copy) && isObject(t)) {
                extend(target[key], source[key]);
            } else {
                target[key] = copy;
            }
        }
    }
    return target;
}

function toArray(likeArr) {
    var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    return Array.isArray(likeArr) ? likeArr.slice(start) : likeArr.length ? Array.prototype.slice.call(likeArr, start) : [];
}

function removeProp(obj, prop) {
    if (prop) {
        try {
            delete obj[prop];
        } catch (e) {}
    } else {
        for (prop in obj) {
            delete obj[prop];
        }
    }
}

function noop() {
    return function () {};
}

function convertTime(time) {
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
}

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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
    _on: function _on(type, fn) {
        if (!this.handlers[type]) {
            this.handlers[type] = [];
        }
        this.handlers[type].push(fn);
    },
    on: function on(type, fn) {
        if (isFunction(fn)) {
            if (!isString(type)) {
                throw new TypeError("事件类型只能为String");
            }
            type = type.split(" ");
            for (var i = type.length; i--;) {
                this._on(type[i], fn);
            }
        }
        return this;
    },
    _off: function _off(type, fn) {
        var handlers = this.handlers[type];
        if (handlers) {
            if (isFunction(fn)) {
                for (var i = handlers.length; i--;) {
                    if (fn === handlers[i]) {
                        handlers.splice(i, 1);
                        break;
                    }
                }
            } else if (isUndefined(fn)) {
                this.handlers[type] = [];
            }
        }
    },
    off: function off(type, fn) {
        var len = arguments.length;
        if (len && isString(type)) {
            var args = toArray(arguments, 1);
            type = type.split(" ");
            for (var i = type.length; i--;) {
                var _off2;

                (_off2 = this._off).call.apply(_off2, [this, type[i]].concat(_toConsumableArray(args)));
            }
        } else if (!len) {
            //没传参数则移除所有绑定
            this.handlers = {};
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
        var args = toArray(arguments, 1),
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

function Loading() {
    this.el = dom.createElement("div", { "class": "rplayer-loading rplayer-hide" });
}

Loading.prototype = {
    constructor: Loading,
    show: function show() {
        dom.removeClass(this.el, "rplayer-hide");
        return this;
    },
    hide: function hide() {
        dom.addClass(this.el, "rplayer-hide");
        return this;
    },

    toggle: function toggle() {
        dom.toggleClass(this.el, "rplayer-hide");
        return this;
    },
    init: function init(target) {
        target.appendChild(this.el);
        return this;
    }
};

function VideoError() {
    this.el = dom.createElement("div", { "class": "rplayer-error rplayer-hide" });
    this.msgEl = dom.createElement("div", { "class": "rplayer-msg" });
    this.callback = noop();
}

VideoError.prototype = {
    constructor: VideoError,
    show: function show(msg) {
        this.setMessage(msg);
        dom.removeClass(this.el, "rplayer-hide");
        return this;
    },
    hide: function hide() {
        dom.addClass(this.el, "rplayer-hide");
        return this;
    },
    setMessage: function setMessage(msg) {
        this.msgEl.innerHTML = msg;
        return this;
    },
    initEvent: function initEvent() {
        dom.on(this.msgEl, "click", this.callback);
        return this;
    },
    init: function init(target, callback) {
        this.el.appendChild(this.msgEl);
        target.appendChild(this.el);
        if (isFunction(callback)) {
            this.callback = callback;
        }
        return this.initEvent();
    }
};

var fsApi = function () {
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

var FULL_SCREEN_CLASS = "rplayer-fullscreen";

function FullScreen(el) {
    this.el = el;
    this.isFullScreen = false;
    this.btn = dom.createElement("button", { "class": "rplayer-fullscreen-btn rplayer-rt" });
}

FullScreen.prototype = {
    constructor: FullScreen,
    request: function request() {
        this.isFullScreen = true;
        fsApi ? this.el[fsApi.requestFullscreen]() : this.fullPage();
        dom.addClass(this.el, FULL_SCREEN_CLASS).addClass(this.btn, FULL_SCREEN_CLASS);
        return this;
    },
    exit: function exit() {
        this.isFullScreen = false;
        fsApi ? doc[fsApi.exitFullscreen]() : this.fullPage(true);
        dom.removeClass(this.btn, FULL_SCREEN_CLASS).removeClass(this.el, FULL_SCREEN_CLASS);
        return this;
    },
    toggle: function toggle() {
        return this.isFullScreen = !this.isFullScreen ? this.request() : this.exit();
    },
    fullPage: function fullPage(exit) {
        //不支持全屏的浏览器铺满页面可视区域
        exit ? dom.removeClass(this.el, "rplayer-fixed") : dom.addClass(this.el, "rplayer-fixed");
        return this;
    },
    initEvent: function initEvent() {
        var _this = this;

        if (fsApi) {
            dom.on(doc, fsApi.fullscreenchange, function () {
                if (!doc[fsApi.fullscreenElement]) {
                    _this.exit();
                }
            }).on(doc, fsApi.fullscreenerror, function () {
                _this.exit();
            });
        }
        dom.on(this.btn, "click", this.toggle.bind(this));
        return this;
    },
    init: function init(el, target) {
        this.el = el;
        target.appendChild(this.btn);
        return this.initEvent();
    }
};

function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var VIDEO_LOADED_META = "video.loaded.meta";
var VIDEO_TIME_UPDATE = "video.time.update";
var VIDEO_SEEKING = "video.seeking";
var VIDEO_LOAD_START = "video.load.start";
var VIDEO_PROGRESS = "video.progress";
var VIDEO_CAN_PLAY = "video.can.play";
var VIDEO_ENDED = "video.ended";
var VIDEO_ERROR = "video.error";
var VIDEO_PLAYING = "video.playing";
var VIDEO_PAUSE = "video.pause";
var VIDEO_DBLCLICK = "video.dblclick";
var VIDEO_CLICK = "video.click";
var VIDEO_VOLUME_CHANGE = "video.volume.change";

function VideoControl(config) {
    Subscriber.call(this);
    this.config = config;
    this.playedTime = null;
}

var fn = VideoControl.prototype = Object.create(Subscriber.prototype);
var proto = {
    constructor: VideoControl,
    setVolume: function setVolume(volume) {
        //音量只能设置0-1的值
        if (volume > 1) {
            volume = volume / 100;
        }
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
    togglePlay: function togglePlay() {
        //当开始加载视频还不能播放时点击播放会报错
        if (this.getDuration()) {
            var paused = this.isPaused();
            this.play(paused);
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
    handleError: function handleError() {
        var code = this.isError(),
            err = void 0,
            message = void 0;
        //出现错误保存当前播放进度，恢复后从当前进度继续播放
        this.playedTime = this.getCurrentTime();
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
            code: code,
            message: message
        };
    },
    notify: function notify(type) {
        var _args;

        var args = (_args = {}, _defineProperty(_args, VIDEO_LOADED_META, [{ duration: this.getDuration() }]), _defineProperty(_args, VIDEO_TIME_UPDATE, [this.getCurrentTime()]), _defineProperty(_args, VIDEO_PROGRESS, [this.getBuffered(true), this.getReadyState()]), _defineProperty(_args, VIDEO_ERROR, [this.handleError()]), _defineProperty(_args, VIDEO_VOLUME_CHANGE, [this.isMuted() ? 0 : this.getVolume()]), _args),
            a = args[type] || [];
        if (type === VIDEO_LOAD_START && this.playedTime) {
            this.setCurrentTime(this.playedTime);
            this.playedTime = 0;
        }
        return this.trigger.apply(this, [type].concat(_toConsumableArray$1(a)));
    },
    initEvent: function initEvent() {
        var el = this.el;
        dom.on(el, "loadedmetadata", this.notify.bind(this, VIDEO_LOADED_META)).on(el, "timeupdate", this.notify.bind(this, VIDEO_TIME_UPDATE)).on(el, "seeking", this.notify.bind(this, VIDEO_SEEKING)).on(el, "loadstart", this.notify.bind(this, VIDEO_LOAD_START)).on(el, "progress", this.notify.bind(this, VIDEO_PROGRESS)).on(el, "canplay seeked", this.notify.bind(this, VIDEO_CAN_PLAY)).on(el, "ended", this.notify.bind(this, VIDEO_ENDED)).on(el, "error", this.notify.bind(this, VIDEO_ERROR)).on(el, "playing", this.notify.bind(this, VIDEO_PLAYING)).on(el, "pause", this.notify.bind(this, VIDEO_PAUSE)).on(el, "volumechange", this.notify.bind(this, VIDEO_VOLUME_CHANGE)).on(el, "dblclick", this.notify.bind(this, VIDEO_DBLCLICK)).on(el, "click", this.notify.bind(this, VIDEO_CLICK)).on(el, "contextmenu", function (evt) {
            return evt.preventDefault();
        });
    },
    init: function init(target) {
        var video = dom.createElement("video"),
            text = doc.createTextNode(this.config.msg.toString());
        this.source = this.config.source;
        video.appendChild(text);
        this.el = video;
        dom.addClass(this.el, "rplayer-video");
        target.appendChild(video);
        this.initSource(this.source).autoPlay(this.config.autoPlay).loop(this.config.loop).setPoster(this.config.poster).setPreload(this.config.preload).initEvent();
        return this;
    },
    destroy: function destroy() {
        dom.off(this.el);
        this.off();
        removeProp(this);
    }
};

extend(fn, proto);

var SLIDER_MOVING = "slider.moving";
var SLIDER_MOVE_DONE = "slider.move.done";
//滑块状态改变(是否可以滑动/点击),视频加载时候为获取到元信息禁止改变进度
var SLIDER_STATUS_CHANGE = "slider.status.change";

function Slider(vertical) {
    Subscriber.call(this);
    this.vertical = isUndefined(vertical) ? false : !!vertical;
    this.moveDis = this.pos = null;
    this.moving = false;
    this.enabled = true; //初始默认可以滑动/点击
}

var proto$1 = Slider.prototype = Object.create(Subscriber.prototype);
proto$1.constructor = Slider;

proto$1.getPosition = function () {
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

proto$1.updateHPosition = function (val, scale) {
    scale && (val = val * 100 + "%");
    dom.css(this.bar, "width", val).css(this.el, "left", val);
    return this;
};

proto$1.updateVPosition = function (val, scale) {
    scale && (val = val * 100 + "%");
    dom.css(this.bar, "height", val).css(this.el, "bottom", val);
    return this;
};

proto$1.mouseDown = function (evt) {
    //只有按鼠标左键时处理(evt.button=0)
    if (!evt.button && this.enabled) {
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

proto$1.moveVertical = function (x, y) {
    var distance = void 0;
    distance = this.pos.maxY - (y - this.pos.offsetY) - this.pos.height;
    distance = distance < 0 ? 0 : distance > this.pos.maxY ? this.pos.maxY : distance;
    distance = distance / this.pos.maxY;
    this.updateVPosition(distance, true);
    return distance;
};

proto$1.moveHorizontal = function (x) {
    var distance = void 0;
    distance = x - this.pos.offsetX;
    distance = distance < 0 ? 0 : distance > this.pos.maxX ? this.pos.maxX : distance;
    distance = distance / this.pos.maxX;
    this.updateHPosition(distance, true);
    return distance;
};

proto$1.mouseMove = function (evt, fn) {
    var x = evt.clientX,
        y = evt.clientY,
        distance = fn.call(this, x, y);
    this.moving = true;
    this.trigger(SLIDER_MOVING, this.moveDis = distance);
};

proto$1.getMoveCallback = function () {
    var _this = this;

    return this.vertical ? function (evt) {
        return _this.mouseMove(evt, _this.moveVertical);
    } : function (evt) {
        return _this.mouseMove(evt, _this.moveHorizontal);
    };
};

proto$1.mouseUp = function () {
    var _this2 = this;

    dom.off(doc, "mousemove moseup").removeClass(this.el, "rplayer-moving");
    this.moving && this.trigger(SLIDER_MOVE_DONE, this.moveDis);
    setTimeout(function () {
        return _this2.moving = false;
    });
};

proto$1.clickTrack = function (evt) {
    //移动滑块鼠标释放时会触发父元素点击事件,可能会导致鼠标释放后滑块位置改变
    //如果移动滑块/被禁用则点击事件不做处理
    if (!this.moving && this.enabled) {
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
    }
};

proto$1.initEvent = function () {
    var _this3 = this;

    dom.on(this.el, "mousedown", this.mouseDown.bind(this)).on(this.track, "click", this.clickTrack.bind(this));
    this.on(SLIDER_STATUS_CHANGE, function (evt, enable) {
        return _this3.enabled = !!enable;
    });
    return this;
};

proto$1.destroy = function () {
    dom.off(this.track).off(this.el);
    removeProp(this);
};

proto$1.init = function (target) {
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
    target.appendChild(this.track);
    return this.initEvent();
};

function VolumeControl(volume) {
    this.panel = dom.createElement("div", { "class": "rplayer-volume-popup rplayer-hide" });
    this.valueEl = dom.createElement("div", { "class": "rplayer-current-volume" });
    this.muteBtn = dom.createElement("button", { "class": "rplayer-mute volume-1" });
    this.showBtn = dom.createElement("button", { "class": "rplayer-audio-btn volume-1" });
    this.slider = new Slider(true);
    this.volume = volume;
}

VolumeControl.prototype = {
    constructor: VolumeControl,
    show: function show() {
        dom.removeClass(this.panel, "rplayer-hide");
        return this;
    },
    hide: function hide() {
        dom.addClass(this.panel, "rplayer-hide");
        return this;
    },
    toggle: function toggle(evt) {
        dom.toggleClass(this.panel, "rplayer-hide");
        //document click事件点击音量设置面板之外隐藏,如果不阻止冒泡则面板显示不出来
        evt.stopPropagation();
        return this;
    },
    updateVolume: function updateVolume(volume, sliderMove) {
        this.volume = volume;
        this.media.setVolume(volume);
        this.updateStyle(this.volume, sliderMove);
        return this;
    },
    updateVolumeByStep: function updateVolumeByStep(step) {
        var volume = this.volume + step;
        volume = volume > 100 ? 100 : volume < 0 ? 0 : volume;
        this.updateVolume(volume);
    },
    updateStyle: function updateStyle(volume, sliderMove) {
        var muteCls = this.muteBtn.className,
            showCls = this.showBtn.className,
            reg = /volume-\S+/;
        muteCls = muteCls.replace(reg, "");
        showCls = showCls.replace(reg, "");
        if (!volume) {
            reg = "volume-mute";
        } else if (volume <= 33) {
            reg = "volume-1";
        } else if (volume <= 66) {
            reg = "volume-2";
        } else {
            reg = "volume-3";
        }
        this.muteBtn.className = muteCls + reg;
        this.showBtn.className = showCls + reg;
        this.valueEl.innerHTML = volume;
        //如果通过移动滑块改变音量则不重复改变slider的位置
        !sliderMove && this.slider.updateVPosition(volume + "%");
        return this;
    },
    mute: function mute() {
        if (this.media.isMuted()) {
            this.updateStyle(this.volume);
            this.media.mute(false);
        } else {
            this.updateStyle(0);
            this.media.mute(true);
        }
    },
    initEvent: function initEvent() {
        var _this = this;

        dom.on(this.muteBtn, "click", this.mute.bind(this)).on(this.panel, "mouseleave", this.hide.bind(this)).on(this.showBtn, "click", this.toggle.bind(this)).on(doc, "click", function (evt) {
            var tgt = evt.target;
            //点击页面其他地方（点击的不是音量设置面板或者面板内的元素）则隐藏音量面板
            if (tgt !== _this.panel && !_this.panel.contains(tgt)) {
                _this.hide();
            }
        });
        this.slider.on(SLIDER_MOVING, function (evt, distance) {
            _this.updateVolume(Math.floor(100 * distance), true);
        });
        return this;
    },
    init: function init(target, media) {
        var panel = dom.createElement("div", { "class": "rplayer-audio-control rplayer-rt" });
        this.media = media;
        this.panel.appendChild(this.valueEl);
        this.slider.init(this.panel);
        this.panel.appendChild(this.muteBtn);
        panel.appendChild(this.showBtn);
        panel.append(this.panel);
        target.appendChild(panel);
        this.updateVolume(this.volume).initEvent();
        return this;
    }
};

function PlayControl() {
    this.btn = dom.createElement("button", { "class": "rplayer-play-btn" });
}

PlayControl.prototype = {
    play: function play() {
        dom.addClass(this.btn, "paused");
        return this;
    },
    pause: function pause() {
        dom.removeClass(this.btn, "paused");
        return this;
    },
    toggle: function toggle() {
        this.media.togglePlay();
        return this;
    },
    initEvent: function initEvent() {
        var toggle = this.toggle.bind(this);
        dom.on(this.btn, "click", toggle);
        this.media.on(VIDEO_PLAYING, this.play.bind(this)).on(VIDEO_PAUSE, this.pause.bind(this)).on(VIDEO_CLICK, toggle);
        return this;
    },
    init: function init(target, media) {
        target.appendChild(this.btn);
        this.media = media;
        return this.initEvent();
    }
};

function TimeInfo() {
    this.currentEl = dom.createElement("span", { "class": "rplayer-current-time" });
    this.totalEl = dom.createElement("span", { "class": "rplayer-total-time" });
}

TimeInfo.prototype = {
    constructor: TimeInfo,
    updateTime: function updateTime() {
        var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var total = arguments[1];

        var el = total ? this.totalEl : this.currentEl;
        el.innerHTML = convertTime(time);
        return this;
    },
    initEvent: function initEvent() {
        var _this = this;

        this.media.on(VIDEO_TIME_UPDATE, function (evt, current) {
            return _this.updateTime(current);
        }).on(VIDEO_LOADED_META, function (evt, meta) {
            return _this.updateTime(meta.duration, true);
        });
        return this;
    },
    init: function init(target, media) {
        var el = dom.createElement("span", { "class": "rplayer-time-info" }),
            text = doc.createTextNode("/");
        this.media = media;
        el.appendChild(this.currentEl);
        el.appendChild(text);
        el.appendChild(this.totalEl);
        target.appendChild(el);
        this.updateTime(0).updateTime(0, true);
        return this.initEvent();
    }
};

function Popup(autoHide) {
    this.el = dom.createElement("div", { "class": "rplayer-popup-info rplayer-hide" });
    this.visible = false;
    this.autoHide = !!autoHide;
    this.timer = null;
}

Popup.prototype = {
    show: function show(msg) {
        var _this = this;

        this.visible = true;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.autoHide) {
            this.timer = setTimeout(function () {
                return _this.hide();
            }, 3000);
        }
        dom.removeClass(this.el, "rplayer-hide");
        msg && this.updateText(msg);
        return this;
    },
    hide: function hide() {
        this.visible = false;
        dom.addClass(this.el, "rplayer-hide");
        return this;
    },
    updatePosition: function updatePosition(prop) {
        var pos = {
            left: "left",
            right: "right",
            top: "top",
            bottom: "bottom"
        };
        if (isObject(prop)) {
            for (var key in prop) {
                if (pos[key]) {
                    dom.css(this.el, key, prop[key]);
                }
            }
        }
        return this;
    },
    updateText: function updateText(content) {
        this.el.innerHTML = content;
        return this;
    },
    getSize: function getSize(prop) {
        //隐藏元素获取不到尺寸信息，隐藏时先将元素显示出来获取之后再隐藏
        var visible = this.visible;
        !visible && this.show();
        var style = getComputedStyle(this.el);
        !visible && this.hide();
        return prop ? parseFloat(style[prop]) : {
            left: parseFloat(style.left),
            right: parseFloat(style.right),
            top: parseFloat(style.top),
            bottom: parseFloat(style.bottom),
            width: parseFloat(style.width)

        };
    },
    width: function width() {
        return this.getSize("width");
    },
    height: function height() {
        return this.getSize("height");
    },
    init: function init(target, cls) {
        cls = cls || "";
        dom.addClass(this.el, cls);
        target.appendChild(this.el);
        return this;
    }
};

function VideoProgress() {
    this.slider = new Slider();
    this.panel = dom.createElement("div", { "class": "rplayer-progress-panel" });
    this.bufferEl = dom.createElement("div", { "class": "rplayer-bufferd-bar" });
    this.popup = new Popup();
    this.currentTime = this.duration = 0;
}

VideoProgress.prototype = {
    constructor: VideoProgress,
    update: function update(current) {
        if (this.currentTime !== current) {
            this.currentTime = current;
            var percent = current / this.duration * 100 || 0;
            this.slider.updateHPosition(percent + "%");
        }
        return this;
    },
    updateByStep: function updateByStep(step) {
        var currentTime = this.currentTime,
            duration = this.duration;
        currentTime += step;
        this.currentTime = currentTime < 0 ? 0 : currentTime > duration ? duration : currentTime;
        this.media.setCurrentTime(this.currentTime).trigger(VIDEO_TIME_UPDATE, this.currentTime);
        return this;
    },
    buffer: function buffer(buffered) {
        dom.css(this.bufferEl, buffered + "%");
    },
    mouseMove: function mouseMove(evt) {
        if (this.duration) {
            this.popup.show();
            var rect = this.panel.getBoundingClientRect(),
                distance = evt.clientX - rect.left,
                width = this.popup.width(),
                left = distance - width / 2;
            width = rect.width - width;
            left = left < 0 ? 0 : left > width ? width : left;
            width = distance / rect.width;
            this.popup.updatePosition({ left: left + "px" }).updateText(convertTime(width * this.duration));
        }
    },
    mouseOut: function mouseOut() {
        this.popup.hide();
    },
    initEvent: function initEvent() {
        var _this = this;

        //滑动改变进度/点击进度条改变进度
        this.slider.on(SLIDER_MOVE_DONE, function (evt, distance) {
            var time = distance * _this.duration;
            _this.media.setCurrentTime(time);
            _this.media.trigger(VIDEO_TIME_UPDATE, time);
        });
        dom.on(this.panel, "mouseover mousemove", this.mouseMove.bind(this)).on(this.panel, "mouseout", this.mouseOut.bind(this));
        this.media.on(VIDEO_LOAD_START, function () {
            return _this.slider.trigger(SLIDER_STATUS_CHANGE, false);
        }).on(VIDEO_LOADED_META, function (evt, meta) {
            _this.duration = meta.duration;
            _this.slider.trigger(SLIDER_STATUS_CHANGE, true);
        }).on(VIDEO_TIME_UPDATE, function (evt, current) {
            return _this.update(current);
        }).on(VIDEO_PROGRESS, function (evt, buffered) {
            return _this.buffer(buffered);
        });
        return this;
    },
    init: function init(target, media) {
        var el = this.panel;
        this.media = media;
        el.appendChild(this.bufferEl);
        this.slider.init(el);
        this.popup.init(el, "rplayer-popup-video-info");
        target.appendChild(el);
        return this.initEvent();
    }
};

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
    this.progress = new VideoProgress();
    this.volumePopup = new Popup(true);
    this.controls = isUndefined(options.controls) ? true : !!options.controls;
    this.useNativeControls = isUndefined(options.useNativeControls) ? false : options.useNativeControls;
}

var fn$1 = RPlayer.prototype = Object.create(Subscriber.prototype);
fn$1.constructor = RPlayer;

fn$1.keyDown = function (evt) {
    //控制条被禁用，不做处理
    var key = evt.key.toLowerCase(),
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
        } else {
            this.fullScreen.toggle();
        }
    }
    evt.preventDefault();
};

fn$1.hideControls = function () {
    dom.addClass(this.controlsPanel, HIDE_CLASS);
    return this;
};

fn$1.showControls = function () {
    var _this = this;

    //出错了则不显示控制条
    if (!this.video.isError()) {
        clearTimeout(hideControlsTimer);
        dom.removeClass(this.controlsPanel, HIDE_CLASS);
        hideControlsTimer = setTimeout(function () {
            return _this.hideControls();
        }, 5000);
    }
    return this;
};

fn$1.buffer = function (buffered, readyState) {
    if (readyState < 3) {
        this.loading.show();
    }
};

fn$1.playEnd = function () {
    this.trigger("play.end");
};

fn$1.handleError = function (error) {
    this.loading.hide();
    this.error.show(error.message);
    return this;
};

fn$1.refresh = function () {
    this.video.reload();
    this.error.hide();
};

fn$1.initEvent = function () {
    var _this2 = this;

    this.video.on(VIDEO_LOAD_START, function () {
        return _this2.loading.show();
    }).on(VIDEO_SEEKING, function () {
        return _this2.loading.show();
    }).on(VIDEO_CAN_PLAY, function () {
        return _this2.loading.hide();
    }).on(VIDEO_ENDED, this.playEnd.bind(this)).on(VIDEO_ERROR, function (evt, error) {
        return _this2.handleError(error);
    });
    return this;
};

fn$1.initControls = function () {
    var settingsPanel = dom.createElement("div", { "class": "rplayer-settings rplayer-rt" }),
        playControl = dom.createElement("div", { "class": "rplayer-play-control rplayer-lf" });
    this.controlsPanel = dom.createElement("div", { "class": "rplayer-controls" });
    this.fullScreen.init(this.container, settingsPanel);
    this.volumeControl.init(settingsPanel, this.video);
    this.playControl.init(playControl, this.video);
    this.timeInfo.init(playControl, this.video);
    this.progress.init(this.controlsPanel, this.video);
    this.volumePopup.init(this.container, "rplayer-popup-volume-info");
    this.controlsPanel.appendChild(settingsPanel);
    this.controlsPanel.appendChild(playControl);
    this.container.appendChild(this.controlsPanel);
    return this.initControlEvent();
};

fn$1.showVolumePopup = function (volume) {
    var text = "\u5F53\u524D\u97F3\u91CF: " + volume;
    if (volume === 0) {
        text = "静音";
    }
    this.volumePopup.show(text);
    return this;
};

fn$1.initControlEvent = function () {
    var _this3 = this;

    this.video.on(VIDEO_PROGRESS, function (evt, buffered, readyState) {
        return _this3.buffer(buffered, readyState);
    }).on(VIDEO_VOLUME_CHANGE, function (evt, muted, volume) {
        return _this3.showVolumePopup(muted, volume);
    }).on(VIDEO_DBLCLICK, function () {
        return _this3.fullScreen.toggle();
    });
    dom.on(this.container, "keydown", this.keyDown.bind(this)).on(this.container, "mousemove", this.showControls.bind(this));
    return this;
};

fn$1.offEvent = function () {
    dom.off(doc).off(this.container).off(this.video.el);
    return this;
};

fn$1.destroy = function () {
    if (this.container) {
        this.video.destroy();
        removeProp(this);
        this.offEvent();
    }
    return this;
};

fn$1.getSource = function () {
    return this.video.getSource();
};

fn$1.updateSource = function (src) {
    this.video.changeSource(src);
};

fn$1.initialize = function () {
    if (!this.container) {
        //防止重复初始化
        var container = dom.createElement("div", {
            tabIndex: 100 //使元素能够获取焦点
        }),
            height = parseInt(getComputedStyle(this.target).height);
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

return RPlayer;

})));
//# sourceMappingURL=rplayer.js.map
