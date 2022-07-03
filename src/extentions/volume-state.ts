import Toggle from "../commons/toggle"
import Video from "../modules/video"
import { createEl, getVolumeClass } from "../utils"

const DELAY = 3000

export default class VolumeState extends Toggle {
    private _iconEl: HTMLElement
    private _textEl: HTMLElement
    private _timer = -1

    constructor(
        private _video: Video,
        parent: HTMLElement
    ) {
        super(parent, "rplayer-volume-state")

        this._iconEl = createEl("span")
        this._textEl = createEl("span", "rplayer-volume-text")

        this.el.appendChild(this._iconEl)
        this.el.appendChild(this._textEl)

        this._updateState()
        this._video.addListener("volumechange", this._handleVolumeChange)
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

        this._timer = window.setTimeout(
            () => this.hide(),
            DELAY
        )

        this._updateState()
    }

    private _updateState() {
        const volume = this._video.getVolume()
        const muted = this._video.isMuted()
        const className = getVolumeClass(volume, muted)
        let volumeStr = volume.toString()
        this._iconEl.className = ""
        
        if (volume === 0 || muted) {
            volumeStr = "静音"
        }

        this._textEl.innerHTML = volumeStr

        this._iconEl.classList.add(
            "rplayer-volume-icon",
            className
        )
    }
}