;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.RPlayer = factory();
  }
}(this, function() {
var dom = {
        handlers: {}
    },
    doc = document,
    guid = 1;

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

dom.replaceClass = function (el, cls) {
    el.className  = cls;
    return this;
};

dom.fullScreen = function (el, exit) {
    var fsApi = this.fsApi;
    if (fsApi) {
        exit ? el[fsApi.requestFullscreen()]() : doc[fsApi.exit]();
    } else {
        this.fullPage(el, false);
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
dom.selectElement = function (selector) {
    var ret,
        reg = /^#[^>~+\[\]\s]+$/; //匹配id选择器
    if (selector) {
        if (selector.nodeName) {
            ret = selector;
        } else if (typeof selector === "string") {
            if (reg.test(selector)) {
                ret = doc.getElementById(selector.substring(1));
                console.log(selector, ret)
            } else {
                ret = doc.querySelector(selector);
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
    var el = this.selectElement(selector);
    if (el && isFunction(callback)) {
        off ? this._off(el, type, callback) :
            this._on(el, type, callback);
    } else if (el && !isFunction(callback)) {
        this._off(el, type);
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
                'requestFullscreen',
                'exitFullscreen',
                'fullscreenElement',
                'fullscreenEnabled',
                'fullscreenchange',
                'fullscreenerror'
            ],
            // WebKit
            [
                'webkitRequestFullscreen',
                'webkitExitFullscreen',
                'webkitFullscreenElement',
                'webkitFullscreenEnabled',
                'webkitfullscreenchange',
                'webkitfullscreenerror'
            ],
            // Firefox
            [
                'mozRequestFullScreen',
                'mozCancelFullScreen',
                'mozFullScreenElement',
                'mozFullScreenEnabled',
                'mozfullscreenchange',
                'mozfullscreenerror'
            ],
            // IE
            [
                'msRequestFullscreen',
                'msExitFullscreen',
                'msFullscreenElement',
                'msFullscreenEnabled',
                'MSFullscreenChange',
                'MSFullscreenError'
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

var DEFAULT_OPTIONS = {
    autoPlay: false,
    defaultVolume: 50,
    loop: false,
    poster: "",
    preload: "metadata",
    source: "",
    msg: ""
};

function isObject(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
}

function query(selector, context) {
    context = context || doc;
    return context.querySelector(selector);
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
    tpl = '<div class="rplayer-container">' +
        '    <video class="rplayer-video"></video>' +
        '    <div class="rplayer-loading rplayer-hide"></div>' +
        '    <div class="rplayer-controls">' +
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
        '                        <span>dsfsdfs</span> / ' +
        '                        <span>sdsdf</span>' +
        '                    </span>' +
        '        </div>' +
        '        <div class="rplayer-settings rplayer-rt">' +
        '            <button type="button" class="rplayer-fullscreen-btn rplayer-rt"></button>' +
        '            <div class="rplayer-audio-control rplayer-rt">' +
        '                <button type="button" class="rplayer-audio-btn volume-1"></button>' +
        '                <div class="rplayer-volume-popup rplayer-hide">' +
        '                    <div class="rplayer-progress">' +
        '                        <div class="rplayer-audio-track">' +
        '                            <div class="rplayer-bar rplayer-volume-value"></div>' +
        '                            <div class="rplayer-slider rplayer-volume-slider"></div>' +
        '                        </div>' +
        '                    </div>' +
        '                    <button class="rplayer-mute volume-1"></button>' +
        '                </div>' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '</div>';

fn.initFullScreenEvent = function () {
    var _this = this,
        fsApi = dom.fsApi;
    if (fsApi) {
        dom.on(dom.doc, fsApi.fullscreenchange, function () {

        });
    }
    dom.on(".rplayer-fullscreen-btn", "click", function () {
        if (_this.isFullScreen) {

        } else {
            dom.fullScreen(_this.container)
                .addClass(this, "fullscreen")
                .addClass(_this.container, "fullscreen");
        }
    });
};

fn.initVolumeEvent = function () {
    var _this = this,
        context = this.container;
    dom.on(".rplayer-audio-btn", "click", function (evt) {
        var panel = query(".rplayer-volume-popup", context),
            cls = "rplayer-hide";
        if (dom.hasClass(panel)) {
            dom.addClass(panel, cls);
        }
        dom.hasClass(panel, cls) ? dom.removeClass(panel, cls) :
            dom.addClass(panel, cls);
        evt.stopPropagation();
    }).on(".rplayer-volume-slider", "mousedown", function (evt) {
        var slider = this,
            origTop = this.offsetTop + SLIDER_SIZE,
            startY = evt.clientY,
            el = query(".rplayer-volume-value", context),
            max = el.parentNode.offsetHeight;
        move = function (evt) {
            var y = evt.clientY,
                distance = max - (y - startY + origTop);
            distance = distance < 0 ? 0 : distance > max ? max : distance;
            distance = distance / max * 100;
            el.style.height = slider.style.bottom = distance + "%";
        };
        dom.on(_this.container, "mousemove", move)
            .on(doc, "mouseup", function () {
                dom.off(_this.container, "mousemove").off(doc, "mouseup");
            });
    });
    return this;
};

fn.initPlayEvent = function () {
    var _this = this,
        context = this.container;
    dom.on(".rplayer-play-btn", "click", function (evt) {
        if (_this.playing = !_this.playing) {
            dom.addClass(this, "paused")
        } else {
            dom.removeClass(this, "paused")
        }
    }).on(".rplayer-video-track", "click", function (evt) {
        var slider = query(".rplayer-video-slider", context),
            left = evt.offsetX;
    }).on(".rplayer-video-slider", "mousedown", function (evt) {
        var slider = this,
            origLeft = this.offsetLeft,
            startX = evt.clientX,
            el = query(".rplayer-video-progress", context),
            max = el.parentNode.offsetWidth;
        move = function (evt) {
            var x = evt.clientX,
                distance = x - startX + origLeft;
            distance = distance < 0 ? 0 : distance > max ? max : distance;
            distance = distance / max * 100;
            el.style.width = slider.style.left = distance + "%";
        };
        dom.on(_this.container, "mousemove", move)
            .on(doc, "mouseup", function () {
                dom.off(_this.container, "mousemove").off(doc, "mouseup");
            });
    });
    return this;
};

fn.initEvent = function () {
    var volumePanel = query(".rplayer-volume-popup", this.container);
    dom.on(doc, "click", function (evt) {
        var tgt = evt.target;
        if (volumePanel !== tgt && !volumePanel.contains(tgt)) {
            dom.addClass(volumePanel, "rplayer-hide");
        }
    });
    this.initPlayEvent()
        .initVolumeEvent();
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

fn.initialize = function () {
    this.destroy();
    this.container = doc.createElement("div");
    this.initSource(this.videoEl = doc.createElement("video"));
    this.videoEl.appendChild(doc.createTextNode(this.config.msg));
    dom.addClass(this.container, "rplayer-container").addClass(this.videoEl, "rplayer-video");
    this.container.innerHTML = tpl;
    this.container.appendChild(this.videoEl);
    this.target.appendChild(this.container);
    this.initEvent();
    return this;
};

RPlayer.init = function (selector, options) {
    return new RPlayer(selector, options).initialize();
};
return RPlayer;
}));
