import RPlayer from ".."
import {addListener, removeListener} from "../dom-event"
import {createEl, reflow} from "../utils"
import {HIDDEN_CLASS} from "../constants"

const TRANSITION_CLASS = "rplayer-switch-state-transition"

class PlayState {
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
        if (visible) {
            this._el.classList.remove(HIDDEN_CLASS)
        } else {
            this._el.classList.add(HIDDEN_CLASS)
        }
    }

    private removeTransition() {
        if (this._el.classList.contains(TRANSITION_CLASS)) {
            removeListener(this._el, "transitionend", this.hide)
            this._el.classList.remove(TRANSITION_CLASS)
        }
    }

    private handleState(add = false) {
        const PAUSED_CLASS = "rplayer-paused"
        const classList = this._el.classList

        if (this._rp.video.isPaused()) {
            classList.add(PAUSED_CLASS)
        } else {
            classList.remove(PAUSED_CLASS)
        }

        if (add) {
            classList.add(TRANSITION_CLASS)
            addListener(this._el, "transitionend", this.hide)
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
    let ps: PlayState | null = new PlayState(rp)

    rp.once("destroy", () => {
        if (ps) {
            ps.destroy()

            ps = null
        }
    })
}