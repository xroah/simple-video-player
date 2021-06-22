import { Player } from "../.."
import { HIDDEN_CLASS } from "../../commons/constants"
import Transition from "../../modules/transition"

class PlayState extends Transition {
    private _player: Player

    constructor(p: Player) {
        super("rplayer-play-state-icon", HIDDEN_CLASS)
        this._player = p

        p.body.append(this.el)
        this.initEvents()
    }

    private initEvents() {
        this._player
            .on("play", this.switchState)
            .on("pause", this.switchState)
    }

    handleTransitionEnd = () => {
        super._handleTransitionEnd()

        // hide after showing transition end
        this.hide()
    }

    private handleState() {
        const PAUSED_CLASS = "rplayer-paused"
        const { el, _player } = this
        const fn = _player.video.paused ? "add" : "remove"

        el.classList[fn](PAUSED_CLASS)
    }

    private hide() {
        // hide with no transition
        this.setVisible(false, true)
    }

    private switchState = () => {
        //may click continuously, hide and show
        this.hide()
        this.setVisible(true)
        this.handleState()
    }

    destroy() {
        this.removeTransitionendListener()
    }
}

export default (p: Player) => {
    let instance: PlayState = new PlayState(p)

    p.once("destroy", () => instance.destroy())
}