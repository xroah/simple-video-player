import { ADDON_BTN_CLASS } from "../commons/constants"
import {Addon} from "../commons/types"

const FULLSCREEN_CLASS = "rplayer-page-fullscreen"

const pageFullscreen: Addon = {
    tag: "button",
    classNames: [ADDON_BTN_CLASS, `${FULLSCREEN_CLASS}-btn`],
    install(el, {root}) {
        el.title = "网页全屏"
        const FULLSCREEN_IN_CLASS = `${FULLSCREEN_CLASS}-in`
        const handleClick = () => {
            if (root.classList.contains(FULLSCREEN_CLASS)) {
                root.classList.remove(FULLSCREEN_CLASS)
                el.classList.remove(FULLSCREEN_IN_CLASS)
            } else {
                root.classList.add(FULLSCREEN_CLASS)
                el.classList.add(FULLSCREEN_IN_CLASS)
            }
        }
        
        el.addEventListener("click", handleClick)
    }
}

export default pageFullscreen