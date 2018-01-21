import {doc, isFunction, isObject, isUndefined, isString, isWindow} from "../global.js";
let dom = {
        handlers: {}
    },
    guid = 1;

dom.hasClass = function (el, cls) {
    if (!el) return false;
    if (el.classList) {
        return el.classList.contains(cls);
    }
    //如果className为XXX-active, cls为active,
    //如果不加空格判断则获取的结果不准确
    return (" " + el.className + " ").indexOf(" " + cls + " ") > -1;
};

dom.addClass = function (el, cls) {
    if (el && !this.hasClass(el, cls)) {
        if (el.classList) {
            el.classList.add(cls);
        } else {
            el.className += " " + cls;
        }
    }
    return this;
};

dom.removeClass = function (el, cls) {
    let reg = new RegExp("\\s+" + cls + "\\s+"),
        className;
    if (el && this.hasClass(el, cls)) {
        className = " " + el.className + " ";
        if (el.classList) {
            el.classList.remove(cls);
        } else {
            el.className = className.replace(reg, " ").trim();
        }
    }
    return this;
};

dom.toggleClass = function (el, cls) {
    let reg = new RegExp("\\s+" + cls + "\\s+"),
        className;
    if (el) {
        if (el.classList) {
            el.classList.toggle(cls);
        } else {
            className = " " + el.className + " ";
            cls = " " + cls + " ";
            if (className.indexOf(cls) > -1) {
                el.className = className.replace(reg, " ").trim();
            } else {
                el.className += " " + cls;
            }
        }
    }
    return this;
};

dom.css = function (el, prop, val) {
    let css = "";
    if (!isUndefined(val)) {
        el.style[prop] = val;
    } else {
        if (isObject(prop)) {
            for (val in prop) {
                css += val + ":" + prop[val] + ";";
            }
            el.style.cssText += css;
        } else if (isString(prop)) {
            return getComputedStyle(el).getPropertyValue(prop);
        }
    }
    return this;
};

//选择元素， 只选中一个
dom.selectElement = function (selector, context) {
    let ret,
        reg = /^#[^>~+\[\]\s:]+$/; //匹配id选择器
    context = context || doc;
    if (selector) {
        if (selector.nodeName || isWindow(selector)) {
            ret = selector;
        } else if (typeof selector === "string") {
            if (reg.test(selector)) {
                ret = doc.getElementById(selector.substring(1));
            } else {
                ret = context.querySelector(selector);
            }
        }
    }
    return ret;
};

//创建元素
dom.createElement = function (name, attrs) {
    let el = doc.createElement(name),
        key;
    if (isObject(attrs)) {
        for (key in attrs) {
            el.setAttribute(key, attrs[key]);
        }
    }
    return el;
};

//添加元素事件
dom._on = function (el, type, callback) {
    let id = el.guid,
        handler;
    if (!id) {
        id = guid++;
        Object.defineProperty(el, "guid", {
            value: id
        });
    }
    handler = this.handlers[id];
    if (!handler) {
        handler = this.handlers[id] = {};
        handler[type] = [];
    } else if (!handler[type]) {
        handler[type] = [];
    }
    handler[type].push(callback);
    el.addEventListener(type, callback);
};

dom.on = function (selector, type, callback, off) {
    let el = this.selectElement(selector),
        i;
    if (el) {
        if (type) {
            //添加多个事件，以空格分开
            type = type.split(" ");
            i = type.length;
            if (isFunction(callback)) {
                for (; i--;) {
                    let t = type[i];
                    off ? this._off(el, t, callback) :
                        this._on(el, t, callback);
                }
            } else if(off){
                for (; i--;) {
                    this._off(el, type[i]);
                }
            }
        } else if(off) {
            this._off(el);
        }

    }
    return this;
};

//移除元素的事件
dom._off = function (el, type, callback) {
    let handlers = this.handlers[el.guid];
    if (handlers) {
        if (type && (handlers = handlers[type])) {
            if (callback) {
                for (let i = 0, len = handlers.length; i < len; i++ ) {
                    if (handlers[i] === callback) {
                        handlers.splice(i, 1);
                        el.removeEventListener(type, callback);
                        break;
                    }
                }
            } else {
                handlers.forEach(function (fn) {
                    el.removeEventListener(type, fn);
                });
                dom.handlers[type] = [];
            }
        } else if (!type) {//如果没有type, 则移除该元素的所有事件
            for (let key in handlers) {
                this._off(el, key);
            }
        }
    }
};

dom.off = function (selector, type, callback) {
    return this.on(selector, type, callback, true);
};

dom.once = function (selector, type, callback) {
    let cb, _this = this;
    if (isFunction(callback)) {
        cb = function () {
            let args = Array.prototype.slice.call(arguments);
            callback.apply(this, args);
            _this.off(selector, type, cb);
        };
        this.on(selector, type, cb);
    }
    return this;
};

/**
 * 判断一个坐标是否再元素内部（例如鼠标移动后判鼠标指针是否再元素上）
 * @param {HTMLElement} el html元素
 * @param {number} x x偏移量
 * @param {number} y y偏移量
 * @param {boolean} relative 为true时候x,y相对视口的坐标,否则相对于元素
 */
dom.isPositionInEl = function (el, x, y, relative) {
    let rect = el.getBoundingClientRect();
    if (relative) {
        x = x - rect.left;
        y = y - rect.top;
    }
    return x > 0 && x < rect.width && y > 0 && y < rect.height;
};

export default dom;