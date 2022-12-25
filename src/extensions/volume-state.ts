import ToggleVisible from "../commons/toggle-visible"
import Player from ".."
import Video from "../modules/video"
import { createEl, getVolumeClass } from "../utils"

const DELAY = 3000

class VolumeState extends ToggleVisible {
    private _iconEl: HTMLElement
    private _textEl: HTMLElement
    private _timer = -1

    constructor(parent: HTMLElement, private _video: Video) {
        super(parent, "rplayer-volume-state")

        this._iconEl = createEl("span")
        this._textEl = createEl("span", "rplayer-volume-text")

        this.el.appendChild(this._iconEl)
        this.el.appendChild(this._textEl)

        this._updateState()
        this._video.addListener("volumechange", this._handleVolumeChange)
        this._video.on("update-volume", this._handleVolumeChange)
    }

    private _clearHideTimeout() {
        if (this._timer !== -1) {
            window.clearTimeout(this._timer)

            this._timer = -1
        }
    }

    private _handleVolumeChange = () => {
        this._clearHideTimeout()
        this.show()
        this._updateState()

        this._timer = window.setTimeout(() => this.hide(), DELAY)
    }

    private _updateState() {
        const volume = this._video.getVolume()
        const muted = this._video.isMuted()
        const className = getVolumeClass(volume, muted)
        let volumeStr = volume.toString()
        this._iconEl.className = ""
        this._textEl.innerHTML = volume === 0 || muted ? "静音" : volumeStr

        this._iconEl.classList.add("rplayer-volume-icon", className)
    }
}

export default function install(player: Player) {
    return new VolumeState(player.root, player.video)
}