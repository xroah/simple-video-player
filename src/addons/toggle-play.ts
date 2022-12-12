import { ADDON_BTN_CLASS } from "../commons/constants"
import { Addon } from "../commons/types"

const togglePlay: Addon = {
    tag: "button",
    classNames: [ADDON_BTN_CLASS, "rplayer-toggle-btn"],
    install(el, player) {
        const PAUSED_CLASS = "rplayer-paused"

        if (player.video.isPaused()) {
            el.classList.add(PAUSED_CLASS)
        }

        player.video
            .addListener(
                "play",
                () => {
                    el.classList.remove(PAUSED_CLASS)
                }
            )
            .addListener(
                "pause",
                () => {
                    el.classList.add(PAUSED_CLASS)
                }
            )

        el.addEventListener("click", player.togglePlay)
    }
}

export default togglePlay