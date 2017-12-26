var dom = {
        doc: document,
        handlers: {}
    },
    guid = 0;

dom.getByCls = function (cls) {
    var result = this.doc.getElementsByClassName(cls);
    return result.length ? (result.length === 1 ? result[0] : result) : null;
};

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
    ;
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

dom.fullScreen = function (el) {
    var support = this.supportFullScreen();
    if (support) {
        el[support]();
    }
    return this;
};

dom.supportFullScreen = function () {
    var el = this.doc.createElement("video"),
        fns = [
            "requestFullscreen",
            "webkitRequestFullScreen",
            "mozRequestFullScreen",
            "msRequestFullscreen"
        ],
        support, tmp,
        i = 0,
        len = fns.length;
    for (; i < len; i++) {
        tmp = fns[i]
        if (el[tmp]) {
            el[tmp]();
            support = tmp;
            break;
        }
    }
    return support;
};

//不支持全屏的浏览器，在网页内铺满窗口
dom.fullPage = function (el, exit) {

};

dom.exitFullScreen = function () {

};

dom.getFullScreenElement = function () {

};

dom.selectElement = function (selector) {
    var ret = [],
        reg = /^#[^>~+\[\]\s]+$/; //id选择器
    if (selector) {
        if (selector.nodeName) {
            ret = [selector];
        } else if (typeof selector === "string") {
            if (reg.test(selector)) {
                ret = this.doc.getElementById(selector.substring(1));
                ret && (ret = [ret]);
                console.log(selector, ret)
            } else {
                ret = this.doc.querySelectorAll(selector);
                ret = Array.prototype.slice.call(ret);
            }

        }
    }
    return ret;
};

dom._on = function (el, type, callback, capture) {
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
    el.addEventListener(type, callback, capture);
};

dom.on = function (selector, type, callback, capture) {
    var el, len, i = 0;
    if (typeof callback === "function") {
        el = this.selectElement(selector);
        len = el.length;
        for (; i < len; i++) {
            this._on(el[i], type, callback, !!capture);
        }
    }
    return this;
};

var DEFAULT_OPTIONS = {
    autoPlay: false,
    defaultVolume: 50,
    loop: false,
    poster: "",
    preload: "metadata",
    source: ""
};

function isObject(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
}

function RPlayer(target, options) {
    if (isObject(options)) {
        this.config = {
            autoPlay: !!options.autoPlay,
            defaultVolume: Math.abs(parseInt(options.defaultVolume)) || DEFAULT_OPTIONS.defaultVolume,
            loop: !!options.loop,
            poster: options.poster || DEFAULT_OPTIONS.poster,
            source: options.source
        };
    } else {
        this.config = DEFAULT_OPTIONS;
    }
    if (!this.config.source) {
        // new Error("没有设置视频链接");
    }
    if (!target.nodeName) {
        throw new Error("第一个参数不是HTML元素");
    }
    this.target = target;
    this.playing = false;
    this.volume = this.config.defaultVolume
    this.mute = false;
    this.isFullScreen = false;
}

var fn = RPlayer.prototype,
    SLIDER_SIZE = 12,
    tpl = '<div class="rplayer-loading rplayer-hide"></div>' +
        '    <div class="rplayer-controls">' +
        '        <div class="rplayer-progress-panel">' +
        '            <div class="rplayer-progress rplayer-video-track">' +
        '                <div class="rplayer-bufferd-bar"></div>' +
        '                <div class="rplayer-bar rplayer-video-progress"></div>' +
        '                <div class="rplayer-slider rplayer-video-slider"></div>' +
        '            </div>' +
        '        </div>' +
        '        <div class="rplayer-play-control rplayer-lf">' +
        '            <button type="button" class="rplayer-play-btn"></button>' +
        '            <span class="rplayer-time-info">' +
        '                        <span class="rplayer-current-time">dsfsdfs</span> / ' +
        '                        <span class="rplayer-total-time">sdsdf</span>' +
        '                    </span>' +
        '        </div>\n' +
        '        <div class="rplayer-settings rplayer-rt">\n' +
        '            <button type="button" class="rplayer-fullscreen-btn rplayer-rt"></button>\n' +
        '            <div class="rplayer-audio-control rplayer-rt">\n' +
        '                <button type="button" class="rplayer-audio-btn volume-1"></button>\n' +
        '                <div class="rplayer-volume-popup rplayer-hide">\n' +
        '                    <div class="rplayer-progress">\n' +
        '                        <div class="rplayer-bar rplayer-volume-value"></div>\n' +
        '                        <div class="rplayer-slider rplayer-volume-slider"></div>\n' +
        '                    </div>\n' +
        '                    <button class="rplayer-mute volume-1"></button>\n' +
        '                </div>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>';
fn.initEvent = function () {
    var _this = this;
    dom.on(".rplayer-play-btn", "click", function (evt) {
        if (_this.playing = !_this.playing) {
            dom.addClass(this, "paused")
        } else {
            dom.removeClass(this, "paused")
        }
    }).on(".rplayer-video-track", "click", function (evt) {
        var slider = dom.getByCls("rplayer-video-slider"),
            left = evt.offsetX;
        console.log(slider)
        console.log(evt.offsetX);
        console.log(evt.clientX)
    }).on(".rplayer-fullscreen-btn", "click", function () {
        if (_this.isFullScreen) {

        } else {
            dom.fullScreen(_this.container).addClass(this, "fullscreen").addClass(_this.container, "fullscreen");
        }
    });
};

fn.initialize = function () {
    this.container = dom.doc.createElement("div"),
        this.videoEl = dom.doc.createElement("video");
    dom.addClass(this.container, "rplayer-container").addClass(this.videoEl, "rplayer-video");
    this.container.innerHTML = tpl;
    this.container.appendChild(this.videoEl);
    this.target.appendChild(this.container);
    this.initEvent();
};

RPlayer.init = function (selector, options) {
    var els = dom.selectElement(selector);
    els.forEach(function (el) {
        new RPlayer(el, options).initialize();
    });
};

RPlayer.init("#container");