import Video from "../modules/video"
import Toggle from "../commons/toggle"
import Player from "../modules/player"

class Loading extends Toggle {
    constructor(
        private _video: Video,
        parent: HTMLElement
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
    return new Loading(player.video, player.root)
}