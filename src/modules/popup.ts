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

    private _handleClickOutSide = (ev: MouseEvent) => {
        const target = ev.target as HTMLElement

        if (
            this.visible &&
            target !== this.related &&
            !this.related.contains(target) &&
            target !== this.el &&
            !this.el.contains(target)
        ) {
            this.hide()
        }
    }

    public hide() {
        super.hide()

        document.removeEventListener(
            "click",
            this._handleClickOutSide
        )
    }

    public override show() {
        super.show()

        const { el } = this
        const relatedRect = this.related.getBoundingClientRect()
        const rect = el.getBoundingClientRect()
        const OFFSET = 5
        const leftOffset = (rect.width - relatedRect.width) / 2
        const left = relatedRect.left - leftOffset
        const top = relatedRect.top - rect.height - OFFSET
        const maxLeft = window.innerWidth - rect.width 

        el.style.left = `${left > maxLeft ? maxLeft : left}px`
        el.style.top = `${top < 0 ? 0 : top}px`

        document.addEventListener(
            "click",
            this._handleClickOutSide
        )
    }
}