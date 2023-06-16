import { createEl } from "../utils"
import EventEmitter from "../commons/event-emitter"
import Tooltip from "./tooltip"
import { Position, SliderOptions } from "../commons/types"
import throttle, { ThrottleFunc } from "../utils/throttle"

export default class Slider extends EventEmitter {
    private _el: HTMLElement
    private _progress: HTMLElement
    private _marker: HTMLElement
    private _buffer?: HTMLElement
    private _tooltip?: Tooltip
    private _value = 0
    private _moving = false
    private _mouseDown = false
    private _entered = false
    private _updated = false

    constructor(
        parent: HTMLElement,
        private _options: SliderOptions = {}
    ) {
        super()

        const PREFIX = "rplayer-slider"
        this._el = createEl("div", `${PREFIX}-wrapper`)
        this._progress = createEl("div", `${PREFIX}-progress`)
        this._marker = createEl("div", `${PREFIX}-marker`)

        if (_options.buffer) {
            this._buffer = createEl("div", `${PREFIX}-buffer`)
            this._el.appendChild(this._buffer)
        }

        if (_options.tooltip !== false) {
            this._tooltip = new Tooltip(this._el)
        }

        this._el.appendChild(this._progress)
        this._el.appendChild(this._marker)
        parent.appendChild(this._el)

        this._initEvent()
    }

    private _initEvent() {
        const el = this._el

        el.addEventListener("mousedown", this._handleMouseDown)
        document.addEventListener("mousemove", this._handleMouseMove)
        document.addEventListener("mouseup", this._handleMouseUp)

        el.addEventListener(
            "touchstart",
            this._handleTouchStart,
            { passive: false }
        )
        document.addEventListener(
            "touchmove",
            this._handleTouchMove,
            { passive: false }
        )
        document.addEventListener("touchend", this._handleTouchEnd)

        if (this._tooltip) {
            el.addEventListener("mousemove", this._handleElMouseMove)
            el.addEventListener("mouseenter", this._handleElMouseEnter)
            el.addEventListener("mouseleave", this._handleElMouseLeave)
        }
    }

    private _showTooltip = throttle(
        ((e: Position) => {
            if (!this._tooltip) {
                return
            }

            const { tooltip, onTooltipUpdate } = this._options
            const rect = this._el.getBoundingClientRect()
            const left = e.clientX - rect.left
            let value = left / rect.width * 100
            let text = Math.floor(value).toString()

            if (value < 0) {
                value = 0
            } else if (value > 100) {
                value = 100
            }

            if (typeof tooltip === "function") {
                text = tooltip(value)
            }

            onTooltipUpdate?.(this._tooltip.el, value)
            this._tooltip.updateText(text)
            this._tooltip.show(e.clientX)
        }) as ThrottleFunc,
        { delay: 100 }
    )

    private _hideTooltip() {
        this._tooltip?.hide()
    }

    private _handleElMouseMove = (e: MouseEvent) => {
        if (!this._moving) {
            this._showTooltip(e)
        }
    }

    private _handleElMouseEnter = (e: MouseEvent) => {
        this._entered = true

        this._showTooltip(e)
    }

    private _handleElMouseLeave = () => {
        this._entered = false

        if (!this._moving) {
            this._hideTooltip()
        }
    }

    private _updatePosition(pos: Position) {
        let { percent } = this._getMousePosition(pos.clientX)

        if (percent < 0) {
            percent = 0
        } else if (percent > 100) {
            percent = 100
        }

        this._updateProgress(percent, pos)

        return percent
    }

    private _handleStart(pos: Position) {
        const { percent } = this._getMousePosition(pos.clientX)
        this._mouseDown = true

        this._updateProgress(percent, pos)
        this.emit(
            "slide-start",
            {
                value: percent,
                type: pos.type
            }
        )
    }

    private _handleMouseDown = (e: MouseEvent) => {
        // not left button
        if (e.button !== undefined && e.button !== 0) {
            return
        }

        e.preventDefault()
        this._handleStart(e)
    }

    private _handleMouseMove = (e: MouseEvent) => {
        this._handleMoving(e)
    }

    private _handleMoving(pos: Position) {
        if (!this._mouseDown) {
            return
        }

        this._moving = true

        this._el.classList.add("rplayer-moving")
        this.emit(
            "slide-move",
            {
                value: this._updatePosition(pos),
                type: pos.type
            }
        )

        this._showTooltip(pos)
    }

    private _handleEnd(pos: Position) {
        if (!this._mouseDown) {
            return
        }

        const { percent } = this._getMousePosition(pos.clientX)
        const updated = this._updated
        this._updated = false
        this._mouseDown = false
        this._moving = false

        this._updateProgress(percent, pos)
        this._el.classList.remove("rplayer-moving")
        this.emit(
            "slide-end",
            {
                value: percent,
                type: pos.type
            }
        )

        if (updated) {
            this.emit(
                "value-change",
                {
                    value: this._value,
                    type: pos.type
                }
            )
        }
    }

    private _handleMouseUp = (e: MouseEvent) => {
        this._handleEnd(e)

        if (!this._entered) {
            this._hideTooltip()
        }
    }

    private _handleTouchStart = (e: TouchEvent) => {
        const touches = e.touches

        if (touches.length === 1) {
            this._handleStart(touches[0])
            this._showTooltip(touches[0])
        }

        // prevent firing mouse event
        e.preventDefault()
    }

    private _handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 1) {
            this._handleMoving(e.touches[0])
            e.preventDefault()
        }
    }

    private _handleTouchEnd = (e: TouchEvent) => {
        if (!e.touches.length) {
            this._handleEnd(e.changedTouches[0])
            this._hideTooltip()
        }
    }

    private _getMousePosition(clientX: number) {
        const rect = this._el.getBoundingClientRect()
        let x = clientX - rect.left

        if (x > rect.width) {
            x = rect.width
        } else if (x < 0) {
            x = 0
        }

        return {
            left: x,
            percent: x / rect.width * 100
        }
    }

    private _updateProgress(val: number, pos: Position) {
        if (this._value !== val) {
            this._updated = true
            this.value = val

            this.emit(
                "value-update",
                {
                    value: val,
                    type: pos.type
                }
            )
        }
    }

    public get value() {
        return this._value
    }

    public set value(val: number) {
        const percent = `${val}%`
        this._value = val
        this._marker.style.left = percent
        this._progress.style.width = percent
    }

    public isMoving() {
        return this._mouseDown || this._moving
    }

    public updateBuffer(val: number) {
        if (this._buffer) {
            this._buffer.style.width = `${val}%`
        }
    }
}