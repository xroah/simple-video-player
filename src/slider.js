function Slider(vertical) {
    Subscriber.call(this);
    this.vertical = isUndefined(vertical) ? false : !!vertical;
    this.moveDis = this.pos = null;
    this.moving = false;
}

var proto = Slider.prototype = Object.create(Subscriber.prototype);
proto.constructor = Slider;

proto.getPosition = function () {
    var parent = this.el.parentNode,
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
    if (scale) {
        val = val * 100 + "%";
    }
    dom.css(this.bar, "width", val)
        .css(this.el, "left", val);
    return this;
};

proto.updateVPosition = function (val, scale) {
    if (scale) {
        val = val * 100 + "%";
    }
    dom.css(this.bar, "height", val)
        .css(this.el, "bottom", val);
    return this;
};

proto.updatePosition = function (val, scale) {
    this.vertical ? this.updateVPosition(val, scale) : this.updateHPosition(val, scale);
};

proto.mouseDown = function (evt) {
    //只有按鼠标左键时处理(evt.button=0)
    if (!evt.button) {
        var x = evt.clientX,
            y = evt.clientY,
            pos = this.getPosition();
        this.pos = {
            width: pos.width,
            height: pos.height,
            offsetX: x - pos.origLeft,
            offsetY: y - pos.origTop,
            maxX: pos.maxX,
            maxY: pos.maxY
        };
        dom.addClass(this.el, "rplayer-moving")
            .on(doc, "mousemove", this.mouseMove.bind(this))
            .on(doc, "mouseup", this.mouseUp.bind(this))
    }
};

proto.mouseMove = function (evt) {
    var x = evt.clientX,
        y = evt.clientY,
        distance;
    this.moving = true;
    if (this.vertical) {
        distance = this.pos.maxY - (y - this.pos.offsetY) - this.pos.height;
        distance = distance < 0 ? 0 : distance > this.pos.maxY ? this.pos.maxY : distance;
        distance = distance / this.pos.maxY;
        this.updateVPosition(distance, true);
    } else {
        distance = x - this.pos.offsetX;
        distance = distance < 0 ? 0 : distance > this.pos.maxX ? this.pos.maxX : distance;
        distance = distance / this.pos.maxX;
        this.updateHPosition(distance, true);
    }
    this.trigger("slider.moving", this.moveDis = distance);
};

proto.mouseUp = function () {
    dom.off(doc, "mousemove moseup")
        .removeClass(this.el, "rplayer-moving");
    this.moving && this.trigger("slider.move.done", this.moveDis);
};

proto.clickTrack = function (evt) {
    //移动滑块鼠标释放时会触发父元素点击事件,可能会导致鼠标释放后滑块位置改变
    //如果移动滑块则点击事件不做处理
    if (this.moving) {
        this.moving = false;
        return;
    }
    var rect = this.track.getBoundingClientRect(),
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
};

proto.initEvent = function () {
    dom.on(this.el, "mousedown", this.mouseDown.bind(this))
        .on(this.track, "click", this.clickTrack.bind(this))
};

proto.destroy = function () {
    dom.off(this.track)
        .off(this.el);
    delete this.track;
    delete this.bar;
    delete this.el;
};

proto.init = function (target, before) {
    var cls = {
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
    this.track = dom.createElement("div", {class: "rplayer-progress " + cls.track});
    this.bar = dom.createElement("div", {class: "rplayer-bar " + cls.bar});
    this.el = dom.createElement("div", {class: "rplayer-slider " + cls.slider});
    this.track.appendChild(this.bar);
    this.track.append(this.el);
    before ? target.insertBefore(this.track, before) : target.appendChild(this.track);
    this.initEvent();
};