import EventEmitter from "../event";
import {isPlainObject} from "../utils";
import {
    addListener,
    createEl,
    removeAllListeners,
    removeListener
} from "../dom"
import {HIDDEN_CLASS, MOVING_CLASS} from "../constants";

type Tooltip = boolean | ((val: number) => string | false)

interface Options {
    vertical?: boolean
    defaultValue?: number | string
    secondary?: boolean
    tooltip?: Tooltip
}

export default class Slider extends EventEmitter {
    private _vertical: boolean
    private _secondary: boolean
    private _el: HTMLElement
    private _marker: HTMLElement
    private _secondaryProgress: HTMLElement | null = null
    private _primaryProgress: HTMLElement
    private _tooltip: Tooltip = true
    private _tooltipEl: HTMLElement | null = null
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
        this._secondary = !!options.secondary
        this._el = createEl("div", "rplayer-slider-wrapper")
        this._marker = createEl("div", "rplayer-slider-marker")
        this._primaryProgress = createEl("div", "rplayer-slider-primary-progress")

        if (typeof options.tooltip === "function" || options.tooltip) {
            this._tooltip = options.tooltip
        } else {
            this._tooltip = false
        }

        if (this._secondary) {
            this._secondaryProgress = createEl("div", "rplayer-slider-secondary-progress")
        }

        if (this._tooltip) {
            this._tooltipEl = createEl("div", "rplayer-slider-tooltip", HIDDEN_CLASS)
        }

        this.mountTo(container)
    }

    private mountTo(container: HTMLElement) {
        const track = createEl("div", "rplayer-slider-track")

        if (this._vertical) {
            this._el.classList.add("rplayer-slider-wrapper-vertical")
        }

        if (this._secondaryProgress) {
            track.appendChild(this._secondaryProgress)
        }

        if (this._tooltipEl) {
            this._el.appendChild(this._tooltipEl)
        }

        track.appendChild(this._primaryProgress)
        track.appendChild(this._marker)
        this._el.appendChild(track)
        container.appendChild(this._el)
        this.update(this._value)
        this.initEvents()
    }

    private initEvents() {
        addListener(this._el, "mousedown", this.handleMouseDown)
        addListener(this._el, "touchstart", this.handleMouseDown)

        if (this._tooltipEl) {
            addListener(this._el, "mouseenter", this.handleMouseEnter)
            addListener(this._el, "mousemove", this.handleMouseMove)
            addListener(this._el, "mouseleave", this.handleMouseLeave)
        }
    }

    getValue() {
        return this._value
    }

    isMoving() {
        return this._moving
    }

    update(val: number, emit = false) {
        let percent = `${val}%`

        if (this._value === val) {
            return
        }

        if (this._vertical) {
            this._marker.style.bottom = percent
            this._primaryProgress.style.height = percent
        } else {
            this._marker.style.left = percent
            this._primaryProgress.style.width = percent
        }

        if (emit) {
            this.emit("valuechange", val)
        }

        this._value = val
    }

    updateSecondary(val: number) {
        const percent = `${val}%`

        if (!this._secondaryProgress) {
            return
        }

        if (this._vertical) {
            this._secondaryProgress.style.height = percent
        } else {
            this._secondaryProgress.style.width = percent
        }
    }

    getPercent(val: number) {
        const elRect = this._el.getBoundingClientRect()

        return (
            this._vertical ?
                val / elRect.height :
                val / elRect.width
        ) * 100
    }

    private updateTooltip(pos = 0) {
        if (!this._tooltipEl) {
            return
        }

        const elRect = this._el.getBoundingClientRect()
        const tooltipFn = (
            typeof this._tooltip === "function" ? this._tooltip :
                (val: number) => Math.round(val).toString()
        )
        const tooltipText = tooltipFn(this.getPercent(pos))
        const obj: any = {}

        if (tooltipText !== false) {
            this._tooltipEl.innerHTML = tooltipText
        }

        this.setTooltipVisible(!!tooltipText)

        const tooltipRect = this._tooltipEl.getBoundingClientRect()

        if (this._vertical) {
            const max = elRect.height - tooltipRect.height
            let bottom = pos - tooltipRect.height / 2
            bottom = bottom < 0 ? 0 : bottom > max ? max : bottom
            obj.bottom = bottom

            this._tooltipEl.style.bottom = `${bottom}px`
        } else {
            const max = elRect.width - tooltipRect.width
            let left = pos - tooltipRect.width / 2
            left = left < 0 ? 0 : left > max ? max : left
            obj.left = left

            this._tooltipEl.style.left = `${left}px`
        }

        this.emit("tooltipupdate", obj)
    }

    private setTooltipVisible(visible: boolean) {
        if (!this._tooltipEl) {
            return
        }

        if (visible) {
            this._tooltipEl.classList.remove(HIDDEN_CLASS)
        } else {
            this._tooltipEl.classList.add(HIDDEN_CLASS)
        }
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

        this.updateTooltip(pos)
    }

    private handleMouseLeave = (evt: MouseEvent) => {
        if (!this._moving) {
            this.setTooltipVisible(false)
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

            this.update(this.getPercent(val), true)
            this.updateTooltip(val)
            addListener(document, "mousemove", this.handleSliderMove)
            addListener(document, "touchmove", this.handleSliderMove)
            addListener(document, "mouseup", this.handleMouseUp, {once: true})
            addListener(document, "touchend", this.handleMouseUp, {once: true})
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

        this._moving = true

        if (this._vertical) {
            //update previous start position
            //mouse move out of slider
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

        this.update(percentVal, true)
        this.updateTooltip(val)
        this.emit("slidemove", percentVal)
    }

    private handleMouseUp = (evt: Event) => {
        removeListener(document, "mousemove", this.handleSliderMove)
        removeListener(document, "touchmove", this.handleSliderMove)

        if (!this._mouseEntered) {
            this.setTooltipVisible(false)
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
        removeListener(document, "touchmove", this.handleSliderMove)
        removeListener(document, "mouseup", this.handleMouseUp)
        removeListener(document, "touchend", this.handleMouseUp)
        this.off()
    }
}