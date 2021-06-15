import { Player } from "../.."
import { HIDDEN_CLASS } from "../../commons/constants"
import { addListener, removeAllListeners } from "../../commons/dom-event"
import { createEl } from "../../commons/utils"

export default {
    install(p: Player) {
        const el = createEl("div", "rplayer-operation")
        const pauseIcon = createEl(
            "div",
            "rplayer-operation-pause",
            HIDDEN_CLASS
        )
        const showPauseIcon = () => {
            if (p.video.paused && !p.video.error) {
                pauseIcon.classList.remove(HIDDEN_CLASS)
            }
        }
        const hidePauseIcon = () => pauseIcon.classList.add(HIDDEN_CLASS)

        addListener(el, "click", p.togglePlay.bind(p))
        p
            .once("destroy", () => removeAllListeners(el))
            .on("loadedmetadata", showPauseIcon)
            .on("pause", showPauseIcon)
            .on("play", hidePauseIcon)
            .on("playing", hidePauseIcon)

        el.appendChild(pauseIcon)
        p.root.appendChild(el)
    }
}