import { Player } from "..";
import { addListeners } from "../commons/dom-event";

export default {
    classNames: ["rplayer-pip-btn"],
    init(this: HTMLElement, p: Player) {
        if (!("pictureInPictureEnabled" in document)) {
            console.warn("The Picture-in-Picture Web API is not available.")

            return false
        }

        const handlePipLeaveOrEnter = (evt: Event) => {
            const CLASS = "rplayer-pip-entered"

            if (evt.type === "enterpictureinpicture") {
                this.classList.add(CLASS)
            } else {
                this.classList.remove(CLASS)
            }
        }

        addListeners(
            p.video.el,
            {
                enterpictureinpicture: handlePipLeaveOrEnter,
                leavepictureinpicture: handlePipLeaveOrEnter
            }
        )
    },
    action(p: Player) {
        const { video: { el } } = p
        const pipEl = document.pictureInPictureElement

        if (pipEl) {
            document.exitPictureInPicture()
        }

        if (pipEl !== el) {
            el.requestPictureInPicture()
        }
    }
}