import dom from "../dom/index.js";
import Slider, {SLIDER_MOVING} from "./slider.js";
import {doc} from "../global";
import Subscriber from "../subscriber.js";

export const VOLUME_CONTROL_UPDATE = "volume.control.update";
export const VOLUME_CONTROL_MUTE = "volume.control.mute";

export default class VolumeControl extends Subscriber {
    constructor(volume) {
        super();
        this.panel = dom.createElement("div", {"class": "rplayer-volume-popup rplayer-hide"});
        this.valueEl = dom.createElement("div", {"class": "rplayer-current-volume"});
        this.muteBtn = dom.createElement("button", {"class": "rplayer-mute volume-1"});
        this.showBtn = dom.createElement("button", {"class": "rplayer-audio-btn volume-1"});
        this.slider = new Slider(true);
        this.volume = volume;
        this.muted = false;
    }

    show() {
        dom.removeClass(this.panel, "rplayer-hide");
        return this;
    }

    hide() {
        dom.addClass(this.panel, "rplayer-hide");
        return this;
    }

    toggle(evt) {
        dom.toggleClass(this.panel, "rplayer-hide");
        //document click事件点击音量设置面板之外隐藏,如果不阻止冒泡则面板显示不出来
        evt.stopPropagation();
        return this;
    }

    updateVolume(volume, sliderMove) {
        this.volume = volume;
        this.updateStyle(this.volume, sliderMove);
        this.trigger(VOLUME_CONTROL_UPDATE, this.volume);
        return this;
    }

    updateVolumeByStep(step) {
        let volume = this.volume + step;
        volume = volume > 100 ? 100 : volume < 0 ? 0 : volume;
        this.updateVolume(volume);
    }

    updateStyle(volume, sliderMove) {
        let muteCls = this.muteBtn.className,
            showCls = this.showBtn.className,
            reg = /volume-\S+/;
        muteCls = muteCls.replace(reg, "");
        showCls = showCls.replace(reg, "");
        if (!volume) {
            reg= "volume-mute";
        } else if (volume <= 33) {
            reg= "volume-1";
        } else if (volume <= 66) {
            reg= "volume-2";
        } else {
            reg= "volume-3";
        }
        this.muteBtn.className = muteCls + reg;
        this.showBtn.className = showCls + reg;
        this.valueEl.innerHTML = volume;
        //如果通过移动滑块改变音量则不重复改变slider的位置
        !sliderMove && this.slider.updateVPosition(volume + "%");
        return this;
    }

    mute() {
        this.muted = !this.muted;
        this.muted ? this.updateStyle(0) : this.updateStyle(this.volume);
        this.trigger(VOLUME_CONTROL_MUTE, this.muted);
    }

    initEvent() {
        dom.on(this.muteBtn, "click", this.mute.bind(this))
            .on(this.panel, "mouseleave", this.hide.bind(this))
            .on(this.showBtn, "click", this.toggle.bind(this))
            .on(doc, "click", evt => {
                let tgt = evt.target;
                //点击页面其他地方（点击的不是音量设置面板或者面板内的元素）则隐藏音量面板
                if (tgt !== this.panel && !this.panel.contains(tgt)) {
                    this.hide();
                }
            });
        this.slider.on(SLIDER_MOVING, (evt, distance) => {
            this.updateVolume(Math.floor(100 * distance), true);
        });
        return this;
    }

    init(target) {
        let panel = dom.createElement("div", {"class": "rplayer-audio-control rplayer-rt"});
        this.panel.appendChild(this.valueEl);
        this.slider.init(this.panel);
        this.panel.appendChild(this.muteBtn);
        panel.appendChild(this.showBtn);
        panel.appendChild(this.panel);
        target.appendChild(panel);
        this.updateVolume(this.volume)
            .initEvent();
        return this;
    }
}