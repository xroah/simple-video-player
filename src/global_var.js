"use strict";
var doc = document,
    guid = 1,
    //根据这个变量判断是否移动滑块,
    //移动滑块鼠标释放时会触发父元素点击事件,可能会导致鼠标释放后滑块位置改变
    //如果移动滑块则阻止点击轨道改变进度/音量的执行
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
    ERROR_TYPE = { //视频播放错误类型
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