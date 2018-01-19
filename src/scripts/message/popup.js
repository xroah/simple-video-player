import dom from "../dom/index.js";
import {isObject} from "../global.js";

function Popup() {
    this.el = dom.createElement("div", {"class": "rplayer-popup-info rplayer-hide"});
    this.visible = false;
}

Popup.prototype = {
    show() {
        this.visible = true;
        dom.removeClass(this.el, "rplayer-hide");
        return this;
    },
    hide() {
        this.visible = false;
        dom.addClass(this.el, "rplayer-hide");
        return this;
    },
    updatePosition(prop) {
        let pos = {
            left: "left",
            right: "right",
            top: "top",
            bottom: "bottom"
        };
        if(isObject(prop)) {
            for (let key in prop) {
                if (pos[key]) {
                    dom.css(this.el, key, prop[key]);
                }
            }
        }
        return this;
    },
    updateText(content) {
        this.el.innerHTML = content;
        return this;
    },
    getSize(prop) {
        //隐藏元素获取不到尺寸信息，隐藏时先将元素显示出来获取之后再隐藏
        let visible = this.visible;
        !visible && this.show();
        let style = getComputedStyle(this.el);
        !visible && this.hide();
        return prop ?
            parseFloat(style[prop]) :
            {
                left: parseFloat(style.left),
                right: parseFloat(style.right),
                top: parseFloat(style.top),
                bottom: parseFloat(style.bottom),
                width: parseFloat(style.width),

            }
    },
    width() {
      return this.getSize("width");
    },
    height() {
        return this.getSize("height");
    },
    init(target, cls) {
        cls = cls || "";
        dom.addClass(this.el, cls);
        target.appendChild(this.el);
        return this;
    }
};

export default Popup;