import { createEl, formatTime } from "../../commons/utils"

export default class TimeInfo {
    private _timeEl: HTMLElement
    private _durationEl: HTMLElement

    constructor(parent: HTMLElement) {
        const el = createEl("div", "rplayer-time-info")
        const slash = createEl("span")
        this._timeEl = createEl("span")
        this._durationEl = createEl("span")
        slash.innerHTML = "/"

        this.setTime(0)
        this.setDuration(0)

        el.appendChild(this._timeEl)
        el.appendChild(slash)
        el.appendChild(this._durationEl)
        parent.appendChild(el)
    }

    setTime(time: number) {
        time = Math.floor(time)
        this._timeEl.innerHTML = formatTime(time)
    }

    setDuration(d: number) {
        d = Math.floor(d)
        this._durationEl.innerHTML = formatTime(d)
    }
}