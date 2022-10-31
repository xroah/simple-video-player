import { controlBarHtml } from "../commons/constants"
import { EventObject } from "../commons/event-emitter"
import { formatTime } from "../utils"
import MiniProgress from "./mini-progress"
import Slider, { Details } from "./slider"
import Transition from "./transition"
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

    constructor(
        private _parent: HTMLElement,
        private _video: Video,
        private _options: Options = {}
    ) {
        super("rplayer-control-bar")

        const DEFAULT_TIME = "00:00"
        this.el.innerHTML = controlBarHtml
        this.autoHide = true
        this.hideTimeout = 3000
        const sliderWrapper = this.el.querySelector(
            ".rplayer-progress"
        ) as HTMLElement
        this._currentTimeEl = this.el.querySelector(
            ".rplayer-current-time"
        ) as HTMLElement
        this._durationEl = this.el.querySelector(
            ".rplayer-duration"
        ) as HTMLElement
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

        this._parent.appendChild(this.el)
        this.show(true)
        this.init()
    }

    protected shouldDelay() {
        return this._slider.isMoving()
    }

    protected init() {
        super.init()
        this._video.addListener("timeupdate", this._handleTimeUpdate)
        this._video.addListener(
            "durationchange",
            this._handleDurationChange
        )
        this._slider.on("value-change", this._handleSliderChange)
        this._slider.on("value-update", this._handleSliderUpdate)
        this._slider.on("slide-end", this._handleSlideEnd)

        this.on("show", this._handleShow)
        this.on("hidden", this._handleHidden)
    }

    private _formatTooltip = (v: number) => {
        const duration = this._video.getDuration()
        let time = duration * v / 100

        if (time >= duration) {
            time = duration
        } else if (time <= 0) {
            time = 0
        }

        if (!duration) {
            return "00:00"
        }

        return formatTime(Math.floor(time))
    }

    private _handleShow = () => {
        this._miniProgress?.show()
        this._parent.classList.remove(NO_CURSOR_CLASS)
    }

    private _handleHidden = () => {
        this._miniProgress?.hide()
        this._parent.classList.add(NO_CURSOR_CLASS)
    }

    private _handleDurationChange = () => {
        const duration = this._video.getDuration()

        if (duration) {
            this._durationEl.innerHTML = formatTime(
                Math.floor(duration)
            )
        }
    }

    private _handleTimeUpdate = () => {
        if (this._slider.isMoving()) {
            return
        }

        const progress = this._video.getProgress()
        this._currentTimeEl.innerHTML = formatTime(
            Math.floor(this._video.getCurrentTime())
        )

        this._slider.updateProgress(progress)
        this._miniProgress?.update(progress)
    }

    private _getSeekTime(eo: EventObject) {
        const details = eo.details as Details
        const duration = this._video.getDuration()

        return duration * details.value / 100
    }

    private _handleSliderChange = (eo: EventObject) => {
        this._video.setCurrentTime(
            this._getSeekTime(eo)
        )
    }

    private _emitSeekEvent = (type: string, eo: EventObject) => {
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