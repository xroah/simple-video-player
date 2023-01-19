import { isFunc, isUndef } from "../utils"

export interface EventObject {
    type: string
    timeStamp: number
    details?: any
}

interface Listener {
    fn: Function
    once: boolean
}

function checkFunction(fn: any) {
    if (!isFunc(fn)) {
        throw new Error(`The "listener" argument must be of type function.`)
    }
}

export default class EventEmitter {
    private _listeners: Map<string, Set<Listener>> = new Map()

    private _addListener(
        eventName: string,
        listener: Function,
        once = false
    ) {
        let listeners = this._listeners.get(eventName)

        checkFunction(listener)

        if (!listeners) {
            this._listeners.set(eventName, listeners = new Set())
        }

        listeners.add({
            fn: listener,
            once
        })

        return this
    }

    on(eventName: string, listener: Function) {
        return this._addListener(eventName, listener)
    }

    once(eventName: string, listener: Function) {
        return this._addListener(eventName, listener, true)
    }

    off(eventName?: string, fn?: Function) {
        if (isUndef(eventName)) {
            this._removeAllListeners()
        } else if (isUndef(fn)) {
            this._removeAllListeners(eventName)
        } else {
            this._removeListener(eventName!, fn!)
        }

        return this
    }

    private _removeListener(eventName: string, fn: Function) {
        const listeners = this._listeners.get(eventName)

        checkFunction(fn)

        if (!listeners) {
            return this
        }

        for (const l of listeners) {
            if (l.fn === fn) {
                listeners.delete(l)

                if (!listeners.size) {
                    this._removeAllListeners(eventName)
                }

                break
            }
        }

        return this
    }

    private _removeAllListeners(eventName?: string) {
        if (isUndef(eventName)) {
            this._listeners = new Map()

            return this
        }

        if (!this._listeners.get(eventName!)) {
            return this
        }

        this._listeners.delete(eventName!)

        return this
    }

    emit(eventName: string, arg?: any) {
        let listeners = this._listeners.get(eventName)

        if (isUndef(eventName) || !listeners) {
            return false
        }

        for (let l of listeners) {
            const evt: EventObject = {
                type: eventName,
                details: arg,
                timeStamp: Date.now()
            }

            if (l.once) {
                this.off(eventName, l.fn)
            }

            l.fn.call(this, evt)
        }

        return true
    }
}