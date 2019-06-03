import EventEmitter from "../event";

interface videoOptions {
    url: string
    poster?: string
}

export default class Player extends EventEmitter {
    el: HTMLVideoElement

    private _wrapper: HTMLElement

    constructor(options: videoOptions) {
        super()

        this.el = document.createElement("video")
        this.el.controls = false
        this.el.preload = "metadata"
        this._wrapper = document.createElement("div")
        this.el.src = options.url
        
        if (options.poster) {
            this.setPoster(options.poster)
        }
    }

    mountTo(container: HTMLElement) {
        this._wrapper.classList.add("rplayer-player-wrapper")
        this.el.classList.add("rplayer-player")
        this._wrapper.appendChild(this.el)
        container.appendChild(this._wrapper)
    }

    updateUrl(url: string) {
        if (!url) {
            return
        }

        this.el.src = url

        this.el.load()
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

    isError()  {
        return !!this.el.error
    }

    getPlaybackRate() {
        return this.el.playbackRate
    }

    setPlaybackRate(rate: number) {
        this.el.playbackRate = rate
    }
}