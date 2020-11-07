import {createEl} from "../utils";
import EventEmitter from "../event";

interface videoOptions {
    url: string
    poster?: string
}

export default class Player extends EventEmitter {
    el: HTMLVideoElement

    private _wrapper: HTMLElement

    constructor(container: HTMLElement, options: videoOptions) {
        super()

        this._wrapper = createEl("div", "rplayer-video-wrapper")
        this.el = createEl("video", "rplayer-video") as HTMLVideoElement
        this.el.controls = false
        this.el.preload = "auto"
        this.el.src = options.url
        this.el.crossOrigin = ""

        if (options.poster) {
            this.setPoster(options.poster)
        }

        this._wrapper.appendChild(this.el)
        container.appendChild(this._wrapper)
    }

    updateUrl(url: string) {
        if (url) {
            this.el.src = url

            this.el.load()
        }
    }

    play() {
        return this.el.play()
    }

    pause() {
        return this.el.pause()
    }

    isPaused() {
        return this.el.paused
    }

    isEnded() {
        return this.el.ended
    }

    setPoster(poster: string) {
        this.el.poster = poster
    }

    setMuted(mute: boolean) {
        this.el.muted = mute
    }

    isMuted() {
        return this.el.muted
    }

    setVolume(volume: number) {
        this.el.volume = volume
    }

    getVolume() {
        return this.el.volume
    }

    getCurrentTime() {
        return this.el.currentTime
    }

    setCurrentTime(time: number) {
        this.el.currentTime = time || 0
    }

    getDuration() {
        return this.el.duration
    }

    getCurrentSrc() {
        return this.el.currentSrc
    }

    getBuffered() {
        return this.el.buffered
    }

    isError() {
        return !!this.el.error
    }

    getPlaybackRate() {
        return this.el.playbackRate
    }

    setPlaybackRate(rate: number) {
        this.el.playbackRate = rate
    }
}