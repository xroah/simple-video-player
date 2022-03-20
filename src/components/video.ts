import { createEl, getContainer } from "../commons/utils"

export interface RPlayerOptions {
    container: HTMLElement | Node | string
    src: string
}

export default class Video {
    el: HTMLVideoElement

    constructor(parent: HTMLElement, src: string = "") {
        this.el = <HTMLVideoElement>createEl("video", "rplayer-video")

        parent.appendChild(this.el)
        this.setSrc(src)
    }

    addListener(name: keyof HTMLVideoElementEventMap, handler: Function) {
        return this.el.addEventListener(name, handler as any)
    }

    removeListener(name: keyof HTMLVideoElementEventMap, handler: Function) {
        return this.el.removeEventListener(name, handler as any)
    }

    setSrc(src: string) {
        this.el.src = src

        this.el.load()
    }

    play() {
        this.el.play()
    }

    pause() {
        this.el.pause()
    }

    toggle() {
        if (this.isPaused()) {
            this.play()
        } else {
            this.pause()
        }
    }

    isPaused() {
        return this.el.paused
    }

    getCurrentTime() {
        return this.el.currentTime
    }

    setCurrentTime(time: number) {
        this.el.currentTime = time
    }

    getDuration() {
        return this.el.duration
    }
}