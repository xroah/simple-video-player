import ToggleVisible from "../commons/toggle-visible"
import Player from "../modules/player"
import Transition from "../modules/transition"

const PAUSED_CLASS = "rplayer-paused"

class PlayState extends Transition {
    constructor(parent: HTMLElement) {
        super("rplayer-toggle-state")

        parent.append(this.el)
    }

    handleTransitionEnd = () => {
        this._handleTransitionEnd()

        // // hide after showing transition end
        if (this.visible) {
            this.hide(true)
        }
    }

    private _reset() {
        //may click continuously, hide and show
        // hide with no transition
        this.hide(true)
        this.el.classList.remove(PAUSED_CLASS)
    }

    public showPause() {
        this._reset()
        this.el.classList.add(PAUSED_CLASS)
        this.show()
    }

    public showPlay() {
        this._reset()
        this.show()
    }
}

class State {
    private _loading: ToggleVisible
    private _playState: PlayState

    constructor(private _player: Player) {
        const { video, root } = _player
        this._loading = new ToggleVisible(root, "rplayer-loading")
        this._playState = new PlayState(root)

        video.addListener("waiting", this._showLoading)
        video.addListener("canplay", this._hideLoading)
        video.addListener("error", this._hideLoading)
        video.addListener("play", this._toggle)
        video.addListener("pause", this._toggle)
    }

    private _showLoading = () => {
        this._loading.show()
    }

    private _hideLoading = () => {
        this._loading.hide()
    }

    private _toggle = () => {
        if (this._player.video.isPaused()) {
            this._playState.showPause()
        } else {
            this._playState.showPlay()
        }
    }
}

export default function install(player: Player) {
    return new State(player)
}