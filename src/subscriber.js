import {isFunction, isString} from "./global.js";

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
        let  h = this.handlers[type];
        if (h) {
            if (isFunction(fn)) {
                for (let i = h.length; i--;) {
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
            let self = this,
                f = function () {
                    fn.apply(this, arguments);
                    self.off(type, f);
                };
            this.on(type, f);
        }
    },
    trigger: function (type) {
        let args = Array.prototype.slice.call(arguments, 1),
            h = this.handlers[type],
            e;
        if (h) {
            e = new CEvent(type);
            e.data = args;
            e.timeStamp = Date.now();
            args = [e].concat(args);
            for (let i = h.length; i--; ) {
                h[i].apply(this, args);
            }
        }
        return this;
    }
};

export default Subscriber;