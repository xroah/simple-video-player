import ToggleVisible from "../commons/toggle-visible"
import { createEl } from "../utils"
import Player from ".."

class MiniProgress extends ToggleVisible {
    private _progress: HTMLElement

    constructor(private _player: Player) {
        super(
            _player.root, 
            "rplayer-mini-progress-wrapper"
        )

        this._progress = createEl("div", "rplayer-mini-progress")

        _player.video.addListener("timeupdate", this._handleUpdate)
        _player.controlBar.on("show", this._hide)
        _player.controlBar.on("hidden", this._show)
        this.hide()
        this.el.appendChild(this._progress)
    }

    private _show = () => this.show()

    private _hide = () => this.hide()

    private _handleUpdate = () => {
        const progress = this._player.video.getProgress()
        this._progress.style.width = `${progress}%`
    }
}

export default function install(player: Player) {
    return new MiniProgress(player)
}