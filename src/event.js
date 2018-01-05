function Subscriber() {
    this.handlers = {};
}

Subscriber.prototype = {
    constructor: Subscriber,
    on: function (type, fn) {
        if (isFunction(fn)) {
            if (!this.handlers[type]) {
                this.handlers[type] = [];
            }
            this.handlers.push(fn);
        }
        return this;
    },
    off: function (type, fn) {
        var h = this.handlers[type],
            i, len;
        if (h) {
            len = h.length;
            i = len - 1;
            if (fn) {
                if (isFunction(fn)) {
                    for (; i--;) {
                        if (h[i] === fn) {
                            h.splice(i, 1);
                            break;
                        }
                    }
                }
            } else {
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
    }
};