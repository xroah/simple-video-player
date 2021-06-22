import EventEmitter from "../commons/event-emitter"
import { isPlainObject, createEl } from "../commons/utils"
import {
    addListener,
    removeAllListeners,
    removeListener
} from "../commons/dom-event"
import { MOVING_CLASS } from "../commons/constants"

interface Options {
    vertical?: boolean
    defaultValue?: number | string
}

export default class Slider extends EventEmitter {
    private _vertical: boolean
    private _el: HTMLElement
    private _marker: HTMLElement
    private _primaryProgress: HTMLElement
    private _value = 0

    private _startX = 0
    private _startY = 0
    private _moving = false

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
        this._primaryProgress = createEl("div", "rplayer-slider-primary")

        this.update(this._value)
        this.initEvents()
        this.mountTo(container)
    }

    private mountTo(container: HTMLElement) {
        const track = createEl("div", "rplayer-slider-track")

        track.append(this._primaryProgress)
        track.append(this._marker)
        this._el.append(track)
        container.append(this._el)
    }

    private initEvents() {
        addListener(this._el, "mousedown", this.handleMouseDown)
        // addListener(this._el, "touchstart", this.handleMouseDown)
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

    private getPercent(val: number) {
        const elRect = this._el.getBoundingClientRect()
        const v = this._vertical ? val / elRect.height : val / elRect.width

        return v * 100
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
    }

    private handleMouseUp = () => {
        removeListener(document, "mousemove", this.handleSliderMove)
        // removeListener(document, "touchmove", this.handleSliderMove)

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