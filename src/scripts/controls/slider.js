import Subscriber from "../subscriber.js"
import {doc, isUndefined, removeProp} from "../global.js";
import dom from "../dom/index.js";

export const SLIDER_MOVING = "slider.moving";
export const SLIDER_MOVE_DONE = "slider.move.done";
//滑块状态改变(是否可以滑动/点击),视频加载时候为获取到元信息禁止改变进度
export const SLIDER_STATUS_CHANGE = "slider.status.change";

function Slider(vertical) {
    Subscriber.call(this);
    this.vertical = isUndefined(vertical) ? false : !!vertical;
    this.moveDis = this.pos = null;
    this.moving = false;
    this.enabled = true; //初始默认可以滑动/点击
}

let proto = Slider.prototype = Object.create(Subscriber.prototype);
proto.constructor = Slider;

proto.getPosition = function () {
    let parent = this.el.parentNode,
        rect = parent.getBoundingClientRect(),
        pos = getComputedStyle(this.el);
    return {
        width: parseFloat(pos.width),
        height: parseFloat(pos.height),
        origLeft: parseFloat(pos.left),
        origTop: parseFloat(pos.top),
        maxX: rect.width,
        maxY: rect.height
    }
};

proto.updateHPosition = function (val, scale) {
    scale && (val = val * 100 + "%");
    dom.css(this.bar, "width", val)
        .css(this.el, "left", val);
    return this;
};

proto.updateVPosition = function (val, scale) {
    scale && (val = val * 100 + "%");
    dom.css(this.bar, "height", val)
        .css(this.el, "bottom", val);
    return this;
};

proto.mouseDown = function (evt) {
    //只有按鼠标左键时处理(evt.button=0)
    if (!evt.button && this.enabled) {
        let x = evt.clientX,
            y = evt.clientY,
            pos = this.getPosition(),
            mouseMove = this.getMoveCallback().bind(this);
        this.pos = {
            width: pos.width,
            height: pos.height,
            offsetX: x - pos.origLeft,
            offsetY: y - pos.origTop,
            maxX: pos.maxX,
            maxY: pos.maxY
        };
        dom.addClass(this.el, "rplayer-moving")
            .on(doc, "mousemove", mouseMove)
            .on(doc, "mouseup", this.mouseUp.bind(this))
    }
};

proto.moveVertical = function (x, y) {
    let distance;
    distance = this.pos.maxY - (y - this.pos.offsetY) - this.pos.height;
    distance = distance < 0 ? 0 : distance > this.pos.maxY ? this.pos.maxY : distance;
    distance = distance / this.pos.maxY;
    this.updateVPosition(distance, true);
    return distance;
};

proto.moveHorizontal = function (x) {
    let distance;
    distance = x - this.pos.offsetX;
    distance = distance < 0 ? 0 : distance > this.pos.maxX ? this.pos.maxX : distance;
    distance = distance / this.pos.maxX;
    this.updateHPosition(distance, true);
    return distance;
};

proto.mouseMove = function (evt, fn) {
    let x = evt.clientX,
        y = evt.clientY,
        distance = fn.call(this, x, y);
    this.moving = true;
    this.trigger(SLIDER_MOVING, this.moveDis = distance);
};

proto.getMoveCallback = function () {
    return this.vertical ?
        evt => this.mouseMove(evt, this.moveVertical) :
        evt => this.mouseMove(evt, this.moveHorizontal);
};

proto.mouseUp = function () {
    dom.off(doc, "mousemove moseup")
        .removeClass(this.el, "rplayer-moving");
    this.moving && this.trigger(SLIDER_MOVE_DONE, this.moveDis);
    setTimeout(() => this.moving = false);
};

proto.clickTrack = function (evt) {
    //移动滑块鼠标释放时会触发父元素点击事件,可能会导致鼠标释放后滑块位置改变
    //如果移动滑块/被禁用则点击事件不做处理
    if (!this.moving && this.enabled) {
        let rect = this.track.getBoundingClientRect(),
            x = evt.clientX,
            y = evt.clientY,
            eType = "slider.moving";
        if (this.vertical) {
            rect = (rect.height - y + rect.top) / rect.height;
            this.updateVPosition(rect, true);
        } else {
            rect = (x - rect.left) / rect.width;
            eType = "slider.move.done";
            this.updateHPosition(rect, true);
        }
        this.trigger(eType, rect);
    }
};

proto.initEvent = function () {
    dom.on(this.el, "mousedown", this.mouseDown.bind(this))
        .on(this.track, "click", this.clickTrack.bind(this));
    this.on(SLIDER_STATUS_CHANGE, (evt, enable) => this.enabled = !!enable);
    return this;
};

proto.destroy = function () {
    dom.off(this.track)
        .off(this.el);
    removeProp(this);
};

proto.init = function (target) {
    let cls = {
        track: "rplayer-video-track",
        bar: "rplayer-video-progress",
        slider: "rplayer-video-slider"
    };
    if (this.vertical) {
        cls = {
            track: "rplayer-volume-progress",
            bar: "rplayer-volume-value",
            slider: "rplayer-volume-slider"
        }
    }
    this.track = dom.createElement("div", {class: `rplayer-progress ${cls.track}`});
    this.bar = dom.createElement("div", {class: `rplayer-bar ${cls.bar}`});
    this.el = dom.createElement("div", {class: `rplayer-slider ${cls.slider}`});
    this.track.appendChild(this.bar);
    this.track.append(this.el);
    target.appendChild(this.track);
    return this.initEvent();
};

export default Slider;