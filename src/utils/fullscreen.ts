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