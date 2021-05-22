import RPlayer from "..";

export default {
    classNames: ["rplayer-pip-btn", "rplayer-addon-btn"],
    init() {
        if (!("pictureInPictureEnabled" in document)) {
            console.warn("The Picture-in-Picture Web API is not available.")

            return false
        }
    },
    action(rp: RPlayer) {
        const { video: { el } } = rp
        const pipEl = document.pictureInPictureElement

        if (pipEl) {
            document.exitPictureInPicture()
        }

        if(pipEl !== el) {
            el.requestPictureInPicture()
        }
    }
}