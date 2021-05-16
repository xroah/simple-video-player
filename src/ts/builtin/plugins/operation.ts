import RPlayer from "../.."
import { addListener, removeAllListeners } from "../../commons/dom-event"
import { createEl } from "../../commons/utils"

export default {
    install(rp: RPlayer) {
        const el = createEl("div", "rplayer-operation-plugin")

        addListener(el, "click", rp.togglePlay.bind(rp))
        rp.once("destroy", () => removeAllListeners(el))

        rp.body.appendChild(el)
    }
}