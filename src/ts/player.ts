import EventEmitter from "./commons/event-emitter"
import Video from "./modules/video"
import Contextmenu, { ContextmenuItem } from "./modules/contextmenu"
import { addListener, removeAllListeners } from "./commons/dom-event"
import Control from "./modules/control"
import {
    isPlainObject,
    createEl,
    getContainer
} from "./commons/utils"
import { AddonOptions } from "./modules/control-bar"
import { CONTROL_BAR_HIDE_TIMEOUT, videoEvents } from "./commons/constants"
import operation from "./builtin/plugins/operation"
import loadState from "./builtin/plugins/load-state"
import switchState from "./builtin/plugins/switch-state"
import requestFullscreen from "./builtin/plugins/fullscreen"
import MessageManager from "./modules/message-manager"
import FeedbackInfo from "./modules/feedback-info"

interface RPlayerOptions {
    container: string | HTMLElement | Node
    url: string
    defaultVolume?: number
    contextmenu?: ContextmenuItem[]
    poster?: string
    controlBarTimeout?: number
    showProgressTooltip?: boolean
    plugins?: Plugins
    addons?: AddonOptions[]
}

interface PluginFunction {
    (p: Player): void
}

interface Plugin {
    install: (p: Player, options?: object) => void
    options?: object
}

interface AdditionData {
    [name: string]: any
}

type Plugins = Array<PluginFunction | Plugin>
export default class Player extends EventEmitter {
    root: HTMLElement
    body: HTMLElement

    video: Video
    control: Control
    message: MessageManager
    feedback: FeedbackInfo
    options: RPlayerOptions

    private _contextmenu: Contextmenu | null = null
    private _container: HTMLElement

    private _installedPlugins: Plugins = []
    private _additionData: AdditionData = {}

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

        this._container = container as HTMLElement

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
        this.options = options
        this.control = new Control(this, controlBarTimeout)
        this.message = new MessageManager(el)
        this.feedback = new FeedbackInfo(el)

        this.init()
    }

    private init() {
        const builtinPlugins: Plugins = [
            operation,
            loadState,
            switchState,
            requestFullscreen
        ]
        const plugins = builtinPlugins.concat(this.options.plugins || [])
        this.root.tabIndex = -1

        this.initContextmenu()
        this.initEvents()
        this.installPlugins(plugins)
        //show pause feedback
        this.feedback.showInfo("pause")

        this.root.appendChild(this.body)
        this._container.appendChild(this.root)
    }

    private initContextmenu() {
        const ctxMenu = this.options.contextmenu

        if (!ctxMenu || !ctxMenu.length) {
            return
        }

        this._contextmenu = new Contextmenu(this, ctxMenu)
    }

    private initEvents() {
        const {
            video: { el },
            handleVideoEvents
        } = this

        videoEvents.forEach(
            (n: string) => addListener(el, n, handleVideoEvents)
        )
    }

    private handleVideoEvents = (evt: Event) => {
        const type = evt.type

        switch (type) {
            case "play":
                if (this.feedback.currentInfo === "pause") {
                    this.feedback.setVisible(false)
                }
                break
            case "pause":
                this.feedback.showInfo("pause")
                break
        }

        this.emit(type, evt)
    }

    private installPlugins(plugins: Plugins) {
        plugins.forEach(plugin => {
            if (this._installedPlugins.indexOf(plugin) >= 0) {
                return
            }

            if (typeof plugin === "function") {
                plugin(this)
            } else {
                plugin.install(this, plugin.options)
            }

            this._installedPlugins.push(plugin)
        })
    }

    setAdditionData(name: string, val: any) {
        this._additionData[name] = val
    }

    getAdditionData(name: string) {
        return this._additionData[name]
    }

    togglePlay() {
        const { video } = this

        if (video.getError()) {
            return
        }

        if (video.isPaused()) {
            video.play()
        } else {
            video.pause()
        }
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