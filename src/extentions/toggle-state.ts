import Player from "../modules/player"
import Transition from "../modules/transition"
import Video from "../modules/video"

class ToggleState extends Transition {
    constructor(parent: HTMLElement, private _video: Video) {
        super("rplayer-toggle-state")

        parent.append(this.el)
        this.initEvents()
    }

    private initEvents() {
        this._video.addListener("play", this.switchState)
        this._video.addListener("pause", this.switchState)
    }

    handleTransitionEnd = () => {
        this._handleTransitionEnd()
        
        // // hide after showing transition end
        if (this.visible) {
            this.hide(true) 
        }
    }

    switchState = () => {
        if (this._video.isPaused()) {
            this.el.classList.add("rplayer-paused")
        } else {
            this.el.classList.remove("rplayer-paused")
        }

        //may click continuously, hide and show
        // hide with no transition
        this.hide(true)
        this.setVisible(true)
    }
}

export default function install(player: Player) {
    return new ToggleState(player.root, player.video)
}