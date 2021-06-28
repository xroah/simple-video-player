import { Player } from ".."
import { addListener, addListeners } from "../commons/dom-event"
import Popup from "../modules/popup"
import { handleMouseEnter, handleMouseLeave } from "./commons"
import classNames from "../commons/class-names"

const VALUE_KEY = "__RATE__"

export interface PlayRateOptions {
    rates?: Array<string | number>
    defaultRate?: number
}

class PlaybackRate extends Popup {
    private _rates: Array<string | number>

    constructor(p: Player, options: PlayRateOptions = {}) {
        super(
            p,
            classNames.addons.RATE_POPUP,
            classNames.commons.HIDDEN
        )

        const {
            rates,
            defaultRate = 1
        } = options
        this.player = p

        if (rates && rates.length) {
            this._rates = rates
        } else {
            this._rates = [2, 1.75, 1.5, 1.25, 1, 0.75, 0.5, 0.25]
        }

        p.video.playbackRate = defaultRate

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
            this.el.append(item)
        })

        super.mount()
    }

    getRateString(rate = this.player.video.playbackRate) {
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
        this.player.video.playbackRate = rate
    }
}

export default {
    classNames: [classNames.addons.RATE_BTN],
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