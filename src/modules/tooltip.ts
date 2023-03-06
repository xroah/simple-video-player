import ToggleVisible from "../commons/toggle-visible"
import { createEl } from "../utils"

export default class Tooltip extends ToggleVisible {
    private _textEl: HTMLElement

    constructor(private _parent: HTMLElement) {
        super(_parent, "rplayer-tooltip")

        this._textEl = createEl("span", "rplayer-tooltip-text")

        this.el.appendChild(this._textEl)
        _parent.appendChild(this.el)
        this.hide()
    }

    public updatePosition(x  = 0) {
        const rect = this.el.getBoundingClientRect()
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

        this.el.style.left = `${left}px`
        this.el.style.top = `${top}px`
    }

    // x relative to page
    public show(x?: number) {
        super.show()
        this.updatePosition(x)
    }

    public updateText(text: string) {
        this._textEl.innerHTML = text
    }
}