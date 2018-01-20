import dom from "../dom/index.js";
import {isObject} from "../global.js";

function Popup(cls, autoHide) {
    this.el = dom.createElement("div", {"class": `rplayer-popup-info rplayer-hide ${cls}`});
    this.visible = false;
    this.autoHide = !!autoHide;
    this.timer = null;
}

Popup.prototype = {
    show(msg) {
        this.visible = true;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.autoHide) {
            this.timer = setTimeout(() => this.hide(), 3000);
        }
        dom.removeClass(this.el, "rplayer-hide");
        msg && this.updateText(msg);
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
    init(target) {
        target.appendChild(this.el);
        return this;
    }
};

export default Popup;