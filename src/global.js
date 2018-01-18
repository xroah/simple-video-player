"use strict";
const DEFAULT_OPTIONS = {
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
    TYPE = {
        function: "[object Function]",
        object: "[object Object]",
        string: "[object String]",
        undef: "[object Undefined]"
    },
    VOLUME_STEP = 5,
    VIDEO_STEP = 10,
    KEY_MAP = {
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
let doc = document,
    isType = type => obj => Object.prototype.toString.call(obj) === TYPE[type],
    isFunction = isType("function"),
    isObject = isType("object"),
    isString = isType("string"),
    isUndefined = isType("undef"),
    isWindow = obj => obj && obj.window === obj;

export function extend(target, source) {
    if (arguments.length) {
        for (let key in source) {
            let copy = source[key],
                t = target[key];
            if (isObject(copy) && isObject(t)) {
                extend(target[key], source[key]);
            } else {
                target[key] = copy;
            }
        }
    }
    return target;
}

export function toArray(likeArr, start = 0) {
    return Array.isArray(likeArr) ? likeArr.slice(start) :
        likeArr.length ?  Array.prototype.slice.call(likeArr) : [];
}

export function removeProp(obj, prop) {
    if (prop) {
        try{
            delete obj[prop];
        }catch (e){}
    } else {
        for (prop in obj) {
            delete obj[prop];
        }
    }
}

export {
    doc,
    DEFAULT_OPTIONS,
    ERROR_TYPE,
    KEY_MAP,
    isFunction,
    isObject,
    isString,
    isUndefined,
    isWindow
};