import { createEl, isUndef } from "../utils"
import Transition from "./transition"

export interface MessageOptions {
    duration?: number
    content?: string
    closable?: boolean
}

let uid = 0

export class Message extends Transition {
    private _contentEl: HTMLElement
    private _closeEl: HTMLElement | null = null

    public id = uid++

    constructor(
        parent: HTMLElement,
        {
            duration,
            content,
            closable,
            ...restOptions
        }: MessageOptions = {}
    ) {
        super("rplayer-message-item", {
            hideTimeout: duration ?? 3000,
            autoHide: true,
            removeOnHidden: true,
            ...restOptions
        })

        this._contentEl = createEl("div", "rplayer-message-content")
        this._contentEl.innerHTML = content ?? ""

        this.el.appendChild(this._contentEl)
        parent.appendChild(this.el)

        if (closable) {
            this._createClose()
        }
    }

    private _createClose() {
        this._closeEl = createEl("button", "rplayer-message-close")

        this.el.appendChild(this._closeEl)
        this._closeEl.addEventListener("click", this._hide)
    }

    private _hide = () => {
        this.hide()
    }

    private _removeClose() {
        const closeEl = this._closeEl

        if (!closeEl) {
            return
        }

        this._closeEl = null

        closeEl.remove()
        closeEl.removeEventListener("click", this._hide)
    }

    public update(
        content?: string,
        {
            duration,
            closable
        }: MessageOptions = {}
    ) {
        if (!isUndef(content)) {
            this._contentEl.innerHTML = content!
        }

        if (!isUndef(duration) && this.hideTimeout !== duration) {
            this.hideTimeout = duration!
        }

        if(closable) {
            if (!this._closeEl) {
                this._createClose()
            }
        } else {
            if (this._closeEl) {
                this._removeClose()
            }
        }

        this.delayHide()
    }
}