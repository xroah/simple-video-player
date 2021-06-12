import {
    addListeners,
    removeAllListeners,
    removeListeners
} from "../commons/dom-event"
import { Player } from ".."
import Transition from "../modules/transition"

export default class Popup extends Transition {
    player: Player

    constructor(p: Player, ...classes: string[]) {
        super("rplayer-popup", ...classes)

        this.player = p
        this.hideTimeout = 300

        this.addListeners()
        p.once("destroy", () => this.destroy())
    }

    mount() {
        this.player.root.appendChild(this.el)
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
        this.player.control.bar.prevented = visible

        super.setVisible(visible, noTransition)
    }

    updatePositionByRelativeEl(el: HTMLElement) {
        const OFFSET_X = 10
        const OFFSET_Y = 50
        const rect = this.player.root.getBoundingClientRect()
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