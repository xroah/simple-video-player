import ToggleVisible from "../commons/toggle-visible"
import { createEl } from "../utils"
import Video from "./video"

export default class MiniProgress extends ToggleVisible {
    private _progress: HTMLElement

    constructor(parent: HTMLElement, private _video: Video) {
        super(parent, "rplayer-mini-progress-wrapper")

        this._progress = createEl("div", "rplayer-mini-progress")

        _video.addListener("timeupdate", this._handleUpdate)

        this.el.appendChild(this._progress)
    }

    private _handleUpdate = () => {
        const progress = this._video.getProgress()
        this._progress.style.width = `${progress}%`
    }
}