import RPlayer from ".."
import { addListeners } from "../commons/dom-event"
import { EventObject } from "../commons/event-emitter"
import { createEl } from "../commons/utils"
import Popup from "../modules/popup"
import { Switch } from "../modules/switch"
import { handleMouseEnter, handleMouseLeave } from "./commons"

let uid = 0
const MIRROR_ID = "rplayer-mirror-video"
const AUTOPLAY_ID = "rplayer-autoplay"
const REMEMBER_ID = "rplayer-remember-last-position"
const SETTINGS_KEY = "__RPLAYER_SETTINGS__"

class PlayerSettings extends Popup {
    private _uid = uid++
    private _switches: Map<string, Switch> = new Map()
    private _autoplay = false
    private _rememberPosition = false

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

    private init(container: HTMLElement) {
        const { _uid, el } = this

        // create item
        const ci = (id: string) =>
            (el: HTMLElement) => {
                const sid = `${id}-${_uid}`
                const s = new Switch(sid)

                this._switches.set(sid, s)

                s.on("change", this.handleSwitchChange)

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

        this.initSwitchStatus()

        this.player.on("loadedmetadata", () => {
            if (this._autoplay) {
                this.player.video
                    .play()
                    .catch(
                        () => this.player.message.show("浏览器已阻止自动播放")
                    )
            }
        })
    }

    private getLocalSettings(): object {
        const settings = localStorage.getItem(SETTINGS_KEY)
        const empty = {}

        if (settings) {
            try {
                const json = JSON.parse(settings)

                return json
            } catch (error) {
                return empty
            }
        }

        return empty
    }

    private initSwitchStatus() {
        const localSettings = this.getLocalSettings()

        if (!localSettings) {
            return
        }

        const {
            autoPlay,
            rememberPosition
        } = <any>localSettings
        const check = (s?: Switch) => s && s.check(true)

        if (autoPlay) {
            const s = this._switches.get(`${AUTOPLAY_ID}-${this._uid}`)

            this.player.video.setAutoPlay(this._autoplay = true)

            check(s)
        }

        if (rememberPosition) {
            const s = this._switches.get(`${AUTOPLAY_ID}-${this._uid}`)

            this._rememberPosition = true

            check(s)
        }
    }

    handleSwitchChange = (evt: EventObject) => {
        const {
            id,
            checked
        } = evt.details || {}
        let localSettings = <any>this.getLocalSettings()

        if (id.indexOf(REMEMBER_ID) > -1) {
            this._rememberPosition = localSettings.rememberPosition = checked
        }

        if (id.indexOf(AUTOPLAY_ID) > -1) {
            this._autoplay = localSettings.autoPlay = checked

            this.player.video.setAutoPlay(checked)
        }

        localStorage.setItem(SETTINGS_KEY, JSON.stringify(localSettings))
    }

    destroy() {
        this._switches.forEach(s => s.destroy())
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