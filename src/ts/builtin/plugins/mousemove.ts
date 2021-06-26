import { Player } from "../.."
import classNames from "../../commons/class-names"
import { addListener } from "../../commons/dom-event"
import { throttle } from "../../commons/utils"

export default function mousemove(p: Player) {
    let timer: number | null = null
    const handleMouseMove = () => {
        p.controlBar.setVisible(true)

        p.root.classList.remove(classNames.plugins.NO_CURSOR)

        if (timer) {
            clearTimeout(timer)

            timer = null
        }

        timer = window.setTimeout(
            () => p.root.classList.add(classNames.plugins.NO_CURSOR),
            3000
        )
    }

    addListener(
        p.root,
        "mousemove",
        throttle(
            handleMouseMove,
            {
                trailing: false,
                delay: 1000
            }
        )
    )
}