import RPlayer from ".."
import {addListener} from "../commons/dom-event"
import {HIDDEN_CLASS} from "../commons/constants"
import Popup from "../modules/popup"

const VALUE_KEY = "__RATE__"

class PlaybackRate extends Popup {
    constructor(rp: RPlayer) {
        super(rp, "rplayer-rate-popup", HIDDEN_CLASS)

        this.rp = rp

        this.initEvents()
        this.mountTo()
    }

    mountTo() {
        const rates = ["2.0", "1.75", "1.50", "1.25", "1.0", "0.75", "0.50", "0.25"]

        rates.forEach(rate => {
            const item = document.createElement("span")
            item.innerHTML = rate

            Object.defineProperty(item, VALUE_KEY, {value: +rate})

            item.classList.add("rplayer-rate-item")
            this.el.appendChild(item)
        })
        
        super.mountTo()
    }

    getPrecision() {
        const rate = this.rp.video.getPlaybackRate()
        let precise = 1

        if (/^\d+\.\d+$/.test(rate.toString())) { //float(eg: 1.25)
            precise = 2
        }

        return precise
    }

    initEvents() {
        addListener(this.el, "click", this.handleItemClick)
    }

    handleItemClick = (evt: MouseEvent) => {
        const rate = (evt.target as any)[VALUE_KEY] || 1

        evt.stopPropagation()

        this.setVisible(false)
        this.rp.video.setPlaybackRate(rate)
    }
}

const KEY = "playbackRate"

export default {
    classNames: ["rplayer-addon-btn", "rplayer-rate-btn"],
    text: "1.0",
    init(this: HTMLElement, rp: RPlayer) {
        const addon = new PlaybackRate(rp)
        const handleRateChange = () => {
            const rate = rp.video.getPlaybackRate()

            this.innerText = rate.toFixed(addon.getPrecision())
        }

        handleRateChange()
        rp.on("ratechange", handleRateChange)
        addListener(this, "mouseout", () => addon.delayHide())
        rp.setAdditionData(KEY, addon)
    },
    action(this: HTMLElement, rp: RPlayer) {
        const addon = rp.getAdditionData(KEY)

        addon.setVisible(!addon.visible)

        if (addon.visible) {
            addon.updatePositionByRelativeEl(this)
        }
    }
}