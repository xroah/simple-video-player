import EventEmitter from "../commons/event-emitter"
import {HIDDEN_CLASS, SHOW_CLASS} from "../constants"
import {addListener} from "../commons/dom-event"
import {createEl, reflow} from "../utils"

export default class Transition extends EventEmitter {
    visible = false
    el: HTMLElement
    hideTimeout = 0
    timer: any = null
    autoHide = false

    constructor(...classes: string[]) {
        super()

        this.el = createEl("div", ...classes)
        addListener(this.el, "transitionend", this.handleTransitionEnd)
    }

    needDelay() {
        return false
    }

    clearTimeout() {
        if (this.timer !== null) {
            clearTimeout(this.timer)

            this.timer = null
        }
    }

    delayHide() {
        if (!this.visible) {
            return
        }

        this.clearTimeout()

        this.timer = setTimeout(
            () => {
                this.timer = null
                if (this.needDelay()) {
                    this.delayHide()
                } else {
                    this.setVisible(false)
                }
            },
            this.hideTimeout
        )
    }

    handleTransitionEnd = () => {
        if (this.visible) {
            this.emit("shown")
        } else {
            this.el.classList.add(HIDDEN_CLASS)
            this.emit("hidden")
        }
    }

    setVisible(visible: boolean) {
        if (this.visible === visible) {
            if (visible && this.autoHide) {
                this.delayHide()
            }

            return
        }

        this.visible = visible

        if (visible) {
            this.el.classList.remove(HIDDEN_CLASS)
            this.emit("show")
            reflow(this.el)
            this.el.classList.add(SHOW_CLASS)

            if (this.autoHide) {
                this.delayHide()
            }
        } else {
            this.el.classList.remove(SHOW_CLASS)
            this.emit("hide")
        }
    }
}