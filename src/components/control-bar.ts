import { createEl, formatTime } from "../commons/utils"
import Slider from "./slider"
import Transition from "../commons/transition"
import { EventObject } from "../commons/event-emitter"
import Video from "./video"
import TimeInfo from "./controls/time"
import ToggleBtn from "./controls/toggle-btn"
import Volume from "./controls/volume-control"

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
    private _time: TimeInfo
    private _toggleBtn: ToggleBtn
    private _volume: Volume
    private _mouseEntered = false

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
        this._toggleBtn = new ToggleBtn(this._leftControlsEl, _video)
        this._volume = new Volume(this._leftControlsEl, _video)
        this._time = new TimeInfo(this._leftControlsEl)
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
        const v = this._video
        const {el} = this

        v.addListener("timeupdate", this._handleTimeupdate)
        v.addListener("durationchange", this._handleDuration)

        el.addEventListener("mouseenter", this._handleMouseEnter)
        el.addEventListener("mouseleave", this._handleMouseEnter)
    }

    private _handleMouseEnter = (evt: MouseEvent) => {
        this._mouseEntered = evt.type === "mouseenter"
    }

    private _formatTooltip(v: number) {
        const duration = this._video.getDuration()

        if (duration) {
            const time = Math.floor(duration * v / 100)

            return formatTime(time)
        }

        return ""
    }

    private _handleDuration = () => {
        const d = this._video.getDuration()

        this._time.setDuration(d)
    }

    needDelay() {
        return this._slider.isMoving() ||
            this._volume.isChanging() ||
            this._mouseEntered
    }

    private _handleSliderChange = (e: EventObject) => {
        const { details: v } = e
        const duration = this._video.getDuration()

        if (duration && !this._slider.isMoving()) {
            const time = v / 100 * duration

            this._video.setCurrentTime(time)
            this._time.setTime(time)
        }
    }

    private _handleTimeupdate = () => {
        const v = this._video

        if (!this._slider.isMoving()) {
            this._slider.updateProgress(
                v.getCurrentTime() / v.getDuration() * 100
            )
        }

        this._time.setTime(v.getCurrentTime())
    }
}