interface Handler {
    (e: MouseEvent): void
}

interface Options {
    onClick?: Handler
    onDblClick?: Handler
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

    private _handleMouseDown = () => {
        this._clickTimes++
        this._prevTimestamp = Date.now()
    }

    private _click(ev: PointerEvent) {
        this._timer = -1
        this._clickTimes = 0
        this._options.onClick?.(ev)
        console.log("click")
    }

    private _dblClick() {
        this._clickTimes = 0
        console.log("double click", Math.random())
    }

    private _handleMouseUp = (ev: PointerEvent) => {
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
        el.addEventListener("pointerdown", this._handleMouseDown)
        el.addEventListener("pointerup", this._handleMouseUp)
    }
}