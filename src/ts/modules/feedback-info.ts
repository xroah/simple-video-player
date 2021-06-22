import { HIDDEN_CLASS } from "../commons/constants"
import { createEl, formatTime } from "../commons/utils"
import Transition from "./transition"

type InfoType = "volume" | "seek"

export default class FeedbackInfo extends Transition {
    private _text: HTMLElement
    private _volumeFeedbackEl: HTMLElement
    private _seekFeedbackEl: HTMLElement

    constructor(container: HTMLElement) {
        super("rplayer-feedback-wrapper", HIDDEN_CLASS)

        this._text = createEl("span")
        this.hideTimeout = 1000
        this.autoHide = true
        this._volumeFeedbackEl = createEl("div", HIDDEN_CLASS)
        this._seekFeedbackEl = createEl("div", HIDDEN_CLASS)

        this.mountTo(container)
    }

    private mountTo(container: HTMLElement) {
        const icon = createEl("span", "rplayer-volume-info-icon")

        this._volumeFeedbackEl.append(icon)
        this._volumeFeedbackEl.append(this._text)
        this.el.append(this._volumeFeedbackEl)
        this.el.append(this._seekFeedbackEl)
        container.append(this.el)
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
        const classListMap: Map<InfoType, DOMTokenList> = new Map([
            ["volume", this._volumeFeedbackEl.classList],
            ["seek", this._seekFeedbackEl.classList]
        ])

        this.setVisible(true)

        classListMap.forEach(classList => classList.add(HIDDEN_CLASS))

        classListMap.get(type)?.remove(HIDDEN_CLASS)
    }
}