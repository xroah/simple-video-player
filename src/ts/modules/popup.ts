import {
    addListeners,
    removeAllListeners,
    removeListeners
} from "../commons/dom-event"
import RPlayer from "../player"
import Transition from "../modules/transition"

export default class Popup extends Transition {
    rp: RPlayer

    constructor(rp: RPlayer, ...classes: string[]) {
        super(...classes)

        this.rp = rp
        this.hideTimeout = 300

        this.addListeners()
    }

    mount() {
        this.rp.root.appendChild(this.el)
    }

    addListeners() {
        addListeners(
            this.el,
            {
                mouseenter: this.handleMouseEnterLeave,
                mouseleave: this.handleMouseEnterLeave
            }
        )
    }

    removeListeners() {
        removeListeners(
            this.el,
            {
                mouseenter: this.handleMouseEnterLeave,
                mouseleave: this.handleMouseEnterLeave
            }
        )

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

    setVisible(visible: boolean, noTransition = false) {
        if (this.visible === visible) {
            return
        }

        // if visible the control bar should not hide
        this.rp.control.bar.prevented = visible

        super.setVisible(visible, noTransition)
    }

    updatePositionByRelativeEl(el: HTMLElement) {
        const OFFSET_X = 10
        const OFFSET_Y = 50
        const rect = this.rp.root.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        let right = rect.right - elRect.right
        let bottom = rect.bottom - elRect.bottom + OFFSET_Y
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