import { Player } from "../.."

function init(this: HTMLElement, p: Player) {
    const handlePlay = () => {
        const fn: "remove" | "add" = p.video.isPaused() ? "remove" : "add"

        this.classList[fn]("rplayer-paused")
    }

    p
        .on("play", handlePlay)
        .on("pause", handlePlay)
        .on("loadstart", handlePlay)
}

export default {
    classNames: ["rplayer-addon-btn", "rplayer-play-btn"],
    init,
    action(p: Player) {
        p.togglePlay()
    }
}