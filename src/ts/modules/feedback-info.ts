import { HIDDEN_CLASS } from "../commons/constants"
import { createEl, formatTime } from "../commons/utils"
import Transition from "./transition"

export default class FeedbackInfo extends Transition {
    private _text: HTMLElement
    private _volumeFeedbackEl: HTMLElement
    private _seekFeedbackEl: HTMLElement

    constructor(container: HTMLElement) {
        super("rplayer-volume-info-wrapper", HIDDEN_CLASS)

        this._text = createEl("span")
        this.autoHide = true
        this.hideTimeout = 1000
        this._volumeFeedbackEl = createEl("div", HIDDEN_CLASS)
        this._seekFeedbackEl = createEl("div", HIDDEN_CLASS)

        this.mountTo(container)
    }

    mountTo(container: HTMLElement) {
        const icon = createEl("span", "rplayer-volume-info-icon")

        this._volumeFeedbackEl.appendChild(icon)
        this._volumeFeedbackEl.appendChild(this._text)
        this.el.appendChild(this._volumeFeedbackEl)
        this.el.appendChild(this._seekFeedbackEl)
        container.appendChild(this.el)
    }

    updateVolumeFeedback(val: number | string) {
        this._text.innerText = String(val) + "%"
    }

    updateSeekFeedback(curTime: number, duration: number) {
        if (!duration) {
            return
        }

        this._seekFeedbackEl.innerText = `${formatTime(curTime)} / ${formatTime(duration)}`
    }

    showInfo(type: "volume" | "seek") {
        if (type === "volume") {
            this._seekFeedbackEl.classList.add(HIDDEN_CLASS)
            this._volumeFeedbackEl.classList.remove(HIDDEN_CLASS)
        } else {
            this._seekFeedbackEl.classList.remove(HIDDEN_CLASS)
            this._volumeFeedbackEl.classList.add(HIDDEN_CLASS)
        }
    }
}