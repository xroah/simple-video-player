import { Player } from "../.."
import { addListener } from "../../commons/dom-event"
import { throttle } from "../../commons/utils"

const CLASS = "rplayer-no-cursor"

export default function mousemove(p: Player) {
    let timer: number | null = null
    const handleMouseMove = () => {
        p.controlBar.setVisible(true)

        p.root.classList.remove(CLASS)

        if (timer) {
            clearTimeout(timer)

            timer = null
        }

        timer = window.setTimeout(
            () => p.root.classList.add(CLASS),
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