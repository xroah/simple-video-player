import {addListener, removeAllListeners} from "../commons/dom-event"
import {createEl, preventAndStop} from "../utils"
import Transition from "./transition"

export const PREFIX = "rplayer-message"

let uid = 0

export interface MessageOptions {
    closable?: boolean
    autoHide?: boolean
    delay?: number
    destroyAfterHide?: boolean
    message?: string | HTMLElement
    classNames?: string[]
}

export default class Message extends Transition {
    private _textEl: HTMLElement //element for showing message text
    private _closeEl: HTMLElement | null = null
    private _options: MessageOptions

    public uid = 0

    constructor(container: HTMLElement, options: MessageOptions = {}) {
        super(`${PREFIX}-item`, ...(options.classNames || []))

        this._options = {
            ...options
        }
        this._textEl = createEl("div", `${PREFIX}-text`)
        this.hideTimeout = this._options.delay || 2000
        this.autoHide = this._options.autoHide !== false

        this.mountTo(container)

        Object.defineProperty(this, "uid", {value: uid++})
    }

    private mountTo(container: HTMLElement) {
        this.el.appendChild(this._textEl)

        if (this._options.closable) {
            this._closeEl = createEl("span", "rplayer-close-btn")

            addListener(
                this._closeEl,
                "click",
                this.handleClose,
                {once: true}
            )
            this.el.appendChild(this._closeEl)
        }

        addListener(this.el, "mouseenter", this.handleMouseEnterLeave)
        addListener(this.el, "mouseleave", this.handleMouseEnterLeave)
        this.update(this._options.message)
        container.appendChild(this.el)

        if (this._options.destroyAfterHide) {
            this.once("hidden", () => this.destroy())
        }

        this.emit("mounted", {
            type: "mounted"
        })
    }

    private handleMouseEnterLeave = (evt: MouseEvent) => {
        if (evt.type === "mouseenter") {
            this.clearTimeout()
        } else {
            this.delayHide()
        }
    }

    private handleClose = (evt: MouseEvent) => {
        preventAndStop(evt)
        this.destroy()
    }

    update(msg: string | HTMLElement = "") {
        this._textEl.innerHTML = ""

        if (typeof msg === "string") {
            this._textEl.innerHTML = msg
        } else {
            this._textEl.appendChild(msg)
        }
    }

    show(msg?: string | HTMLElement) {
        super.setVisible(true)

        this.update(msg)
    }

    hide() {
        super.delayHide()
    }

    destroy() {
        if (!this.el.parentNode) {
            return
        }
        
        this.clearTimeout()
        removeAllListeners(this.el)
        this.emit("destroy", this.uid)
        this.el.parentNode.removeChild(this.el)
        this.off()
    }
}