import dom from "../dom/index.js";
import Slider from "./slider.js";
import Subscriber from "../subscriber.js";
import {doc, extend} from "../global";

export const VOLUME_UPDATE = "volume.update";
export const VOLUME_MUTE = "volume.mute";

function VolumeControl(volume) {
    Subscriber.call(this);
    this.el = dom.createElement("div", {"class": "rplayer-volume-popup rplayer-hide"});
    this.valueEl = dom.createElement("div", {"class": "rplayer-current-volume"});
    this.muteBtn = dom.createElement("button", {"class": "rplayer-mute volume-1"});
    this.showBtn = dom.createElement("button", {"class": "rplayer-audio-btn volume-1"});
    this.slider = new Slider(true);
    this.volume = volume;
    this.muted = false;
}

VolumeControl.prototype = Object.create(Subscriber.prototype);

let proto = {
    constructor: VolumeControl,
    show() {
        dom.removeClass(this.el, "rplayer-hide");
        return this;
    },
    hide() {
        dom.addClass(this.el, "rplayer-hide");
        return this;
    },
    toggle(evt) {
        dom.toggleClass(this.el, "rplayer-hide");
        //document click事件点击音量设置面板之外隐藏,如果不阻止冒泡则面板显示不出来
        evt.stopPropagation();
        return this;
    },
    updateVolume(volume, scale, sliderMove) {
        scale && (volume *= 100);
        volume = Math.floor(volume);
        this.volume = volume;
        if (!volume) {
            this.muted = true;
            this.trigger(VOLUME_MUTE, this.muted);
        } else {
            this.muted = false;
            this.trigger(VOLUME_UPDATE, volume);
        }
        this.updateStyle(volume, sliderMove);
        return this;
    },
    updateVolumeByStep(step) {
        let volume = this.volume + step;
        volume = volume > 100 ? 100 : volume < 0 ? 0 : volume;
        this.updateVolume(volume);
    },
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
    },
    mute() {
        if (this.muted = !this.muted) {
            this.updateStyle(0);
        } else {
            this.updateStyle(this.volume);
        }
        this.trigger(VOLUME_MUTE, this.muted);
    },
    initEvent() {
        dom.on(this.muteBtn, "click", this.mute.bind(this))
            .on(this.el, "mouseleave", this.hide.bind(this))
            .on(this.showBtn, "click", this.toggle.bind(this))
            .on(doc, "click", evt => {
                let tgt = evt.target;
                //点击页面其他地方（点击的不是音量设置面板或者面板内的元素）则隐藏音量面板
                if (tgt !== this.el && !this.el.contains(tgt)) {
                    this.hide();
                }
            });
        this.slider.on("slider.moving", (evt, distance) => {
            this.updateVolume(distance, true, true);
        });
        return this;
    },
    init(target) {
    // <div class="rplayer-audio-control rplayer-rt">' +
    //     '                <button type="button" class="rplayer-audio-btn volume-1"></button>' +
    //     '            </div>';
        let panel = dom.createElement("div", {"class": "rplayer-audio-control rplayer-rt"});
        this.el.appendChild(this.valueEl);
        this.slider.init(this.el);
        this.el.appendChild(this.muteBtn);
        panel.appendChild(this.showBtn);
        panel.append(this.el);
        target.appendChild(panel);
        this.updateVolume(this.volume)
            .initEvent();
        return this;
    }
};

extend(VolumeControl.prototype, proto);

export default VolumeControl;