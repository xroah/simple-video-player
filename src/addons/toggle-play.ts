import { Addon } from "../commons/types";
import Player from "../modules/player";

const togglePlay: Addon = {
    tag: "button",
    classNames: ["rplayer-addon-btn", "rplayer-toggle-btn"],
    install(
        el: HTMLElement,
        player: Player
    ) {
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