interface ThrottleOptions {
    trailing?: boolean
    delay?: number
}

export type ThrottleFunc = (...arg: unknown[]) => unknown

// original: https://github.com/jashkenas/underscore/blob/master/modules/throttle.js
export default function throttle(
    fn: ThrottleFunc,
    options?: ThrottleOptions
) {
    let timer = -1
    let previous = 0
    const throttled = function throttled(...args: unknown[]) {
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

                timer = -1
            }

            previous = now

            fn(...args)
        } else if (trailing !== false && !timer) {
            timer = window.setTimeout(
                () =>{
                    timer = -1

                    fn(...args)
                },
                delay
            )
        }
    }

    return throttled
}