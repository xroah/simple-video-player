import { ADDON_BTN_CLASS } from "../commons/constants"
import { Addon } from "../commons/types"
import {
    getFullscreenChangeEventName,
    getFullscreenElement,
    toggleFullScreen
} from "../utils/fullscreen"

const fullscreen: Addon = {
    tag: "button",
    classNames: [ADDON_BTN_CLASS, "rplayer-fullscreen-btn"],
    install(el, { root, video }) {
        const fullscreenchangeName = getFullscreenChangeEventName()
        const FULLSCREEN_IN_CLASS = "rplayer-fullscreen-in"

        el.title = "全屏"
        document.addEventListener(
            fullscreenchangeName as keyof DocumentEventMap,
            () => {
                const fsEl = getFullscreenElement()

                if (fsEl) {
                    el.classList.add(FULLSCREEN_IN_CLASS)
                } else {
                    el.classList.remove(FULLSCREEN_IN_CLASS)
                }
            }
        )

        el.addEventListener(
            "click",
            () => toggleFullScreen(root, video.el)
        )
    }
}

export default fullscreen