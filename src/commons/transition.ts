import EventEmitter from "./event-emitter"
import { HIDDEN_CLASS, SHOW_CLASS } from "./constants"
import {
    createEl,
    noop,
    reflow
} from "../commons/utils"

export default class Transition extends EventEmitter {
    visible = false
    el: HTMLElement
    hideTimeout = 0
    timer: any = null
    autoHide = false

    constructor(...classes: string[]) {
        super()

        this.el = createEl("div", ...classes)
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

    delayHide(force = false) {
        if (!this.visible) {
            return
        }

        this.clearTimeout()

        this.timer = setTimeout(
            () => {
                this.timer = null
                
                if (this.needDelay()) {
                    this.delayHide(force)
                } else {
                    this.setVisible(false, force)
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

    addListener = () => {
        this.el.addEventListener(
            "transitionend",
            this.handleTransitionEnd,
            // avoid triggered multiple times(multi transition property)
            { once: true }
        )
    }

    removeListener = () => {
        this.el.removeEventListener(
            "transitionend",
            this.handleTransitionEnd
        )
    }

    setVisible(visible: boolean, force = false) {
        if (this.visible === visible) {
            if (visible && this.autoHide) {
                this.delayHide(force)
            }

            return
        }

        const show = (reflow: (el: HTMLElement) => void = noop) => {
            this.el.classList.remove(HIDDEN_CLASS)
            this.emit("show")
            reflow(this.el)
            this.el.classList.add(SHOW_CLASS)
        }

        this.visible = visible

        this.removeListener()

        if (visible) {
            if (force) {
                show()
                this.handleTransitionEnd()
            } else {
                this.addListener()
                show(reflow)
            }

            if (this.autoHide) {
                this.delayHide()
            }

            return
        }

        this.emit("hide")
        this.el.classList.remove(SHOW_CLASS)

        if (force) {
            this.handleTransitionEnd()
        } else {
            this.addListener()
        }
    }
}