import { Addon, AddonArray, AddonFunction } from "../commons/types"
import { createEl } from "../utils"
import Player from "./player"

export default class AddonManager {
    private _left: HTMLElement
    private _center: HTMLElement
    private _right: HTMLElement

    constructor(
        private _parent: HTMLElement,
        private _player: Player,
        addons: AddonArray
    ) {
        this._left = createEl("div", "rplayer-left-addons")
        this._center = createEl("div", "rplayer-center-addons")
        this._right = createEl("div", "rplayer-right-addons")

        _parent.appendChild(this._left)
        _parent.appendChild(this._center)
        _parent.appendChild(this._right)

        this._init(addons)
    }

    private _init(addons: AddonArray) {
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
                    addon => this.install(c, addon)
                )
            }
        }
    }

    private install(
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