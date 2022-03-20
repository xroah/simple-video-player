import { createEl, formatTime } from "../commons/utils"
import Slider from "./slider"
import Transition from "../commons/transition"
import { EventObject } from "../commons/event-emitter"
import Video from "./video"

const html = `
    <div class="rplayer-progress-wrapper">
    </div>
    <div class="rplayer-controls-wrapper">
        <div class="rplayer-left-controls"></div>
        <div class="rplayer-right-controls"></div>
    </div>
`

export default class ControlBar extends Transition {
    private _slider: Slider
    private _leftControlsEl: HTMLDivElement
    private _rightControlsEl: HTMLDivElement

    constructor(
        private _video: Video,
        parent: HTMLDivElement
    ) {
        super("rplayer-control-bar")

        this.autoHide = true
        this.hideTimeout = 5000
        this.el.innerHTML = html
        const progressWrapper = <HTMLDivElement>this.el.querySelector(
            ".rplayer-progress-wrapper"
        )
        this._leftControlsEl = <HTMLDivElement>this.el.querySelector(
            ".rplayer-left-controls"
        )
        this._rightControlsEl = <HTMLDivElement>this.el.querySelector(
            ".rplayer-right-controls"
        )
        this._slider = new Slider(
            progressWrapper,
            {
                buffer: true,
                tooltip: this._formatTooltip.bind(this)
            }
        )

        this._slider.on("value-change", this._handleSliderChange)
        parent.appendChild(this.el)

        this._initEvent()
        this.setVisible(false, true)
    }

    private _initEvent() {
        this._video.addListener("timeupdate", this._handleTimeupdate)
    }

    private _formatTooltip(v: number) {
        const duration = this._video.getDuration()

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

    private _handleSliderChange = (e: EventObject) => {
        const { details: v } = e
        const duration = this._video.getDuration()

        if (duration && !this._slider.isMoving()) {
            this._video.setCurrentTime(v / 100 * duration)
        }
    }

    private _handleTimeupdate = () => {
        if (!this._slider.isMoving()) {
            const v = this._video

            this._slider.updateProgress(
                v.getCurrentTime() / v.getDuration() * 100
            )
        }
    }
}