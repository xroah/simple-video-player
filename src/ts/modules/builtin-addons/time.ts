import { createEl, formatTime } from "../../commons/utils"
import Video from "../video"

export default class PlayerTime {
    private _video: Video
    private _currentTimeEl: HTMLElement
    private _durationEl: HTMLElement

    constructor(container: HTMLElement, video: Video) {
        this._video = video
        this._currentTimeEl = createEl("span")
        this._durationEl = createEl("span")

        this.mountTo(container)
    }

    mountTo(container: HTMLElement) {
        const textNode = document.createTextNode(" / ")
        const timeFrag = document.createDocumentFragment()
        const el = createEl("div", "rplayer-time-info")

        timeFrag.appendChild(this._currentTimeEl)
        timeFrag.appendChild(textNode)
        timeFrag.appendChild(this._durationEl)
        el.appendChild(timeFrag)
        container.appendChild(el)
    }

    updateCurrentTime(val: number) {
        this._currentTimeEl.innerHTML = formatTime(val)
    }

    updateDuration(val: number) {
        this._durationEl.innerHTML = formatTime(val)
    }
}