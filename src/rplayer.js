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

/**
 * slide the slider, change video progress or volume
 * @param el {Element} element
 * @param slider {Element} element
 * @param distance {number} 移动的距离
 * @param {string} position left/bottom属性
 * @param {string} prop width/height属性
 */
fn.slide = function (el, slider, distance, position, prop, max) {
    var min = 0;
    distance = distance < min ? min :
               distance > max ? max : distance;
    el.style[prop] = distance + "px";
    slider.style[position] = distance + "px";
};

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
            origTop = this.offsetTop,
            startY = evt.clientY,
            el = query(".rplayer-volume-value", context),
            max = parseInt(getComputedStyle(el.parentNode).height) - SLIDER_SIZE;
        move = function (evt) {
            var y = evt.clientY,
                distance = max - (y - startY + origTop);
            console.log(distance)
            _this.slide(el, slider, distance, "bottom", "height", max);
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
            max = parseInt(getComputedStyle(el.parentNode).width) - SLIDER_SIZE;
        move = function (evt) {
            var x = evt.clientX,
                distance = x - startX + origLeft;
            console.log(distance)
            _this.slide(el, slider, distance, "left", "width", max);
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

fn.initSource = function(el) {
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