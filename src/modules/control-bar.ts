import { EventObject } from "../commons/event-emitter"
import { OptionsWithAddons } from "../commons/types"
import { createEl, formatTime } from "../utils"
import MiniProgress from "./mini-progress"
import Slider, { Details } from "./slider"
import Transition from "./transition"
import Player from ".."
import Video from "./video"

interface Options {
    showMiniProgress?: boolean
}

const NO_CURSOR_CLASS = "rplayer-no-cursor"

export default class ControlBar extends Transition {
    private _slider: Slider
    private _miniProgress?: MiniProgress
    private _currentTimeEl: HTMLElement
    private _durationEl: HTMLElement
    private _hidePrevented = false

    private _video: Video

    constructor(
        private _parent: HTMLElement,
        player: Player,
        private _options: Options = {}
    ) {
        super("rplayer-control-bar")

        const DEFAULT_TIME = "00:00"
        const { el } = this
        const progressWrapper = createEl("div", "rplayer-progress-wrapper")
        const sliderWrapper = createEl("div", "rplayer-progress")
        this._video = player.video
        this.autoHide = true
        this.hideTimeout = 3000
        this._currentTimeEl = createEl("div", "rplayer-current-time")
        this._durationEl = createEl("div", "rplayer-duration")!
        this._currentTimeEl.innerHTML = DEFAULT_TIME
        this._durationEl.innerHTML = DEFAULT_TIME
        this._slider = new Slider(
            sliderWrapper,
            {
                buffer: true,
                tooltip: this._formatTooltip
            }
        )

        if (_options.showMiniProgress !== false) {
            this._miniProgress = new MiniProgress(this._parent)
        }

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
        super.init()

        const { _video } = this

        _video.addListener("timeupdate", this._handleTimeUpdate)
        _video.addListener("durationchange", this._handleDurationChange)
        _video.addListener("progress", this._handleVideoProgress)

        this._slider.on("value-change", this._handleSliderChange)
        this._slider.on("value-update", this._handleSliderUpdate)
        this._slider.on("slide-end", this._handleSlideEnd)

        this.on("show", this._handleShow)
        this.on("hidden", this._handleHidden)
    }

    protected override shouldDelay() {
        return this._slider.isMoving()
    }

    public override hide() {
        if (!this._hidePrevented) {
            super.hide()
        }
    }

    protected override delayHide() {
        if (this._hidePrevented) {
            this.clearHideTimeout()

            return
        }

        super.delayHide()
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
        this.autoHide = !prevented

        if (prevented) {
            this.clearHideTimeout()
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

    private _handleShow = () => {
        this._miniProgress?.hide()
        this._parent.classList.remove(NO_CURSOR_CLASS)
    }

    private _handleHidden = () => {
        this._miniProgress?.show()
        this._parent.classList.add(NO_CURSOR_CLASS)
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

        this._slider.updateProgress(progress)
        this._miniProgress?.update(progress)
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
                ...eo.details
            }
        )
    }

    private _handleSliderUpdate = (eo: EventObject) => {
        this._emitSeekEvent("seeking", eo)
    }

    private _handleSlideEnd = (eo: EventObject) => {
        this._emitSeekEvent("seek-end", eo)
    }
}