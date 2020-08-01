import RPlayer from "..";
import {addListener, removeAllListeners} from "../dom-event";
import {createEl} from "../utils";

export default (rp: RPlayer) => {
    const btn = createEl("span", "rplayer-addon-btn", "rplayer-play-btn")
    const handlePlay = () => {
        if (rp.video.isPaused()) {
            btn.classList.remove("rplayer-paused")
        } else {
            btn.classList.add("rplayer-paused")
        }
    }

    rp
        .on("play", handlePlay)
        .on("pause", handlePlay)
        .on("loadstart", handlePlay)
        .once("destroy", () => removeAllListeners(btn))
        .once("beforemount", () => {
            const {left} = rp.getAddonContainers()

            left.appendChild(btn)
        })

    addListener(btn, "click", rp.togglePlay.bind(rp))

    return btn
}