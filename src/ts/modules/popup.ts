import {
    addListener,
    removeAllListeners,
    removeListener
} from "../commons/dom-event"
import RPlayer from "../player"
import Transition from "../modules/transition"
import { HIDDEN_CLASS } from "../commons/constants"

export default class Popup extends Transition {
    rp: RPlayer

    constructor(rp: RPlayer, ...classes: string[]) {
        super(...classes)

        this.rp = rp
        this.hideTimeout = 300
    }

    mountTo() {
        this.rp.root.appendChild(this.el)
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

    updatePositionByRelativeEl(el: HTMLElement) {
        const OFFSET_X = 10
        const OFFSET_Y = 50
        const rect = this.rp.root.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        let right = rect.right - elRect.right
        let bottom = rect.bottom - elRect.bottom+ OFFSET_Y
        //make pop center relative to the el
        right -= (this.el.offsetWidth - elRect.width) / 2

        if (right < OFFSET_X) {
            right = OFFSET_X
        }

        this.el.style.right = `${right}px`
        this.el.style.bottom = `${bottom}px`
    }

    destroy() {
        this.off()
        removeAllListeners(this.el)
    }
}