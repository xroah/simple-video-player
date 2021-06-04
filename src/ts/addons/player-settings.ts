import RPlayer from ".."
import { addListeners } from "../commons/dom-event"
import { createEl } from "../commons/utils"
import Popup from "../modules/popup"
import { Switch } from "../modules/switch"
import { handleMouseEnter, handleMouseLeave } from "./commons"

let uid = 0
const MIRROR_ID = "rplayer-mirror-video"
const AUTOPLAY_ID = "rplayer-autoplay"
const REMEMBER_ID = "rplayer-remember-last-position"

class PlayerSettings extends Popup {
    private _uid = uid++

    constructor(rp: RPlayer, ...classes: string[]) {
        super(rp, "rplayer-settings-popup", ...classes)

        this.init(rp.root)
    }

    private createItem(labelText: string, callback?: (el: HTMLElement) => void) {
        const el = createEl("div", "rplayer-settings-item")
        const label = createEl("div", "rplayer-settings-label")

        label.innerText = labelText

        el.appendChild(label)

        if (typeof callback === "function") {
            callback(el)
        }

        return el
    }

    init(container: HTMLElement) {
        const { _uid, el } = this

        // create item
        const ci = (id: string) =>
            (el: HTMLElement) => {
                const s = new Switch(`${id}-${_uid}`)

                s.mountTo(el)
            }

        const items = [
            this.createItem("镜像画面", ci(MIRROR_ID)),
            this.createItem("自动播放", ci(AUTOPLAY_ID)),
            this.createItem("记住上次播放位置", ci(REMEMBER_ID))
        ]
        const frag = document.createDocumentFragment()

        items.forEach(item => frag.appendChild(item))

        el.appendChild(frag)
        container.appendChild(el)
    }
}

export default {
    classNames: ["rplayer-addon-btn", "rplayer-settings-btn"],
    init(this: HTMLElement, rp: RPlayer) {
        const addon = new PlayerSettings(rp)

        addListeners(this, {
            mouseleave: handleMouseLeave.bind(addon),
            mouseenter: handleMouseEnter.bind(addon)
        })
    },
}