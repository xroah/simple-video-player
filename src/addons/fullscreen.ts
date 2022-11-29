import { ADDON_BTN_CLASS } from "../commons/constants"
import { Addon } from "../commons/types"
import Player from "../modules/player"
import {
    getFullscreenChangeEventName,
    getFullscreenElement,
    toggleFullScreen
} from "../utils/fullscreen"

const fullscreen: Addon = {
    tag: "button",
    classNames: [ADDON_BTN_CLASS, "rplayer-fullscreen-btn"],
    install(el: HTMLElement, { root }: Player) {
        const fullscreenchangeName = getFullscreenChangeEventName()
        const FULLSCREEN_IN_CLASS = "rplayer-fullscreen-in"

        document.addEventListener(
            // @ts-ignore
            fullscreenchangeName,
            () => {
                const fsEl = getFullscreenElement()

                if (fsEl) {
                    el.classList.add(FULLSCREEN_IN_CLASS)
                } else {
                    el.classList.remove(FULLSCREEN_IN_CLASS)
                }
            }
        )

        el.addEventListener("click", () => toggleFullScreen(root))
    }
}

export default fullscreen