import {
    Addon,
    AddonArray,
    AddonFunction
} from "../commons/types"
import { createEl } from "../utils"
import Player from "./player"

export default class AddonManager {
    private _left: HTMLElement
    private _center: HTMLElement
    private _right: HTMLElement
    private _el: HTMLElement

    constructor(
        private _parent: HTMLElement,
        private _player: Player
    ) {
        this._el = createEl("div", "rplayer-addons-wrapper")
        this._left = createEl("div", "rplayer-left-addons")
        this._center = createEl("div", "rplayer-center-addons")
        this._right = createEl("div", "rplayer-right-addons")

        this._el.appendChild(this._left)
        this._el.appendChild(this._center)
        this._el.appendChild(this._right)
        _parent.appendChild(this._el)
    }

    public installAddons(addons: AddonArray) {
        const containers = [
            this._left,
            this._center,
            this._right
        ]
        const len = addons.length

        for (let i = 0; i < len; i++) {
            const c = containers[i]

            if (c) {
                addons[i].forEach(
                    addon => this._install(c, addon)
                )
            }
        }
    }

    public installAddon(
        addon: Addon | AddonFunction,
        pos: "left" | "center" | "right"
    ) {
        const posMap = new Map([
            ["left", this._left],
            ["center", this._center],
            ["right", this._right]
        ])
        const c = posMap.get(pos)

        if (c) {
            this._install(c, addon)
        } 
    }

    private _install(
        container: HTMLElement,
        addon: Addon | AddonFunction
    ) {
        let tag = "div"
        let installFunc: AddonFunction
        let options: unknown
        let classNames = ["rplayer-addon"]

        if (typeof addon === "function") {
            installFunc = addon
        } else {
            if (addon.tag) {
                tag = addon.tag
            }

            if (addon.classNames) {
                classNames = [
                    ...classNames,
                    ...addon.classNames
                ]
            }

            installFunc = addon.install
            options = addon.options
        }

        const el = createEl(tag, ...classNames)

        installFunc(el, this._player, options)
        container.appendChild(el)
    }
}