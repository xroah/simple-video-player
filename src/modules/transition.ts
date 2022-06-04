import EventEmitter from "../commons/event-emitter"
import { HIDDEN_CLASS, SHOW_CLASS } from "../commons/constants"
import {
    createEl,
    noop,
    reflow
} from "../commons/utils"

export default class Transition extends EventEmitter {
    protected visible = false
    protected el: HTMLElement
    // for auto hide
    protected hideTimeout = 0
    protected timer = -1
    protected autoHide = false

    private _transitionEndTimer = -1

    constructor(...classes: string[]) {
        super()

        this.el = createEl("div", HIDDEN_CLASS, ...classes)
    }

    protected shouldDelay() {
        return false
    }

    protected clearTimeout() {
        if (this.timer !== -1) {
            clearTimeout(this.timer)

            this.timer = -1
        }
    }

    protected delayHide(force = false) {
        if (!this.visible) {
            return
        }

        this.clearTimeout()

        this.timer = window.setTimeout(
            () => {
                this.timer = -1

                if (this.shouldDelay()) {
                    this.delayHide(force)
                } else {
                    this.setVisible(false, force)
                }
            },
            this.hideTimeout
        )
    }

    protected _handleTransitionEnd() {
        this._transitionEndTimer = -1

        if (this.visible) {
            this.emit("shown")
        } else {
            this.el.classList.add(HIDDEN_CLASS)
            this.emit("hidden")
        }
    }

    private clearTransitionTimeout() {
        if (this._transitionEndTimer !== -1) {
            clearTimeout(this._transitionEndTimer)

            this._transitionEndTimer = -1
        }
    }

    protected handleTransitionEnd = (ev: TransitionEvent) => {
        if (ev.target === this.el) {
            this.clearTransitionTimeout()
            this._handleTransitionEnd()
        }
    }

    private getTransitionDuration() {
        let {transitionDelay, transitionDuration} = getComputedStyle(this.el)
        // If multiple durations only take the first
        transitionDelay = transitionDelay.split(",")[0]
        transitionDuration = transitionDuration.split(",")[0]
        const duration = Number.parseFloat(transitionDuration) || 0
        const delay = Number.parseFloat(transitionDelay) || 0

        return (duration + delay) * 1000
    }

    protected addListener = () => {
        this.el.addEventListener(
            "transitionend",
            this.handleTransitionEnd,
            // avoid triggered multiple times(multi transition property)
            { once: true }
        )

        const PAD = 10
        // in case transitioned not firing
        this._transitionEndTimer = window.setTimeout(
            () => {
                this._handleTransitionEnd()
                this.removeListener()
            },
            this.getTransitionDuration() + PAD
        )
    }

    protected removeListener = () => {
        this.el.removeEventListener(
            "transitionend",
            this.handleTransitionEnd
        )
    }

    protected setVisible(visible: boolean, force = false) {
        if (this.visible === visible) {
            if (visible && this.autoHide) {
                // clearTimeout and reset
                this.delayHide(force)
            }

            return
        }

        const show = (reflow: (el: HTMLElement) => void = noop) => {
            this.el.classList.remove(HIDDEN_CLASS)
            reflow(this.el)
            this.el.classList.add(SHOW_CLASS)
        }

        this.visible = visible

        this.removeListener()

        if (visible) {
            this.emit("show")

            if (force) {
                show()
                this._handleTransitionEnd()
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
            this._handleTransitionEnd()
        } else {
            this.addListener()
        }
    }

    public show() {
        this.setVisible(true)
    }

    public hide() {
        this.setVisible(false)
    }
}