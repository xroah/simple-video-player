import { Player } from "..";

export default {
    classNames: ["rplayer-pip-btn"],
    init() {
        if (!("pictureInPictureEnabled" in document)) {
            console.warn("The Picture-in-Picture Web API is not available.")

            return false
        }
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