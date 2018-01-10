function CEvent(type) {
    this.type = type;
    this.data = null;
    this.timeStamp = 0;
}

function Subscriber() {
    this.handlers = {};
}

Subscriber.prototype = {
    constructor: Subscriber,
    on: function (type, fn) {
        if (isFunction(fn)) {
            if (!isString(type)) {
                type = String(type);
            }
            if (!this.handlers[type]) {
                this.handlers[type] = [];
            }
            this.handlers[type].push(fn);
        }
        return this;
    },
    off: function (type, fn) {
        var h = this.handlers[type],
            i;
        if (h) {
            if (isFunction(fn)) {
                for (i = h.length; i--;) {
                    if (h[i] === fn) {
                        h.splice(i, 1);
                        break;
                    }
                }
            } else if (!fn){
                this.handlers[type] = [];
            }
        }
        return this;
    },
    once: function (type, fn) {
        if (isFunction(fn)) {
            var self = this,
                f = function () {
                    fn.apply(this, arguments);
                    self.off(type, f);
                };
            this.on(type, f);
        }
    },
    trigger: function (type) {
        var args = Array.prototype.slice.call(arguments, 1),
            h = this.handlers[type],
            e, i;
        if (h) {
            e = new CEvent(type);
            e.data = args;
            e.timeStamp = Date.now();
            args = [e].concat(args);
            for (i = h.length; i--; ) {
                h[i].apply(this, args);
            }
        }
        return this;
    }
};