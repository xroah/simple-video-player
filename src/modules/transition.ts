import EventEmitter from "../commons/event-emitter"
import { HIDDEN_CLASS, SHOW_CLASS } from "../commons/constants"
import {
    createEl,
    noop,
    reflow
} from "../utils"

export default class Transition extends EventEmitter {
    protected visible = false
    protected el: HTMLElement
    // for auto hide
    protected hideTimeout = 0
    protected autoHide = false
    private _autoHideTimer = -1

    private _transitionEndTimer = -1

    constructor(cls: string = "", el?: HTMLElement) {
        super()

        this.el = el = el || createEl("div", HIDDEN_CLASS, cls)

        el.addEventListener("mouseenter", this._handleMouseEnter)
        el.addEventListener("mouseleave", this._handleMouseLeave)
    }

    protected shouldDelay() {
        return false
    }

    protected clearHideTimeout() {
        if (this._autoHideTimer !== -1) {
            window.clearTimeout(this._autoHideTimer)

            this._autoHideTimer = -1
        }
    }

    protected delayHide() {
        if (!this.visible) {
            return
        }

        this.clearHideTimeout()

        this._autoHideTimer = window.setTimeout(
            () => {
                this._autoHideTimer = -1

                if (this.shouldDelay()) {
                    this.delayHide()
                } else {
                    this.setVisible(false)
                }
            },
            this.hideTimeout
        )
    }

    protected _handleTransitionEnd(e?: TransitionEvent) {
        if (e && e.target !== this.el) {
            return
        }

        if (this.visible) {
            this.emit("shown")
        } else {
            this.el.classList.add(HIDDEN_CLASS)
            this.emit("hidden")
        }

        this.clearTransitionTimeout()
    }

    protected handleTransitionEnd = (e?: TransitionEvent) => {
        this._handleTransitionEnd(e)
    }

    private clearTransitionTimeout() {
        if (this._transitionEndTimer !== -1) {
            window.clearTimeout(this._transitionEndTimer)

            this._transitionEndTimer = -1
        }
    }

    private getTransitionDuration() {
        let { transitionDelay, transitionDuration } = getComputedStyle(this.el)
        // If multiple durations only take the first
        transitionDelay = transitionDelay.split(",")[0]
        transitionDuration = transitionDuration.split(",")[0]
        const duration = Number.parseFloat(transitionDuration) || 0
        const delay = Number.parseFloat(transitionDelay) || 0

        return (duration + delay) * 1000
    }

    protected addListener() {
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
                this._transitionEndTimer = -1

                this.handleTransitionEnd()
                this.removeListener()
            },
            this.getTransitionDuration() + PAD
        )
    }

    protected removeListener() {
        this.el.removeEventListener(
            "transitionend",
            this.handleTransitionEnd
        )
        this.clearTransitionTimeout()
    }

    private _handleMouseEnter = () => {
        if (this.autoHide) {
            this.clearHideTimeout()
        }
    }

    private _handleMouseLeave = () => {
        if (this.autoHide) {
            this.delayHide()
        }
    }

    protected setVisible(visible: boolean, force = false) {
        if (this.visible === visible) {
            if (visible && this.autoHide) {
                // clearHideTimeout and reset
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

        this.removeListener()

        if (visible) {
            if (force) {
                show()
                this.emit("show")
                this.handleTransitionEnd()
            } else {
                show(reflow)
                this.addListener()
            }

            if (this.autoHide) {
                this.delayHide()
            }

            return
        }

        this.el.classList.remove(SHOW_CLASS)
        this.emit("hide")

        if (force) {
            this.handleTransitionEnd()
        } else {
            this.addListener()
        }
    }

    public show(force = false) {
        this.setVisible(true, force)
    }

    public hide(force = false) {
        this.setVisible(false, force)
    }

    public toggle(force = false) {
        if (this.visible) {
            this.hide(force)
        } else {
            this.show(force)
        }
    }
}