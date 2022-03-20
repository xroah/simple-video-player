import { createEl, formatTime } from "../commons/utils"
import Slider from "./slider"
import Transition from "../commons/transition"
import { EventObject } from "../commons/event-emitter"

const html = `
    <div class="rplayer-control-bar">
        <div class="rplayer-progress-wrapper">
        </div>
        <div class="rplayer-btns-wrapper">
            <div class="rplayer-left-btns"></div>
            <div class="rplayer-right-btns"></div>
        </div>
    </div>
`

export default class ControlBar extends Transition {
    private _slider: Slider

    constructor(
        private _videoEl: HTMLVideoElement,
        parent: HTMLDivElement
    ) {
        super()

        this.el = <HTMLDivElement>createEl(
            "div",
            "rplayer-control-bar"
        )
        this.el.innerHTML = html
        const progressWrapper = <HTMLDivElement>this.el.querySelector(
            ".rplayer-progress-wrapper"
        )
        this._slider = new Slider(
            progressWrapper,
            {
                buffer: true,
                tooltip: this._formatTooltip.bind(this)
            }
        )

        this._slider.on("value-change", this._handleProgressChange)
        parent.appendChild(this.el)

        this._initVideoEvent()
    }

    private _initVideoEvent() {
        const vEl = this._videoEl

        vEl.addEventListener("timeupdate", this._handleTimeupdate)
    }

    private _formatTooltip(v: number) {
        const duration = this._videoEl.duration

        if (duration) {
            console.log(duration, v, duration * v / 100)
            const time = Math.floor(duration * v / 100)

            return formatTime(time)
        }

        return ""
    }

    needDelay() {
        return this._slider.isMoving()
    }

    private _handleProgressChange = (e: EventObject) => {
        const { details: v } = e
        const { duration } = this._videoEl

        if (duration && !this._slider.isMoving()) {
            this._videoEl.currentTime = v / 100 * duration
        }
    }

    private _handleTimeupdate = () => {
        if (!this._slider.isMoving()) {
            const vEl = this._videoEl

            this._slider.updateProgress(
                vEl.currentTime / vEl.duration * 100
            )
        }
    }
}