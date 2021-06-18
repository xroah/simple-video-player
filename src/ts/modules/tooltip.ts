import EventEmitter from "../commons/event-emitter"
import { createEl } from "../commons/utils"
import { HIDDEN_CLASS } from "../commons/constants"

interface Options {
    vertical?: boolean
}

export default class Tooltip extends EventEmitter {
    private _el: HTMLElement
    private _visible = false

    constructor(private _container: HTMLElement, private _options: Options = {}) {
        super()

        this._el = createEl(
            "div",
            "rplayer-tooltip",
            _options.vertical ? "rplayer-tooltip-vertical" : "",
            HIDDEN_CLASS
        )
        _container.appendChild(this._el)
    }

    updatePosition(val: number) {
        const containerRect = this._container.getBoundingClientRect()
        const elRect = this._el.getBoundingClientRect()

        if (this._options.vertical) {
            const max = containerRect.height - elRect.height
            let bottom = val - elRect.height / 2
            bottom = bottom < 0 ? 0 : bottom > max ? max : bottom

            this._el.style.transform = `translateY(${bottom}px)`
        } else {
            const max = containerRect.width - elRect.width
            let left = val - elRect.width / 2
            left = left < 0 ? 0 : left > max ? max : left

            this._el.style.transform = `translateX(${left}px)`
        }
    }

    updateText(text: string | false) {
        this._el.innerHTML = text || ""
    }

    setVisible(visible: boolean) {
        if (this._visible === visible) {
            return
        }

        const fn = visible ? "remove" : "add"
        
        this._visible = visible

        this._el.classList[fn](HIDDEN_CLASS)
    }
}