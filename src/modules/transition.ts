import EventEmitter from "../commons/event-emitter"
import { HIDDEN_CLASS, SHOW_CLASS } from "../commons/constants"
import {
    createEl,
    noop,
    reflow
} from "../utils"
import Timer from "../commons/timer"

interface Options {
    el?: HTMLElement
    autoHide?: boolean
    hideTimeout?: number
    removeOnHidden?: boolean
}

export default class Transition extends EventEmitter {
    public visible = false
    public hideTimeout = 0

    protected el: HTMLElement
    protected autoHideTimer?: Timer
    protected mouseEntered = false

    private _transitionEndTimer: Timer
    private _endTimestamp = 0

    constructor(cls = "", protected options: Options = {}) {
        super()

        this.el = options.el || createEl("div", HIDDEN_CLASS, cls)
        this.hideTimeout = options.hideTimeout ?? 0
        this._transitionEndTimer = new Timer(
            0,
            () => {
                this.handleTransitionEnd()
                this.removeListener()
            }
        )

        if (options.autoHide) {
            this.autoHideTimer = new Timer(
                this.hideTimeout,
                () => {
                    if (this.shouldDelay()) {
                        this.delayHide()
                    } else {
                        this.hide()
                    }
                }
            )
        }

        this.el.addEventListener("mouseenter", this.handleMouseEnter)
        this.el.addEventListener("mouseleave", this.handleMouseLeave)
        this.el.addEventListener("touchend", this._handleTouchEnd)
    }

    protected shouldDelay() {
        return false
    }

    protected delayHide() {
        if (!this.visible || this.mouseEntered) {
            return
        }

        this.autoHideTimer?.delay(true)
    }

    protected _handleTransitionEnd(e?: TransitionEvent) {
        if (e && e.target !== this.el) {
            return
        }

        if (this.visible) {
            this.emit("shown")
        } else {
            if (this.options.removeOnHidden) {
                this.el.remove()
            } else {
                this.el.classList.add(HIDDEN_CLASS)
            }

            this.emit("hidden")
        }

        this._transitionEndTimer.clear()
    }

    protected handleTransitionEnd = (e?: TransitionEvent) => {
        this._handleTransitionEnd(e)
    }

    private _getTransitionDuration() {
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
        const duration = this._getTransitionDuration()
        // in case transitionend not firing
        this._transitionEndTimer.timeout = duration + PAD
        this._transitionEndTimer.delay(true)
    }

    protected removeListener() {
        this.el.removeEventListener(
            "transitionend",
            this.handleTransitionEnd
        )

        this._transitionEndTimer.clear()
    }

    private _handleTouchEnd = (ev: TouchEvent) => {
        this._endTimestamp = ev.timeStamp
    }

    protected handleMouseEnter = (ev: MouseEvent) => {
        // mouse enter event fired after touch end
        // and the timestamp may be equal
        const interval = Math.abs(ev.timeStamp - this._endTimestamp)

        if (interval > 10) {
            this.mouseEntered = true
        }

        if (this.options.autoHide) {
            this.autoHideTimer!.clear()
        }
    }

    protected handleMouseLeave = () => {
        this.mouseEntered = false

        if (this.options.autoHide) {
            this.delayHide()
        }
    }

    protected setVisible(visible: boolean, force = false) {
        if (this.visible === visible) {
            if (visible && this.options.autoHide) {
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

            if (this.options.autoHide) {
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