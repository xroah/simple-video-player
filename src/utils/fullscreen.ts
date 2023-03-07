/* eslint-disable @typescript-eslint/no-explicit-any */
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

export function getFullscreenMethod() {
    const body = document.body as any
    const methodName = body.requestFullscreen ||
        body.webkitRequestFullscreen ||
        body.mozRequestFullScreen

    return methodName?.name || false
}

export function requestFullscreen(el: any, videoEl?: HTMLVideoElement) {
    const methodName = getFullscreenMethod()
    
    if (methodName) {
        el[methodName]()
    } else {
        (videoEl as any)?.webkitEnterFullScreen?.()
    }
}

export function getFullscreenElement() {
    const doc = document as any

    return doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullscreenElement
}

export function toggleFullScreen(el: HTMLElement, videoEl?: HTMLVideoElement) {
    const fsEl = getFullscreenElement()

    if (fsEl) {
        exitFullscreen()
    } else {
        requestFullscreen(el, videoEl)
    }
}

export function getFullscreenChangeEventName() {
    const body = document.body as any

    if (body.requestFullscreen) {
        return "fullscreenchange"
    }

    if (body.webkitRequestFullscreen) {
        return "webkitfullscreenchange"
    }

    if (body.mozRequestFullscreen) {
        return "mozfullscreenchange"
    }
}