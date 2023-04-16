import ToggleVisible from "../commons/toggle-visible"
import Player from ".."
import Video from "../modules/video"
import { createEl, getVolumeClass } from "../utils"
import Timer from "../commons/timer"

const DELAY = 3000

class VolumeState extends ToggleVisible {
    private _iconEl: HTMLElement
    private _textEl: HTMLElement
    private _timer: Timer

    constructor(parent: HTMLElement, private _video: Video) {
        super(parent, "rplayer-volume-state")

        this._iconEl = createEl("span")
        this._textEl = createEl("span", "rplayer-volume-text")
        this._timer = new Timer(DELAY, () => this.hide())

        this.el.appendChild(this._iconEl)
        this.el.appendChild(this._textEl)

        this._updateState()
        this._video.addListener("volumechange", this._handleVolumeChange)
        this._video.on("update-volume", this._handleVolumeChange)
    }

    private _handleVolumeChange = () => {
        this.show()
        this._updateState()
        this._timer.delay(true)
    }

    private _updateState() {
        const volume = this._video.getVolume()
        const muted = this._video.isMuted()
        const className = getVolumeClass(volume, muted)
        const volumeStr = volume.toString()
        this._iconEl.className = ""
        this._textEl.innerHTML = volume === 0 || muted ? "静音" : volumeStr

        this._iconEl.classList.add("rplayer-volume-icon", className)
    }
}

export default function install(player: Player) {
    return new VolumeState(player.root, player.video)
}