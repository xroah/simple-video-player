import Player from ".."

export interface ControlBarOptions {
    showMiniProgress?: boolean
}

export interface PlayerOptions extends
    OptionsWithAddons, ControlBarOptions {
    container: string | HTMLElement | Node
    src: string
    poster?: string
    controlBarTimeout?: number
    extensions?: Array<Extension | ExtensionFn>
    contextmenu?: false | ContextmenuOptions
    // for mouse or pen: click toggle play, dblclick toggle fullscreen
    defaultPointerAction?: boolean
}

// contextmenu
export type Action = (play: Player) => void

export interface ContextmenuItem {
    className?: string
    text: string
    action: Action
}

export interface BeforeShowCallback {
    (ev: PointerEvent, el: HTMLElement): boolean
}

export type ContextmenuOptions = ContextmenuItem[] | {
    items: ContextmenuItem[],
    beforeShow?: BeforeShowCallback
}
export interface ExtensionFn {
    (player: Player, options?: unknown): unknown
}

export interface Extension {
    options?: unknown
    install: ExtensionFn
}

export type AddonFunction = {
    (
        el: HTMLElement,
        player: Player,
        options?: unknown
    ): unknown
}

export interface Addon {
    tag?: string
    classNames?: string[]
    options?: unknown
    install: AddonFunction
}

export type AddonArray = Array<Array<Addon | AddonFunction>>

export interface OptionsWithAddons {
    addons?: AddonArray
}