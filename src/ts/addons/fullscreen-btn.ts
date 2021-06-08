
import { Player } from ".."

export default {
    classNames: ["rplayer-addon-btn", "rplayer-fullscreen-btn"],
    action(p: Player) {
        p.emit("fullscreen")
    }
}