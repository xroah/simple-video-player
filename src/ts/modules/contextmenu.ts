import {HIDDEN_CLASS} from "../constants";
import {
    addListener,
    removeAllListeners,
    removeListener
} from "../dom-event";
import EventEmitter from "../event";
import {
    isFunc,
    noop,
    createEl,
    preventAndStop
} from "../utils";
import RPlayer from ".."

const ITEM_CLASS = "rplayer-contextmenu-item"
const ACTIVE_CLASS = "rplayer-active"

export interface ContextmenuItem {
    text: string | ((rp?: RPlayer) => string)
    id?: string
    action?: (rp?: RPlayer) => void
}

export default class Contextmenu extends EventEmitter {
    private _el: HTMLElement
    private _player: RPlayer

    constructor(
        container: HTMLElement,
        player: RPlayer,
        items: ContextmenuItem[]
    ) {
        super()

        this._el = createEl("ul", "rplayer-contextmenu", HIDDEN_CLASS)
        this._player = player
        this._el.tabIndex = -1

        this.mountTo(container, items)
    }

    private mountTo(container: HTMLElement, items: ContextmenuItem[]) {
        const frag = document.createDocumentFragment()

        items.forEach(item => {
            const li = createEl("li", ITEM_CLASS)
            const action = isFunc(item.action) ? item.action : noop
            const text = item.text as any
            li.innerHTML = isFunc(text) ? text(this._player) : () => text

            if (item.id) {
                li.id = item.id
            }

            Object.defineProperty(li, "__action__", {
                value: action
            })
            Object.defineProperty(li, "__text__", {
                value: text
            })

            frag.appendChild(li)
        })

        this._el.appendChild(frag)
        container.appendChild(this._el)
    }

    private updatePosition(left: number, top: number) {
        const winW = window.innerWidth
        const winH = window.innerHeight
        const elW = this._el.offsetWidth
        const elH = this._el.offsetHeight
        const maxLeft = winW - elW
        const maxTop = winH - elH

        if (left > maxLeft) {
            left = maxLeft
        }

        if (top > maxTop) {
            top = maxTop
        }

        this._el.style.left = `${left}px`
        this._el.style.top = `${top}px`
    }

    private addEvents() {
        addListener(document, "click", this.handleClickOutside)
        addListener(this._el, "click", this.handleClick)
        addListener(this._el, "contextmenu", preventAndStop)
        addListener(this._el, "mouseover", this.handleMouseOver)
        addListener(this._el, "mouseout", this.handleMouseOut)
        addListener(this._el, "keydown", this.handleKeydown)
    }

    private removeEvents() {
        removeListener(document, "click", this.handleClickOutside)
        removeAllListeners(this._el)
    }

    private getItemParent(target: HTMLElement) {
        let el: HTMLElement | null = target.parentNode as HTMLElement

        while (el && el !== this._el && this._el.contains(el)) {
            if (el.classList.contains(ITEM_CLASS)) {
                return el
            }

            el = el.parentNode as HTMLElement
        }

        return this._el
    }

    private handleKeydown = (evt: KeyboardEvent) => {
        const keySet = new Set(["arrowdown", "arrowup", "enter"])
        const key = evt.key.toLowerCase()
        //prevent hotkey
        preventAndStop(evt)

        if (!keySet.has(key)) {
            return
        }

        const items = this._el.children
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
        const active = this._el.querySelector(`.${ACTIVE_CLASS}`)

        if (active) {
            active.classList.remove(ACTIVE_CLASS)
        }

        return active
    }

    private handleMouseOver = (evt: MouseEvent) => {
        let target = evt.target as HTMLElement
        let parent = this.getItemParent(target)

        this.handleMouseOut()

        //target may be an child element
        if (
            target.classList.contains(ITEM_CLASS) ||
            ((target = parent) && parent.classList.contains(ITEM_CLASS))
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

        this.setVisible(false)
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
            target !== this._el &&
            !this._el.contains(target)
        ) {
            this.setVisible(false)
        }
    }

    updateText() {
        const items: any = this._el.children

        for (let item of items) {
            const html = item.__text__(this._player)

            if (html !== item.innerHTML) {
                item.innerHTML = html
            }
        }
    }

    setVisible(visible: boolean, left = 0, top = 0) {
        if (this.isVisible() === visible) {
            return
        }

        //prevent events adding repeatedly
        //or the element is hidden
        this.removeEvents()

        if (visible) {
            this._el.classList.remove(HIDDEN_CLASS)
            this.updateText()
            this.updatePosition(left, top)
            this.addEvents()
            this._el.focus()
            this.emit("shown")
        } else {
            this._el.classList.add(HIDDEN_CLASS)
            this.emit("hidden")
        }
    }

    isVisible() {
        return !this._el.classList.contains(HIDDEN_CLASS)
    }

    destroy() {
        this.removeEvents()
    }
}