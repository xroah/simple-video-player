import EventEmitter from "../commons/event-emitter"
import { HIDDEN_CLASS, SHOW_CLASS } from "../commons/constants"
import { createEl, noop, reflow } from "../commons/utils"
import { addListener, removeListener } from "../commons/dom-event"

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

    delayHide(noTransition = false) {
        if (!this.visible) {
            return
        }

        this.clearTimeout()

        this.timer = setTimeout(
            () => {
                this.timer = null
                if (this.needDelay()) {
                    this.delayHide(noTransition)
                } else {
                    this.setVisible(false, noTransition)
                }
            },
            this.hideTimeout
        )
    }

    protected _handleTransitionEnd() {
        if (this.visible) {
            this.emit("shown")
        } else {
            this.el.classList.add(HIDDEN_CLASS)
            this.emit("hidden")
        }
    }

    handleTransitionEnd = () => {
        this._handleTransitionEnd()
    }

    addTransitionEndListener = () => {
        addListener(
            this.el,
            "transitionend",
            this.handleTransitionEnd,
            // avoid triggered multiple times(multi transition property)
            {once: true} 
        )
    }

    removeTransitionendListener = () => {
        removeListener(this.el, "transitionend", this.handleTransitionEnd)
    }

    setVisible(visible: boolean, noTransition = false) {
        if (this.visible === visible) {
            if (visible && this.autoHide) {
                this.delayHide()
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

        this.removeTransitionendListener()

        if (visible) {
            if (noTransition) {
                show()
                this.handleTransitionEnd()
            } else {
                this.addTransitionEndListener()
                show(reflow)
            }

            if (this.autoHide) {
                this.delayHide()
            }

            return
        }

        this.emit("hide")
        this.el.classList.remove(SHOW_CLASS)

        if (noTransition) {
            this.handleTransitionEnd()
        } else {
            this.addTransitionEndListener()
        }
    }
}