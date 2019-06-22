import EventEmitter from "../event"
import {HIDDEN_CLASS, SHOW_CLASS} from "../constans"
import {reflow} from "../dom"

export default class Transition extends EventEmitter {
    visible = false
    el: HTMLElement
    hideTimeout = 0
    timer: any = null
    autoHide = false

    constructor() {
        super()

        this.el = document.createElement("div")
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
            reflow(this.el)
            this.el.classList.add(SHOW_CLASS)
            this.emit("show", {type: "show"})

            if (this.autoHide) {
                this.delayHide()
            }
        } else {
            this.el.classList.remove(SHOW_CLASS)
            this.emit("hide", {type: "hide"})
        }
    }
}