export function exitFullscreen() {
    const doc = document as any

    if (doc.exitFullscreen) {
        document.exitFullscreen()
    } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen()
    } else if (doc.mozCancelFullscreen) {
        doc.mozCancelFullscreen()
    }
}

export function requestFullscreen(el: any) {
    if (el.requestFullscreen) {
        el.requestFullscreen()
    } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen()
    } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen()
    } else {
        return false
    }
}

export function getFullscreenElement() {
    const doc = document as any

    return doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullscreenElement
}

export function toggleFullScreen(el: HTMLElement) {
    const fsEl = getFullscreenElement()

    if (fsEl) {
        exitFullscreen()
    } else {
        requestFullscreen(el)
    }
}

export function getFullscreenChangeEventName() {
    const { body } = document

    // @ts-ignore
    if (body.requestFullscreen) {
        return "fullscreenchange"
    }

    // @ts-ignore
    if (body.webkitRequestFullscreen) {
        return "webkitfullscreenchange"
    }

    // @ts-ignore
    if (body.mozRequestFullscreen) {
        return "mozfullscreenchange"
    }
}