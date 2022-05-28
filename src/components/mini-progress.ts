import { createEl } from "../commons/utils"
import Video from "./video"

export default class MiniProgress {
    private _el: HTMLDivElement
    private _progress: HTMLDivElement

    constructor(
        parent: HTMLDivElement,
        private _video: Video
    ) {
        this._el = <HTMLDivElement>createEl(
            "div",
            "rplayer-mini-progress-wrapper"
        )
        this._progress = <HTMLDivElement>createEl(
            "div",
            "rplayer-mini-progress-bar"
        )

        _video.addListener("timeupdate", this._update)
        this._el.appendChild(this._progress)
        parent.appendChild(this._el)
    }

    show() {
        this._el.style.display = "block"
    }

    hide() {
        this._el.style.display = "none"
    }

    private _update = () => {
        this._progress.style.width = `${this._video.getProgress()}%`
    }
}