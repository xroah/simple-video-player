import { EventObject } from "../commons/event-emitter"
import { formatTime } from "../utils"
import MiniProgress from "./mini-progress"
import Slider from "./slider"
import Transition from "./transition"
import Video from "./video"

const html = `
    <div class="rplayer-progress-wrapper">
    </div>
    <div class="rplayer-controls-wrapper">
        <div class="rplayer-left-controls"></div>
        <div class="rplayer-right-controls"></div>
    </div>
`

interface Options {
    showMiniProgress?: boolean
}

export default class ControlBar extends Transition {
    private _slider: Slider
    private _miniProgress?: MiniProgress

    constructor(
        private _parent: HTMLElement,
        private _video: Video,
        private _options: Options = {}
    ) {
        super("rplayer-control-bar")

        this.el.innerHTML = html
        this.autoHide = true
        this.hideTimeout = 3000
        const sliderWrapper = this.el.querySelector(
            ".rplayer-progress-wrapper"
        ) as HTMLElement
        this._slider = new Slider(
            sliderWrapper,
            {
                tooltip(v) {
                    const duration = _video.getDuration()
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
        this._slider.on("value-change", this._handleSliderChange)

        if(this._miniProgress) {
            this.on("show", this._hideMiniProgress)
            this.on("hidden", this._showMiniProgress)
        }
    }

    private _showMiniProgress = () => this._miniProgress?.show()

    private _hideMiniProgress = () => this._miniProgress?.hide()

    private _handleTimeUpdate = () => {
        if (this._slider.isMoving()) {
            return
        }

        const progress = this._video.getProgress()

        this._slider.updateProgress(progress)
        this._miniProgress?.update(progress)
    }

    private _handleSliderChange = (eo: EventObject) => {
        const progress = eo.details as number
        const duration = this._video.getDuration()

        this._video.setCurrentTime(duration * progress / 100)
    }
}