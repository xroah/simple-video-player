import { createEl, formatTime } from "../commons/utils"

export default class PlayerTime {
    private _currentTimeEl: HTMLElement
    private _durationEl: HTMLElement

    constructor(container: HTMLElement) {
        this._currentTimeEl = createEl("span")
        this._durationEl = createEl("span")

        this.mountTo(container)
    }

    private mountTo(container: HTMLElement) {
        const timeFrag = document.createDocumentFragment()
        const el = createEl("div", "rplayer-time-info")

        timeFrag.append(this._currentTimeEl)
        timeFrag.append(this._durationEl)
        el.append(timeFrag)
        container.append(el)
    }

    updateCurrentTime(val: number) {
        this._currentTimeEl.innerHTML = formatTime(val)
    }

    updateDuration(val: number) {
        this._durationEl.innerHTML = " / " + formatTime(val)
    }
}