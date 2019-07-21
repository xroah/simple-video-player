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