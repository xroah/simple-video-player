import Player from ".."
import { ERROR_CLASS } from "../commons/constants"
import ToggleVisible from "../commons/toggle-visible"
import { createEl } from "../utils"

interface Options {
    refreshText?: string
    abortedText?: string
    decodeErrText?: string
    networkErrText?: string
    notSupportedText?: string
    unknownErrText?: string
}

class VideoError extends ToggleVisible {
    private _msgEl: HTMLElement
    private _refreshBtn: HTMLElement
    private _time = 0

    constructor(
        private _player: Player,
        private _options: Options = {}
    ) {
        super(_player.root, "rplayer-error-wrapper")

        this._msgEl = createEl("div", "rpalyer-error-text")
        this._refreshBtn = createEl("button", "rplayer-error-refresh")
        this._refreshBtn.innerHTML = _options.refreshText ?? "刷新"
        this.el.appendChild(this._msgEl)
        this.el.appendChild(this._refreshBtn)

        this._refreshBtn.addEventListener("click", this._handleRefresh)
        _player.video.addListener("error", this._handleError)
        this.el.addEventListener("contextmenu", this._handleContextmenu)
    }

    private _getMessage() {
        const error = this._player.video.getError()
        let msg = ""

        switch (error?.code) {
            case MediaError.MEDIA_ERR_ABORTED:
                msg = this._options.abortedText ?? "视频加载中断"
                break
            case MediaError.MEDIA_ERR_DECODE:
                msg = this._options.decodeErrText ?? "视频解码失败"
                break
            case MediaError.MEDIA_ERR_NETWORK:
                msg = this._options.networkErrText ?? "视频加载出错，请检查网络"
                break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                msg = this._options.notSupportedText ?? "不支持的视频格式或网络错误"
                break
            default:
                msg = this._options.unknownErrText ?? "未知错误"
        }

        return msg
    }

    private _handleContextmenu(ev: Event) {
        ev.stopPropagation()
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
        const errorMsg = this._getMessage()
        this._msgEl.innerHTML = errorMsg

        this._player.controlBar.hide()
        this._player.root.classList.add(ERROR_CLASS)
        this.show()
    }

    private _handleError = () => {
        const { video } = this._player
        this._time = video.getCurrentTime()

        this._show()
        video.removeListener(
            "loadedmetadata",
            this._handleLoadedMetadata
        )
    }
}

export default function installErrorExt(
    player: Player,
    options: Options
) {
    return new VideoError(player, options)
}