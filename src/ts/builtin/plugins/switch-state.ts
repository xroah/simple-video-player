import { Player } from "../.."
import { addListener, removeListener } from "../../commons/dom-event"
import { createEl, reflow } from "../../commons/utils"
import { HIDDEN_CLASS, TRANSITION_CLASS } from "../../commons/constants"

class SwitchState {
    private _el: HTMLElement
    private _player: Player

    constructor(p: Player) {
        this._el = createEl("span", "rplayer-switch-state-icon", HIDDEN_CLASS)
        this._player = p

        p.body.appendChild(this._el)
        this.initEvents()
    }

    private initEvents() {
        this._player
            .on("play", this.switchState)
            .on("pause", this.switchState)
    }

    setVisible(visible: boolean) {
        this._el.classList[visible ? "remove" : "add"](HIDDEN_CLASS)
    }

    private removeTransition() {
        const { _el } = this

        if (_el.classList.contains(TRANSITION_CLASS)) {
            removeListener(_el, "transitionend", this.hide)
            _el.classList.remove(TRANSITION_CLASS)
        }
    }

    private handleState(visible = false) {
        const PAUSED_CLASS = "rplayer-paused"
        const { _el, _player } = this
        const fn: "remove" | "add" = _player.video.paused ? "add" : "remove"

        _el.classList[fn](PAUSED_CLASS)

        if (visible) {
            _el.classList.add(TRANSITION_CLASS)
            addListener(_el, "transitionend", this.hide)
        }
    }

    private hide = () => {
        this.removeTransition()
        this.handleState()
        this.setVisible(false)
    }

    switchState = () => {
        //may click continuously
        this.hide()
        this.setVisible(true)
        reflow(this._el)
        this.handleState(true)
    }

    destroy() {
        this.removeTransition()
    }
}

export default (p: Player) => {
    let instance: SwitchState | null = new SwitchState(p)

    p.once(
        "destroy",
        () => {
            if (instance) {
                instance.destroy()

                instance = null
            }
        }
    )
}