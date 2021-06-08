import { HIDDEN_CLASS } from "../commons/constants"
import { createEl, formatTime } from "../commons/utils"
import Transition from "./transition"

type InfoType = "volume" | "seek" | "pause"

export default class FeedbackInfo extends Transition {
    private _text: HTMLElement
    private _volumeFeedbackEl: HTMLElement
    private _seekFeedbackEl: HTMLElement
    private _pauseFeedbackEl: HTMLElement

    currentInfo: InfoType | undefined

    constructor(container: HTMLElement) {
        super("rplayer-feedback-wrapper", HIDDEN_CLASS)

        this._text = createEl("span")
        this.hideTimeout = 1000
        this._volumeFeedbackEl = createEl("div", HIDDEN_CLASS)
        this._seekFeedbackEl = createEl("div", HIDDEN_CLASS)
        this._pauseFeedbackEl = createEl("div", "feedback-pause-icon", HIDDEN_CLASS)

        this.mountTo(container)
    }

    mountTo(container: HTMLElement) {
        const icon = createEl("span", "rplayer-volume-info-icon")

        this._volumeFeedbackEl.appendChild(icon)
        this._volumeFeedbackEl.appendChild(this._text)
        this.el.appendChild(this._volumeFeedbackEl)
        this.el.appendChild(this._seekFeedbackEl)
        this.el.appendChild(this._pauseFeedbackEl)
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

    showInfo(type: InfoType) {
        const els = [
            this._pauseFeedbackEl,
            this._seekFeedbackEl,
            this._volumeFeedbackEl
        ]
        this.autoHide = type !== "pause"
        this.currentInfo = type

        this.setVisible(true)

        els.forEach(el => el.classList.add(HIDDEN_CLASS))

        switch (type) {
            case "volume":
                this._volumeFeedbackEl.classList.remove(HIDDEN_CLASS)
                break
            case "seek":
                this._seekFeedbackEl.classList.remove(HIDDEN_CLASS)
                break
            case "pause":
                this._pauseFeedbackEl.classList.remove(HIDDEN_CLASS)
                break
            default:
            //do nothing
        }
    }
}