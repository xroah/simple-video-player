import { EventObject } from "../commons/event-emitter"
import { createEl, formatTime } from "../utils"
import Slider from "./slider"
import Transition from "./transition"
import Player from ".."
import Video from "./video"
import { CONTROL_BAR_DELAY } from "../commons/constants"
import { Details, TooltipCallback } from "../commons/types"

export default class ControlBar extends Transition {
    private _slider: Slider
    private _currentTimeEl: HTMLElement
    private _durationEl: HTMLElement
    private _hidePrevented = false

    private _video: Video

    constructor(
        private _parent: HTMLElement,
        player: Player,
        onTooltipUpdate?: TooltipCallback["onTooltipUpdate"]
    ) {
        super(
            "rplayer-control-bar",
            {
                autoHide: true,
                hideTimeout: CONTROL_BAR_DELAY
            }
        )

        const DEFAULT_TIME = "00:00"
        const progressWrapper = createEl("div", "rplayer-progress-wrapper")
        const sliderWrapper = createEl("div", "rplayer-progress")
        this._video = player.video
        this._currentTimeEl = createEl("div", "rplayer-current-time")
        this._durationEl = createEl("div", "rplayer-duration")!
        this._currentTimeEl.innerHTML = DEFAULT_TIME
        this._durationEl.innerHTML = DEFAULT_TIME
        this._slider = new Slider(
            sliderWrapper,
            {
                buffer: true,
                tooltip: this._formatTooltip,
                onTooltipUpdate,
            }
        )

        progressWrapper.appendChild(this._currentTimeEl)
        progressWrapper.appendChild(sliderWrapper)
        progressWrapper.appendChild(this._durationEl)
        this.el.appendChild(progressWrapper)
        this._parent.appendChild(this.el)

        this.show(true)
        this.init()
    }

    public getAddonContainer() {
        return this.el
    }

    protected init() {
        const { _video } = this

        _video.addListener("timeupdate", this._handleTimeUpdate)
        _video.addListener("durationchange", this._handleDurationChange)
        _video.addListener("progress", this._handleVideoProgress)

        this._slider.on("value-change", this._handleSliderChange)
        this._slider.on("slide-start", this._handleSlideStart)
        this._slider.on("slide-move", this._handleSlideMove)
        this._slider.on("slide-end", this._handleSlideEnd)
    }

    public override hide() {
        if (!this._hidePrevented) {
            super.hide()
        }
    }

    protected override delayHide() {
        if (this._hidePrevented) {
            this.autoHideTimer?.clear()

            return
        }

        super.delayHide()
    }

    protected override handleMouseLeave = () => {
        if (!this._hidePrevented) {
            this.delayHide()
        }
    }

    private _handleVideoProgress = () => {
        const buffered = this._video.getBuffered()
        const len = buffered.length
        const currentTime = this._video.getCurrentTime()

        for (let i = 0; i < len; i++) {
            const end = buffered.end(i)

            if (
                currentTime >= buffered.start(i) &&
                currentTime <= end
            ) {
                this._updateBuffer(end)
                break
            }
        }
    }

    private _updateBuffer(time: number) {
        const duration = this._video.getDuration()

        this._slider.updateBuffer(time / duration * 100)
    }

    public preventHide(prevented = false) {
        if (!this.visible) {
            return
        }

        this._hidePrevented = prevented

        if (prevented) {
            this.autoHideTimer?.clear()
        } else {
            this.delayHide()
        }
    }

    private _formatTooltip = (v: number) => {
        const duration = this._video.getDuration()

        if (!duration) {
            return "00:00"
        }

        return formatTime(duration * v / 100)
    }

    private _handleDurationChange = () => {
        const duration = this._video.getDuration()

        if (duration) {
            this._durationEl.innerHTML = formatTime(duration)
        }
    }

    private _handleTimeUpdate = () => {
        if (this._slider.isMoving()) {
            return
        }

        const progress = this._video.getProgress()
        const time = this._video.getCurrentTime()
        this._currentTimeEl.innerHTML = formatTime(time)
        this._slider.value = progress
    }

    private _getSeekTime(eo: EventObject) {
        const details = eo.details as Details
        const duration = this._video.getDuration()

        return duration * details.value / 100
    }

    private _handleSliderChange = (eo: EventObject) => {
        this._video.setCurrentTime(this._getSeekTime(eo))
        this._updateBuffer(0)
        this._video.dispatch("timeupdate")
    }

    private _emitSeekEvent(type: string, eo: EventObject) {
        this.emit(
            type,
            {
                time: this._getSeekTime(eo),
                ...(eo.details as object)
            }
        )
    }

    private _handleSlideStart = (eo: EventObject) => {
        this._emitSeekEvent("seek-start", eo)
        this.preventHide(true)
    }

    private _handleSlideMove = (eo: EventObject) => {
        this._emitSeekEvent("seeking", eo)
    }

    private _handleSlideEnd = (eo: EventObject) => {
        this._emitSeekEvent("seek-end", eo)
        this.preventHide(false)
    }
}