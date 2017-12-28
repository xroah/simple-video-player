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
var tpl = '<div class="rplayer-loading rplayer-hide"></div>' +
    '    <div class="rplayer-controls">' +
    '        <div class="rplayer-popup-info rplayer-video-time-info rplayer-hide">10:00</div>' +
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
    '                <div class="rplayer-popup-info rplayer-volume-info rplayer-hide">10:00</div>' +
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

fn.setVolume = function (audioBtn, muteBtn, volumeSlider, volumeValue, currentVolume, volume) {
    volume = Math.ceil(volume);
    this.videoEl.volume = volume / BASE_VOLUME;
    this.volume = volume;
    this.changeVolumeStyle.apply(this, arguments);
    return this;
};

fn.changeVolumeStyle = function (audioBtn, muteBtn, volumeSlider, volumeValue, currentVolume, volume) {
    var cls = audioBtn.className,
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
    volumeSlider.style.bottom = volumeValue.style.height = volume + "%";
    audioBtn.className = muteBtn.className = cls;
    currentVolume.innerHTML = volume;
    this.videoEl.muted = this.muted = !volume;
    return this;
};

fn.initVolumeEvent = function () {
    var _this = this,
        timer,
        context = this.container,
        changeAudioBtn = dom.selectElement(".rplayer-audio-btn", context),
        muteBtn = dom.selectElement(".rplayer-mute", context),
        volumePopup = dom.selectElement(".rplayer-volume-popup", context),
        volumeInfo = dom.selectElement(".rplayer-volume-info", context),
        volumeSlider = dom.selectElement(".rplayer-volume-slider", context),
        volumeProgress = dom.selectElement(".rplayer-volume-progress", context),
        volumeValue = dom.selectElement(".rplayer-volume-value", context),
        currentVolume = dom.selectElement(".rplayer-current-volume", context);
    dom.on(changeAudioBtn, "click", function (evt) {
        //点击显示/隐藏设置音量面板
        var cls = "rplayer-hide";
        if (dom.hasClass(volumePopup)) {
            dom.addClass(volumePopup, cls);
        }
        dom.hasClass(volumePopup, cls) ? dom.removeClass(volumePopup, cls) :
            dom.addClass(volumePopup, cls);
        //阻止冒泡到document, document点击事件点击面板外任意地方隐藏面板，如不阻止冒泡则显示不出来
        evt.stopPropagation();
    }).on(volumeSlider, "mousedown", function (evt) {
        //移动slider改变音量
        if (evt.button) return; //按下的鼠标不是左键则不作处理(左键evt.button=0)
        var origTop = this.offsetTop + SLIDER_SIZE,
            startY = evt.clientY,
            max = volumeValue.parentNode.offsetHeight,
            move = function (evt) {
                var y = evt.clientY,
                    distance = max - (y - startY + origTop);
                distance = distance < 0 ? 0 : distance > max ? max : distance;
                distance = distance / max * 100;
                _this.setVolume(changeAudioBtn, muteBtn, volumeSlider, volumeValue, currentVolume, distance);
            };
        dom.on(_this.container, "mousemove", move)
            .on(doc, "mouseup", function () {
                dom.off(_this.container, "mousemove").off(doc, "mouseup");
            });
    }).on(volumeProgress, "click", function (evt) {
        //点击音量轨道设置音量
        var rect = this.getBoundingClientRect(),
            y = evt.clientY;
        if (evt.target === volumeSlider) return;
        rect = (rect.height - y + rect.top) / rect.height * 100;
        _this.setVolume(changeAudioBtn, muteBtn, volumeSlider, volumeValue, currentVolume, rect);
    }).on(muteBtn, "click", function () {
        //点击静音键
        var args = [changeAudioBtn, muteBtn, volumeSlider, volumeValue, currentVolume];
        console.log(_this.volume)
        if (_this.muted = !_this.muted) {
            args.push(0);
            _this.videoEl.mute = true;
        } else {
            args.push(_this.volume);
            _this.videoEl.mute = false;
        }
        _this.changeVolumeStyle.apply(_this, args);
    }).on(this.container, "keydown", function (evt) {
        var key = evt.key.toLowerCase(),
            volume = _this.volume,
            //up,down为IE浏览器中的上，下按键
            //arrowup,arrowdown为其他浏览器中的上，下按键
            //按上下键音量加减5
            STEP = 5,
            keyMap = {
                up: STEP,
                arrowup: STEP,
                down: -STEP,
                arrowdown: -STEP
            },
            tmp = keyMap[key];
        if (tmp) {
            evt.preventDefault();
            volume += tmp;
            volume = volume > 100 ? 100 : volume < 0 ? 0 : volume;
            _this.setVolume(changeAudioBtn, muteBtn, volumeSlider, volumeValue, currentVolume, volume);
            if (dom.hasClass(volumePopup, "rplayer-hide")) {
                clearTimeout(timer);
                volumeInfo.innerHTML = currentVolume.innerHTML = _this.volume;
                dom.removeClass(volumeInfo, "rplayer-hide");
                timer = setTimeout(function () {
                    dom.addClass(volumeInfo, "rplayer-hide");
                }, 3000)
            }
        }
    });
    this.setVolume(changeAudioBtn, muteBtn, volumeSlider, volumeValue, currentVolume, this.config.defaultVolume);
    return this;
};

