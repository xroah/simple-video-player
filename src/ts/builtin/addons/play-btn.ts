import { Player } from "../.."
import classNames from "../../commons/class-names"

function init(this: HTMLElement, p: Player) {
    const handlePlay = () => {
        const fn = p.video.paused ? "remove" : "add"

        this.classList[fn](classNames.commons.PAUSED)
    }

    p
        .on("play", handlePlay)
        .on("pause", handlePlay)
        .on("loadstart", handlePlay)
}

export default {
    classNames: [classNames.addons.PLAY_BTN],
    init,
    action(p: Player) {
        p.togglePlay()
    }
}