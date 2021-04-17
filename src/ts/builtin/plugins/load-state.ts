import {HIDDEN_CLASS} from "../../constants"
import {createEl} from "../../commons/utils"
import settings from "../../settings"
import RPlayer from "../.."

export interface ErrorMessage {
    abort?: string
    network?: string
    decode?: string
    notSupport?: string
}

class LoadState {
    private _el: HTMLElement
    private _spinnerEl: HTMLElement
    private _errEl: HTMLElement
    private _errorMessage: ErrorMessage = {}

    constructor(container: HTMLElement, eMsg?: ErrorMessage) {
        this._el = createEl("div", "rplayer-state-wrapper", HIDDEN_CLASS)
        this._spinnerEl = createEl("div", "rplayer-loading-spinner")
        this._errEl = createEl("div", "rplayer-error-message")
        this._errorMessage = {
            ...eMsg
        }

        this._el.appendChild(this._spinnerEl)
        this._el.appendChild(this._errEl)
        container.appendChild(this._el)
    }

    updateMessage(error?: MediaError | null) {
        if (!error) {
            return
        }

        const eMsg = this._errorMessage as any
        const map = new Map([
            [MediaError.MEDIA_ERR_ABORTED, "abort"],
            [MediaError.MEDIA_ERR_DECODE, "decode"],
            [MediaError.MEDIA_ERR_NETWORK, "network"],
            [MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED, "notSupport"]
        ])
        let msg = eMsg[map.get(error.code) as any]

        this._errEl.innerHTML = msg || error.message || settings.defaultMessage.unknownError
    }

    setVisible(
        visible: boolean,
        state: "error" | "loading" = "loading",
        error: MediaError | null = null
    ) {
        if (visible) {
            if (state === "loading") {
                this._spinnerEl.classList.remove(HIDDEN_CLASS)
                this._errEl.classList.add(HIDDEN_CLASS)
            } else {
                this._spinnerEl.classList.add(HIDDEN_CLASS)
                this._errEl.classList.remove(HIDDEN_CLASS)
                this.updateMessage(error)
            }

            this._el.classList.remove(HIDDEN_CLASS)
        } else {
            this._el.classList.add(HIDDEN_CLASS)
        }
    }
}

export default {
    install(rp: RPlayer) {
        const state = new LoadState(rp.body)
        const show = () => state.setVisible(true)
        const hide = () => state.setVisible(false)
        const handleError = () => state.setVisible(true, "error", rp.video.getError())

        rp.on("loadstart", show)
        rp.on("waiting", show)
        rp.on("canplay", hide)
        rp.on("error", handleError)
    }
}