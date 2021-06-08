import { Player } from "../.."
import { addListener, removeAllListeners } from "../../commons/dom-event"
import { createEl } from "../../commons/utils"

export default {
    install(p: Player) {
        const el = createEl("div", "rplayer-operation-plugin")

        addListener(el, "click", p.togglePlay.bind(p))
        p.once("destroy", () => removeAllListeners(el))

        p.body.appendChild(el)
    }
}