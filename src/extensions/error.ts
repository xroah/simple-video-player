import Player from ".."
import { ERROR_CLASS } from "../commons/constants"
import ToggleVisible from "../commons/toggle-visible"
import Video from "../modules/video"
import { createEl } from "../utils"

class VideoError extends ToggleVisible {
    private _msgEl: HTMLElement
    private _refreshBtn: HTMLElement

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

    private _handleRefresh = () => {
        const {video} = this._player
        const currentTime = video.getCurrentTime()
        
        video.load()
        video.setCurrentTime(currentTime)
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
        this._show()
    }
}

export default function installErrorExt(player: Player) {
    return new VideoError(player)
}