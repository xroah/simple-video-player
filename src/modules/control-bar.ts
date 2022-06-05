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
    constructor(
        private _parent: HTMLElement,
        private _video: Video
    ) {
        super("rplayer-control-bar")

        this.el.innerHTML = html
        this.autoHide = true
        this.hideTimeout = 3000

        this._parent.appendChild(this.el)
        this.show(true)
        super.init()
    }
}