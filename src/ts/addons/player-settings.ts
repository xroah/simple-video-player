import { Player } from ".."
import { addListeners } from "../commons/dom-event"
import { EventObject } from "../commons/event-emitter"
import { createEl, formatTime, throttle } from "../commons/utils"
import Popup from "../modules/popup"
import { Switch } from "../modules/switch"
import { handleMouseEnter, handleMouseLeave } from "./commons"

let uid = 0
const LOOP_ID_PREFIX = "rplayer-loop"
const AUTOPLAY_ID_PREFIX = "rplayer-autoplay"
const REMEMBER_ID_PREFIX = "rplayer-remember-last-position"
const SETTINGS_KEY = "__RPLAYER_SETTINGS__"
const TIME_KEY = "__RPLAYER_CURRENT_TIME__"

class PlayerSettings extends Popup {
    private _uid = uid++
    private _switches: Map<string, Switch> = new Map()

    constructor(p: Player, ...classes: string[]) {
        super(p, "rplayer-settings-popup", ...classes)

        this.init()
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

    mount() {
        const { el } = this

        // create item
        const ci = (id: string) =>
            (el: HTMLElement) => {
                const s = new Switch(id)

                this._switches.set(id, s)

                s.on("change", this.handleSwitchChange)

                s.mountTo(el)
            }
        const items = [
            this.createItem("循环播放", ci(this.getId(LOOP_ID_PREFIX))),
            this.createItem("自动播放", ci(this.getId(AUTOPLAY_ID_PREFIX))),
            this.createItem("记住上次播放位置", ci(this.getId(REMEMBER_ID_PREFIX)))
        ]
        const frag = document.createDocumentFragment()

        items.forEach(item => frag.appendChild(item))

        el.appendChild(frag)

        super.mount()
    }

    private init() {
        this.mount()

        this.handleSettings()
        this.initSwitchStatus()

        this.player.on("loadedmetadata", this.handleLoad)
    }

    private handleLoad = () => {
        const {
            autoplay,
            rememberPosition
        } = <any>this.getLocalSettings()
        const {
            player,
            player: { video }
        } = this

        if (autoplay) {
            video
                .play()
                .catch(
                    () => player.message.show("浏览器已阻止自动播放")
                )
        }

        if (rememberPosition) {
            const saved = this.getSavedTime()
            const key = this.getVideoKey()
            const time = saved[key]

            if (time) {
                video.setCurrentTime(time)
                player.message.show(`已为您跳转至上次播放位置: ${formatTime(time)}`)
            }
        }
    }

    private getLocalSettings() {
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

    private getId(prefix: string) {
        return `${prefix}-${this._uid}`
    }

    private initSwitchStatus() {
        const {
            autoplay,
            rememberPosition,
            loop
        } = <any>this.getLocalSettings()
        const { _switches } = this
        const check = (s?: Switch) => s && s.check(true)
        const switches: Array<Switch | undefined> = []

        if (autoplay) {
            switches.push(_switches.get(this.getId(AUTOPLAY_ID_PREFIX)))
        }

        if (rememberPosition) {
            switches.push(_switches.get(this.getId(REMEMBER_ID_PREFIX)))
        }

        if (loop) {
            switches.push(_switches.get(this.getId(LOOP_ID_PREFIX)))
        }

        switches.forEach(check)
    }

    private addTimeUpdateEvent() {
        this.player.on("timeupdate", this.handleTimeUpdate)
    }

    private removeTimeUpdateEvent() {
        this.player.off("timeupdate", this.handleTimeUpdate)
    }

    private getVideoKey() {
        const url = this.player.video.getCurrentSrc()
        const a = document.createElement("a")
        let key = ''

        //parse the url
        a.href = url

        if (a.host) {
            key = `${a.protocol}//${a.host}${a.pathname}`
        } else {
            //maybe blob
            key = url
        }

        return window.btoa(key)
    }

    private getSavedTime() {
        const localTime = localStorage.getItem(TIME_KEY)
        const empty = {}

        if (localTime) {
            try {
                const json = JSON.parse(localTime)

                return json
            } catch (error) {
                return empty
            }
        }

        return empty
    }

    private saveTimeToLocal = () => {
        const saved = <any>this.getSavedTime()
        const key = this.getVideoKey()

        saved[key] = this.player.video.getCurrentTime()

        localStorage.setItem(TIME_KEY, JSON.stringify(saved))
    }

    //save current time to localStorage
    private handleTimeUpdate = throttle(
        this.saveTimeToLocal,
        {
            trailing: false,
            delay: 1000
        }
    )

    private handleSettings() {
        const {
            autoplay,
            loop,
            rememberPosition
        } = <any>this.getLocalSettings()
        const { player: { video } } = this

        video.setAutoplay(autoplay)
        video.setLoop(loop)

        if (rememberPosition) {
            this.addTimeUpdateEvent()
        } else {
            this.removeTimeUpdateEvent()
        }
    }

    private handleSwitchChange = (evt: EventObject) => {
        const {
            id,
            checked
        } = evt.details || {}
        let localSettings = <any>this.getLocalSettings()

        if (id.indexOf(REMEMBER_ID_PREFIX) > -1) {
            localSettings.rememberPosition = checked
        }

        if (id.indexOf(AUTOPLAY_ID_PREFIX) > -1) {
            localSettings.autoplay = checked
        }

        if (id.indexOf(LOOP_ID_PREFIX) > -1) {
            localSettings.loop = checked
        }

        //save settings to localStorage
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(localSettings))

        this.handleSettings()
    }

    destroy() {
        this._switches.forEach(s => s.destroy())
    }
}

export default {
    classNames: ["rplayer-settings-btn"],
    init(this: HTMLElement, p: Player) {
        const addon = new PlayerSettings(p)

        addListeners(this, {
            mouseleave: handleMouseLeave.bind(addon),
            mouseenter: handleMouseEnter.bind(addon)
        })
    },
}