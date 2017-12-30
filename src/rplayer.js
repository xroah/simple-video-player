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
    dom.hasClass(this.volumePopup, "rplayer-hide") ?
        this.showVolumeSettingsPanel() :
        this.hideVolumeSettingsPanel();
    //阻止冒泡到document, document点击事件点击面板外任意地方隐藏面板，如不阻止冒泡则显示不出来
    evt.stopPropagation();
};

fn.showVolumeSettingsPanel = function () {
    dom.removeClass(this.volumePopup, "rplayer-hide");
    return this;
};

fn.hideVolumeSettingsPanel = function () {
    dom.addClass(this.volumePopup, "rplayer-hide");
    return this;
};

//移动slider改变音量
fn.slideVolumeSlider = function (evt) {
    if (evt.button) return; //按下的鼠标不是左键则不作处理(左键evt.button=0)
    var origTop = this.volumeSlider.offsetTop + SLIDER_SIZE,
        startY = evt.clientY,
        max = this.volumeSlider.parentNode.offsetHeight,
        _this = this,
        move = function (evt) {
            var y = evt.clientY,
                distance = max - (y - startY + origTop);
            distance = distance < 0 ? 0 : distance > max ? max : distance;
            distance = distance / max * 100;
            _this.updateVolume(distance);
        };
    dom.on(doc, "mousemove", move)
        .on(doc, "mouseup", function () {
            dom.off(doc, "mousemove").off(doc, "mouseup");
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

fn.showPopupTimeInfo = function (evt) {
    var duration = this.video.getDuration(),
        popup = this.videoPopupTime;
    if (duration) {
        dom.removeClass(popup, "rplayer-hide");
        var rect = this.videoTrack.getBoundingClientRect(),
            x = evt.clientX,
            distance = x - rect.left,
            width = popup.offsetWidth,
            left = distance - width / 2,
            max = rect.width - width;
        left = left < 0 ? 0 : left > max ? max : left;
        console.log(width)
        popup.innerHTML = this.video.convertTime(distance / rect.width * duration);
        popup.style.left = left + "px";
    }
};

//拖动滑块改变进度
fn.slideVideoSlider = function (evt) {
    if (evt.button) return;
    var origLeft = this.videoSlider.offsetLeft,
        startX = evt.clientX,
        max = this.videoSlider.parentNode.offsetWidth,
        distance,
        _this = this,
        paused = this.video.isPaused(),
        move = function (evt) {
            var x = evt.clientX;
            distance = x - startX + origLeft;
            distance = distance < 0 ? 0 : distance > max ? max : distance;
            distance = distance / max;
            dom.addClass(_this.videoSlider, "moving");
            _this.updateProgressPosition(distance);
            _this.video.pause();
        };
    dom.on(doc, "mousemove", move)
        .on(doc, "mouseup", function () {
            dom.off(doc, "mousemove").off(doc, "mouseup");
            dom.removeClass(_this.videoSlider, "moving");
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
        _this.showPopupTimeInfo(evt);
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

fn.hideControls = function () {
    dom.addClass(this.controlsPanel, "rplayer-hide")
        .addClass(this.controlsPanel, "rplayer-transform");
    return this;
};

fn.showControls = function () {
    var _this = this;
    clearTimeout(hideControlsTimer);
    dom.removeClass(this.controlsPanel, "rplayer-hide")
        .removeClass(this.controlsPanel, "rplayer-transform");
    hideControlsTimer = setTimeout(function () {
        _this.hideControls().hideVolumeSettingsPanel();
    }, 5000);
    return this;
};

fn.toggleVolumePopupInfo = function (volume) {
    var _this = this;
    clearTimeout(hideVolumePopTimer);
    this.volumePopupInfo.innerHTML = "当前音量: " + volume;
    this.currentVolume.innerHTML = volume;
    dom.removeClass(this.volumePopupInfo, "rplayer-hide");
    hideVolumePopTimer = setTimeout(function () {
        dom.addClass(_this.volumePopupInfo, "rplayer-hide");
    }, 3000);
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
            _this.hideVolumeSettingsPanel();
        }
    }).on(this.container, "keydown", this.keyDown.bind(this))
        .on(this.container, "mousemove", function () {
            _this.showControls();
        }).on(this.container, "mouseleave", function () {
        _this.hideVolumeSettingsPanel();
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

fn.initElements = function () {
    var context = this.container;
    this.controlsPanel = dom.selectElement(".rplayer-controls", context);
    this.playBtn = dom.selectElement(".rplayer-play-btn", context);
    this.videoTrack = dom.selectElement(".rplayer-video-track", context);
    this.videoSlider = dom.selectElement(".rplayer-video-slider", context);
    this.videoProgress = dom.selectElement(".rplayer-video-progress", context);
    this.videoPopupTime = dom.selectElement(".rplayer-popup-video-info", context);
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