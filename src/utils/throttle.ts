interface ThrottleOptions {
    trailing?: boolean
    delay?: number
}

// original: https://github.com/jashkenas/underscore/blob/master/modules/throttle.js
export function throttle(fn: Function, options?: ThrottleOptions) {
    let timer: any = null
    let previous = 0
    const throttled = function throttled(...args: any[]) {
        if (!options) {
            options = {}
        }

        const {
            delay = 100,
            trailing
        } = options
        const now = Date.now()
        const remaining = delay - (now - previous)

        if (remaining <= 0) {
            if (timer !== null) {
                clearTimeout(timer)

                timer = null
            }

            previous = now

            fn.apply(null, args)
        } else if (trailing !== false && !timer) {
            timer = setTimeout(
                () => fn.apply(timer = null, args),
                delay
            )
        }
    }

    return throttled
}