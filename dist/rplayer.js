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
    msg: "",
    useNativeControls: false
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



function toArray(likeArr) {
    var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    return Array.isArray(likeArr) ? likeArr.slice(start) : likeArr.length ? Array.prototype.slice.call(likeArr, start) : [];
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

/**
 * 判断一个坐标是否再元素内部（例如鼠标移动后判鼠标指针是否再元素上）
 * @param {HTMLElement} el html元素
 * @param {number} x x偏移量
 * @param {number} y y偏移量
 * @param {boolean} relative 为true时候x,y相对视口的坐标,否则相对于元素
 */
dom.isPositionInEl = function (el, x, y, relative) {
    var rect = el.getBoundingClientRect();
    if (relative) {
        x = x - rect.left;
        y = y - rect.top;
    }
    return x > 0 && x < rect.width && y > 0 && y < rect.height;
};

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function CEvent(type) {
    this.type = type;
    this.data = null;
    this.timeStamp = 0;
}

var Subscriber = function () {
    function Subscriber() {
        _classCallCheck(this, Subscriber);

        Object.defineProperty(this, "handlers", { value: {} });
    }

    _createClass(Subscriber, [{
        key: "_on",
        value: function _on(type, fn) {
            if (!this.handlers[type]) {
                this.handlers[type] = [];
            }
            this.handlers[type].push(fn);
        }
    }, {
        key: "on",
        value: function on(type, fn) {
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
        }
    }, {
        key: "_off",
        value: function _off(type, fn) {
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
        }
    }, {
        key: "off",
        value: function off(type, fn) {
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
        }
    }, {
        key: "once",
        value: function once(type, fn) {
            if (isFunction(fn)) {
                var self = this,
                    f = function f() {
                    fn.apply(this, arguments);
                    self.off(type, f);
                };
                this.on(type, f);
            }
        }
    }, {
        key: "trigger",
        value: function trigger(type) {
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
    }]);

    return Subscriber;
}();

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Loading = function () {
    function Loading() {
        _classCallCheck$1(this, Loading);

        this.el = dom.createElement("div", { "class": "rplayer-loading rplayer-hide" });
    }

    _createClass$1(Loading, [{
        key: "show",
        value: function show() {
            dom.removeClass(this.el, "rplayer-hide");
            return this;
        }
    }, {
        key: "hide",
        value: function hide() {
            dom.addClass(this.el, "rplayer-hide");
            return this;
        }
    }, {
        key: "toggle",
        value: function toggle() {
            dom.toggleClass(this.el, "rplayer-hide");
            return this;
        }
    }, {
        key: "init",
        value: function init(target) {
            target.appendChild(this.el);
            return this;
        }
    }]);

    return Loading;
}();

var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VideoError = function () {
    function VideoError() {
        _classCallCheck$2(this, VideoError);

        this.el = dom.createElement("div", { "class": "rplayer-error rplayer-hide" });
        this.msgEl = dom.createElement("div", { "class": "rplayer-msg" });
        this.callback = noop();
    }

    _createClass$2(VideoError, [{
        key: "show",
        value: function show(msg) {
            this.setMessage(msg);
            dom.removeClass(this.el, "rplayer-hide");
            return this;
        }
    }, {
        key: "hide",
        value: function hide() {
            dom.addClass(this.el, "rplayer-hide");
            return this;
        }
    }, {
        key: "setMessage",
        value: function setMessage(msg) {
            this.msgEl.innerHTML = msg;
            return this;
        }
    }, {
        key: "initEvent",
        value: function initEvent() {
            dom.on(this.msgEl, "click", this.callback);
            return this;
        }
    }, {
        key: "init",
        value: function init(target, callback) {
            this.el.appendChild(this.msgEl);
            target.appendChild(this.el);
            if (isFunction(callback)) {
                this.callback = callback;
            }
            return this.initEvent();
        }
    }]);

    return VideoError;
}();

var _createClass$3 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var VideoControl = function (_Subscriber) {
    _inherits(VideoControl, _Subscriber);

    function VideoControl(config) {
        _classCallCheck$3(this, VideoControl);

        var _this = _possibleConstructorReturn(this, (VideoControl.__proto__ || Object.getPrototypeOf(VideoControl)).call(this));

        _this.config = config;
        _this.playedTime = null;
        _this.el = dom.createElement("video", { "class": "rplayer-video" });
        _this.paused = _this.el.paused;
        return _this;
    }

    _createClass$3(VideoControl, [{
        key: "setVolume",
        value: function setVolume(volume) {
            //音量只能设置0-1的值
            if (volume > 1) {
                volume = volume / 100;
            }
            this.el.volume = volume;
            return this;
        }
    }, {
        key: "getVolume",
        value: function getVolume() {
            return Math.floor(this.el.volume * 100);
        }
    }, {
        key: "mute",
        value: function mute(_mute) {
            this.el.muted = isUndefined(_mute) ? true : !!_mute;
            return this;
        }
    }, {
        key: "isMuted",
        value: function isMuted() {
            return this.el.muted;
        }
    }, {
        key: "autoPlay",
        value: function autoPlay(play) {
            this.el.autoplay = !!play;
            return this;
        }
    }, {
        key: "play",
        value: function play() {
            this.paused = false;
            if (this.el.networkState !== 2) {
                //networkState=2（视频正在缓冲不能播放）时候反复点击播放按钮会报DomException错误
                //此时不执行video元素的播放/暂停,只改变paused（video元素paused为只读）状态
                //当触发canplay事件时，如果paused为true则进行播放
                this.el.play();
            }
            return this;
        }
    }, {
        key: "pause",
        value: function pause() {
            this.paused = true;
            if (this.el.networkState !== 2) {
                this.el.pause();
            }
        }
    }, {
        key: "togglePlay",
        value: function togglePlay() {
            this.paused ? this.play() : this.pause();
            return this;
        }
    }, {
        key: "isError",
        value: function isError() {
            var err = this.el.error;
            return err ? err.code : err;
        }
    }, {
        key: "loop",
        value: function loop(isLoop) {
            this.el.loop = !!isLoop;
            return this;
        }
    }, {
        key: "setPoster",
        value: function setPoster(poster) {
            this.el.poster = poster;
            return this;
        }
    }, {
        key: "setPreload",
        value: function setPreload(preload) {
            this.el.preload = preload;
            return this;
        }
    }, {
        key: "setCurrentTime",
        value: function setCurrentTime(time, scale) {
            var duration = this.getDuration();
            if (scale) {
                time = duration * scale;
            }
            this.el.currentTime = time;
            return this;
        }
    }, {
        key: "getCurrentTime",
        value: function getCurrentTime() {
            return this.el.currentTime;
        }
    }, {
        key: "getDuration",
        value: function getDuration() {
            return this.el.duration;
        }
    }, {
        key: "getBuffered",
        value: function getBuffered(percent) {
            var buffered = this.el.buffered,
                len = buffered.length;
            if (percent) {
                //缓冲的百分比
                return len ? buffered = buffered.end(len - 1) / this.getDuration() * 100 : null;
            }
            return buffered;
        }
    }, {
        key: "getReadyState",
        value: function getReadyState() {
            return this.el.readyState;
        }
    }, {
        key: "showControls",
        value: function showControls() {
            this.el.controls = true;
            return this;
        }
    }, {
        key: "reload",
        value: function reload() {
            this.el.load();
            return this;
        }
    }, {
        key: "changeSource",
        value: function changeSource(src) {
            var paused = this.paused;
            if (this.source !== src) {
                this.source = src;
                this.initSource(src);
            }
            if (!paused) {
                this.play(true);
            }
            return this;
        }
    }, {
        key: "getSource",
        value: function getSource() {
            return this.el.currentSrc;
        }
    }, {
        key: "initSource",
        value: function initSource(source) {
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
        }
    }, {
        key: "handleError",
        value: function handleError() {
            var code = this.isError(),
                err = void 0,
                message = void 0;
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
                code: code,
                message: message
            };
        }
    }, {
        key: "notify",
        value: function notify(type) {
            var _args;

            var args = (_args = {}, _defineProperty(_args, VIDEO_LOADED_META, [{ duration: this.getDuration() }]), _defineProperty(_args, VIDEO_TIME_UPDATE, [this.getCurrentTime()]), _defineProperty(_args, VIDEO_PROGRESS, [this.getBuffered(true), this.getReadyState()]), _defineProperty(_args, VIDEO_ERROR, [this.handleError()]), _defineProperty(_args, VIDEO_VOLUME_CHANGE, [this.isMuted() ? 0 : this.getVolume()]), _args),
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
            return this.trigger.apply(this, [type].concat(_toConsumableArray$1(a)));
        }
    }, {
        key: "initEvent",
        value: function initEvent() {
            var el = this.el;
            dom.on(el, "loadedmetadata", this.notify.bind(this, VIDEO_LOADED_META)).on(el, "timeupdate", this.notify.bind(this, VIDEO_TIME_UPDATE)).on(el, "seeking", this.notify.bind(this, VIDEO_SEEKING)).on(el, "loadstart", this.notify.bind(this, VIDEO_LOAD_START)).on(el, "progress", this.notify.bind(this, VIDEO_PROGRESS)).on(el, "canplay seeked", this.notify.bind(this, VIDEO_CAN_PLAY)).on(el, "ended", this.notify.bind(this, VIDEO_ENDED)).on(el, "error", this.notify.bind(this, VIDEO_ERROR)).on(el, "playing", this.notify.bind(this, VIDEO_PLAYING)).on(el, "pause", this.notify.bind(this, VIDEO_PAUSE)).on(el, "volumechange", this.notify.bind(this, VIDEO_VOLUME_CHANGE)).on(el, "dblclick", this.notify.bind(this, VIDEO_DBLCLICK)).on(el, "click", this.notify.bind(this, VIDEO_CLICK)).on(el, "contextmenu", function (evt) {
                return evt.preventDefault();
            });
        }
    }, {
        key: "init",
        value: function init(target) {
            var video = this.el,
                text = doc.createTextNode(this.config.msg.toString());
            this.source = this.config.source;
            if (this.config.useNativeControls) {
                this.showControls();
            }
            video.appendChild(text);
            target.appendChild(video);
            this.initSource(this.source).autoPlay(this.config.autoPlay).loop(this.config.loop).setPoster(this.config.poster).setPreload(this.config.preload).initEvent();
            return this;
        }
    }]);

    return VideoControl;
}(Subscriber);

var _createClass$4 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$1(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SLIDER_MOVING = "slider.moving";
var SLIDER_MOVE_DONE = "slider.move.done";

var Slider = function (_Subscriber) {
    _inherits$1(Slider, _Subscriber);

    function Slider(vertical) {
        _classCallCheck$4(this, Slider);

        var _this = _possibleConstructorReturn$1(this, (Slider.__proto__ || Object.getPrototypeOf(Slider)).call(this));

        _this.vertical = isUndefined(vertical) ? false : !!vertical;
        _this.moveDis = _this.pos = null;
        _this.moving = false;
        //滑块状态改变(是否可以滑动/点击),视频加载时候没有获取到元信息禁止改变进度
        //初始默认可以滑动/点击
        _this.enabled = true;
        _this.track = dom.createElement("div", { "class": "rplayer-progress" });
        _this.bar = dom.createElement("div", { "class": "rplayer-bar" });
        _this.el = dom.createElement("div", { "class": "rplayer-slider" });
        return _this;
    }

    _createClass$4(Slider, [{
        key: "getPosition",
        value: function getPosition() {
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
        }
    }, {
        key: "updateHPosition",
        value: function updateHPosition(val, scale) {
            scale && (val = val * 100 + "%");
            dom.css(this.bar, "width", val).css(this.el, "left", val);
            return this;
        }
    }, {
        key: "updateVPosition",
        value: function updateVPosition(val, scale) {
            scale && (val = val * 100 + "%");
            dom.css(this.bar, "height", val).css(this.el, "bottom", val);
            return this;
        }
    }, {
        key: "mouseDown",
        value: function mouseDown(evt) {
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
        }
    }, {
        key: "moveVertical",
        value: function moveVertical(x, y) {
            var distance = void 0;
            distance = this.pos.maxY - (y - this.pos.offsetY) - this.pos.height;
            distance = distance < 0 ? 0 : distance > this.pos.maxY ? this.pos.maxY : distance;
            distance = distance / this.pos.maxY;
            this.updateVPosition(distance, true);
            return distance;
        }
    }, {
        key: "moveHorizontal",
        value: function moveHorizontal(x) {
            var distance = void 0;
            distance = x - this.pos.offsetX;
            distance = distance < 0 ? 0 : distance > this.pos.maxX ? this.pos.maxX : distance;
            distance = distance / this.pos.maxX;
            this.updateHPosition(distance, true);
            return distance;
        }
    }, {
        key: "mouseMove",
        value: function mouseMove(evt, fn) {
            var x = evt.clientX,
                y = evt.clientY,
                distance = fn.call(this, x, y);
            this.moving = true;
            this.trigger(SLIDER_MOVING, this.moveDis = distance);
        }
    }, {
        key: "getMoveCallback",
        value: function getMoveCallback() {
            var _this2 = this;

            return this.vertical ? function (evt) {
                return _this2.mouseMove(evt, _this2.moveVertical);
            } : function (evt) {
                return _this2.mouseMove(evt, _this2.moveHorizontal);
            };
        }
    }, {
        key: "mouseUp",
        value: function mouseUp() {
            var _this3 = this;

            dom.off(doc, "mousemove mouseup").removeClass(this.el, "rplayer-moving");
            if (this.moving) {
                this.trigger(SLIDER_MOVE_DONE, this.moveDis);
                setTimeout(function () {
                    return _this3.moving = false;
                });
            }
        }
    }, {
        key: "clickTrack",
        value: function clickTrack(evt) {
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
        }
    }, {
        key: "initEvent",
        value: function initEvent() {
            dom.on(this.el, "mousedown", this.mouseDown.bind(this)).on(this.track, "click", this.clickTrack.bind(this));
            return this;
        }
    }, {
        key: "init",
        value: function init(target) {
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
            dom.addClass(this.track, cls.track).addClass(this.bar, cls.bar).addClass(this.el, cls.slider);
            this.track.appendChild(this.bar);
            this.track.append(this.el);
            target.appendChild(this.track);
            return this.initEvent();
        }
    }]);

    return Slider;
}(Subscriber);

var _createClass$5 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Popup = function () {
    function Popup(cls, autoHide) {
        _classCallCheck$5(this, Popup);

        this.el = dom.createElement("div", { "class": "rplayer-popup-info rplayer-hide " + cls });
        this.visible = false;
        this.autoHide = !!autoHide;
        this.timer = null;
    }

    _createClass$5(Popup, [{
        key: "show",
        value: function show(msg) {
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
        }
    }, {
        key: "hide",
        value: function hide() {
            this.visible = false;
            dom.addClass(this.el, "rplayer-hide");
            return this;
        }
    }, {
        key: "updatePosition",
        value: function updatePosition(prop) {
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
        }
    }, {
        key: "updateText",
        value: function updateText(content) {
            this.el.innerHTML = content;
            return this;
        }
    }, {
        key: "getSize",
        value: function getSize(prop) {
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
        }
    }, {
        key: "width",
        value: function width() {
            return this.getSize("width");
        }
    }, {
        key: "height",
        value: function height() {
            return this.getSize("height");
        }
    }, {
        key: "init",
        value: function init(target) {
            target.appendChild(this.el);
            return this;
        }
    }]);

    return Popup;
}();

var _createClass$6 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$6(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$2(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$2(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//滑动/点击改变进度后设置视频播放时间
var VIDEO_PROGRESS_UPDATE = "video.progress.update";
//视频播放时时间改变
var VIDEO_PROGRESS_UPDATED = "video.progress.updated";
var VIDEO_PROGRESS_BUFFER = "video.progress.buffer";

var VideoProgress = function (_Subscriber) {
    _inherits$2(VideoProgress, _Subscriber);

    function VideoProgress() {
        _classCallCheck$6(this, VideoProgress);

        var _this = _possibleConstructorReturn$2(this, (VideoProgress.__proto__ || Object.getPrototypeOf(VideoProgress)).call(this));

        _this.slider = new Slider();
        _this.panel = dom.createElement("div", { "class": "rplayer-progress-panel" });
        _this.bufferEl = dom.createElement("div", { "class": "rplayer-bufferd-bar" });
        _this.popup = new Popup("rplayer-popup-video-info");
        _this.currentTime = _this.duration = 0;
        return _this;
    }

    _createClass$6(VideoProgress, [{
        key: "update",
        value: function update(current, sliderMove) {
            if (this.currentTime !== current) {
                this.currentTime = current;
                var percent = current / this.duration * 100 || 0;
                !sliderMove && this.slider.updateHPosition(percent + "%");
            }
            return this;
        }
    }, {
        key: "updateByStep",
        value: function updateByStep(step) {
            var currentTime = this.currentTime,
                duration = this.duration;
            if (duration) {
                currentTime += step;
                this.currentTime = currentTime < 0 ? 0 : currentTime > duration ? duration : currentTime;
                this.trigger(VIDEO_PROGRESS_UPDATE, this.currentTime);
            }
            return this;
        }
    }, {
        key: "enable",
        value: function enable(_enable) {
            this.slider.enabled = !!_enable;
            return this;
        }
    }, {
        key: "buffer",
        value: function buffer(buffered) {
            dom.css(this.bufferEl, buffered + "%");
        }
    }, {
        key: "mouseMove",
        value: function mouseMove(evt) {
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
        }
    }, {
        key: "mouseOut",
        value: function mouseOut() {
            this.popup.hide();
        }
    }, {
        key: "initEvent",
        value: function initEvent() {
            var _this2 = this;

            //滑动改变进度/点击进度条改变进度
            this.slider.on(SLIDER_MOVE_DONE, function (evt, distance) {
                var time = distance * _this2.duration;
                _this2.update(time);
                _this2.trigger(VIDEO_PROGRESS_UPDATE, time);
            });
            dom.on(this.panel, "mouseover mousemove", this.mouseMove.bind(this)).on(this.panel, "mouseout", this.mouseOut.bind(this));
            this.on(VIDEO_PROGRESS_UPDATED, function (evt, time) {
                return _this2.update(time);
            }).on(VIDEO_PROGRESS_BUFFER, function (evt, buffer) {
                return _this2.buffer(buffer);
            });
            return this;
        }
    }, {
        key: "init",
        value: function init(target) {
            var el = this.panel;
            el.appendChild(this.bufferEl);
            this.slider.init(el);
            this.popup.init(el);
            target.appendChild(el);
            return this.initEvent();
        }
    }]);

    return VideoProgress;
}(Subscriber);

var _createClass$7 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$7(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$3(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$3(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VOLUME_CONTROL_UPDATE = "volume.control.update";
var VOLUME_CONTROL_MUTE = "volume.control.mute";

var VolumeControl = function (_Subscriber) {
    _inherits$3(VolumeControl, _Subscriber);

    function VolumeControl(volume) {
        _classCallCheck$7(this, VolumeControl);

        var _this = _possibleConstructorReturn$3(this, (VolumeControl.__proto__ || Object.getPrototypeOf(VolumeControl)).call(this));

        _this.panel = dom.createElement("div", { "class": "rplayer-volume-popup rplayer-hide" });
        _this.valueEl = dom.createElement("div", { "class": "rplayer-current-volume" });
        _this.muteBtn = dom.createElement("button", { "class": "rplayer-mute volume-1" });
        _this.showBtn = dom.createElement("button", { "class": "rplayer-audio-btn volume-1" });
        _this.slider = new Slider(true);
        _this.volume = volume;
        _this.muted = false;
        return _this;
    }

    _createClass$7(VolumeControl, [{
        key: "show",
        value: function show() {
            dom.removeClass(this.panel, "rplayer-hide");
            return this;
        }
    }, {
        key: "hide",
        value: function hide() {
            dom.addClass(this.panel, "rplayer-hide");
            return this;
        }
    }, {
        key: "toggle",
        value: function toggle(evt) {
            dom.toggleClass(this.panel, "rplayer-hide");
            //document click事件点击音量设置面板之外隐藏,如果不阻止冒泡则面板显示不出来
            evt.stopPropagation();
            return this;
        }
    }, {
        key: "updateVolume",
        value: function updateVolume(volume, sliderMove) {
            this.volume = volume;
            this.updateStyle(this.volume, sliderMove);
            this.trigger(VOLUME_CONTROL_UPDATE, this.volume);
            return this;
        }
    }, {
        key: "updateVolumeByStep",
        value: function updateVolumeByStep(step) {
            var volume = this.volume + step;
            volume = volume > 100 ? 100 : volume < 0 ? 0 : volume;
            this.updateVolume(volume);
        }
    }, {
        key: "updateStyle",
        value: function updateStyle(volume, sliderMove) {
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
        }
    }, {
        key: "mute",
        value: function mute() {
            this.muted = !this.muted;
            this.muted ? this.updateStyle(0) : this.updateStyle(this.volume);
            this.trigger(VOLUME_CONTROL_MUTE, this.muted);
        }
    }, {
        key: "initEvent",
        value: function initEvent() {
            var _this2 = this;

            dom.on(this.muteBtn, "click", this.mute.bind(this)).on(this.panel, "mouseleave", this.hide.bind(this)).on(this.showBtn, "click", this.toggle.bind(this)).on(doc, "click", function (evt) {
                var tgt = evt.target;
                //点击页面其他地方（点击的不是音量设置面板或者面板内的元素）则隐藏音量面板
                if (tgt !== _this2.panel && !_this2.panel.contains(tgt)) {
                    _this2.hide();
                }
            });
            this.slider.on(SLIDER_MOVING, function (evt, distance) {
                _this2.updateVolume(Math.floor(100 * distance), true);
            });
            return this;
        }
    }, {
        key: "init",
        value: function init(target) {
            var panel = dom.createElement("div", { "class": "rplayer-audio-control rplayer-rt" });
            this.panel.appendChild(this.valueEl);
            this.slider.init(this.panel);
            this.panel.appendChild(this.muteBtn);
            panel.appendChild(this.showBtn);
            panel.append(this.panel);
            target.appendChild(panel);
            this.updateVolume(this.volume).initEvent();
            return this;
        }
    }]);

    return VolumeControl;
}(Subscriber);

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

var _createClass$8 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$8(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FullScreen = function () {
    function FullScreen(el) {
        _classCallCheck$8(this, FullScreen);

        this.el = el;
        this.isFullScreen = false;
        this.btn = dom.createElement("button", { "class": "rplayer-fullscreen-btn rplayer-rt" });
    }

    _createClass$8(FullScreen, [{
        key: "request",
        value: function request() {
            this.isFullScreen = true;
            fsApi ? this.el[fsApi.requestFullscreen]() : this.fullPage();
            dom.addClass(this.el, "rplayer-fullscreen").addClass(this.btn, "rplayer-fullscreen");
            return this;
        }
    }, {
        key: "exit",
        value: function exit() {
            this.isFullScreen = false;
            fsApi ? doc[fsApi.exitFullscreen]() : this.fullPage(true);
            dom.removeClass(this.btn, "rplayer-fullscreen").removeClass(this.el, "rplayer-fullscreen");
            return this;
        }
    }, {
        key: "toggle",
        value: function toggle() {
            return this.isFullScreen = !this.isFullScreen ? this.request() : this.exit();
        }
    }, {
        key: "fullPage",
        value: function fullPage(exit) {
            //不支持全屏的浏览器铺满页面可视区域
            exit ? dom.removeClass(this.el, "rplayer-fixed") : dom.addClass(this.el, "rplayer-fixed");
            return this;
        }
    }, {
        key: "initEvent",
        value: function initEvent() {
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
        }
    }, {
        key: "init",
        value: function init(target) {
            target.appendChild(this.btn);
            return this.initEvent();
        }
    }]);

    return FullScreen;
}();

var _createClass$9 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$9(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TimeInfo = function () {
    function TimeInfo() {
        _classCallCheck$9(this, TimeInfo);

        this.currentEl = dom.createElement("span", { "class": "rplayer-current-time" });
        this.totalEl = dom.createElement("span", { "class": "rplayer-total-time" });
    }

    _createClass$9(TimeInfo, [{
        key: "updateCurrentTime",
        value: function updateCurrentTime(time) {
            this.currentEl.innerHTML = convertTime(time);
            return this;
        }
    }, {
        key: "updateTotalTime",
        value: function updateTotalTime(time) {
            this.totalEl.innerHTML = convertTime(time);
            return this;
        }
    }, {
        key: "init",
        value: function init(target) {
            var el = dom.createElement("span", { "class": "rplayer-time-info" }),
                text = doc.createTextNode("/");
            this.currentEl.innerHTML = this.totalEl.innerHTML = "00:00";
            el.appendChild(this.currentEl);
            el.appendChild(text);
            el.appendChild(this.totalEl);
            target.appendChild(el);
            return this;
        }
    }]);

    return TimeInfo;
}();

var _createClass$10 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$10(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Controls = function () {
    function Controls(parent, media, volume) {
        _classCallCheck$10(this, Controls);

        this.parentEl = parent;
        this.media = media;
        this.timer = null;
        //视频是否允许点击播放/改变进度
        //第一次开始加载是不允许改变
        this.enabled = false;
        this.el = dom.createElement("div", { "class": "rplayer-controls" });
        this.playBtn = dom.createElement("button", { "class": "rplayer-play-btn" });
        this.volumeControl = new VolumeControl(volume);
        this.timeInfo = new TimeInfo();
        this.fullScreen = new FullScreen(parent);
        this.progress = new VideoProgress();
        this.volumePopup = new Popup("rplayer-popup-volume-info", true);
    }

    _createClass$10(Controls, [{
        key: "show",
        value: function show() {
            var _this = this;

            var evt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var error = this.media.isError();
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            if (!error) {
                var mouseX = evt.clientX;
                var mouseY = evt.clientY;
                this.visible = true;
                dom.removeClass(this.el, "rplayer-hide");
                this.timer = setTimeout(function () {
                    _this.hide(mouseX, mouseY);
                }, 5000);
            }
            return this;
        }
    }, {
        key: "hide",
        value: function hide(mouseX, mouseY) {
            if (!dom.isPositionInEl(this.el, mouseX, mouseY, true)) {
                dom.addClass(this.el, "rplayer-hide");
            }
            return this;
        }
    }, {
        key: "keyDown",
        value: function keyDown(evt) {
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
        }
    }, {
        key: "showVolumePopup",
        value: function showVolumePopup(volume) {
            var text = "\u5F53\u524D\u97F3\u91CF: " + volume;
            if (volume === 0) {
                text = "静音";
            }
            this.volumePopup.show(text);
            return this;
        }
    }, {
        key: "updateMeta",
        value: function updateMeta(meta) {
            var duration = meta.duration,
                progress = this.progress;
            this.timeInfo.updateTotalTime(duration);
            progress.enable(this.enabled = true);
            progress.duration = duration;
        }
    }, {
        key: "updateTime",
        value: function updateTime(current) {
            this.timeInfo.updateCurrentTime(current);
            this.progress.trigger(VIDEO_PROGRESS_UPDATED, current);
        }
    }, {
        key: "updateProgress",
        value: function updateProgress(time) {
            this.media.setCurrentTime(time);
            this.timeInfo.updateCurrentTime(time);
        }
    }, {
        key: "play",
        value: function play() {
            dom.addClass(this.playBtn, "rplayer-paused");
            return this;
        }
    }, {
        key: "pause",
        value: function pause() {
            dom.removeClass(this.playBtn, "rplayer-paused");
            return this;
        }
    }, {
        key: "togglePlay",
        value: function togglePlay() {
            if (this.enabled) {
                this.media.togglePlay();
                this.media.paused ? this.pause() : this.play();
            }
        }
    }, {
        key: "initEvent",
        value: function initEvent() {
            var _this2 = this;

            var media = this.media,
                progress = this.progress,
                toggle = this.togglePlay.bind(this);
            media.on(VIDEO_VOLUME_CHANGE, function (evt, volume) {
                return _this2.showVolumePopup(volume);
            }).on(VIDEO_LOAD_START, function () {
                _this2.pause();
                _this2.progress.enable(_this2.enabled = false);
            }).on(VIDEO_LOADED_META, function (evt, meta) {
                return _this2.updateMeta(meta);
            }).on(VIDEO_TIME_UPDATE, function (evt, current) {
                return _this2.updateTime(current);
            }).on(VIDEO_PROGRESS, function (evt, buffered) {
                return progress.trigger(VIDEO_PROGRESS_BUFFER, buffered);
            }).on(VIDEO_PLAYING, this.play.bind(this)).on(VIDEO_PAUSE, this.pause.bind(this)).on(VIDEO_CLICK, toggle).on(VIDEO_DBLCLICK, function () {
                return _this2.fullScreen.toggle();
            });
            progress.on(VIDEO_PROGRESS_UPDATE, function (evt, time) {
                return _this2.updateProgress(time);
            });
            this.volumeControl.on(VOLUME_CONTROL_MUTE, function (evt, muted) {
                return media.mute(muted);
            }).on(VOLUME_CONTROL_UPDATE, function (evt, volume) {
                return media.setVolume(volume);
            });
            dom.on(this.parentEl, "keydown", this.keyDown.bind(this)).on(this.parentEl, "mousemove", this.show.bind(this)).on(this.playBtn, "click", toggle);
            return this;
        }
    }, {
        key: "init",
        value: function init() {
            var settingsPanel = dom.createElement("div", { "class": "rplayer-settings rplayer-rt" }),
                playControl = dom.createElement("div", { "class": "rplayer-play-control rplayer-lf" }),
                el = this.el;
            this.fullScreen.init(settingsPanel);
            this.volumeControl.init(settingsPanel);
            playControl.appendChild(this.playBtn);
            this.timeInfo.init(playControl);
            this.progress.init(el);
            this.volumePopup.init(el);
            el.appendChild(playControl);
            el.appendChild(settingsPanel);
            this.parentEl.appendChild(el);
            this.show();
            return this.initEvent();
        }
    }]);

    return Controls;
}();

var _createClass$11 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$11(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$4(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$4(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DEFAULT_HEIGHT = 500;

function handleConfig(options) {
    return isObject(options) ? {
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

var RPlayer = function (_Subscriber) {
    _inherits$4(RPlayer, _Subscriber);

    function RPlayer(selector, options) {
        _classCallCheck$11(this, RPlayer);

        var target = dom.selectElement(selector),
            config = handleConfig(options);

        var _this = _possibleConstructorReturn$4(this, (RPlayer.__proto__ || Object.getPrototypeOf(RPlayer)).call(this));

        if (!config.source) {
            throw new Error("没有设置视频链接");
        }
        if (!target) {
            throw new Error("未选中任何元素");
        }
        _this.target = target;
        _this.loading = new Loading();
        _this.video = new VideoControl(config);
        _this.container = dom.createElement("div", {
            "tabIndex": 100, //使元素能够获取焦点
            "class": "rplayer-container"
        });
        //播放控制与原生控制二选一，如果设置了useNativeControls为true，则优先使用原生控制
        if ((isUndefined(options.controls) ? true : !!options.controls) && !config.useNativeControls) {
            _this.controls = new Controls(_this.container, _this.video, config.defaultVolume);
        }
        return _this;
    }

    _createClass$11(RPlayer, [{
        key: "buffer",
        value: function buffer(buffered, readyState) {
            if (readyState < 3) {
                this.loading.show();
            }
        }
    }, {
        key: "playEnd",
        value: function playEnd() {
            this.trigger("play.end");
        }
    }, {
        key: "handleError",
        value: function handleError(error) {
            if (!this.error) {
                this.error = new VideoError();
                this.error.init(this.container, this.refresh.bind(this));
            }
            this.loading.hide();
            this.error.show(error.message);
            return this;
        }
    }, {
        key: "refresh",
        value: function refresh() {
            this.video.reload();
            this.error.hide();
        }
    }, {
        key: "initEvent",
        value: function initEvent() {
            var _this2 = this;

            this.video.on(VIDEO_LOAD_START, function () {
                return _this2.loading.show();
            }).on(VIDEO_PROGRESS, function (evt, buffered, readyState) {
                return _this2.buffer(buffered, readyState);
            }).on(VIDEO_SEEKING, function () {
                return _this2.loading.show();
            }).on(VIDEO_CAN_PLAY, function () {
                return _this2.loading.hide();
            }).on(VIDEO_ENDED, this.playEnd.bind(this)).on(VIDEO_ERROR, function (evt, error) {
                return _this2.handleError(error);
            });
            return this;
        }
    }, {
        key: "getSource",
        value: function getSource() {
            return this.video.getSource();
        }
    }, {
        key: "updateSource",
        value: function updateSource(src) {
            this.video.changeSource(src);
        }
    }, {
        key: "initialize",
        value: function initialize() {
            var container = this.container,
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
        }
    }]);

    return RPlayer;
}(Subscriber);

RPlayer.init = function (selector, options) {
    return new RPlayer(selector, options).initialize();
};

return RPlayer;

})));
//# sourceMappingURL=rplayer.js.map
