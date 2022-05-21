import { createEl } from "../../commons/utils"
import {
    volumeLow,
    volumeMedium,
    volumeHigh,
    volumeOff
} from "../svg"
import Video from "../video"
import Slider from "../slider"
import { EventObject } from "../../commons/event-emitter"
import { SHOW_CLASS } from "../../commons/constants"

export default class Volume {
    private _el: HTMLDivElement
    private _btnEl: HTMLButtonElement
    private _sliderEl: HTMLDivElement
    private _slider: Slider
    private _mouseEntered = false

    constructor(
        parent: HTMLElement,
        private _video: Video
    ) {
        this._el = <HTMLDivElement>createEl(
            "div",
            "rplayer-volume-wrapper"
        )
        this._btnEl = <HTMLButtonElement>createEl(
            "button",
            "rplayer-volume-btn",
            "rplayer-btn"
        )
        this._sliderEl = <HTMLDivElement>createEl(
            "div",
            "rplayer-volume-slider"
        )
        this._slider = new Slider(this._sliderEl, { tooltip: false })

        this._updateIcon()
        this._handleVolumeChange()
        this._el.appendChild(this._btnEl)
        this._el.appendChild(this._sliderEl)
        parent.appendChild(this._el)

        this._video.addListener("volumechange", this._handleVolumeChange)
        this._slider.on("value-update", this._handleSliderChange)
        this._slider.on("slide-end", this._handleSlideEnd)
        this._btnEl.addEventListener("click", this._toggleMuted)
        this._el.addEventListener("mouseenter", this._handleMouseEnter)
        this._el.addEventListener("mouseleave", this._handleMouseLeave)
    }

    isChanging() {
        return this._slider.isMoving()
    }

    private _toggleMuted = () => {
        const v = this._video

        v.setMuted(!v.isMuted())
        this._updateIcon()
    }

    private _updateIcon() {
        const v = this._video
        const btn = this._btnEl
        const children = btn.children
        const volume = v.getVolume()
        const threshold = 100 / 3

        if (children.length) {
            btn.removeChild(children[0])
        }

        if (volume === 0 || v.isMuted()) {
            btn.appendChild(volumeOff())
        } else if (volume <= threshold) {
            btn.appendChild(volumeLow())
        } else if (volume > threshold && volume <= threshold * 2) {
            btn.appendChild(volumeMedium())
        } else {
            btn.appendChild(volumeHigh())
        }
    }

    private _showSlider() {
        this._sliderEl.classList.add(SHOW_CLASS)
    }

    private _hideSlider() {
        this._sliderEl.classList.remove(SHOW_CLASS)
    }

    private _handleMouseEnter = () => {
        this._mouseEntered = true

        this._showSlider()
    }

    private _handleMouseLeave = () => {
        this._mouseEntered = false

        if (!this._slider.isMoving()) {
            this._hideSlider()
        }
    }

    private _handleSlideEnd = () => {
        if (!this._mouseEntered) {
            this._hideSlider()
        }
    }

    private _handleVolumeChange = () => {
        const {
            _video: v,
            _slider: s
        } = this

        if (!s.isMoving()) {
            if (v.isMuted()) {
                s.updateProgress(0)
            } else {
                s.updateProgress(v.getVolume())
            }
        }

        this._updateIcon()
    }

    private _handleSliderChange = (e: EventObject) => {
        const { details: volume } = e

        this._video.setVolume(volume)
        this._video.setMuted(false)
    }
}
