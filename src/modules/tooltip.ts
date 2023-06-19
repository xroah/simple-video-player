import { SliderEvents } from "../commons/enums"
import { EventObject } from "../commons/event-emitter"
import ToggleVisible from "../commons/toggle-visible"
import { Details, TooltipOptions } from "../commons/types"
import { createEl } from "../utils"
import throttle, { ThrottleFunc } from "../utils/throttle"
import Slider from "./slider"

export default class Tooltip extends ToggleVisible {
    private _textEl: HTMLElement
    private _parent: HTMLElement
    private _entered = false

    constructor(
        private _slider: Slider,
        private _options: TooltipOptions = {}
    ) {
        super(_slider.el, "rplayer-tooltip")

        this._textEl = createEl("span", "rplayer-tooltip-text")
        this._parent = _slider.el

        this.el.appendChild(this._textEl)
        this.hide()
        this._initEvent()
    }

    private _initEvent() {
        this._slider.on("slide-start", this._handleSlide)
        this._slider.on("slide-move", this._handleSlide)
        this._slider.on("slide-end", this._handleSlide)

        if (this._options.visibleOnHover) {
            const p = this._parent

            p.addEventListener("mouseenter", this._handleMouseEvent)
            p.addEventListener("mousemove", this._handleMouseEvent)
            p.addEventListener("mouseleave", this._handleMouseEvent)
        }
    }

    _update = throttle(
        ((value: number) => {
            const defaultFormatter = (value: number) => {
                return Math.floor(value)
            }
            const format = this._options.formatter ?? defaultFormatter

            this.updateText(format(value))
            this._updatePosition(value)
            this._options.onUpdate?.(this.el, value)
        }) as ThrottleFunc
    )

    private _handleSlide = (ev: EventObject) => {
        const { value } = ev.details as Details

        if (ev.type === SliderEvents.SLIDE_END) {
            if (!this._entered) {
                this.hide()
            }
        } else {
            this.show()
        }

        this._update(value)
    }

    private _handleMouseEvent = (ev: MouseEvent) => {
        if (ev.type === "mouseleave") {
            this._entered = false

            if (!this._slider.isMoving()) {
                this.hide()
            }
        } else {
            this._entered = true

            this.show()
            this._update(this._slider.getMousePosition(ev.clientX))
        }
    }

    // x:  percent of the parent width
    private _updatePosition(x = 0) {
        const rect = this.el.getBoundingClientRect()
        const parentRect = this._parent.getBoundingClientRect()
        const maxLeft = parentRect.width - rect.width
        const SPACE = 20
        const top = - SPACE - rect.height
        let left = x * parentRect.width / 100 - rect.width / 2

        if (left <= 0) {
            left = 0
        } else if (left > maxLeft) {
            left = maxLeft
        }

        this.el.style.left = `${left}px`
        this.el.style.top = `${top}px`
    }

    public updateText(text: string | number) {
        this._textEl.innerHTML = String(text)
    }
}