import { ADDON_BTN_CLASS } from "../commons/constants"
import { Addon } from "../commons/types"
import Player from "../modules/player"
import Popup from "../modules/popup"
import Video from "../modules/video"
import { createEl } from "../utils"

const ITEM_CLASS = "rplayer-rate-item"

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
            .25,
            .5,
            1.0,
            1.25,
            1.5,
            1.75,
            2.0
        ]

        for (const rate of rates) {
            const li = createEl("li", ITEM_CLASS)
            li.innerHTML = getPlayRate(rate)

            this._rateMap.set(li, rate)
            this._list.appendChild(li)
        }
    }

    private _handleClick = (ev: MouseEvent) => {
        const target = ev.target as HTMLElement

        if (target.classList.contains(ITEM_CLASS)) {
            const rate = this._rateMap.get(target) || 1

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