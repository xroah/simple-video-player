import EventEmitter from "../commons/event-emitter"
import { isPlainObject, createEl } from "../commons/utils"
import {
    addListener,
    addListeners,
    removeAllListeners,
    removeListener
} from "../commons/dom-event"
import { MOVING_CLASS } from "../commons/constants"
import Tooltip from "./tooltip"

interface Options {
    vertical?: boolean
    defaultValue?: number | string
    secondary?: boolean
    tooltip?: {
        formatter: (v: number) => string
    }
}

export default class Slider extends EventEmitter {
    private _vertical: boolean
    private _el: HTMLElement
    private _marker: HTMLElement
    private _secondaryProgress: HTMLElement | null = null
    private _primaryProgress: HTMLElement
    private _tooltip: Tooltip | undefined
    private _tooltipFormatter: ((v: number) => string) | undefined
    private _value = 0

    private _startX = 0
    private _startY = 0
    private _moving = false
    private _mouseEntered = false

    constructor(container: HTMLElement, options?: Options) {
        super()

        if (!options || !isPlainObject(options)) {
            options = {}
        }

        this._vertical = !!options.vertical
        this._value = Number(options.defaultValue) || 0
        this._el = createEl(
            "div",
            "rplayer-slider-wrapper",
            this._vertical ? "rplayer-slider-wrapper-vertical" : ""
        )
        this._marker = createEl("div", "rplayer-slider-marker")
        this._primaryProgress = createEl("div", "rplayer-slider-primary-progress")

        if (options.secondary) {
            this._secondaryProgress = createEl("div", "rplayer-slider-secondary-progress")
        }

        if (options.tooltip) {
            this._tooltip = new Tooltip(this._el)
            this._tooltipFormatter = options.tooltip.formatter
        }

        this.update(this._value)
        this.initEvents()
        this.mountTo(container)
    }

    private mountTo(container: HTMLElement) {
        const track = createEl("div", "rplayer-slider-track")

        if (this._secondaryProgress) {
            track.appendChild(this._secondaryProgress)
        }

        track.appendChild(this._primaryProgress)
        track.appendChild(this._marker)
        this._el.appendChild(track)
        container.appendChild(this._el)
    }

    private initEvents() {
        addListener(this._el, "mousedown", this.handleMouseDown)
        // addListener(this._el, "touchstart", this.handleMouseDown)

        if (this._tooltip) {
            addListeners(
                this._el,
                {
                    mouseenter: this.handleMouseEnter,
                    mousemove: this.handleMouseMove,
                    mouseleave: this.handleMouseLeave
                }
            )
        }
    }

    getValue() {
        return this._value
    }

    isMoving() {
        return this._moving
    }

    update(val: number) {
        let percent = `${val}%`

        if (this._value === val) {
            return false
        }

        if (this._vertical) {
            this._marker.style.bottom = percent
            this._primaryProgress.style.height = percent
        } else {
            this._marker.style.left = percent
            this._primaryProgress.style.width = percent
        }

        this._value = val

        return true
    }

    //val is percent
    private updateAndEmit(val: number) {
        if (this.update(val)) {
            this.emit("valuechange", val)
        }
    }

    updateSecondary(val: number) {
        const percent = `${val}%`

        if (this._secondaryProgress) {
            const prop = this._vertical ? "height" : "width"
            this._secondaryProgress.style[prop] = percent
        }
    }

    getPercent(val: number) {
        const elRect = this._el.getBoundingClientRect()
        const v = this._vertical ? val / elRect.height : val / elRect.width

        return v * 100
    }

    private updateTooltip(pos = 0, isPercent = false) {
        const tp = this._tooltip

        if (!tp) {
            return
        }

        let percent = 0

        if (isPercent) {
            percent = pos
        } else {
            if (this._vertical) {
                percent = pos / this._el.offsetHeight * 100
            } else {
                percent = pos / this._el.offsetWidth * 100
            }
        }

        tp.updateText(this._tooltipFormatter!(percent))
        tp.updatePosition(pos)
    }

    private handleMouseMove = (evt: MouseEvent) => {
        this.handleMouseEnter(evt)
    }

