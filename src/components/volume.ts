import { createEl } from "../commons/utils"
import {
    volumeLow,
    volumeMedium,
    volumeHigh,
    volumeOff
} from "./svg"

export default class Volume {
    protected _btnEl: HTMLButtonElement

    constructor(
        tag: string,
        ...classes: string[]
    ) {
        this._btnEl = <HTMLButtonElement>createEl(
            tag,
            ...classes
        )
    }

    protected _updateIcon(volume: number, muted: boolean) {
        const btn = this._btnEl
        const children = btn.children
        const threshold = 100 / 3

        if (children.length) {
            btn.removeChild(children[0])
        }

        if (volume === 0 || muted) {
            btn.appendChild(volumeOff())
        } else if (volume <= threshold) {
            btn.appendChild(volumeLow())
        } else if (volume > threshold && volume <= threshold * 2) {
            btn.appendChild(volumeMedium())
        } else {
            btn.appendChild(volumeHigh())
        }
    }
}
