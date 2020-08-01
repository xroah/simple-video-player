import RPlayer from "..";
import {addListener} from "../dom-event";
import Slider from "../modules/slider";
import {HIDDEN_CLASS} from "../constants";
import Popup from "./popup";
import {createEl} from "../utils";

class Volume extends Popup {
    private _slider: Slider
    private _text: HTMLElement
    private _wrapper: HTMLElement

    constructor(rp: RPlayer) {
        super(rp, "rplayer-volume-popup", HIDDEN_CLASS)

        this._wrapper = createEl("div", "rplayer-volume-slider")
        this._slider = new Slider(this._wrapper, {
            vertical: true
        })
        this._text = document.createElement("span")
        //the icon btn, for showing the volume popup
        this.relatedTarget = createEl("span", "rplayer-volume-btn", "rplayer-addon-btn")
        this.rp = rp
    }

    updateVolume = () => {
        const {
            rp: {video},
            relatedTarget: btn
        } = this
        const val = video.isMuted() ? 0 : video.getVolume()

        if (val === 0) {
            btn!.classList.add("rplayer-muted")
        } else {
            btn!.classList.remove("rplayer-muted")
        }

        this.update(val * 100)
    }

    handleIconClick = () => {
        const {video} = this.rp

        if (this.visible) {
            video.setMuted(!video.isMuted())
        } else {
            this.setVisible(!this.visible)
        }

        this.updateVolume()
    }

    handleSliderValueChange = (evt: any) => {
        const val = evt.value / 100

        this.rp.video.setVolume(val)
    }

    initEvents() {
        const {
            rp,
            relatedTarget: btn
        } = this

        addListener(btn!, "click", this.handleIconClick)
        rp.control.bar.on("hidden", this.handleControlBarHidden)
        rp.on("volumechange", this.updateVolume)
        this._slider.on("valuechange", this.handleSliderValueChange)
    }

    mountTo(container: HTMLElement) {
        const btn = this.relatedTarget!

        this.el.appendChild(this._text)
        this.el.appendChild(this._wrapper)
        container.appendChild(btn)
        container.appendChild(this.el)

        this.initEvents()
    }

    //update slider and text, when volumechange or mute
    update(val: number) {
        //prevent racing(volume change and slider value change(moving) simultaneously)
        if (!this._slider.isMoving()) {
            this._slider.update(val)
        }

        this._text.innerHTML = Math.round(val).toString()
    }
}

export default (rp: RPlayer) => {
    const el = createEl("div", "rplayer-volume-wrapper")
    const volume = new Volume(rp)

    volume.mountTo(el)

    rp
        .once("beforemount", () => {
            const {right} = rp.getAddonContainers()

            right.appendChild(el)
        })
        .once("destroy", () => volume.destroy())
}