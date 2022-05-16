import { HIDDEN_CLASS } from "../commons/constants"
import Transition from "../commons/transition"
import Video from "./video"
import { pause, play } from "./svg"

export default class PlayState extends Transition {
    private _icon: SVGSVGElement | null = null

    constructor(private _video: Video, parent: HTMLElement) {
        super(
            "rplayer-play-state",
            HIDDEN_CLASS
        )

        parent.append(this.el)
        this.initEvents()
    }

    private initEvents() {
        this._video.addListener("play", this.switchState)
        this._video.addListener("pause", this.switchState)
    }

    handleTransitionEnd = () => {
        this._handleTransitionEnd()
        // hide after showing transition end
        this.hide()
    }

    hide() {
        // hide with no transition
        this.setVisible(false, true)
    }

    switchState = () => {
        //may click continuously, hide and show
        this.hide()
        this.setVisible(true)

        if (this._icon) {
            this.el.removeChild(this._icon)
        }

        if (this._video.isPaused()) {
            this._icon = pause()
        } else {
            this._icon = play()
        }

        this.el.appendChild(this._icon)
    }
}