import Video from "../modules/video"
import ToggleVisible from "../commons/toggle-visible"
import Player from "../modules/player"

class Loading extends ToggleVisible {
    constructor(
        parent: HTMLElement,
        private _video: Video
    ) {
       super(parent, "rplayer-loading")

        this._video.addListener("waiting", this._show)
        this._video.addListener("canplay", this._hide)
        this._video.addListener("error", this._hide)
    }

    private _show = () => this.show()

    private _hide = () => this.hide()
}

export default function install(player: Player) {
    return new Loading(player.root, player.video)
}