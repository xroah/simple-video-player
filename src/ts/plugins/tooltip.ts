import { createEl, formatTime, preventAndStop } from "../commons/utils"
import { HIDDEN_CLASS } from "../commons/constants"
import classNames from "../commons/class-names"
import { Player } from ".."
import { addListeners } from "../commons/dom-event"
import { EventObject } from "../commons/event-emitter"

interface Options {
    formatter?: (n: number) => string | false
}

class Tooltip {
    private _el: HTMLElement
    private _textEl: HTMLElement
    private _visible = false

    constructor(
        private _container: HTMLElement,
        private _options: Options = {}
    ) {
        if (typeof _options.formatter !== "function") {
            _options.formatter = (n: number) => formatTime(n)
        }

        const { plugins } = classNames
        const el = this._el = createEl(
            "div",
            plugins.TOOLTIP_WRAPPER,
            HIDDEN_CLASS
        )
        this._textEl = createEl("span", plugins.TOOLTIP_TEXT)

        el.append(this._textEl)
        _container.append(el)
    }

    updatePosition(pos: number) {
        const containerRect = this._container.getBoundingClientRect()
        const elRect = this._el.getBoundingClientRect()

        const max = containerRect.width - elRect.width
        let left = pos - elRect.width / 2
        left = left < 0 ? 0 : left > max ? max : left

        this._el.style.transform = `translateX(${left}px)`
    }

    updateTime(time: number) {
        const { formatter } = this._options
        const text = formatter!(time)

        if (text) {
            this._textEl.innerText = text
        }
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

export default function tooltip(p: Player, options: Options) {
    let mouseEntered = false

    const {
        controlBar: {
            progress: { el: container },
            progress
        }
    } = p
    const tooltip = new Tooltip(container, options)
    const hide = () => tooltip.setVisible(false)
    const updatePosition = (percent: number, width: number) => {
        const { video: { duration } } = p
        percent /= 100
        
        tooltip.setVisible(true)

        if (duration) {
            tooltip.updateTime(percent * duration)
            tooltip.updatePosition(percent * width)

            return
        }

        hide()
    }
    const handleMouseEnterOrMove = (evt: MouseEvent) => {
        mouseEntered = true

        if (p.controlBar.progress.isMoving()) {
            return
        }

        const x = evt.clientX - container.getBoundingClientRect().left
        const width = container.offsetWidth
        const value = x / width

        updatePosition(value * 100, width)
        preventAndStop(evt)
    }
    const handleMouseLeave = () => {
        mouseEntered = false

        if (!p.controlBar.progress.isMoving()) {
            hide()
        }
    }
    const handleSliderMove = (evt: EventObject) => {
        updatePosition(evt.details, container.offsetWidth)
    }
    const handleSlideEnd = () => {
        if (!mouseEntered) {
            hide()
        }
    }

    addListeners(container, {
        mouseenter: handleMouseEnterOrMove,
        mousemove: handleMouseEnterOrMove,
        mouseleave: handleMouseLeave
    })
    progress.on("slidemove", handleSliderMove)
    progress.on("slideend", handleSlideEnd)
}