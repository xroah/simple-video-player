import {isUndef} from "./utils"

type El = HTMLElement | Document | Window
type Options = boolean | AddEventListenerOptions | undefined

export const LISTENER_KEY = "R_PLAYER_LISTENERS_KEY"

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

class Listener {
    fn: any
    //orig: prevent adding repeatedly
    //if once, the original listener will be wrapped
    orig: any
    capture: boolean

    constructor(
        fn: Function,
        orig: Function,
        capture: boolean
    ) {
        this.fn = fn
        this.orig = orig
        this.capture = capture
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

    if (!el[LISTENER_KEY]) {
        //for saving the element listeners
        Object.defineProperty(el, LISTENER_KEY, {
            value: new Map(),
            configurable: true
        })
    }

    const listenersMap = el[LISTENER_KEY]
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

    listeners.push(new Listener(_listener, listener, !!_options.capture))
    element.addEventListener(eventName, _listener as EventListener, _options)
}

export function removeAllListeners(element: El) {
    if (LISTENER_KEY in element) {
        const el = element as any
        const listenersMap = el[LISTENER_KEY]

        listenersMap.forEach((v: Listener[], k: string) => {
            for (let l of v) {
                element.removeEventListener(k, l.fn, l.capture)
            }
        })

        delete el[LISTENER_KEY]
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
    const listenersMap = el[LISTENER_KEY] || new Map()

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
        delete el[LISTENER_KEY]
    }
}

export function getContainer(container: string | HTMLElement | Node) {
    if (container) {
        if (typeof container === "string") {
            return document.querySelector(container)
        } else if (container.nodeName) {
            return container
        }
    }

    return null
}

export function preventAndStop(evt: Event) {
    evt.preventDefault()
    evt.stopPropagation()
}

export function createEl(tag: string, ...classNames: string[]) {
    const el = document.createElement(tag)

    if (classNames.length) {
        el.classList.add(...classNames)
    }

    return el
}

export function reflow(el: HTMLElement) {
    el.offsetHeight
}