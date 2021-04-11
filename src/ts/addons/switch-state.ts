import RPlayer from ".."
import {addListener, removeListener} from "../commons/dom-event"
import {createEl, reflow} from "../commons/utils"
import {HIDDEN_CLASS, TRANSITION_CLASS} from "../constants"

class SwitchState {
    private _el: HTMLElement
    private _rp: RPlayer

    constructor(rp: RPlayer) {
        this._el = createEl("span", "rplayer-switch-state-icon", HIDDEN_CLASS)
        this._rp = rp

        rp.root.appendChild(this._el)
        this.initEvents()
    }

    private initEvents() {
        this._rp
            .on("play", this.switchState)
            .on("pause", this.switchState)
    }

    setVisible(visible: boolean) {
        this._el.classList[visible ? "remove" : "add"](HIDDEN_CLASS)
    }

    private removeTransition() {
        const {_el} = this

        if (_el.classList.contains(TRANSITION_CLASS)) {
            removeListener(_el, "transitionend", this.hide)
            _el.classList.remove(TRANSITION_CLASS)
        }
    }

    private handleState(visible = false) {
        const PAUSED_CLASS = "rplayer-paused"
        const {_el} = this
        const fn: "remove" | "add" = this._rp.video.isPaused() ? "add" : "remove"

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

export default (rp: RPlayer) => {
    let instance: SwitchState | null = new SwitchState(rp)

    rp.once(
        "destroy",
        () => {
            if (instance) {
                instance.destroy()

                instance = null
            }
        }
    )
}