import { HIDDEN_CLASS } from "../commons/constants"
import { addListener, removeAllListeners } from "../commons/dom-event"
import { createEl, preventAndStop } from "../commons/utils"
import Transition from "./transition"

export const PREFIX = "rplayer-message"

let uid = 0

export interface MessageOptions {
    closable?: boolean
    autoHide?: boolean
    delay?: number
    message?: string | HTMLElement
    prepend?: boolean
}

export default class Message extends Transition {
    private _textEl: HTMLElement //element for showing message text
    private _closeEl: HTMLElement | null = null
    private _options: MessageOptions

    public uid = 0

    constructor(container: HTMLElement, options: MessageOptions = {}) {
        super(`${PREFIX}-item`, HIDDEN_CLASS)

        this._options = {
            ...options
        }
        this._textEl = createEl("div", `${PREFIX}-text`)
        this.hideTimeout = this._options.delay || 3000
        this.autoHide = this._options.autoHide !== false

        this.init()
        this.mountTo(container, options.prepend)

        Object.defineProperty(this, "uid", { value: uid++ })
    }

    private init() {
        addListener(this.el, "mouseenter", this.handleMouseEnterLeave)
        addListener(this.el, "mouseleave", this.handleMouseEnterLeave)
        this.once("hidden", () => this.destroy())

        this.update(this._options.message)
    }

    private mountTo(container: HTMLElement, prepend = false) {
        // apply background to inner
        const inner = createEl("div", "rplayer-message-item-inner")
        
        inner.append(this._textEl)

        if (this._options.closable) {
            this._closeEl = createEl("span", "rplayer-close-btn")

            addListener(
                this._closeEl,
                "click",
                this.handleClose,
                { once: true }
            )

            inner.append(this._closeEl)
        }

        this.el.append(inner)

        if (prepend) {
            const first = container.firstElementChild

            if (first) {
                container.insertBefore(this.el, first)

                return
            }
        }

        container.append(this.el)
    }

    private handleMouseEnterLeave = (evt: MouseEvent) => {
        if (!this.autoHide) {
            return
        }

        if (evt.type === "mouseenter") {
            this.clearTimeout()
        } else {
            this.delayHide()
        }
    }

    private handleClose = (evt: MouseEvent) => {
        preventAndStop(evt)

        this.hide()
    }

    update(msg: string | HTMLElement = "") {
        this._textEl.innerHTML = ""

        if (typeof msg === "string") {
            this._textEl.innerHTML = msg
        } else {
            this._textEl.append(msg)
        }

        if (this.autoHide) {
            this.delayHide()
        }
    }

    show(msg?: string | HTMLElement) {
        this.setVisible(true)

        this.update(msg)
    }

    hide() {
        this.setVisible(false)
    }

    destroy() {
        if (!this.el.parentNode) {
            return
        }

        this.clearTimeout()
        removeAllListeners(this.el)
        this.emit("destroy", this.uid)
        this.off()
        this.el.remove()
    }
}