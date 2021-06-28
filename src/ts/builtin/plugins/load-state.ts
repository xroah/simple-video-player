import { createEl } from "../../commons/utils"
import { Player } from "../.."
import classNames from "../../commons/class-names"
import { HIDDEN_CLASS } from "../../commons/constants"

class LoadState {
    private _el: HTMLElement
    private _spinnerEl: HTMLElement
    private _errEl: HTMLElement

    constructor(container: HTMLElement) {
        this._el = createEl(
            "div",
            classNames.plugins.STATE_WRAPPER,
            HIDDEN_CLASS
        )
        this._spinnerEl = createEl("div", classNames.plugins.LOADING_SPINNER)
        this._errEl = createEl("div", classNames.plugins.ERROR_MESSAGE)

        this._el.append(this._spinnerEl)
        this._el.append(this._errEl)
        container.append(this._el)
    }

    updateMessage(error?: MediaError | null) {
        if (!error) {
            return
        }

        /* const map = new Map([
            [MediaError.MEDIA_ERR_ABORTED, "abort"],
            [MediaError.MEDIA_ERR_DECODE, "decode"],
            [MediaError.MEDIA_ERR_NETWORK, "network"],
            [MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED, "notSupport"]
        ]) */

        this._errEl.innerHTML = error.message || "未知错误"
    }

    setVisible(
        visible: boolean,
        state: "error" | "loading" = "loading",
        error: MediaError | null = null
    ) {
        if (visible) {
            [
                this._spinnerEl,
                this._errEl
            ].forEach(el => el.classList.add(HIDDEN_CLASS))

            if (state === "loading") {
                this._spinnerEl.classList.remove(HIDDEN_CLASS)
            } else {
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
    install(p: Player) {
        const state = new LoadState(p.body)
        const show = () => state.setVisible(true)
        const hide = () => state.setVisible(false)
        const handleError = () =>
            state.setVisible(true, "error", p.video.error)
        const handleSeeked = () => {
            if (p.video.readySate >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                hide()
            }
        }

        p
            .on("loadstart", show)
            .on("waiting", show)
            .on("seeking", show)
            .on("seeked", handleSeeked)
            .on("canplay", hide)
            .on("error", handleError)
    }
}