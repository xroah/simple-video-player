import RPlayer from ".."
import {HIDDEN_CLASS} from "../constants"
import {addListener} from "../commons/dom-event"
import Message from "../modules/message"

let message: Message | null = null

export default (rp: RPlayer) => {
    let justMounted = true

    addListener(rp.video.el, "volumechange", () => {
        //the volume will be changed when just mounted
        if (justMounted) {
            return requestAnimationFrame(() => justMounted = false)
        }

        if (!message) {
            message = new Message(
                rp.root,
                {
                    autoHide: true,
                    delay: 3000,
                    classNames: ["rplayer-message-volume-info", HIDDEN_CLASS],
                    destroyAfterHide: true
                }
            )

            message.once("destroy", () => message = null)
        }

        message.show(Math.round(rp.video.getVolume() * 100).toString())
    })
}