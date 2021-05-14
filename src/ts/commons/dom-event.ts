import { isUndef } from "./utils"
import { EVENT_LISTENER_KEY } from "./constants"

type El = HTMLElement | Document | Window
type Options = boolean | AddEventListenerOptions | undefined

function handleOptions(options: Options) {
    let ret: AddEventListenerOptions

    if (typeof options === "object") {
        ret = {
            ...options,
            capture: !!options.capture
        }
    } else {
        ret = {
            capture: !!options
        }
    }

    return ret
}

interface Listener {
    fn: any
    //orig: the original function, prevent adding repeatedly
    //if once, the original listener will be wrapped
    orig: any
    capture: boolean
}

interface ListenerObj {
    listener: Function
    capture?: boolean
}

interface Listeners {
    [name: string]: ListenerObj | Function
}

function createListener(fn: any, orig: any, capture: boolean): Listener {
    return {
        fn,
        orig,
        capture
    }
}

export function addListener(
    element: El,
    eventName: string,
    listener: Function,
    options?: boolean | AddEventListenerOptions
) {
    const el = element as any
    const _options = handleOptions(options)

    if (!el[EVENT_LISTENER_KEY]) {
        //for saving the element listeners
        Object.defineProperty(el, EVENT_LISTENER_KEY, {
            value: new Map(),
            configurable: true
        })
    }

    const listenersMap = el[EVENT_LISTENER_KEY]
    let listeners = listenersMap.get(eventName)
    let _listener = listener
    let exists = false

    if (!listeners) {
        listenersMap.set(eventName, listeners = [])
    }

    for (let l of listeners) {
        //already exists, addEventListener will not add 
        //if both listener and capture are same
        if (_listener === l.orig && l.capture === _options.capture) {
            exists = true

            break
        }
    }

    if (exists) {
        return
    }

    if (_options.once) {
        _listener = function onceWrapper(evt: Event) {
            listener(evt)
            removeListener(el, eventName, _listener, _options)
        }
    }

    listeners.push(createListener(_listener, listener, !!_options.capture))
    element.addEventListener(eventName, _listener as EventListener, _options)
}

export function addListeners(element: El, obj: Listeners) {
    const keys: Array<keyof Listeners> = Object.keys(obj)

    for (let key of keys) {
        let fn = obj[key]
        let tmp: ListenerObj = {
            listener: () => {}
        }

        if (typeof fn === "function") {
            tmp.listener = fn
        } else {
            tmp = fn
        }
        addListener(
            element,
            key as string,
            tmp.listener,
            !!tmp.capture
        )
    }
}

export function removeAllListeners(element: El) {
    const el = element as any

    if (EVENT_LISTENER_KEY in element) {
        const listenersMap = el[EVENT_LISTENER_KEY]

        listenersMap.forEach((v: Listener[], k: string) => {
            for (let l of v) {
                el.removeEventListener(k, l.fn, l.capture)
            }
        })

        delete el[EVENT_LISTENER_KEY]
    }
}

export function removeListener(
    element: El,
    eventName?: string,
    listener?: Function,
    options?: Options
) {
    const el = element as any
    const _options = handleOptions(options)
    const listenersMap = el[EVENT_LISTENER_KEY] || new Map()

    if (isUndef(eventName)) {
        //remove all events of the element
        return removeAllListeners(element)
    }

    let listeners = listenersMap.get(eventName)

    if (!listeners) {
        return
    }

    if (!listener) {
        //remove all listeners of eventName
        for (let l of listeners) {
            element.removeEventListener(eventName!, l.fn, l.capture)
        }

        listeners = []
    } else {
        //remove specified listener
        for (let i = 0, len = listeners.length; i < len; i++) {
            const l = listeners[i]

            if (l.fn === listener && l.capture === _options.capture) {
                element.removeEventListener(eventName!, l.fn, _options)
                listeners.splice(i, 1)

                break
            }
        }
    }

    //all listeners were removed
    if (!listeners.length) {
        listenersMap.delete(eventName)
    }

    //no listeners
    if (!listenersMap.size) {
        delete el[EVENT_LISTENER_KEY]
    }
}

export function removeListeners(element: El, obj: Listeners) {
    const keys: Array<keyof Listeners> = Object.keys(obj)

    for (let key of keys) {
        const fn = obj[key]
        let tmp: ListenerObj = {
            listener: () => {}
        }

        if (typeof fn === "function") {
            tmp.listener = fn
        } else {
            tmp = fn
        }

        removeListener(
            element,
            key as string,
            tmp.listener,
            !!tmp.capture
        )
    }
}