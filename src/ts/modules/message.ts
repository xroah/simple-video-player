import {
    addListener,
    createEl,
    preventAndStop,
    removeAllListeners
} from "../dom"
import EventEmitter from "../event"

export const PREFIX = "rplayer-message"

let uid = 0

export interface MessageOptions {
    closable?: boolean
    autoHide?: boolean
    delay?: number
}

export default class Message extends EventEmitter {
    private _el: HTMLElement
    private _timer: any = null
    private _textEl: HTMLElement //element for showing message text
    private _closeEl: HTMLElement | null = null
    private _options: MessageOptions

    public uid = uid++

    constructor(container: HTMLElement, options = {}) {
        super()

        this._options = {
            ...options
        }
        this._textEl = createEl("div", `${PREFIX}-text`)
        this._el = createEl("div", `${PREFIX}-item`)

        this.mountTo(container)
    }

    getEl() {
        return this._el
    }

    private mountTo(container: HTMLElement) {
        this._el.appendChild(this._textEl)

        if (this._options.closable) {
            this._closeEl = createEl("span", "rplayer-close-btn")

            addListener(
                this._closeEl,
                "click",
                this.handleClose,
                {once: true}
            )
            this._el.appendChild(this._closeEl)
        }

        addListener(this._el, "mouseenter", this.handleMouseEnterLeave)
        addListener(this._el, "mouseleave", this.handleMouseEnterLeave)
        container.appendChild(this._el)

        this.emit("mounted", {
            type: "mounted"
        })
    }

    private handleMouseEnterLeave = (evt: MouseEvent) => {
        if (evt.type === "mouseenter") {
            this.clearDelayTimer()
        } else {
            this.delayHide()
        }
    }

    private handleClose = (evt: MouseEvent) => {
        preventAndStop(evt)
        this.destroy()
    }

    update(msg: string | HTMLElement) {
        this._textEl.innerHTML = ""

        if (typeof msg === "string") {
            this._textEl.innerHTML = msg
        } else {
            this._textEl.appendChild(msg)
        }

        const {
            delay,
            autoHide
        } = this._options

        if (autoHide !== false) {
            this.delayHide(delay)
        }
    }

    destroy() {
        if (!this._el.parentNode) {
            return
        }

        this.clearDelayTimer()
        removeAllListeners(this._el)
        this.emit("destroy", this.uid)
        this.off()
    }

    private clearDelayTimer() {
        if (this._timer !== null) {
            clearTimeout(this._timer)

            this._timer = null
        }
    }

    private delayHide(delay = 2000) {
        this.clearDelayTimer()

        this._timer = setTimeout(this.destroy.bind(this), delay)
    }
}