    private handleMouseEnter = (evt: MouseEvent) => {
        if (this._moving) {
            return
        }

        const x = evt.clientX
        const y = evt.clientY
        const elRect = this._el.getBoundingClientRect()
        let pos = 0
        this._mouseEntered = true

        if (this._vertical) {
            pos = elRect.bottom - y
        } else {
            pos = x - elRect.left
        }

        if (this._tooltip) {
            this._tooltip.setVisible(true)
        }

        this.updateTooltip(pos)
    }

    private handleMouseLeave = (evt: MouseEvent) => {
        if (!this._moving && this._tooltip) {
            this._tooltip.setVisible(false)
        }

        this._mouseEntered = false
    }

    private handleMouseDown = (evt: any) => {
        const isMouseDown = evt.type === "mousedown"

        if (
            (isMouseDown && evt.button === 0) ||
            evt.type === "touchstart"
        ) {
            const rect = this._el.getBoundingClientRect()
            this._startX = isMouseDown ? evt.clientX : evt.touches[0].clientX
            this._startY = isMouseDown ? evt.clientY : evt.touches[0].clientY
            const val = this._vertical ?
                rect.height - (this._startY - rect.top) :
                this._startX - rect.left
            const percentVal = this.getPercent(val)

            //only update when press out of the marker
            if (evt.target !== this._marker) {
                this.updateAndEmit(percentVal)
            }

            this.emit("slidestart", percentVal)
            this.updateTooltip(val)
            addListener(document, "mousemove", this.handleSliderMove)
            // addListener(document, "touchmove", this.handleSliderMove)
            addListener(document, "mouseup", this.handleMouseUp, { once: true })
            // addListener(document, "touchend", this.handleMouseUp, { once: true })
        }

        evt.stopPropagation()
    }

    private handleSliderMove = (evt: any) => {
        const elRect = this._el.getBoundingClientRect()
        const origWidth = this._primaryProgress.offsetWidth
        const origHeight = this._primaryProgress.offsetHeight
        const x = evt.type === "mousemove" ? evt.clientX : evt.touches[0].clientX
        const y = evt.type === "mousemove" ? evt.clientY : evt.touches[0].clientY
        //moved distance
        const disX = x - this._startX
        const disY = y - this._startY
        let width = origWidth + disX
        let height = origHeight - disY
        let val: number
        let percentVal: number

        if (this._vertical) {
            //update previous start position
            //if mouse move out of slider
            let startY = 0

            if (height < 0) {
                startY = elRect.bottom
                height = 0
            } else if (height > elRect.height) {
                startY = elRect.top
                height = elRect.height
            } else {
                //mouse in slider
                startY = y
            }

            val = height
            this._startY = startY
        } else {
            let startX = 0

            if (width < 0) {
                startX = elRect.left
                width = 0
            } else if (width > elRect.width) {
                startX = elRect.right
                width = elRect.width
            } else {
                startX = x
            }

            val = width
            this._startX = startX
        }

        if (!this._el.classList.contains(MOVING_CLASS)) {
            this._el.classList.add(MOVING_CLASS)
        }

        percentVal = this.getPercent(val)

        if (!this._moving) {
            this._moving = true

            this.emit("slidemovestart", percentVal)
        }
        
        this.emit("slidemove", percentVal)
        this.updateAndEmit(percentVal)
        this.updateTooltip(percentVal, true)
    }

    private handleMouseUp = () => {
        removeListener(document, "mousemove", this.handleSliderMove)
        // removeListener(document, "touchmove", this.handleSliderMove)

        if (!this._mouseEntered && this._tooltip) {
            this._tooltip.setVisible(false)
        }

        if (this._moving) {
            this._moving = false
            this._el.classList.remove(MOVING_CLASS)

            this.emit("slideend", this._value)
        }
    }

    destroy() {
        if (!this._el.parentNode) {
            return
        }

        removeAllListeners(this._marker)
        removeAllListeners(this._el)
        removeListener(document, "mousemove", this.handleSliderMove)
        // removeListener(document, "touchmove", this.handleSliderMove)
        removeListener(document, "mouseup", this.handleMouseUp)
        // removeListener(document, "touchend", this.handleMouseUp)
        this.off()
    }
}