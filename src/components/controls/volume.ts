import { createEl } from "../../commons/utils"
import  { 
    volumeLow,
    volumeMedium,
    volumeHigh,
    volumeOff
 } from "../svg"
 import Video from "../video"
 import Slider from "../slider"
import { EventObject } from "../../commons/event-emitter"
import {SHOW_CLASS} from "../../commons/constants"

export default class Volume {
    private _el: HTMLDivElement
    private _iconEl: HTMLDivElement
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
        this._iconEl = <HTMLDivElement>createEl(
            "div",
            "rplayer-volume-icon"
        )
        this._sliderEl = <HTMLDivElement>createEl(
            "div",
            "rplayer-volume-slider"
        )
        this._slider = new Slider(this._sliderEl, {tooltip: false})

        this._updateIcon()
        this._handleVolumeChange()
        this._el.appendChild(this._iconEl)
        this._el.appendChild(this._sliderEl)
        parent.appendChild(this._el)

        this._video.addListener("volumechange", this._handleVolumeChange)
        this._slider.on("value-update", this._handleSliderChange)
        this._slider.on("slide-end", this._handleSlideEnd)
        this._el.addEventListener("mouseenter", this._handleMouseEnter)
        this._el.addEventListener("mouseleave", this._handleMouseLeave)
    }

    isChanging() {
        return this._slider.isMoving()
    }

    private _updateIcon() {
        const v = this._video
        const icon = this._iconEl
        const children = icon.children
        const volume = v.getVolume()
        const threshold = 100 / 3

        if (children.length) {
            icon.removeChild(children[0])
        }

        if (volume === 0 || v.isMuted()) {
            icon.appendChild(volumeOff())
        } else if (volume <= threshold) {
            icon.appendChild(volumeLow())
        } else if (volume > threshold && volume <= threshold * 2) {
            icon.appendChild(volumeMedium()) 
        } else {
            icon.appendChild(volumeHigh())
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
        const volume = this._video.getVolume()

        if (!this._slider.isMoving()) {
            this._slider.updateProgress(volume)
        }

        this._updateIcon()
    }

    private _handleSliderChange = (e: EventObject) => {
        const {details: volume} = e

        this._video.setVolume(volume)
    }
}
