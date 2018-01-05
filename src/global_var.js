"use strict";
var doc = document,
    guid = 1,
    SLIDER_SIZE = 12,
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
    HIDE_CLASS = "rplayer-hide";

function isFunction(fn) {
    return Object.prototype.toString.call(fn) === "[object Function]";
}

function isObject(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
}

function isUndefined(v) {
    var tmpVar;
    return v === tmpVar;
}

function  isWindow(obj) {
    return obj && obj.window === obj;
}

function inherit(child, parent) {
    var f = function() {};
    if (!isFunction(child) && isFunction(parent)) {
        throw new Error("参数不是函数");
    }
    f.prototype = parent.prototype;
    child.prototype = new f();
    child.prototype.constructor = child;
}