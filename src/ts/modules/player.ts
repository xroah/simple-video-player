import EventEmitter from "../commons/event-emitter"
import Video from "./video"
import {
    addListener,
    removeAllListeners
} from "../commons/dom-event"
import {
    isPlainObject,
    createEl,
    getContainer
} from "../commons/utils"
import ControlBar, { AddonOptions } from "./control-bar"
import {
    CONTROL_BAR_HIDE_TIMEOUT,
    videoEvents
} from "../commons/constants"
import operation from "../builtin/plugins/operation"
import loadState from "../builtin/plugins/load-state"
import playState from "../builtin/plugins/play-state"
import requestFullscreen from "../builtin/plugins/fullscreen"
import MessageManager from "./message-manager"
import FeedbackInfo from "./feedback-info"
import control from "../builtin/plugins/control"
import mousemove from "../builtin/plugins/mousemove"
import classNames from "../commons/class-names"

interface RPlayerOptions {
    container: string | HTMLElement | Node
    url: string
    defaultVolume?: number
    poster?: string
    controlBarTimeout?: number
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
    // actionable plugin/addon mount to root
    root: HTMLElement
    // others mount to body
    body: HTMLElement

    video: Video
    message: MessageManager
    feedback: FeedbackInfo
    options: RPlayerOptions
    controlBar: ControlBar

    private _container: HTMLElement

    private _installedPlugins: Plugins = []
    private _additionData: AdditionData = {}

    constructor(options: RPlayerOptions) {
        super()

        if (!isPlainObject(options)) {
            throw new Error("Options must be an object")
        }

        const container = getContainer(options.container) as HTMLElement

        if (!container) {
            throw new Error("Can not find a container")
        }

        if (container.firstElementChild) {
            throw new Error("The container is not empty, please try another")
        }

        const el = createEl("div", classNames.modules.ROOT)
        const body = createEl("div", classNames.modules.BODY)
        const controlBarTimeout = options.controlBarTimeout ||
            CONTROL_BAR_HIDE_TIMEOUT

        this._container = container 

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
        this.message = new MessageManager(el)
        this.feedback = new FeedbackInfo(body)
        this.controlBar = new ControlBar(this, controlBarTimeout)

        this.init()
    }

    private init() {
        this.root.tabIndex = -1

        this.initEvents()
        this.installPlugins(this.options.plugins || [])

        this.root.append(this.body)
        this._container.append(this.root)
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
        this.emit(evt.type, evt)
    }

    private installPlugins(plugins: Plugins) {
        const builtinPlugins: Plugins = [
            operation,
            loadState,
            playState,
            requestFullscreen,
            control,
            mousemove
        ]
        plugins = [...builtinPlugins, ...plugins]

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

        if (video.error) {
            return
        }

        if (video.paused) {
            video.play()
        } else {
            video.pause()
        }
    }

    destroy() {
        this.emit("destroy")

        this.off()
        this.controlBar.destroy()
        this.root.remove()

        removeAllListeners(this.video.el)
        removeAllListeners(this.root)
        removeAllListeners(this.body)
    }
}