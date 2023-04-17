import Player from ".."
import { CONTEXTMENU_ITEM_CLASS } from "../commons/constants"
import ToggleVisible from "../commons/toggle-visible"
import {
    Action,
    BeforeShowCallback,
    ContextmenuItem,
    ContextmenuOptions
} from "../commons/types"
import { createEl } from "../utils"

class Contextmenu extends ToggleVisible {
    private _actionsMap = new WeakMap<HTMLElement, Action>()
    private _beforeShow?: BeforeShowCallback
    private _menu: HTMLElement

    constructor(
        private _player: Player,
        options: ContextmenuOptions
    ) {
        super(_player.root, "rplayer-contextmenu")

        this.el.tabIndex = -1
        this._menu = createEl("ul")

        if (Array.isArray(options)) {
            this._createItems(options)
        } else {
            this._beforeShow = options.beforeShow

            this._createItems(options.items)
        }

        _player.root.addEventListener(
            "contextmenu",
            this._handleContextmenu
        )
    }

    private _createItems(items: ContextmenuItem[]) {
        for (const item of items) {
            const li = document.createElement("li")
            li.innerHTML = item.text

            if (item.className && String(item.className).trim()) {
                li.classList.add(item.className)
            }

            li.classList.add(CONTEXTMENU_ITEM_CLASS)
            this._menu.appendChild(li)
            this._actionsMap.set(li, item.action)
        }

        this.el.appendChild(this._menu)
    }

    private _show(ev: MouseEvent) {
        this.show()

        const rect = this._menu.getBoundingClientRect()
        const OFFSET = 10
        const maxLeft = window.innerWidth - rect.width - OFFSET
        const maxTop = window.innerHeight - rect.height - OFFSET
        const left = ev.clientX > maxLeft ? maxLeft : ev.clientX
        const top = ev.clientY > maxTop ? maxTop : ev.clientY

        this._menu.style.left = left + "px"
        this._menu.style.top = top + "px"

        this.el.focus()

        document.addEventListener(
            "click",
            this._handleClickOutside
        )
        document.addEventListener(
            "contextmenu",
            this._handleClickOutside
        )
        this.el.addEventListener("keydown", this._handleKeydown)
        this._menu.addEventListener("click", this._handleClick)
    }

    private _hide() {
        this.hide()

        document.removeEventListener(
            "click",
            this._handleClickOutside
        )
        document.removeEventListener(
            "contextmenu",
            this._handleClickOutside
        )
        this.el.removeEventListener("keydown", this._handleKeydown)
        this._menu.removeEventListener("click", this._handleClick)
    }

    private _handleContextmenu = (ev: MouseEvent) => {
        const target = ev.target as HTMLElement

        ev.preventDefault()
        ev.stopPropagation()

        if (this.el === target || this.el.contains(target)) {
            if (this.el === target) {
                this._hide()
            }

            return
        }

        const ret = this._beforeShow?.(ev, this.el)

        if (ret === false) {
            return
        }

        this._show(ev)
    }

    private _handleClick = (ev: MouseEvent) => {
        const target = ev.target as HTMLElement

        if (target.classList.contains(CONTEXTMENU_ITEM_CLASS)) {
            const action = this._actionsMap.get(target)

            action?.(this._player)
            this._hide()
        }

        ev.stopPropagation()
    }

    private _handleKeydown = (ev: KeyboardEvent) => {
        if (ev.key.toLowerCase() === "escape") {
            this._hide()
        }
    }

    private _handleClickOutside = () => {
        this._hide()
    }
}

export default function install(
    play: Player,
    options: ContextmenuOptions
) {
    return new Contextmenu(play, options)
}