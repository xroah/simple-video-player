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
    };
let doc = document,
    isType = type => obj => Object.prototype.toString.call(obj) === TYPE[type],
    isFunction = isType("function"),
    isObject = isType("object"),
    isString = isType("string"),
    isUndefined = isType("undef"),
    isWindow = obj => obj && obj.window === obj;

export {
    doc,
    DEFAULT_OPTIONS,
    ERROR_TYPE,
    isFunction,
    isObject,
    isString,
    isUndefined,
    isWindow
};