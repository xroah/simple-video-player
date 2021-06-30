import { Player } from "../.."
import classNames from "../../commons/class-names"
import { HIDDEN_CLASS } from "../../commons/constants"
import Transition from "../../modules/transition"

class PlayState extends Transition {
    private _player: Player

    constructor(p: Player) {
        super(
            classNames.plugins.PLAY_STATE_ICON,
            HIDDEN_CLASS
        )
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
        const { el, _player } = this
        const fn = _player.video.paused ? "add" : "remove"

        el.classList[fn](classNames.commons.PAUSED)
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

export default function playState(p: Player) {
    let instance: PlayState = new PlayState(p)

    p.once("destroy", () => instance.destroy())
}