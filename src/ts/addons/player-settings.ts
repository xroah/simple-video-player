import { Player } from ".."
import classNames from "../commons/class-names"
import { HIDDEN_CLASS } from "../commons/constants"
import { addListeners } from "../commons/dom-event"
import { EventObject } from "../commons/event-emitter"
import {
    createEl,
    formatTime,
    throttle
} from "../commons/utils"
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

    constructor(p: Player) {
        super(
            p,
            classNames.addons.SETTINGS_POPUP,
            HIDDEN_CLASS
        )

        this.init()
    }

    private createItem(
        labelText: string,
        callback?: (el: HTMLElement) => void
    ) {
        const el = createEl("div", classNames.addons.SETTINGS_ITEM)
        const label = createEl("div", classNames.addons.SETTINGS_LABEL)

        label.innerText = labelText

        el.append(label)

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

        items.forEach(item => frag.append(item))

        el.append(frag)

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
        } = <any>this.getLocalData(SETTINGS_KEY)
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
            const saved = this.getLocalData(TIME_KEY)
            const key = this.getVideoKey()
            const time = saved[key]

            if (time) {
                video.currentTime = time
                player.message.show(`已为您跳转至上次播放位置: ${formatTime(time)}`)
            }
        }
    }

    private getLocalData(key: string) {
        const settings = localStorage.getItem(key)
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
        const localSettings = <any>this.getLocalData(SETTINGS_KEY)
        const check = (s?: Switch) => s && s.check(true)
        const keyMap = new Map([
            ["autoplay", this.getId(AUTOPLAY_ID_PREFIX)], 
            ["rememberPosition", this.getId(REMEMBER_ID_PREFIX)], 
            ["loop", this.getId(LOOP_ID_PREFIX)]
        ])
        
        keyMap.forEach((v, k) => {
            if (localSettings[k]) {
                check(this._switches.get(v))
            }
        })
    }

    private addTimeUpdateEvent() {
        this.player.on("timeupdate", this.handleTimeUpdate)
    }

    private removeTimeUpdateEvent() {
        this.player.off("timeupdate", this.handleTimeUpdate)
    }

    private getVideoKey() {
        const url = this.player.video.currentSrc
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

    private saveTimeToLocal = () => {
        const saved = <any>this.getLocalData(TIME_KEY)
        const key = this.getVideoKey()

        saved[key] = this.player.video.currentTime

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

    private handleSettings(settings?: object) {
        const {
            autoplay,
            loop,
            rememberPosition
        } = <any>(settings || this.getLocalData(SETTINGS_KEY))
        const { player: { video } } = this

        video.autoplay = autoplay
        video.loop = loop

        if (rememberPosition) {
            this.addTimeUpdateEvent()
        } else {
            this.removeTimeUpdateEvent()

            localStorage.removeItem(TIME_KEY)
        }
    }

    private handleSwitchChange = (evt: EventObject) => {
        const {
            id,
            checked
        } = evt.details || {}
        const idMap = new Map([
            [this.getId(REMEMBER_ID_PREFIX), "rememberPosition"],
            [this.getId(AUTOPLAY_ID_PREFIX), "autoplay"],
            [this.getId(LOOP_ID_PREFIX), "loop"]
        ])
        const key = idMap.get(id)
        let localSettings = <any>this.getLocalData(SETTINGS_KEY)

        if(key) {
            localSettings[key] = checked
        }

        //save settings to localStorage
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(localSettings))

        this.handleSettings(localSettings)
    }

    destroy() {
        this._switches.forEach(s => s.destroy())
    }
}

export default {
    classNames: [classNames.addons.SETTINGS_BTN],
    init(this: HTMLElement, p: Player) {
        const addon = new PlayerSettings(p)

        addListeners(this, {
            mouseleave: handleMouseLeave.bind(addon),
            mouseenter: handleMouseEnter.bind(addon)
        })
    },
}