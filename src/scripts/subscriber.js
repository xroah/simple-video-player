import {isFunction, isString, toArray} from "./global.js";
import {isUndefined} from "./global";

function CEvent(type) {
    this.type = type;
    this.data = null;
    this.timeStamp = 0;
}

function Subscriber() {
    Object.defineProperty(this, "handlers", {value: {}});
}

Subscriber.prototype = {
    constructor: Subscriber,
    _on(type, fn) {
        if (!this.handlers[type]) {
            this.handlers[type] = [];
        }
        this.handlers[type].push(fn);
    },
    on(type, fn) {
        if (isFunction(fn)) {
            if (!isString(type)) {
                throw new TypeError("事件类型只能为String");
            }
            type = type.split(" ");
            for (let i = type.length; i--;) {
                this._on(type[i], fn);
            }
        }
        return this;
    },
    _off(type, fn) {
        let handlers = this.handlers[type];
        if (handlers) {
            if (isFunction(fn)) {
                for(let i = handlers.length; i--;) {
                    if (fn === handlers[i]) {
                        handlers.splice(i, 1);
                        break;
                    }
                }
            } else if (isUndefined(fn)) {
                this.handlers[type] = [];
            }
        }
    },
    off(type, fn) {
        let len = arguments.length;
        if (len && isString(type)) {
            let args = toArray(arguments, 1);
            type = type.split(" ");
            for (let i = type.length; i--;) {
                this._off.call(this, type[i], ...args);
            }
        } else if (!len) {
            //没传参数则移除所有绑定
            this.handlers = {};
        }
        return this;
    },
    once(type, fn) {
        if (isFunction(fn)) {
            let self = this,
                f = function () {
                    fn.apply(this, arguments);
                    self.off(type, f);
                };
            this.on(type, f);
        }
    },
    trigger(type) {
        let args = toArray(arguments, 1),
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