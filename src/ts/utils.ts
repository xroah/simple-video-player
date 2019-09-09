export function isUndef(obj: any) {
    return obj === undefined || obj === null
}

export function isFunc(fn: any) {
    return typeof fn === "function"
}

export function isPlainObject(obj: any) {
    return Object.prototype.toString.call(obj) === "[object Object]"
}

export function formatTime(seconds: number) {
    const convert = (num: number) => (100 + num).toString().substr(1)
    const hour = 60 * 60
    seconds = Math.round(seconds)

    if (seconds < 60) {
        return `00:00:${convert(seconds)}`
    } else if (seconds < hour) {
        const min = convert(Math.floor(seconds / 60))
        const sec = convert(seconds % 60)

        return `00:${min}:${sec}`
    }

    const _hour = Math.floor(seconds / hour)
    seconds = seconds % hour
    const min = Math.floor(seconds / 60)
    seconds = seconds % 60

    return `${convert(_hour)}:${convert(min)}:${convert(seconds)}`
}

export function noop() {
    //do nothing
}

export function throttle(fn: Function, delay: number = 100) {
    let timer: any = null
    let previous = 0
    const throttled = function throttled(...args: any[]) {
        const now = Date.now()
        const remaining = delay - (now - previous)

        if (remaining <= 0) {
            if (timer !== null) {
                clearTimeout(timer)

                timer = null
            }

            previous = now

            fn.apply(null, args)
        } else if (!timer) {
            timer = setTimeout(
                () => fn.apply(timer = null, args),
                delay
            )
        }
    }

    return throttled
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
        el.classList.add(
            ...(classNames.filter(c => c))
        )
    }

    return el
}

export function reflow(el: HTMLElement) {
    el.offsetHeight
}