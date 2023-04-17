import { ADDON_BTN_CLASS } from "../commons/constants"
import { Addon } from "../commons/types"

const toggle: Addon = {
    tag: "button",
    classNames: [ADDON_BTN_CLASS, "rplayer-toggle-btn"],
    install(el, player) {
        const PAUSED_CLASS = "rplayer-paused"
        const {video} = player

        if (video.isPaused()) {
            el.classList.add(PAUSED_CLASS)
        }

        video
            .addListener(
                "play",
                () => el.classList.remove(PAUSED_CLASS)
            )
            .addListener(
                "pause",
                () => el.classList.add(PAUSED_CLASS)
            )

        el.addEventListener("click", () => video.toggle())
    }
}

export default toggle