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
    //根据这个变量判断是否移动滑块,如果移动滑块则阻止点击轨道改变进度/音量的执行
    sliderMoving = false,
    DEFAULT_HEIGHT = 500,
    DEFAULT_OPTIONS = {
        autoPlay: false,
        defaultVolume: 50,
        loop: false,
        poster: "",
        preload: "metadata",
        source: "",
        msg: ""
    },
    ERROR_TYPE = {
        "1": "MEDIA_ERR_ABORTED",
        "2": "MEDIA_ERR_NETWORK",
        "3": "MEDIA_ERR_DECODE",
        "4": "MEDIA_ERR_SRC_NOT_SUPPORTED"
    },
    hideVolumePopTimer = null,
    hideControlsTimer = null,
    HIDE_CLASS = "rplayer-hide",
    TYPE = {
        function: "[object Function]",
        object: "[object Object]",
        string: "[object String]",
        undef: "[object Undefined]"
    },
    isType = function (type) {
        return function (obj) {
            return Object.prototype.toString.call(obj) === TYPE[type];
        };
    },
    isFunction = isType("function"),
    isObject = isType("object"),
    isString = isType("string"),
    isUndefined = isType("undef"),
    isWindow = function (obj) {
        return obj && obj.window === obj;
    };
var dom = {
        handlers: {}
    };

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
        className;
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
        className;
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
    var ret,
        reg = /^#[^>~+\[\]\s]+$/; //匹配id选择器
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
        key;
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
        if (type) {
            //添加多个事件，以空格分开
            type = type.split(" ");
            i = type.length;
            if (isFunction(callback)) {
                for (; i--;) {
                    t = type[i];
                    off ? this._off(el, t, callback) :
                        this._on(el, t, callback);
                }
            } else if(off){
                for (; i--;) {
                    this._off(el, type[i]);
                }
            }
        } else {
            off && this._off(el);
        }

    }
    return this;
};

