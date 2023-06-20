import { ACTIVE_CLASS, ADDON_BTN_CLASS } from "../commons/constants"
import { EventObject } from "../commons/event-emitter"
import { Addon, Details } from "../commons/types"
import Player from ".."
import Slider from "../modules/slider"
import Video from "../modules/video"
import { createEl, getVolumeClass } from "../utils"
import Timer from "../commons/timer"
import Tooltip from "../modules/tooltip"

class VolumeAddon {
    private _btn: HTMLElement
    private _slider: Slider
    private _video: Video
    private _mouseEntered = false
    private _timer: Timer
    private _volumeTooltip: Tooltip

    constructor(
        private _parent: HTMLElement,
        private _player: Player
    ) {
        const sliderWrapper = createEl("div", "rplayer-volume-slider")
        const vid = this._video = _player.video
        this._btn = createEl("button")
        const slider = this._slider = new Slider(sliderWrapper)
        this._timer = new Timer(
            300,
            () => this._parent.classList.remove(ACTIVE_CLASS)
        )
        this._volumeTooltip = new Tooltip(
            slider,
            { boundary: _parent }
        )

        _parent.appendChild(this._btn)
        _parent.appendChild(sliderWrapper)
        this._handleVolumeChange()

        this._btn.addEventListener("click", this._handleClick)
        vid.addListener("volumechange", this._handleVolumeChange)
        slider.on("value-update", this._handleSliderUpdate)
        slider.on("slide-start", this._handleSlideStart)
        slider.on("slide-end", this._handleSlideEnd)

        _parent.addEventListener("mouseenter", this._handleMouseEnter)
        _parent.addEventListener("mouseleave", this._handleMouseLeave)
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

        if (!this._slider.isMoving()) {
            const volume = this._player.video.getVolume()

            this._slider.value = volume
        }
    }

    private _handleClick = () => {
        const muted = this._video.isMuted()

        this._video.setMuted(!muted)
    }

    private _handleSliderUpdate = (eo: EventObject) => {
        const details = eo.details as Details

        this._video.setMuted(false)
        this._video.setVolume(details.value)
    }

    private _handleSlideStart = () => {
        this._player.controlBar.preventHide(true)
    }

    private _handleSlideEnd = () => {
        this._player.controlBar.preventHide(false)

        if (!this._mouseEntered) {
            this._timer.delay(true)
        }
    }

    private _handleMouseEnter = () => {
        this._mouseEntered = true

        this._timer.clear()
        this._parent.classList.add(ACTIVE_CLASS)
    }


    private _handleMouseLeave = () => {
        this._mouseEntered = false

        if (!this._slider.isMoving()) {
            this._timer.delay(true)
        }
    }
}

const volume: Addon = {
    tag: "div",
    classNames: ["rplayer-volume-addon"],
    install(el, player) {
        return new VolumeAddon(el, player)
    }
}

export default volume