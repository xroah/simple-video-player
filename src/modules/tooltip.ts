import { HIDDEN_CLASS } from "../commons/constants"
import { createEl } from "../utils"

export default class Tooltip {
    private _el: HTMLElement
    private _textEl: HTMLElement
    private _visible = true

    constructor(private _parent: HTMLElement) {
        this._el = createEl("div", "rplayer-tooltip")
        this._textEl = createEl("span", "rplayer-tooltip-text")

        this._el.appendChild(this._textEl)
        _parent.appendChild(this._el)
        this.hide()
    }

    public updatePosition(x: number, y: number) {
        const rect = this._el.getBoundingClientRect()
        const parentRect = this._parent.getBoundingClientRect()
        const maxLeft = parentRect.width - rect.width
        const SPACE = 20
        const top = - SPACE - rect.height
        let left = x - parentRect.left - rect.width / 2

        if (left <= 0) {
            left = 0
        } else if (left > maxLeft) {
            left = maxLeft
        }

        this._el.style.left = `${left}px`
        this._el.style.top = `${top}px`
    }

    // x, y relative to page
    public show(x: number, y: number) {
        if (!this._visible) {
            this._visible = true

            this._el.classList.remove(HIDDEN_CLASS)
        }

        this.updatePosition(x, y)
    }

    public hide() {
        if (this._visible) {
            this._visible = false

            this._el.classList.add(HIDDEN_CLASS)
        }
    }

    public updateText(text: string) {
        this._textEl.innerHTML = text
    }
}