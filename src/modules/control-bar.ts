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
        this._slider = new Slider(sliderWrapper)

        this._parent.appendChild(this.el)
        this.show(true)
        super.init()
    }
    
    protected shouldDelay() {
        return this._slider.isMoving()
    }
}