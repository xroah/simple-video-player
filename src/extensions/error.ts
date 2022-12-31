import Player from ".."
import { ERROR_CLASS } from "../commons/constants"
import ToggleVisible from "../commons/toggle-visible"
import Video from "../modules/video"
import { createEl } from "../utils"

class VideoError extends ToggleVisible {
    private _msgEl: HTMLElement
    private _refreshBtn: HTMLElement
    private _paused = true
    private _time = 0

    constructor(private _player: Player) {
        super(_player.root, "rplayer-error-wrapper")

        this._msgEl = createEl("div", "rpalyer-error-text")
        this._refreshBtn = createEl("button", "rplayer-error-refresh")
        this._refreshBtn.innerHTML = "刷新"
        this.el.appendChild(this._msgEl)
        this.el.appendChild(this._refreshBtn)

        this._refreshBtn.addEventListener("click", this._handleRefresh)
        _player.video.addListener("error", this._handleError)
    }

    private getMessage() {
        const error = this._player.video.getError()
        let msg = ""

        switch (error?.code) {
            case MediaError.MEDIA_ERR_ABORTED:
                msg = "视频加载中断"
                break
            case MediaError.MEDIA_ERR_DECODE:
                msg = "视频解码失败"
                break
            case MediaError.MEDIA_ERR_NETWORK:
                msg = "视频加载出错，请检查网络"
                break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                msg = "不支持的视频格式"
                break
            default:
                msg = "未知错误"
        }

        return msg
    }

    private _handleLoadedMetadata = () => {
        if (this._time > 0) {
            this._player.video.setCurrentTime(this._time)
        }

        this._player.video.play()
    }

    private _handleRefresh = () => {
        if (!navigator.onLine) {
            return
        }

        const { video } = this._player

        video.load()
        video.addListener(
            "loadeddata",
            this._handleLoadedMetadata,
            { once: true }
        )
        this._hide()
    }

    private _hide() {
        this._player.root.classList.remove(ERROR_CLASS)
        this.hide()
    }

    private _show() {
        const errorMsg = this.getMessage()
        this._msgEl.innerHTML = errorMsg

        this._player.controlBar.hide()
        this._player.root.classList.add(ERROR_CLASS)
        this.show()
    }

    private _handleError = () => {
        const { video } = this._player
        this._paused = video.isPaused()
        this._time = video.getCurrentTime()

        this._show()
        video.removeListener(
            "loadedmetadata",
            this._handleLoadedMetadata
        )
    }
}

export default function installErrorExt(player: Player) {
    return new VideoError(player)
}