import { Player } from "../.."
import classNames from "../../commons/class-names"
import { addListener, removeAllListeners } from "../../commons/dom-event"
import { createEl } from "../../commons/utils"

export default function operation(p: Player) {
        const el = createEl("div", classNames.plugins.OPERATION)
        const pauseIcon = createEl(
            "div",
            classNames.plugins.OPERATION_PAUSE,
            classNames.commons.HIDDEN
        )
        const showPauseIcon = () => {
            if (p.video.paused && !p.video.error) {
                pauseIcon.classList.remove(classNames.commons.HIDDEN)
            }
        }
        const hidePauseIcon =
            () => pauseIcon.classList.add(classNames.commons.HIDDEN)

        addListener(el, "click", p.togglePlay.bind(p))
        p
            .once("destroy", () => removeAllListeners(el))
            .on("loadedmetadata", showPauseIcon)
            .on("pause", showPauseIcon)
            .on("play", hidePauseIcon)
            .on("playing", hidePauseIcon)

        el.append(pauseIcon)
        p.root.append(el)
    }