interface Handler {
    (e: MouseEvent): void
}

interface Options {
    onClick?: Handler
    onDblClick?: Handler
    type?: "mouse" | "touch" | "both"
}

const THRESHOLD = 200

export default class DblClickEmulator {
    private _clickTimes = 0
    private _timer = -1
    private _prevTimestamp = 0

    constructor(private _options: Options = {}) { }

    private _clearTimeout() {
        if (this._timer !== -1) {
            window.clearTimeout(this._timer)

            this._timer = -1
        }
    }

    private _handleMouseDown = (ev: MouseEvent) => {
        this._clickTimes++
        this._prevTimestamp = Date.now()
    }

    private _click(ev: MouseEvent) {
        this._timer = -1
        this._clickTimes = 0
        this._options.onClick?.(ev)
        console.log("click")
    }

    private _dblClick() {
        this._clickTimes = 0
        console.log("double click", Math.random())
    }

    private _handleMouseUp = (ev: MouseEvent) => {
        const now = Date.now()

        if (
            this._clickTimes === 2 &&
            this._prevTimestamp - now <= THRESHOLD
        ) {
            this._clearTimeout()
            this._dblClick()

            return
        }

        this._timer = window.setTimeout(
            () => this._click(ev),
            THRESHOLD
        )
    }

    public emulate(el: HTMLElement) {
        el.addEventListener("mousedown", this._handleMouseDown)
        el.addEventListener("mouseup", this._handleMouseUp)
    }
}