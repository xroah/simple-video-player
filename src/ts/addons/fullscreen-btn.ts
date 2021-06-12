
import { Player } from ".."

export default {
    classNames: ["rplayer-fullscreen-btn"],
    action(p: Player) {
        p.emit("fullscreen")
    }
}