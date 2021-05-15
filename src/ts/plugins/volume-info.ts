import RPlayer from ".."
import {HIDDEN_CLASS} from "../commons/constants"
import { EventObject } from "../commons/event-emitter"
import { createEl } from "../commons/utils"
import Transition from "../modules/transition"

class VolumeInfo extends Transition {
    private _text: HTMLElement

    constructor(container: HTMLElement) {
        super("rplayer-volume-info-wrapper", HIDDEN_CLASS)

        const icon = createEl("span", "rplayer-volume-info-icon")
        this._text = createEl("span")
        this.autoHide = true
        this.hideTimeout = 1000

        this.el.appendChild(icon)
        this.el.appendChild(this._text)
        container.appendChild(this.el)
    }

    updateText(val: number | string) {
        this._text.innerText = String(val)
    }
}

export default function volumeInfo(rp: RPlayer) {
    const info = new VolumeInfo(rp.root)

    rp.on("volumechangebykeydown", (evt: EventObject) => {
        info.updateText(evt.details || 0)
        info.setVisible(true)
    })
}