export function isUndef(obj: any) {
    return obj === undefined || obj === null
}

export function isFunc(fn: any) {
    return typeof fn === "function"
}

export function isPlainObject(obj: any) {
    return Object.prototype.toString.call(obj) === "[object Object]"
}

export function noop() {
    //do nothing
}

export function formatTime(n: number) {
	const ret: string[] = []
	const pad = (n: number) => String(100 + n).substring(1)
	let time = n
	
	while (time >= 60) {
		const remainder = time % 60
		time = Math.floor(time / 60)
		ret.unshift(pad(remainder))
	}
	
	ret.unshift(pad(time))
	
	return ret.join(":")
}

interface ThrottleOptions {
    trailing?: boolean
    delay?: number
}

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