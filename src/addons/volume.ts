import { ADDON_BTN_CLASS } from "../commons/constants";
import { EventObject } from "../commons/event-emitter";
import { Addon } from "../commons/types";
import Slider, { Details } from "../modules/slider";
import Video from "../modules/video";
import { createEl, getVolumeClass } from "../utils";

class VolumeAddon {
    private _btn: HTMLElement
    private _slider: Slider

    constructor(
        parent: HTMLElement,
        private _video: Video
    ) {
        this._btn = createEl("button")
        const sliderWrapper = createEl("div", "rplayer-volume-slider")
        this._slider = new Slider(
            sliderWrapper,
            { tooltip: false }
        )

        this._slider.updateProgress(_video.getVolume())
        this._updateBtnClass()

        parent.appendChild(this._btn)
        parent.appendChild(sliderWrapper)
        
        this._btn.addEventListener("click", this._handleClick)
        _video.addListener("volumechange", this._handleVolumeChange)
        this._slider.on("value-update", this._handleSliderUpdate)
    }

    private _updateBtnClass() {
        const volume = this._video.getVolume()
        const muted = this._video.isMuted()
        const className = getVolumeClass(volume, muted)
        this._btn.className = ""

        this._btn.classList.add(ADDON_BTN_CLASS, className)
    }

    private _handleVolumeChange = () => {
        this._updateBtnClass()
    }

    private _handleClick = () => {
        const muted = this._video.isMuted()

        this._video.setMuted(!muted)
    }

    private _handleSliderUpdate = (eo: EventObject) => {
        const details = eo.details as Details
        
        this._video.setVolume(details.value)
    }
}

const volume: Addon = {
    tag: "div",
    classNames: ["rplayer-volume-addon"],
    install(el, player) {
        return new VolumeAddon(el, player.video)
    }
}

export default volume