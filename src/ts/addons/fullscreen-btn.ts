
import RPlayer from ".."

export default {
    classNames: ["rplayer-addon-btn", "rplayer-fullscreen-btn"],
    action(rp: RPlayer) {
        rp.emit("fullscreen")
    }
}