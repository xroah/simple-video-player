import { createEl, getContainer } from "../commons/utils"

export interface RPlayerOptions {
    container: HTMLElement | Node | string
    src: string
}

export default class Video {
    el: HTMLVideoElement

    constructor(parent: HTMLElement, src: string = "") {
        const wrapper = <HTMLDivElement>createEl(
            "div",
            "rplayer-video-wrapper"
        )
        this.el = <HTMLVideoElement>createEl("video", "rplayer-video")

        wrapper.appendChild(this.el)
        parent.appendChild(wrapper)
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

    getVolume() {
        return Math.floor(this.el.volume * 100)
    }

    setVolume(v: number) {
        if (v > 100) {
            v = 100
        }

        this.el.volume = v / 100
    }

    isMuted() {
        return this.el.muted
    }

    setMuted(muted: boolean) {
        this.el.muted = muted
    }

    getProgress() {
        const duration = this.getDuration()
        const currentTime = this.getCurrentTime()

        if (!duration) {
            return 0
        }

        return currentTime / duration * 100
    }
}