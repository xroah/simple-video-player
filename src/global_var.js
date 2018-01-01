"use strict";
var doc = document,
    guid = 1,
    SLIDER_SIZE = 12,
    DEFAULT_OPTIONS = {
        autoPlay: false,
        defaultVolume: 50,
        loop: false,
        poster: "",
        preload: "metadata",
        source: "",
        msg: ""
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