import { controlBarHtml } from "../commons/constants"
import { EventObject } from "../commons/event-emitter"
import { formatTime } from "../utils"
import MiniProgress from "./mini-progress"
import Slider from "./slider"
import Transition from "./transition"
import Video from "./video"

interface Options {
    showMiniProgress?: boolean
}

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

        if (this._miniProgress) {
            this.on("show", this._hideMiniProgress)
            this.on("hidden", this._showMiniProgress)
        }
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

    private _showMiniProgress = () => this._miniProgress?.show()

    private _hideMiniProgress = () => this._miniProgress?.hide()

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

    private _handleSliderChange = (eo: EventObject) => {
        const progress = eo.details as number
        const duration = this._video.getDuration()

        this._video.setCurrentTime(duration * progress / 100)
    }
}