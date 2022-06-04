import { createEl } from "../commons/utils"
import EventEmitter from "../commons/event-emitter"
import { HIDDEN_CLASS } from "../commons/constants"

interface SliderOptions {
    tooltip?: boolean | ((v: number) => string)
    buffer?: boolean
}

export default class Slider extends EventEmitter {
    private _el: HTMLDivElement
    private _progress: HTMLDivElement
    private _marker: HTMLDivElement
    private _tooltip: HTMLDivElement | null = null
    private _buffer: HTMLDivElement
    private _value = 0
    private _moving = false
    private _mouseDown = false
    private _entered = false

    constructor(
        parent: HTMLElement,
        private _options: SliderOptions = {}
    ) {
        super()

        const PREFIX = "rplayer-slider"
        this._el = <HTMLDivElement>createEl(
            "div",
            `${PREFIX}-wrapper`
        )
        this._progress = <HTMLDivElement>createEl(
            "div",
            `${PREFIX}-progress`
        )
        this._marker = <HTMLDivElement>createEl(
            "div",
            `${PREFIX}-marker`
        )

        if (_options.buffer) {
            this._buffer = <HTMLDivElement>createEl(
                "div",
                `${PREFIX}-buffer`
            )
            this._el.appendChild(this._buffer)
        }

        if (this._tooltipAvail()) {
            this._tooltip = <HTMLDivElement>createEl(
                "div",
                HIDDEN_CLASS,
                `${PREFIX}-tooltip`
            )

            this._el.appendChild(this._tooltip)
        }

        this._el.appendChild(this._progress)
        this._el.appendChild(this._marker)
        parent.appendChild(this._el)

        this._initEvent()
    }

    private _initEvent() {
        const el = this._el

        if (this._tooltipAvail()) {
            el.addEventListener("mousemove", this._handleMouseMove)
        }

        el.addEventListener("mousedown", this._handleMouseDown)
        el.addEventListener("mouseenter", this._handleMouseEnter)
        el.addEventListener("mouseleave", this._handleMouseLeave)
        document.addEventListener("mousemove", this._handleSliderMove)
        document.addEventListener("mouseup", this._handleMouseUp)
    }

    private _tooltipAvail() {
        return this._options.tooltip !== false
    }

    private formatTooltip(v: number) {
        v = v < 0 ? 0 : v > 100 ? 100 : v

        if (typeof this._options.tooltip === "function") {
            return this._options.tooltip(v)
        }

        return Math.floor(v).toString()
    }

    private _showTooltip(e: MouseEvent) {
        const { _tooltip: t } = this

        if (!t) {
            return
        }

        t.classList.remove(HIDDEN_CLASS)

        const { left, percent } = this._getMousePosition(e)
        const tRect = t.getBoundingClientRect()
        const rect = this._el.getBoundingClientRect()
        const max = rect.width - tRect.width
        t.innerHTML = this.formatTooltip(percent)
        let l = left - tRect.width / 2
        l = l < 0 ? 0 : l > max ? max : l
        t.style.left = `${l}px`
    }

    private _hideToolTip() {
        if (!this._tooltip) {
            return
        }

        this._tooltip.classList.add(HIDDEN_CLASS)
    }

    private _handleMouseMove = (e: MouseEvent) => {
        if (!this._moving) {
            this._showTooltip(e)
        }
    }

    private _handleMouseEnter = (e: MouseEvent) => {
        this._entered = true
        const { percent } = this._getMousePosition(e)

        this._showTooltip(e)
    }

    private _handleMouseLeave = (e: MouseEvent) => {
        this._entered = false

        if (!this._moving) {
            this._hideToolTip()
        }
    }

    private _handleMouseDown = (e: MouseEvent) => {
        const pos = this._getMousePosition(e)
        this._mouseDown = true
        this._moving = true

        this._updateProgress(pos.percent)
        this.emit("slide-start")
    }

    private _handleSliderMove = (e: MouseEvent) => {
        if (!this._mouseDown) {
            return
        }

        let { percent } = this._getMousePosition(e)

        if (percent < 0) {
            percent = 0
        } else if (percent > 100) {
            percent = 100
        }

        this._el.classList.add("rplayer-moving")
        this._updateProgress(percent)
        this._showTooltip(e)
    }

    private _handleMouseUp = (e: MouseEvent) => {
        if (!this._mouseDown) {
            return
        }

        this._mouseDown = false
        this._moving = false

        this._el.classList.remove("rplayer-moving")
        this.emit("slide-end")

        if (!this._entered) {
            this._hideToolTip()
        }
    }

    private _getMousePosition(e: MouseEvent) {
        const rect = this._el.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percent = x / rect.width * 100

        return {
            left: x,
            percent
        }
    }

    private _updateProgress(val: number) {
        if (this._value !== val) {
            this.emit("value-change", val)
            this.updateProgress(val)
        }
    }

    public isMoving() {
        return this._moving
    }

    public updateProgress(val: number) {
        const percent = `${val}%`
        this._value = val
        this._marker.style.left = percent
        this._progress.style.width = percent
    }
}