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

    if (ret.length < 2) {
        ret.unshift("00")
    }

    return ret.join(":")
}

export function getContainer(
    container: string | HTMLElement | Node
) {
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
        el.classList.add(...(classNames.filter(c => c)))
    }

    return el
}

export function reflow(el: HTMLElement) {
    return el.offsetHeight
}

function exitFullscreen() {
    const doc = document as any

    if (doc.exitFullscreen) {
        document.exitFullscreen()
    } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen()
    } else if (doc.mozCancelFullscreen) {
        doc.mozCancelFullscreen()
    }
}

function requestFullscreen(el: any) {
    if (el.requestFullscreen) {
        el.requestFullscreen()
    } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen()
    } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen()
    }
}

export function toggleFullScreen(el: HTMLElement) {
    const doc = document as any
    const fsEl = doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullscreenElement

    if (fsEl) {
        exitFullscreen()
    } else {
        requestFullscreen(el)
    }
}

export function getVolumeClass(volume: number, muted = false) {
    let ret = ""

    if (volume === 0 || muted) {
        ret = "muted"
    } else if (volume <= 33) {
        ret = "low"
    } else if (volume <= 66) {
        ret = "medium"
    } else {
        ret = "high"
    }

    return "rplayer-volume-" + ret
}