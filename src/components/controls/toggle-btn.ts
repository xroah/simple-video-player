import { createBtn, createEl } from "../../commons/utils"
import Video from "../video"
import { play, pause } from "../svg"

export default class ToggleBtn {
    private _el: HTMLButtonElement
    private _icon: SVGSVGElement

    constructor(
        parent: HTMLDivElement,
        private _video: Video
    ) {
        this._el = createBtn("rplayer-play-btn")

        _video.addListener("play", this._handlePlay)
        _video.addListener("pause", this._handlePause)
        this._setIcon(play())
        this._el.addEventListener("click", this._toggle)
        parent.appendChild(this._el)
    }

    private _toggle = () => {
        this._video.toggle()
    }

    private _setIcon(icon: SVGSVGElement) {
        if (this._icon == icon) {
            return
        }

        if (this._icon) {
            this._el.removeChild(this._icon)
        }

        this._icon = icon

        this._el.appendChild(icon)
    }

    private _handlePlay = () => {
        this._setIcon(pause())
    }

    private _handlePause = () => {
        this._setIcon(play())
    }
}