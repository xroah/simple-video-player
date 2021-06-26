
import { Player } from ".."
import classNames from "../commons/class-names"

export default {
    classNames: [classNames.addons.FULLSCREEN_BTN],
    action(p: Player) {
        p.emit("fullscreen")
    }
}