import { createEl } from "../utils"

type EventName = keyof HTMLVideoElementEventMap

interface EventHandler<K extends EventName> {
    (ev: HTMLVideoElementEventMap[K]): unknown
}

export default class Video {
    el: HTMLVideoElement

    constructor(parent: HTMLElement) {
        const wrapper = createEl("div", "rplayer-video-wrapper")
        this.el = <HTMLVideoElement>createEl(
            "video",
            "rplayer-video"
        )
        this.el.playsInline = true

        wrapper.appendChild(this.el)
        parent.appendChild(wrapper)
    }

    on<K extends EventName>(
        name: K,
        handler: EventHandler<K>,
        options?: boolean | AddEventListenerOptions
    ) {
        return this.el.addEventListener(name, handler, options)
    }

    off<K extends EventName>(
        name: K,
        handler: EventHandler<K>,
        options?: boolean | AddEventListenerOptions
    ) {
        return this.el.removeEventListener(name, handler, options)
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

    getError() {
        return this.el.error
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