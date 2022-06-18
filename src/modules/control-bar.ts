import { EventObject } from "../commons/event-emitter"
import { formatTime } from "../utils"
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

export default class ControlBar extends Transition {
    private _slider: Slider

    constructor(
        private _parent: HTMLElement,
        private _video: Video
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
                tooltipContainer: _parent,
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
    }

    private _handleTimeUpdate = () => {
        const duration = this._video.getDuration()
        const currentTime = this._video.getCurrentTime()

        if (!duration || this._slider.isMoving()) {
            return
        }

        this._slider.updateProgress(currentTime / duration * 100)
    }

    private _handleSliderChange = (eo: EventObject) => {
        const progress = eo.details as number
        const duration = this._video.getDuration()

        this._video.setCurrentTime(duration * progress / 100)
    }
}