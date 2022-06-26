import Video from "../modules/video"
import Toggle from "../commons/toggle"

export default class Loading extends Toggle {
    constructor(
        private _video: Video,
        parent: HTMLElement
    ) {
       super(parent, "rplayer-loading")

        this._video.on("waiting", this._show)
        this._video.on("canplay", this._hide)
    }

    private _show = () => this.show()

    private _hide = () => this.hide()
}