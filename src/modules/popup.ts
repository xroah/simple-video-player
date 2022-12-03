import ToggleVisible from "../commons/toggle-visible"
import Player from "./player"

export default class Popup extends ToggleVisible {
    constructor(
        protected related: HTMLElement,
        protected player: Player,
        className?: string
    ) {
        super(
            player.root,
            "rplayer-popup",
            className || ""
        )

        const { el } = this

        el.addEventListener("mouseenter", this._handleMouseEnter)
        el.addEventListener("mouseleave", this._handleMouseLeave)
    }

    private _handleMouseEnter = () => {
        this.player.controlBar.preventHide(true)
    }

    private _handleMouseLeave = () => {
        this.player.controlBar.preventHide(false)
    }

    public override show() {
        super.show()

        const { el } = this
        const relatedRect = this.related.getBoundingClientRect()
        const rect = el.getBoundingClientRect()
        const OFFSET = 30
        const left = relatedRect.left - rect.width / 2
        const top = relatedRect.top - rect.height - OFFSET

        el.style.left = `${left}px`
        el.style.top = `${top}px`
    }
}