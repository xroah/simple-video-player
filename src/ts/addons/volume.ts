import { Player } from ".."
import Slider from "../modules/slider"
import { HIDDEN_CLASS } from "../commons/constants"
import Popup from "../modules/popup"
import { createEl } from "../commons/utils"
import { EventObject } from "../commons/event-emitter"
import { addListeners } from "../commons/dom-event"
import Video from "../modules/video"
import { handleMouseEnter, handleMouseLeave } from "./commons"

class Volume extends Popup {
    private _slider: Slider
    private _text: HTMLElement
    private _wrapper: HTMLElement

    constructor(p: Player) {
        super(p, "rplayer-volume-popup", HIDDEN_CLASS)

        this._wrapper = createEl("div", "rplayer-volume-slider")
        this._slider = new Slider(this._wrapper, {
            vertical: true
        })
        this._text = document.createElement("span")
        //the icon btn, for showing the volume popup
        this.player = p

        this.initEvents()
        this.mount()
    }

    private handleVolumeChange = () => {
        const {
            player: { video }
        } = this
        const val = video.isMuted() ? 0 : video.getVolume()

        this.updateText(val * 100)
    }

    private handleSliderValueChange = (evt: EventObject) => {
        const val = evt.details / 100

        this.player.video.setVolume(val)
    }

    private initEvents() {
        this.player.on("volumechange", this.handleVolumeChange)
        this._slider.on("valuechange", this.handleSliderValueChange)
    }

    mount() {
        this.el.appendChild(this._text)
        this.el.appendChild(this._wrapper)

        super.mount()
    }

    //update slider and text, when volumechange or mute
    updateText(val: number) {
        //prevent racing(volume change and slider value change(moving) simultaneously)
        if (!this._slider.isMoving()) {
            this._slider.update(val)
        }

        this._text.innerHTML = Math.round(val).toString()
    }

    needDelay() {
        const moving = this._slider.isMoving()

        return moving
    }

    destroy() {
        super.destroy()

        this._slider.destroy()
    }
}

const KEY = "volumeAddon"

function handleMuted(el: HTMLElement, video: Video) {
    const muted = video.getVolume() === 0 || video.isMuted()
    const MUTED_CLS = "rplayer-muted"
    const fn: "add" | "remove" = muted ? "add" : "remove"

    el.classList[fn](MUTED_CLS)
}

export default {
    classNames: ["rplayer-addon-btn", "rplayer-volume-btn"],
    init(this: HTMLElement, p: Player) {
        const addon = new Volume(p)
        const handleVolumeChange = () => handleMuted(this, p.video)

        handleVolumeChange()
        p.setAdditionData(KEY, addon)
        addListeners(this, {
            mouseleave: handleMouseLeave.bind(addon),
            mouseenter: handleMouseEnter.bind(addon)
        })
        p.on("volumechange", handleVolumeChange)
    },
    action(this: HTMLElement, p: Player) {
        const addon = p.getAdditionData(KEY)
        const video = p.video

        if (addon.visible) {
            video.setMuted(!video.isMuted())
            handleMuted(this, video)
        }
    }
}