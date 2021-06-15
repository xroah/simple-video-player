import { createEl, isUndef } from "../commons/utils"
import EventEmitter from "../commons/event-emitter"

interface videoOptions {
    url: string
    poster?: string
    defaultVolume?: number
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
        const { poster, defaultVolume = 0 } = options
        let volume = 50

        if (poster) {
            this.setPoster(poster)
        }

        if (!isUndef(defaultVolume)) {
            volume = +defaultVolume || volume
        }

        this.volume = (volume / 100)

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

    get paused() {
        return this.el.paused
    }

    get ended() {
        return this.el.ended
    }

    setPoster(poster: string) {
        this.el.poster = poster
    }

    set muted(mute: boolean) {
        this.el.muted = mute
    }

    get muted() {
        return this.el.muted
    }

    set volume(volume: number) {
        this.el.volume = volume
    }

    get volume() {
        return this.el.volume
    }

    getPercentVolume() {
        return Math.round(this.volume * 100)
    }

    setPercentVolume(volume: number) {
        this.volume = volume / 100
    }

    get currentTime() {
        return this.el.currentTime
    }

    set currentTime(time: number) {
        this.el.currentTime = time || 0
    }

    get duration() {
        return this.el.duration
    }

    get currentSrc() {
        return this.el.currentSrc
    }

    get buffered() {
        return this.el.buffered
    }

    get error() {
        return this.el.error
    }

    get playbackRate() {
        return this.el.playbackRate
    }

    set playbackRate(rate: number) {
        this.el.playbackRate = rate
    }

    set autoplay(autoPlay: boolean) {
        this.el.autoplay = autoPlay
    }

    get autoplay() {
        return this.el.autoplay
    }

    set loop(loop: boolean) {
        this.el.loop = loop
    }

    get loop() {
        return this.el.loop
    }

    get seekable() {
        return this.el.seekable
    }

    get readySate() {
        return this.el.readyState
    }

    get seeking() {
        return this.el.seeking
    }
}