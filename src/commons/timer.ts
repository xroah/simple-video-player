export default class Timer {
    private _id = -1

    constructor(
        private _timeout: number,
        private _callback?: VoidFunction
    ) { }

    clear() {
        if (this._id !== -1) {
            window.clearTimeout(this._id)

            this._id = -1
        }
    }

    set callback(cb: VoidFunction) {
        this._callback = cb
    }

    set timeout(t: number) {
        this._timeout = t
    }

    delay(clear = false) {
        if (clear) {
            this.clear()
        }

        if (!this._callback) {
            return
        }

        this._id = window.setTimeout(
            () => {
                this._id = -1

                this._callback?.()
            },
            this._timeout
        )
    }
}