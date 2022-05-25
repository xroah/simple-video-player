import { createEl } from "../commons/utils"
import Volume from "./volume"

export default class VolumeState extends Volume {
    private _el: HTMLDivElement
    private _textEl: HTMLSpanElement
    private _timer = -1

    constructor(parent: HTMLDivElement) {
        super("span")

        this._el = <HTMLDivElement>createEl(
            "div",
            "rplayer-volume-state"
        )
        this._textEl = <HTMLSpanElement>createEl(
            "span",
            "rplayer-volume-text"
        )

        this._el.appendChild(this._btnEl)
        this._el.appendChild(this._textEl)
        parent.appendChild(this._el)
    }

    update(volume: number, muted: boolean) {
        if (this._timer != -1 ) {
            clearTimeout(this._timer)
        }

        this._el.style.display = "block"
        this._textEl.innerHTML = String(volume)
        this._timer = window.setTimeout(() => {
            this._el.style.display = "none"
            this._timer = -1
        }, 1500)

        this._updateIcon(volume, muted)
    }
}