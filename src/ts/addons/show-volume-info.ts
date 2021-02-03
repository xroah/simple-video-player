import RPlayer from ".."
import {addListener} from "../dom-event"
import Message from "../modules/message"

export default (rp: RPlayer) => {
    const message = new Message(
        rp.root,
        {
            autoHide: true,
            delay: 3000,
            classNames: ["rplayer-message-volume-info"]
        }
    )
    let justMounted = true

    addListener(rp.video.el, "volumechange", () => {
        //the volume will be changed when just mounted
        if (justMounted) {
            justMounted = false

            return
        }

        message.show(Math.round(rp.video.getVolume() * 100).toString())
    })
}