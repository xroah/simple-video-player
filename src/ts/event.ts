import Listener from "./listener"
import {isUndef} from "./utils"

function checkFunction(fn: any) {
    if (typeof fn !== "function") {
        throw new Error(`The "listener" argument must be of type function.`)
    }
}



export default class EventEmitter {
    private _listeners: Map<string, Listener[]> = new Map()

    private _addListener(
        eventName: string,
        listener: Function,
        prepend = false,
        once = false
    ) {
        let listeners = this._listeners.get(eventName)

        checkFunction(listener)

        if (!listeners) {
            this._listeners.set(eventName, listeners = [])
        }

        for (let l of listeners) {
            //the listener already exists
            if (l.fn === listener) {
                return
            }
        }

        const _listener = new Listener(listener, once)

        if (prepend) {
            listeners.unshift(_listener)
        } else {
            listeners.push(_listener)
        }
    }

    on(eventName: string, listener: Function) {
        this.addListener(eventName, listener)

        return this
    }

    addListener(eventName: string, listener: Function) {
        this._addListener(eventName, listener)
    }

    once(eventName: string, listener: Function) {
        this._addListener(eventName, listener, false, true)

        return this
    }

    prependListener(eventName: string, listener: Function) {
        this._addListener(eventName, listener, true)

        return this
    }

    prependOnceListener(eventName: string, listener: Function) {
        this._addListener(eventName, listener, true, true)

        return this
    }

    off(eventName?: string, fn?: Function) {
        this.removeListener(eventName, fn)

        return this
    }

    private _removeListener(eventName: string, fn: Function) {
        const listeners = this._listeners.get(eventName)

        checkFunction(fn)

        if (!listeners) {
            return
        }

        for (let i = 0, len = listeners.length; i < len; i++) {
            const l = listeners[i]

            if (l.fn === fn) {
                listeners.splice(i, 1)

                if (!listeners.length) {
                    this._removeAllListeners(eventName)
                }

                break
            }
        }
    }

    private _removeAllListeners(eventName?: string) {
        if (isUndef(eventName)) {
            this._listeners = new Map()

            return
        }

        const name = eventName!

        if (!this._listeners.get(name)) {
            return
        }

        this._listeners.delete(name)
    }

    removeListener(eventName?: string, fn?: Function) {
        if (isUndef(eventName)) {
            this._removeAllListeners()
        } else if (isUndef(fn)) {
            this._removeAllListeners(eventName)
        } else {
            this._removeListener(eventName!, fn!)
        }

        return this
    }

    emit(eventName: string, ...args: any[]) {
        let listeners = this._listeners.get(eventName)

        if (isUndef(eventName) || !listeners) {
            return false
        }

        listeners = [...listeners]

        for (let l of listeners) {
            if (l.once) {
                this.removeListener(eventName, l.fn)
            }

            l.fn.apply(this, args)
        }

        return true
    }

    listeners(eventName: string) {
        return this._listeners.get(eventName) || []
    }

    listenerCount(eventName: string) {
        if (isUndef(eventName)) {
            return 0
        }

        return this.listeners(eventName).length
    }

    eventNames() {
        return Array.from(this._listeners.keys())
    }

}