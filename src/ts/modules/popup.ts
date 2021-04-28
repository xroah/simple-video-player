import {
    addListener,
    removeAllListeners,
    removeListener
} from "../commons/dom-event"
import RPlayer from "../player"
import Transition from "../modules/transition"
import { HIDDEN_CLASS } from "../commons/constants"
import { createEl } from "../commons/utils"

export default class Popup extends Transition {
    el: HTMLElement
    rp: RPlayer

    constructor(rp: RPlayer, ...classes: string[]) {
        super()

        this.rp = rp
        this.el = createEl("div", ...classes)
        this.hideTimeout = 300
    }

    handleTransitionEnd = () => {
        this.el.classList.add(HIDDEN_CLASS)
        this.removeListeners()
    }

    addListeners() {
        addListener(this.el, "mouseenter", this.handleMouseEnterLeave)
        addListener(this.el, "mouseleave", this.handleMouseEnterLeave)
    }

    removeListeners() {
        removeListener(this.el, "mouseenter", this.handleMouseEnterLeave)
        removeListener(this.el, "mouseleave", this.handleMouseEnterLeave)
        removeListener(this.el, "transitionend", this.handleTransitionEnd)
    }

    handleIconClick = () => {
        this.setVisible(!this.visible)
    }

    handleControlBarHidden = () => {
        this.setVisible(false, true)
    }

    handleMouseEnterLeave = (evt: MouseEvent) => {
        const isEnter = evt.type === "mouseenter"

        if (isEnter) {
            this.clearTimeout()
        } else {
            if (evt.target === this.el && !this.needDelay()) {
                this.setVisible(false)
            } else {
                //prevent from hiding immediately
                this.delayHide()
            }
        }
    }

    setVisible(visible: boolean, force = false) {
        if (this.visible === visible) {
            return
        }

        super.setVisible(visible)
        this.removeListeners()

        if (visible) {
            return this.addListeners()
        }

        if (force) {
            this.handleTransitionEnd()
        } else {
            addListener(this.el, "transitionend", this.handleTransitionEnd)
        }
    }

    destroy() {
        this.off()
        removeAllListeners(this.el)
    }
}