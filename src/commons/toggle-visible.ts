import { createEl } from "../utils"
import { HIDDEN_CLASS } from "./constants"

export default class ToggleVisible {
    public el: HTMLElement
    protected visible = true

    constructor(
        parent: HTMLElement,
        ...classes: string[]
    ) {
        this.el = createEl("div", ...classes)

        parent.appendChild(this.el)
        this.hide()
    }

    public show() {
        if (this.visible) {
            return
        }

        this.visible = true

        this.el.classList.remove(HIDDEN_CLASS)
    }

    public hide() {
        if (!this.visible) {
            return
        }

        this.visible = false

        this.el.classList.add(HIDDEN_CLASS)
    }
}