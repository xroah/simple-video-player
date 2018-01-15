function Slider(el, vertical) {
    Subscriber.call(this);
    this.vertical = isUndefined(vertical) ? false : !!vertical;
    this.el = el;
    this.distance = this.pos = null;
    this.moving = false;
}

var proto = Slider.prototype = Object.create(Subscriber.prototype);
proto.constructor = Slider;

proto.getPosition = function () {
    var parent = this.el.parentNode,
        rect = parent.getBoundingClientRect(),
        el = this.el;
    return {
        width: el.offsetWidth,
        height: el.offsetHeight,
        origLeft: el.offsetLeft,
        origTop: el.offsetTop,
        maxX: rect.width,
        maxY: rect.height
    }
};

proto.setPosition = function (prop, val, scale) {
    if (scale) {
        val = val * 100 + "%";
    }
    dom.css(this.el, prop, val);
    return this;
};

proto.mouseDown = function (evt) {
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
    evt.stopImmediatePropagation();
    dom.addClass(this.el, "rplayer-moving")
        .on(doc, "mousemove", this.mouseMove.bind(this))
        .on(doc, "mouseup", this.mouseUp.bind(this))
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
        this.setPosition("bottom", distance, true);
    } else {
        distance = x - this.pos.offsetX;
        distance = distance < 0 ? 0 : distance > this.pos.maxX ? this.pos.maxX : distance;
        distance = distance / this.pos.maxX;
        this.setPosition("left", distance, true);
    }
    this.trigger("slider.moving", this.distance = distance);
};

proto.mouseUp = function () {
    dom.off(doc, "mousemove moseup")
        .removeClass(this.el, "rplayer-moving");
    this.moving && this.trigger("slider.move.done", this.distance);
};

proto.init = function () {
    var el = this.el;
    dom.on(el, "mousedown", this.mouseDown.bind(this));
};