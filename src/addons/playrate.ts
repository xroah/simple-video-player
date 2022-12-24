import { ACTIVE_CLASS, ADDON_BTN_CLASS, RATE_ITEM_CLASS } from "../commons/constants"
import { Addon } from "../commons/types"
import Player from "../modules/player"
import Popup from "../modules/popup"
import { createEl } from "../utils"

function getPlayRate(rate: number) {
    if (/^\d+$/.test(String(rate))) {
        return `${rate}.0x`
    }

    return `${rate}x`
}

class RatePopup extends Popup {
    private _list: HTMLElement
    private _rateMap = new WeakMap<HTMLElement, number>()

    constructor(el: HTMLElement, player: Player) {
        super(el, player, "rplayer-rate-popup")

        this._list = createEl("ul")

        this._list.addEventListener("click", this._handleClick)
        this._createList()
        this.el.appendChild(this._list)
    }

    private _createList() {
        const rates = [
            2.0,
            1.75,
            1.5,
            1.25,
            1.0,
            .5,
            .25
        ]
        const videoRate = this.player.video.getPlayRate()

        for (const rate of rates) {
            const li = createEl("li", RATE_ITEM_CLASS)
            li.innerHTML = getPlayRate(rate)

            if (videoRate === rate) {
                li.classList.add(ACTIVE_CLASS)
            }

            this._rateMap.set(li, rate)
            this._list.appendChild(li)
        }
    }

    private _handleClick = (ev: MouseEvent) => {
        const target = ev.target as HTMLElement

        if (target.classList.contains(RATE_ITEM_CLASS)) {
            const rate = this._rateMap.get(target) || 1
            const prev = this.el.querySelector("." + ACTIVE_CLASS)

            prev?.classList.remove(ACTIVE_CLASS)
            target.classList.add(ACTIVE_CLASS)

            this.player.video.setPlayRate(rate)
        }

        this.hide()
    }
}

const playRate: Addon = {
    tag: "button",
    classNames: [ADDON_BTN_CLASS],
    install(el, player) {
        const ratePopup = new RatePopup(el, player)
        el.innerHTML = getPlayRate(player.video.getPlayRate())

        player.controlBar.on("hide", () => ratePopup.hide())
        el.addEventListener("click", () => ratePopup.toggle())
        player.video.addListener(
            "ratechange",
            function (this: HTMLVideoElement) {
                el.innerHTML = getPlayRate(this.playbackRate)
            }
        )
    }
}

export default playRate