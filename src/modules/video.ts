import EventEmitter from "../commons/event-emitter"
import { createEl } from "../utils"

type EventName = keyof HTMLVideoElementEventMap

interface EventHandler<K extends EventName> {
    (ev: HTMLVideoElementEventMap[K]): unknown
}

export default class Video extends EventEmitter {
    public el: HTMLVideoElement

    constructor(parent: HTMLElement) {
        super()

        const wrapper = createEl("div", "rplayer-video-wrapper")
        this.el = <HTMLVideoElement>createEl(
            "video",
            "rplayer-video"
        )
        this.el.playsInline = true

        wrapper.appendChild(this.el)
        parent.appendChild(wrapper)
    }

    public addListener<K extends EventName>(
        name: K,
        handler: EventHandler<K>,
        options?: boolean | AddEventListenerOptions
    ) {
        this.el.addEventListener(name, handler, options)

        return this
    }

    public removeListener<K extends EventName>(
        name: K,
        handler: EventHandler<K>,
        options?: boolean | AddEventListenerOptions
    ) {
        this.el.removeEventListener(name, handler, options)

        return this
    }

    public dispatch<T extends EventName>(type: T) {
        this.el.dispatchEvent(new Event(type))
    }

    public setSrc(src: string) {
        this.el.src = src

        this.el.load()
    }

    public load() {
        this.el.load()
    }

    public play() {
        this.el.play()
    }

    public pause() {
        this.el.pause()
    }

    public toggle() {
        if (this.isPaused()) {
            this.play()
        } else {
            this.pause()
        }
    }

    public isPaused() {
        return this.el.paused
    }

    public getCurrentTime() {
        return this.el.currentTime
    }

    public setCurrentTime(time: number) {
        const duration = this.getDuration() || 0

        if (time < 0) {
            time = 0
        } else if (time > duration) {
            time = duration
        }
        
        if (Number.isNaN(time)) {
            return
        }

        this.el.currentTime = time
    }

    public getDuration() {
        return this.el.duration
    }

    public getVolume() {
        return Math.floor(this.el.volume * 100)
    }

    public setVolume(v: number) {
        if (v < 0) {
            v = 0
        } else if (v > 100) {
            v = 100
        }

        this.el.volume = v / 100

        // emit for other extensions(like: volume-state)
        this.emit("update-volume")
    }

    public isMuted() {
        return this.el.muted
    }

    public setMuted(muted: boolean) {
        this.el.muted = muted
    }

    public getPlayRate() {
        return this.el.playbackRate
    }

    public setPlayRate(r: number) {
        this.el.playbackRate = r
    }

    public getBuffered() {
        return this.el.buffered
    }

    public getError() {
        return this.el.error
    }

    public getProgress() {
        const duration = this.getDuration()
        const currentTime = this.getCurrentTime()

        if (!duration) {
            return 0
        }

        return currentTime / duration * 100
    }
}