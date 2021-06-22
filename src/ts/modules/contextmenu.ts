import { HIDDEN_CLASS } from "../commons/constants"
import {
    addListener,
    addListeners,
    removeAllListeners,
    removeListener
} from "../commons/dom-event"
import {
    isFunc,
    noop,
    createEl,
    preventAndStop
} from "../commons/utils"
import {Player} from ".."
import Transition from "./transition"

const ITEM_CLASS = "rplayer-contextmenu-item"
const ACTIVE_CLASS = "rplayer-active"

export interface ContextmenuItem {
    text: string | ((p?: Player) => string)
    id?: string
    action?: (p?: Player) => void
}

export default class Contextmenu extends Transition {
    private _player: Player

    constructor(
        player: Player,
        items: ContextmenuItem[]
    ) {
        super("rplayer-contextmenu", HIDDEN_CLASS)

        this._player = player
        this.el.tabIndex = -1

        this.init(items)
    }

    private init(items: ContextmenuItem[]) {
        this.mount(items)
        addListener(this._player.root, "contextmenu", this.handleContextMenu)
    }

    private mount(items: ContextmenuItem[]) {
        const frag = document.createDocumentFragment()

        items.forEach(item => {
            const li = createEl("li", ITEM_CLASS)
            const action = isFunc(item.action) ? item.action : noop
            const text = item.text as any
            let textFn: Function

            if (isFunc(text)) {
                textFn = text
                li.innerHTML = text(this._player)
            } else {
                textFn = () => text
                li.innerHTML = text
            }

            if (item.id) {
                li.id = item.id
            }

            Object.defineProperty(li, "__action__", {
                value: action
            })
            Object.defineProperty(li, "__text__", {
                value: textFn
            })

            frag.append(li)
        })

        this.el.append(frag)
        this._player.root.append(this.el)
    }

    private handleContextMenu = (evt: MouseEvent) => {
        this.setVisible(true)
        this.updatePosition(evt.clientX, evt.clientY)

        this._player.emit(evt.type, evt)

        preventAndStop(evt)
    }

    private updatePosition(left: number, top: number) {
        const winW = window.innerWidth
        const winH = window.innerHeight
        const elW = this.el.offsetWidth
        const elH = this.el.offsetHeight
        const maxLeft = winW - elW
        const maxTop = winH - elH

        if (left > maxLeft) {
            left = maxLeft
        }

        if (top > maxTop) {
            top = maxTop
        }

        this.el.style.left = `${left}px`
        this.el.style.top = `${top}px`
    }

    private addEvents() {
        addListener(document, "click", this.handleClickOutside)
        addListeners(
            this.el,
            {
                click: this.handleClick,
                contextmenu: preventAndStop,
                mouseover: this.handleMouseOver,
                mouseout: this.handleMouseOut,
                keydown: this.handleKeydown
            }
        )
    }

    private removeEvents() {
        removeListener(document, "click", this.handleClickOutside)
        removeAllListeners(this.el)
    }

    private getItemParent(target: HTMLElement) {
        let el: HTMLElement | null = target.parentNode as HTMLElement

        while (el && el !== this.el && this.el.contains(el)) {
            if (el.classList.contains(ITEM_CLASS)) {
                return el
            }

            el = el.parentNode as HTMLElement
        }

        return null
    }

    private handleKeydown = (evt: KeyboardEvent) => {
        const keySet = new Set(["arrowdown", "arrowup", "enter"])
        const key = evt.key.toLowerCase()
        //prevent hotkey
        preventAndStop(evt)

        if (!keySet.has(key)) {
            return
        }

        const items = this.el.children
        const len = items.length
        let active = this.handleMouseOut()
        let index = 0

        if (active) {
            for (let i = 0; i < len; i++) {
                if (active === items[i]) {
                    index = i
                    break
                }
            }

            switch (key) {
                case "arrowup":
                    index -= 1
                    break
                case "arrowdown":
                    index += 1
                    break
                case "enter":
                    this.select(active)
                    return
            }
        }

        if (index >= len) {
            index = 0
        } else if (index < 0) {
            index = len - 1
        }

        items[index].classList.add(ACTIVE_CLASS)
    }

    private handleMouseOut = () => {
        const active = this.el.querySelector(`.${ACTIVE_CLASS}`)

        if (active) {
            active.classList.remove(ACTIVE_CLASS)
        }

        return active
    }

    private handleMouseOver = (evt: MouseEvent) => {
        let target = evt.target as HTMLElement
        let parent = this.getItemParent(target) as HTMLElement

        this.handleMouseOut()

        //target may be an child element
        if (
            target.classList.contains(ITEM_CLASS) ||
            ((target = parent) && target.classList.contains(ITEM_CLASS))
        ) {
            target.classList.add(ACTIVE_CLASS)
        }
    }

    private select(item: any) {
        let el = item

        //the target may be an child element
        if (el && !el.classList.contains(ITEM_CLASS)) {
            el = this.getItemParent(el)
        }

        if (el && el.classList.contains(ITEM_CLASS)) {
            item.__action__(this._player)
            el.classList.remove(ACTIVE_CLASS)
        }

        this.setVisible(false, true)
        //focus the player root element
        this._player.root.focus()
    }

    private handleClick = (evt: MouseEvent) => {
        this.select(evt.target)
        preventAndStop(evt)
    }

    private handleClickOutside = (evt: MouseEvent) => {
        const target = evt.target as HTMLElement

        if (
            target !== this.el &&
            !this.el.contains(target)
        ) {
            this.setVisible(false, true)
        }
    }

    private updateText() {
        const items: any = this.el.children

        for (let item of items) {
            const html = item.__text__(this._player)

            if (html !== item.innerHTML) {
                item.innerHTML = html
            }
        }
    }

    setVisible(visible: boolean, noTransition = false) {
        if (this.visible === visible) {
            return
        }

        //prevent events adding repeatedly
        //or the element is hidden
        this.removeEvents()

        super.setVisible(visible, noTransition)

        if (visible) {
            this.updateText()
            this.addEvents()
            this.el.focus()
        }
    }

    destroy() {
        this.removeEvents()
    }
}