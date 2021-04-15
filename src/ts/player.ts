import EventEmitter from "./commons/event-emitter";
import Video from "./modules/video";
import Contextmenu, { ContextmenuItem } from "./modules/contextmenu"
import { addListener, removeAllListeners } from "./commons/dom-event"
import Control from "./modules/control"
import {
    isPlainObject,
    preventAndStop,
    createEl,
    getContainer
} from "./commons/utils"
import { CONTROL_BAR_HIDE_TIMEOUT, videoEvents } from "./constants"
import operation from "./builtin/plugins/operation";
interface RPlayerOptions {
    container: string | HTMLElement | Node
    // autoPlay?: boolean
    url: string
    defaultVolume?: number
    contextmenu?: ContextmenuItem[]
    poster?: string
    playOnClick?: boolean
    controlBarTimeout?: number
    plugins?: Plugins
}

interface PluginFunction {
    (rp: RPlayer): void
}

interface Plugin {
    install: (rp: RPlayer, options?: object) => void
    options?: object
}

type Plugins = Array<PluginFunction | Plugin>
export default class RPlayer extends EventEmitter {
    root: HTMLElement
    body: HTMLElement

    video: Video
    control: Control

    private _options: RPlayerOptions
    private _contextmenu: Contextmenu | null = null
    private _container: HTMLElement

    constructor(options: RPlayerOptions) {
        super()

        if (!isPlainObject(options)) {
            throw new Error("Options must be an object")
        }

        const container = getContainer(options.container)

        if (!container) {
            throw new Error("Can not find a container")
        }

        const el = createEl("div", "rplayer-root")
        const body = createEl("div", "rplayer-body")
        const controlBarTimeout = options.controlBarTimeout || CONTROL_BAR_HIDE_TIMEOUT
        const builtinPlugins: Plugins = [operation]

        this._options = options
        this.video = new Video(
            body,
            {
                url: options.url,
                poster: options.poster,
                defaultVolume: options.defaultVolume
            }
        )
        this.root = el
        this.body = body
        this.control = new Control(this, controlBarTimeout)
        this._container = container as HTMLElement

        this.installPlugins(builtinPlugins.concat(options.plugins || []))
        this.init()
    }

    private init() {
        this.root.tabIndex = -1

        this.initContextmenu()
        this.initEvents()

        this.root.appendChild(this.body)
        this._container.appendChild(this.root)
        this.control.showControlBar()
    }

    private initContextmenu() {
        const ctxMenu = this._options.contextmenu

        if (!ctxMenu || !ctxMenu.length) {
            return
        }

        this._contextmenu = new Contextmenu(this.root, this, ctxMenu)

        addListener(this.root, "contextmenu", this.handleContextMenu)
    }

    private handleContextMenu = (evt: MouseEvent) => {
        const { _contextmenu: ctxMenu } = this

        if (ctxMenu) {
            ctxMenu.setVisible(!ctxMenu.isVisible(), evt.clientX, evt.clientY)
        }

        preventAndStop(evt)
        this.emit(evt.type)
    }

    private initEvents() {
        videoEvents.forEach(
            (n: string) => addListener(
                this.video.el,
                n,
                this.handleVideoEvents
            )
        )
    }

    installPlugins(plugins: Plugins) {
        plugins.forEach(plugin => {
            if (typeof plugin === "function") {
                plugin(this)
            } else {
                plugin.install(this, plugin.options)
            }
        })
    }

    togglePlay() {
        const { video } = this

        if (video.isError()) {
            return
        }

        if (video.isPaused()) {
            video.play()
        } else {
            video.pause()
        }
    }

    private handleVideoEvents = (evt: Event) => {
        const type = evt.type
        /* const { video } = this

        switch (type) {
            case "loadstart":
                _loadState.setVisible(true)
                break
            case "waiting":
                _loadState.setVisible(true)
                break
            case "canplay":
                _loadState.setVisible(false)
                break
            case "error":
                _loadState.setVisible(true, "error", video.el.error)
                break
            case "progress":
                this.control.handleBuffer()
        } */

        this.emit(type)
    }

    destroy() {
        this.emit("destroy")
        this.control.destroy()
        this.root.parentNode?.removeChild(this.root)
        this._contextmenu?.destroy()
        removeAllListeners(this.video.el)
        removeAllListeners(this.root)
        removeAllListeners(this.body)
        this.off()
    }
}