import RPlayer from "../..";

function init(this: HTMLElement, rp: RPlayer) {
    const handlePlay = () => {
        const fn: "remove" | "add" = rp.video.isPaused() ? "remove" : "add"

        this.classList[fn]("rplayer-paused")
    }

    rp
        .on("play", handlePlay)
        .on("pause", handlePlay)
        .on("loadstart", handlePlay)
}

export default {
    classNames: ["rplayer-addon-btn", "rplayer-play-btn"],
    init,
    action(rp: RPlayer) {
        rp.togglePlay()
    }
}