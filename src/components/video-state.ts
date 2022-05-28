import { createEl } from "../commons/utils"
import Video from "./video"


const HTML = `
    <div class="rplayer-loading-state">
    </div>
`

export default class VideoState {
    private _el: HTMLDivElement
    private _loadingEl: HTMLDivElement

    constructor(
        parent: HTMLDivElement,
        private _video: Video
    ) {
        this._el = <HTMLDivElement>createEl(
            "div",
            "rplayer-video-state"
        )
        this._loadingEl = <HTMLDivElement>createEl(
            "div",
            "rplayer-spinner"
        )

        this._el.appendChild(this._loadingEl)
        parent.appendChild(this._el)
    }

    show() {
        this._el.style.display = "block"
    }

    hide() {
        this._el.style.display = "none"
    }
}