fn.initPlayEvent = function () {
    var _this = this,
        context = this.container,
        playButton = dom.selectElement(".rplayer-play-btn", context),
        videoTrack = dom.selectElement(".rplayer-video-track", context),
        videoSlider = dom.selectElement(".rplayer-video-slider", context),
        videoProgress = dom.selectElement(".rplayer-video-progress", context),
        currentTime = dom.selectElement(".rplayer-current-time", context),
        totalTime = dom.selectElement(".rplayer-total-time", context),
        loading = dom.selectElement(".rplayer-loading", context),
        buffered = dom.selectElement(".rplayer-bufferd-bar", context);
    dom.on(playButton, "click", function () {
        //点击播放/暂停
        if (_this.playing = !_this.playing) {
            dom.addClass(this, "paused")
            _this.videoEl.play();
        } else {
            _this.videoEl.pause();
            dom.removeClass(this, "paused")
        }
    }).on(videoTrack, "click", function (evt) {
        //点击视频轨道改变进度
        var rect = this.getBoundingClientRect(),
            x = evt.clientX;
        if (evt.target === videoSlider) return;
        rect = (x - rect.left) / rect.width;
        _this.videoEl.currentTime = _this.videoEl.duration * rect;
        console.log(_this.videoEl.currentTime)
        videoProgress.style.width = videoSlider.style.left = rect * 100 + "%";
    }).on(videoSlider, "mousedown", function (evt) {
        //拖动滑块改变进度
        if (evt.button) return;
        var origLeft = this.offsetLeft,
            startX = evt.clientX,
            max = videoProgress.parentNode.offsetWidth,
            distance,
            move = function (evt) {
                var x = evt.clientX;
                distance = x - startX + origLeft;
                distance = distance < 0 ? 0 : distance > max ? max : distance;
                distance = distance / max * 100;
                videoProgress.style.width = videoSlider.style.left = distance + "%";
                _this.videoEl.pause();
            };
        dom.on(_this.container, "mousemove", move)
            .on(doc, "mouseup", function () {
                dom.off(_this.container, "mousemove").off(doc, "mouseup");
                _this.videoEl.currentTime = _this.videoEl.duration * distance / 100;
                _this.videoEl.play();
            });
    }).on(this.videoEl, "loadedmetadata", function () {
        totalTime.innerHTML = convertTime(this.duration);
        console.log("duration====", _this.videoEl.duration)
    }).on(this.videoEl, "canplay", function () {
        dom.removeClass(loading, "loading").addClass(loading, "rplayer-hide");
    }).on(this.videoEl, "progress", function () {
        var b = this.buffered,
            len = b.length;
        if (len) {
            len = b.end(len - 1);
            len = len / this.duration * 100;
            buffered.style.width = len + "%";
        }
        if (this.readyState < 3) {
            dom.addClass(loading, "loading").removeClass(loading, "rplayer-hide");
        }
    }).on(this.videoEl, "timeupdate", function () {
        var progress = this.currentTime / this.duration * 100;
        videoProgress.style.width = videoSlider.style.left = progress + "%";
        currentTime.innerHTML = convertTime(this.currentTime);
    }).on(this.videoEl, "abort", function () {
        console.log("abort")
        videoProgress.style.width = videoSlider.style.left = 0;
    }).on(this.videoEl, "error", function () {
console.log("error")
    }).on(this.videoEl, "seeking", function () {
       console.log("seeking")
    });
    return this;
};

fn.initEvent = function () {
    var volumePanel = dom.selectElement(".rplayer-volume-popup", this.container);
    dom.on(doc, "click", function (evt) {
        //点击设置音频面板外任何地方隐藏
        var tgt = evt.target;
        if (volumePanel !== tgt && !volumePanel.contains(tgt)) {
            dom.addClass(volumePanel, "rplayer-hide");
        }
    });
    return this.initPlayEvent()
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
    this.container.tabIndex = 100;
    this.container.innerHTML = tpl;
    this.initSource(this.videoEl = doc.createElement("video"));
    this.videoEl.appendChild(doc.createTextNode(this.config.msg));
    dom.addClass(this.container, "rplayer-container").addClass(this.videoEl, "rplayer-video");
    this.container.appendChild(this.videoEl);
    this.target.appendChild(this.container);
    this.initEvent();
    return this;
};

RPlayer.init = function (selector, options) {
    return new RPlayer(selector, options).initialize();
};