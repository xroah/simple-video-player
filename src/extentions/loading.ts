import { createEl } from "../utils"
import { HIDDEN_CLASS } from "../commons/constants"
import Video from "../modules/video"

export default class Loading {
    private _el: HTMLElement
    private _visible = true

    constructor(
        private _video: Video,
        parent: HTMLElement
    ) {
        this._el = createEl("div", "rplayer-loading")

        parent.appendChild(this._el)
        this._hide()
        this._video.addListener("waiting", this._show)
        this._video.addListener("canplay", this._hide)
    }

    private _show = () => {
        if (this._visible) {
            return
        }

        this._visible = true

        this._el.classList.remove(HIDDEN_CLASS)
    }

    private _hide = () => {
        if(!this._visible) {
            return
        }

        this._visible = false

        this._el.classList.add(HIDDEN_CLASS)
    }
}