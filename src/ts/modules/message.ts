import {
    addListener,
    createEl,
    preventAndStop,
    removeAllListeners
} from "../dom"
import EventEmitter from "../event"

const PREFIX = "rplayer-message"

let uid = 0

interface MessageOptions {
    closable?: boolean
    autoHide?: boolean
    delay?: number
}

export default class Message extends EventEmitter {
    private _el: HTMLElement | null = null
    private _timer: any = null
    private _textEl: HTMLElement //element for showing message text
    private _closeEl: HTMLElement | null = null
    private _options: MessageOptions

    uid = uid++

    constructor(options = {}) {
        super()

        this._options = {
            ...options
        }
    }

    getEl() {
        return this._el
    }

    mountTo(container: HTMLElement) {
        this._el = createEl("div", `${PREFIX}-item`)
        this._textEl = createEl("div", `${PREFIX}-text`)

        this._el.appendChild(this._textEl)

        if (this._options.closable) {
            this._closeEl = createEl("span", "rplayer-close-btn")

            addListener(this._closeEl, "click", this.handleClick)
            this._el.appendChild(this._closeEl)
        }

        addListener(this._el, "mouseenter", this.handleMouseEnterLeave)
        addListener(this._el, "mouseleave", this.handleMouseEnterLeave)
        container.appendChild(this._el)

        this.emit("mount", {
            type: "mount"
        })
    }

    private handleMouseEnterLeave = (evt: MouseEvent) => {
        if (evt.type === "mouseenter") {
            this.clearDelayTimer()
        } else {
            this.delayHide()
        }
    }

    private handleClick = (evt: MouseEvent) => {
        preventAndStop(evt)
        this.destroy()
    }

    update(msg: string | HTMLElement) {
        if (!this._el) {
            return
        }

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
        if (!this._el) {
            return
        }

        this.clearDelayTimer()
        removeAllListeners(this._el)
        this.emit("destroy", {
            type: "destroy",
            value: this.uid
        })
        this.off()

        if (this._closeEl) {
            removeAllListeners(this._closeEl)
        }
    }

    private clearDelayTimer() {
        if (this._timer !== null) {
            clearTimeout(this._timer)

            this._timer = null
        }
    }

    delayHide(delay = 2000) {
        this.clearDelayTimer()

        this._timer = setTimeout(() => {
            this.destroy()
        }, delay)
    }
}