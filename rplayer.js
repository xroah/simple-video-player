var  Dom = {
    doc: document,
    handlers: {};
};

Dom.getByCls = function(cls) {
    var result = this.doc.getElementsByClassName(cls);
    return result.length ? (result.length === 1 ? result[0] : result) : null;
};

Dom.hasClass = function(el, cls) {
    if (el.classList) {
        return el.classList.contains(cls);
    }
    return new RegExp(cls).test(el.className);
};

Dom.addClass = function(el, cls) {
    if (this.hasClass(el, cls)) {
        if (el.classList) {
            el.classList.add(cls);
        } else {
            el.className += " " + cls;
        }
    };
};

Dom.removeClass = function(el, cls) {
    var reg = new RegExp("\\s*" + cls + "\\s*");
    if (this.hasClass(el, cls)) {
        if (el.classList) {
            el.classList.remove(cls);
        } else {
            el.className = el.className.replace(reg, " ").trim();
        }
    }
};

Dom.on = function(selector, type,  callback) {
    var el = [],
            len, i = 0;
    if (typeof callback !== "function") {
        callback = function() {};
    }
    if (selector.nodeType) {
        el = [selector];
    } else if (typeof selector === "string") {
        el = this.doc.querySelectorAll(selector);
    }
    len = el.length;
    for (; i < len; i++) {
        el.addEventListener(type, callback);
    }
};