import { Player } from ".."
import Slider from "../modules/slider"
import Popup from "../modules/popup"
import { createEl } from "../commons/utils"
import { EventObject } from "../commons/event-emitter"
import { addListeners } from "../commons/dom-event"
import Video from "../modules/video"
import { handleMouseEnter, handleMouseLeave } from "./commons"
import classNames from "../commons/class-names"
import { HIDDEN_CLASS } from "../commons/constants"

class Volume extends Popup {
    private _slider: Slider
    private _text: HTMLElement
    private _wrapper: HTMLElement

    constructor(p: Player) {
        super(
            p,
            classNames.addons.VOLUME_POPUP,
            HIDDEN_CLASS
        )

        this._wrapper = createEl("div", classNames.addons.VOLUME_SLIDER)
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
        const val = video.muted ? 0 : video.volume

        this.updateText(val * 100)
    }

    private handleSliderValueChange = (evt: EventObject) => {
        this.player.video.setPercentVolume(evt.details)
    }

    private initEvents() {
        this.player.on("volumechange", this.handleVolumeChange)
        this._slider.on("valuechange", this.handleSliderValueChange)
    }

    mount() {
        this.el.append(this._text)
        this.el.append(this._wrapper)

        super.mount()
    }

    // update slider and text, when volumechange or mute
    updateText(val: number) {
        // prevent racing(volume change and 
        // slider value change(moving) simultaneously)
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
    const muted = video.volume === 0 || video.muted
    const fn = muted ? "add" : "remove"

    el.classList[fn](classNames.commons.MUTED)
}

export default {
    classNames: [classNames.addons.VOLUME_BTN],
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
            video.muted = !video.muted
            
            handleMuted(this, video)
        }
    }
}