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

 const HTML = `
    <div class="rplayer-volume-icon"></div>
    <div class="rplayer-volume-slider"></div>
    <div class="rplayer-volume-text"></div>
 `

export default class Volume {
    private _el: HTMLDivElement
    private _iconEl: HTMLDivElement
    private _textEl: HTMLDivElement
    private _slider: Slider

    constructor(
        parent: HTMLElement,
        private _video: Video
    ) {
        this._el = <HTMLDivElement>createEl(
            "div",
            "rplayer-volume-wrapper"
        )
        this._el.innerHTML = HTML
        this._iconEl = <HTMLDivElement>this._el.querySelector(
            ".rplayer-volume-icon"
        )
        const sliderEl = <HTMLDivElement>this._el.querySelector(
            ".rplayer-volume-slider"
        )
        this._textEl = <HTMLDivElement>this._el.querySelector(
            ".rplayer-volume-text"
        )
        this._slider = new Slider(sliderEl, {tooltip: false})

        this._updateIcon()
        this._handleVolumeChange()
        parent.appendChild(this._el)

        this._video.addListener("volumechange", this._handleVolumeChange)
        this._slider.on("value-update", this._handleSliderChange)
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

    private _handleVolumeChange = () => {
        const volume = this._video.getVolume()

        if (!this._slider.isMoving()) {
            this._slider.updateProgress(volume)
        }

        this._updateText(volume)
        this._updateIcon()
    }

    private _handleSliderChange = (e: EventObject) => {
        const {details: volume} = e

        this._video.setVolume(volume)
    }

    private _updateText(v: number) {
        this._textEl.innerHTML = String(v)
    }
}
