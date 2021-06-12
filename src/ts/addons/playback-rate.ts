import { Player } from ".."
import { addListener, addListeners } from "../commons/dom-event"
import { HIDDEN_CLASS } from "../commons/constants"
import Popup from "../modules/popup"
import { handleMouseEnter, handleMouseLeave } from "./commons"

const VALUE_KEY = "__RATE__"

export interface PlayRateOptions {
    rates?: Array<string | number>
    defaultRate?: number
}

class PlaybackRate extends Popup {
    private _rates: Array<string | number> = [2, 1.75, 1.5, 1.25, 1, 0.75, 0.5, 0.25]

    constructor(p: Player, options: PlayRateOptions = {}) {
        super(p, "rplayer-rate-popup", HIDDEN_CLASS)

        const {
            rates,
            defaultRate = 1
        } = options
        this.player = p

        if (rates && rates.length) {
            this._rates = rates
        }

        p.video.setPlaybackRate(defaultRate)

        this.initEvents()
        this.mount()
    }

    mount() {
        this._rates.forEach(rate => {
            const item = document.createElement("span")
            const rateNumber = +rate

            item.innerHTML = this.getRateString(rateNumber)

            Object.defineProperty(item, VALUE_KEY, { value: rateNumber })

            item.classList.add("rplayer-rate-item")
            this.el.appendChild(item)
        })

        super.mount()
    }

    getRateString(rate = this.player.video.getPlaybackRate()) {
        let rateString = String(rate)

        switch (rateString.length) {
            case 1: //maybe 1
                rateString += ".0"
                break

            case 3: //maybe 0.5
                rateString += "0"
                break

            default:
            //do nothing
        }

        return rateString
    }

    private initEvents() {
        addListener(this.el, "click", this.handleItemClick)
    }

    private handleItemClick = (evt: MouseEvent) => {
        const rate = (evt.target as any)[VALUE_KEY] || 1

        evt.stopPropagation()

        this.setVisible(false)
        this.player.video.setPlaybackRate(rate)
    }
}

export default {
    classNames: ["rplayer-rate-btn"],
    text: "1.0",
    init(this: HTMLElement, p: Player, options?: PlayRateOptions) {
        const addon = new PlaybackRate(p, options)
        const handleChange = () => this.innerText = addon.getRateString()

        handleChange()
        p.on("ratechange", handleChange)
        addListeners(this, {
            mouseleave: handleMouseLeave.bind(addon),
            mouseenter: handleMouseEnter.bind(addon)
        })
    }
}