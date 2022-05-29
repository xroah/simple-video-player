import { HIDDEN_CLASS } from "../commons/constants"
import { createEl } from "../commons/utils"
import Video from "./video"


const HTML = `
    <div class="rplayer-spinner">
    </div>
    <div class="rplayer-error"></div>
`

export default class VideoState {
    private _el: HTMLDivElement
    private _loadingEl: HTMLDivElement
    private _errorEl: HTMLDivElement

    constructor(
        parent: HTMLDivElement,
        private _video: Video
    ) {
        this._el = <HTMLDivElement>createEl(
            "div",
            "rplayer-video-state",
            HIDDEN_CLASS
        )
        this._loadingEl = <HTMLDivElement>createEl(
            "div",
            "rplayer-spinner",
            HIDDEN_CLASS
        )
        this._errorEl = <HTMLDivElement>createEl(
            "div",
            "rplayer-error",
            HIDDEN_CLASS
        )

        this._el.appendChild(this._loadingEl)
        this._el.appendChild(this._errorEl)
        parent.appendChild(this._el)

        _video.addListener("loadstart", this._handleWaiting)
        _video.addListener("waiting", this._handleWaiting)
        _video.addListener("error", this._handleError)
        _video.addListener("canplay", this._handleCanPlay)
    }

    private _handleError = () => {
        this.showError()
    }

    private _handleWaiting = () => {
        this.showLoading()
    }

    private _handleCanPlay = () => {
        this.hide()
    }

    private _show() {
        this._el.classList.remove(HIDDEN_CLASS)
    }

    hide() {
        this._el.classList.add(HIDDEN_CLASS)
    }

    showLoading() {
        this._show()
        this._loadingEl.classList.remove(HIDDEN_CLASS)
        this._errorEl.classList.add(HIDDEN_CLASS)
    }

    showError() {
        const error = this._video.getError()!
        const errorMap = new Map([
            [MediaError.MEDIA_ERR_ABORTED, "加载错误"],
            [MediaError.MEDIA_ERR_DECODE, "解码失败"],
            [MediaError.MEDIA_ERR_NETWORK, "网络错误"],
            [MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED, "格式错误"]
        ])
        const msg = errorMap.get(error.code) || "播放错误"
        this._errorEl.innerHTML = msg

        this._show()
        this._errorEl.classList.remove(HIDDEN_CLASS)
        this._loadingEl.classList.add(HIDDEN_CLASS)
    }
}