import RPlayer from ".."
import {HIDDEN_CLASS} from "../commons/constants"
import { EventObject } from "../commons/event-emitter"
import Transition from "../modules/transition"

class VolumeInfo extends Transition {
    constructor(container: HTMLElement) {
        super("rplayer-volume-info", HIDDEN_CLASS)

        
        this.autoHide = true
        this.hideTimeout = 1000

        container.appendChild(this.el)
    }

    updateText(val: number | string) {
        this.el.innerText = String(val)
    }
}

export default function volumeInfo(rp: RPlayer) {
    const info = new VolumeInfo(rp.root)

    rp.on("volumechangebykeydown", (evt: EventObject) => {
        info.updateText(evt.details || 0)
        info.setVisible(true)
    })
}