//移除元素的事件
dom._off = function (el, type, callback) {
    var id = el.guid,
        handlers = this.handlers[id],
        i = 0, len;
    if (handlers) {
        if (type && (handlers = handlers[type])) {
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
        } else if (!type) {//如果没有type, 则移除该元素的所有事件
            for (i in handlers) {
                this._off(el, i);
            }
        }
    }
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
          '<div class="rplayer-popup-info rplayer-popup-volume-info rplayer-hide">10:00</div>' +
          '<div class="rplayer-error rplayer-hide"><div class="rplayer-msg">出错了</div></div>',
    controls = '<div class="rplayer-popup-info rplayer-popup-video-info rplayer-hide">10:00</div>' +
        '        <div class="rplayer-progress-panel">' +
        '            <div class="rplayer-progress rplayer-video-track">' +
        '                <div class="rplayer-bufferd-bar"></div>' +
        '                <div class="rplayer-bar rplayer-video-progress"></div>' +
        '                <div class="rplayer-mark rplayer-hide"></div>' +
        '                <div class="rplayer-slider rplayer-video-slider"></div>' +
        '            </div>' +
        '        </div>' +
        '        <div class="rplayer-play-control rplayer-lf">' +
        '            <button type="button" class="rplayer-play-btn"></button>' +
        '            <span class="rplayer-time-info">' +
        '               <span class="rplayer-current-time">00:00</span>/' +
        '               <span class="rplayer-total-time">00:00</span>' +
        '             </span>' +
        '        </div>' +
        '        <div class="rplayer-settings rplayer-rt">' +
        '            <button type="button" class="rplayer-fullscreen-btn rplayer-rt"></button>' +
        '            <div class="rplayer-audio-control rplayer-rt">' +
        '                <button type="button" class="rplayer-audio-btn volume-1"></button>' +
        '                <div class="rplayer-volume-popup rplayer-hide">' +
        '                    <span class="rplayer-current-volume">12</span>' +
        '                    <div class="rplayer-progress rplayer-volume-progress">' +
        '                        <div class="rplayer-bar rplayer-volume-value"></div>' +
        '                        <div class="rplayer-slider rplayer-volume-slider"></div>' +
        '                    </div>' +
        '                    <button class="rplayer-mute volume-1"></button>' +
        '                </div>' +
        '            </div>' +
        '        </div>';

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
        if (volume > 1) {
            volume = volume / 100;
        }
        volume > 1 && (volume = 1);
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
            buffered = buffered.end(len - 1) / this.getDuration() * 100;
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
    on: function (type, fn) {
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
    off: function (type, fn) {
        var h = this.handlers[type],
            i;
        if (h) {
            if (isFunction(fn)) {
                for (i = h.length; i--;) {
                    if (h[i] === fn) {
                        h.splice(i, 1);
                        break;
                    }
                }
            } else if (!fn){
                this.handlers[type] = [];
            }
        }
        return this;
    },
    once: function (type, fn) {
        if (isFunction(fn)) {
            var self = this,
                f = function () {
                    fn.apply(this, arguments);
                    self.off(type, f);
                };
            this.on(type, f);
        }
    },
    trigger: function (type) {
        var args = Array.prototype.slice.call(arguments, 1),
            h = this.handlers[type],
            e, i;
        if (h) {
            e = new CEvent(type);
            e.data = args;
            e.timeStamp = Date.now();
            args = [e].concat(args);
            for (i = h.length; i--; ) {
                h[i].apply(this, args);
            }
        }
        return this;
    }
};
function RPlayer(selector, options) {
    var target = dom.selectElement(selector),
        config;
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
        new Error("没有设置视频链接");
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
    dom.fullScreen(this.container)
        .addClass(this.fullScreenBtn, "rplayer-fullscreen")
        .addClass(this.container, "rplayer-fullscreen");
};

fn.exitFullScreen = function () {
    this.isFullScreen = false;
    dom.fullScreen(this.container, true)
        .removeClass(this.fullScreenBtn, "rplayer-fullscreen")
        .removeClass(this.container, "rplayer-fullscreen");
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
    this.currentVolume.innerHTML = volume;
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

//移动改变音量/进度的滑块
fn.moveSlider = function (evt, obj, fn) {
    if (!sliderMoving) {
        sliderMoving = true;
    }
    fn.call(this, evt, obj);
};

//计算音量滑块移动的距离
fn.calcVolumeDistance = function (evt, obj) {
    var y = evt.clientY,
        max = obj.max,
        distance = max - (y - obj.offset);
    distance = distance < 0 ? 0 : distance > max ? max : distance;
    distance = distance / max * 100;
    this.updateVolume(distance);
};

function docMouseUp(obj, fn) {
    dom.off(doc, "mouseup mousemove");
    if (isFunction(fn)) {
        fn(obj.distance);
    }
}

//移动slider改变音量
fn.slideVolumeSlider = function (evt) {
    if (evt.button) return; //按下的鼠标不是左键则不作处理(左键evt.button=0)
    var origTop = this.volumeSlider.offsetTop + this.volumeSlider.offsetHeight,
        startY = evt.clientY - origTop,
        _this = this;
    origTop = {
        max: this.volumeSlider.parentNode.offsetHeight,
        offset: startY
    };
    dom.on(doc, "mousemove", function (evt) {
        _this.moveSlider(evt, origTop, _this.calcVolumeDistance);
    }).on(doc, "mouseup", function () {
        docMouseUp();
    });
};

fn.mute = function () {
    //点击静音键
    if (this.video.isMuted()) {
        this.video.mute(false);
        this.updateVolumeStyle(this.video.getVolume());
    } else {
        this.video.mute(true);
        this.updateVolumeStyle(0);
    }
};

//点击音量设置轨道/视频进度轨道回调
fn.clickOnBar = function (evt, fn) {
    if (sliderMoving) {
        sliderMoving = false;
        return;
    }
    fn.call(this, evt);
};

//点击音量轨道改变音量
fn.clickVolumeBar = function (evt) {
    var rect = this.volumeProgress.getBoundingClientRect(),
        y = evt.clientY;
    rect = (rect.height - y + rect.top) / rect.height * 100;
    this.updateVolume(rect);
};

fn.initVolumeEvent = function () {
    var _this = this;
    dom.on(this.volumePopup, "mouseleave", this.hideVolumeSettingsPanel.bind(this))
        .on(this.volumeSlider, "mousedown", this.slideVolumeSlider.bind(this))
        .on(this.volumeProgress, "click", function (evt) {
            _this.clickOnBar(evt, _this.clickVolumeBar);
        })
        .on(doc, "click", function (evt) {
            var tgt = evt.target;
            //点击页面其他地方（点击的不是音量设置面板或者面板内的元素）则隐藏音量面板
            if (tgt !== _this.volumePopup && !_this.volumePopup.contains(tgt)) {
                _this.hideVolumeSettingsPanel();
            }
        });
    return this;
};

fn.togglePlay = function () {
    if (!this.controlsDisabled) {
        if (this.video.isPaused()) {
            this.play();
        } else {
            this.pause();
        }
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
        dom.removeClass(popup, HIDE_CLASS)
            .removeClass(mark, HIDE_CLASS);
        var rect = this.videoTrack.getBoundingClientRect(),
            x = evt.clientX,
            distance = x - rect.left,
            width = popup.offsetWidth,
            left = distance - width / 2,
            max = rect.width - width;
        left = left < 0 ? 0 : left > max ? max : left;
        max = distance / rect.width;
        popup.innerHTML = this.video.convertTime(max * duration);
        popup.style.left = left + "px";
        mark.style.left = max * 100 + "%";
    }
    return this;
};

fn.hidePopupTimeInfo = function () {
    dom.addClass(this.videoPopupTime, HIDE_CLASS)
        .addClass(this.mark, HIDE_CLASS);
    return this;
};

//计算进度滑块移动的距离
fn.calcProgressDistance = function (evt, obj) {
    var x = evt.clientX,
        distance = x - obj.offset,
        max = obj.max;
    distance = distance < 0 ? 0 : distance > max ? max : distance;
    obj.distance = distance = distance / max;
    dom.addClass(this.videoSlider, "rplayer-moving");
    this.updateProgressPosition(distance);
};

//拖动滑块改变进度
fn.slideVideoSlider = function (evt) {
    if (evt.button) return;
    var origLeft = this.videoSlider.offsetLeft,
        startX = evt.clientX - origLeft,
        _this = this;
    origLeft = {
        max: this.videoSlider.parentNode.offsetWidth,
        offset: startX
    };
    dom.on(doc, "mousemove", function (evt) {
        _this.moveSlider(evt, origLeft, _this.calcProgressDistance);
    }).on(doc, "mouseup", function () {
        docMouseUp(origLeft, function (dis) {
            _this.trigger("progress.changed.by.user", dis, true);
        });
    });
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
    typeof  b === "number" && this.bufferedBar && (this.bufferedBar.style.width = b + "%");
    if (this.video.getReadyState() < 3) {
        this.showLoading();
    }
};

fn.updateProgressPosition = function (progress) {
    isUndefined(progress) && (progress = this.video.getPlayedPercentage());
    this.videoProgress.style.width = this.videoSlider.style.left = progress * 100 + "%";
    this.updateCurrentTime();
    return this;
};

fn.updateProgressByStep = function (step) {
    var currentTime = this.video.getCurrentTime(),
        duration = this.video.getDuration();
    currentTime += step;
    currentTime = currentTime < 0 ? 0 : currentTime > duration ? duration : currentTime;
    this.video.setCurrentTime(currentTime);
    this.updateProgressPosition();
};

fn.updateCurrentTime = function () {
    this.currentTime.innerHTML = this.video.convertTime(this.video.getCurrentTime());
    return this;
};

fn.updateTotalTime = function () {
    this.totalTime.innerHTML = this.video.convertTime(this.video.getDuration());
    return this;
};

fn.updateMetaInfo = function () {
    if (this.video.isAutoPlay()) {
        this.play();
    }
    this.updateTotalTime()
        .enableControls();
};

fn.hideControls = function () {
    dom.addClass(this.controlsPanel, HIDE_CLASS);
    return this;
};

fn.showControls = function () {
    var _this = this,
        err = this.video.isError();
    //出错了则不显示控制条
    if (err != null) return;
    clearTimeout(hideControlsTimer);
    dom.removeClass(this.controlsPanel, HIDE_CLASS);
    if (dom.hasClass(this.volumePopup, HIDE_CLASS)) {
        hideControlsTimer = setTimeout(function () {
            _this.hideControls();
        }, 5000);
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

fn.loop = function () {
    return this.video.isLoop() ? this.play() :
        this.pause();
};

fn.toggleError = function () {
    var el = this.errorMsg.parentNode;
    dom.toggleClass(el, HIDE_CLASS);
    this.hideLoading()
        .hideControls();
    return this;
};

fn.error = function () {
    var err = this.video.isError(),
        currentTime = this.video.getCurrentTime(),
        msg;
    //出现错误刷新调用reload之后，会触发updatetime事件更新时间，时间为0
    //则不能从中断处理开始播放,故时间不为0时保存，
    if (currentTime) {
        this.playedTime = currentTime
    }
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
    this.toggleError();
};

fn.refresh = function () {
    this.video.reload();
    this.toggleError()
        .updateProgressPosition(0);
};

//点击进度条改变播放进度
fn.clickProgressBar = function (evt) {
    var rect = this.videoTrack.getBoundingClientRect(),
        x = evt.clientX;
    rect = (x - rect.left) / rect.width;
    this.trigger("progress.changed.by.user", rect);
};

fn.initPlayEvent = function () {
    var _this = this,
        videoEl = this.video.el;
    dom.on(videoEl, "loadstart stalled", function (evt) {
            if (_this.playedTime && evt.type === "loadstart") {
                _this.video.setCurrentTime(_this.playedTime);
                this.playedTime = 0;
            }
            _this.showLoading()
                .disableControls();
        })
        .on(videoEl, "progress", this.progress.bind(this))
        .on(videoEl, "canplay seeked", this.hideLoading.bind(this))
        .on(videoEl, "ended", this.loop.bind(this))
        .on(videoEl, "error", this.error.bind(this))
        .on(videoEl, "contextmenu", function (evt) {
            evt.preventDefault();
        });

    return this;
};

fn.toggleVolumePopupInfo = function (volume) {
    var _this = this;
    //当音量设置面板隐藏是才显示当前音量
    if (dom.hasClass(this.volumePopup, HIDE_CLASS)) {
        clearTimeout(hideVolumePopTimer);
        this.volumePopupInfo.innerHTML = "当前音量: " + volume;
        this.currentVolume.innerHTML = volume;
        dom.removeClass(this.volumePopupInfo, HIDE_CLASS);
        hideVolumePopTimer = setTimeout(function () {
            dom.addClass(_this.volumePopupInfo, HIDE_CLASS);
        }, 3000);
    }
    return this;
};

fn.keyDown = function (evt) {
    //控制条被禁用时，不做处理
    if (this.controlsDisabled) return;
    var key = evt.key.toLowerCase(),
        //up,down, left, right为IE浏览器中的上，下按键
        //arrowup,arrowdown, arrowleft, arrowright为其他浏览器中的上，下按键
        //按上下键音量加减5
        regUpOrDown = /(up)|(down)/,
        regLeftOrRight = /(left)|(right)/,
        //regEsc = /esc/,
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
            escape: "escape" //esc键盘
        },
        tmp = keyMap[key];
    if (tmp) {
        if (regLeftOrRight.test(key)) {
            this.updateProgressByStep(tmp);
        } else if (regUpOrDown.test(key)) {
            this.updateVolumeByStep(tmp);
        } else {// if (regEsc.test(key)) {
            this.toggleFullScreen();
        }
    } else if (key === " " || key === "spacebar") {//空格键
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
            this.togglePlay();
            break;
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

fn.initControlEvent = function () {
    var _this = this,
        videoEl = this.video.el;
    //滑动改变进度/点击进度条改变进度
    this.on("progress.changed.by.user", function (evt, progress, move) {
        move ? dom.removeClass(_this.videoSlider, "rplayer-moving")
            : this.updateProgressPosition(progress);
        progress && _this.video.setCurrentTime(progress, true);
    });
    dom.on(this.videoTrack, "mouseover mousemove", this.showPopupTimeInfo.bind(this))
        .on(this.videoTrack, "mouseout", this.hidePopupTimeInfo.bind(this))
        .on(this.videoTrack, "click", function (evt) {
            _this.clickOnBar(evt, _this.clickProgressBar);
        })
        .on(this.videoSlider, "mousedown", this.slideVideoSlider.bind(this))
        .on(this.container, "keydown", this.keyDown.bind(this))
        .on(this.container, "mousemove", this.showControls.bind(this))
        .on(videoEl, "loadedmetadata", this.updateMetaInfo.bind(this))
        .on(videoEl, "timeupdate", function () {
            //在拖动滑块改变播放进度时候不改变播放进度条位置，只改变播放的当前时间
            //防止影响滑块以及进度条的位置
            if (!dom.hasClass(_this.videoSlider, "rplayer-moving")) {
                _this.updateProgressPosition();
            } else {
                _this.updateCurrentTime();
            }
        })
        .on(videoEl, "dblclick", this.toggleFullScreen.bind(this))
        .on(videoEl, "seeking", this.showLoading.bind(this));
    return this.initVolumeEvent()
        .initFullScreenEvent();
};

fn.offEvent = function () {
    dom.off(doc)
        .off(this.volumePopup)
        .off(this.volumeSlider)
        .off(this.volumeProgress)
        .off(this.videoTrack)
        .off(this.container)
        .off(this.video.el);
    return this;
};

fn.removeProp = function () {
    var key;
    for (key in this) {
        delete this[key];
    }
    return this;
};

fn.destroy = function () {
    if (this.container) {
        //this.target.removeChild(this.container);
        this.offEvent()
            .removeProp();
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
    this.videoTrack = dom.selectElement(".rplayer-video-track", context);
    this.videoSlider = dom.selectElement(".rplayer-video-slider", context);
    this.videoProgress = dom.selectElement(".rplayer-video-progress", context);
    this.videoPopupTime = dom.selectElement(".rplayer-popup-video-info", context);
    this.currentTime = dom.selectElement(".rplayer-current-time", context);
    this.totalTime = dom.selectElement(".rplayer-total-time", context);
    this.bufferedBar = dom.selectElement(".rplayer-bufferd-bar", context);
    this.showVolumePopBtn = dom.selectElement(".rplayer-audio-btn", context);
    this.muteBtn = dom.selectElement(".rplayer-mute", context);
    this.volumePopup = dom.selectElement(".rplayer-volume-popup", context);
    this.volumePopupInfo = dom.selectElement(".rplayer-popup-volume-info", context);
    this.volumeSlider = dom.selectElement(".rplayer-volume-slider", context);
    this.volumeProgress = dom.selectElement(".rplayer-volume-progress", context);
    this.volumeValue = dom.selectElement(".rplayer-volume-value", context);
    this.currentVolume = dom.selectElement(".rplayer-current-volume", context);
    this.fullScreenBtn = dom.selectElement(".rplayer-fullscreen-btn", context);
    this.mark = dom.selectElement(".rplayer-mark", context);
    return this;
};

fn.initPlayState = function () {

};

fn.getSource = function () {
    return this.video.getSource();
};

fn.initialize = function () {
    if (!this.container) { //防止重复初始化
        var container = doc.createElement("div"),
            height = parseInt(getComputedStyle(this.target).height);
        this.isFullScreen = false;
        container.tabIndex = 100;//使元素能够获取焦点
        container.innerHTML = tpl;
        container.style.height = (height || DEFAULT_HEIGHT) + "px";
        this.container = container;
        container.appendChild(this.video.init());
        dom.addClass(this.container, "rplayer-container");
        //播放控制与原生控制二选一，如果设置了useNativeControls为true，则优先使用原生控制
        if (this.controls && !this.useNativeControls) {
            this.controlsPanel = doc.createElement("div");
            dom.addClass(this.controlsPanel, "rplayer-controls");
            this.controlsPanel.innerHTML = controls;
            this.container.appendChild(this.controlsPanel);
            this.initElements()
                .updateVolumeStyle(this.video.getVolume())
                .initControlEvent();
        } else if (this.useNativeControls) {
            this.video.showControls();
        }
        this.target.appendChild(this.container);
        this.initEssentialElements()
            .initEvent();
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
}));
