import { EventObject } from "../commons/event-emitter"
import ToggleVisible from "../commons/toggle-visible"
import { TooltipOptions } from "../commons/types"
import { createEl } from "../utils"
import throttle from "../utils/throttle"
import Slider from "./slider"

export default class Tooltip extends ToggleVisible {
    private _textEl: HTMLElement
    private _parent: HTMLElement

    constructor(
        private _slider: Slider,
        private _options: TooltipOptions = {}
    ) {
        super(_slider.el, "rplayer-tooltip")

        this._textEl = createEl("span", "rplayer-tooltip-text")
        this._parent = _slider.el

        this.el.appendChild(this._textEl)
        this.hide()
    }

    public updatePosition(x = 0) {
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