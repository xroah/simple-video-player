import Player from ".."

export interface TooltipCallback {
    onTooltipUpdate?: (el: HTMLElement, v: number) => void
}

export interface PlayerOptions extends
    OptionsWithAddons, TooltipCallback {
    container: string | HTMLElement | Node
    src: string
    poster?: string
    controlBarTimeout?: number
    extensions?: Array<Extension | ExtensionFn>
}

// contextmenu
export type Action = (play: Player, el: HTMLElement) => void

export interface ContextmenuItem {
    className?: string
    text: string
    action: Action
}

export interface BeforeShowCallback {
    (ev: MouseEvent, el: HTMLElement): boolean
}

export type ContextmenuOptions = ContextmenuItem[] | {
    items: ContextmenuItem[],
    beforeShow?: BeforeShowCallback
}
export interface ExtensionFn {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (player: Player, options?: any): unknown
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

// slider
export interface SliderOptions extends TooltipCallback {
    buffer?: boolean
    tooltip?: boolean | ((v: number) => string)
}

export interface Position {
    clientX: number
    clientY: number
    type?: string
}

export interface Details {
    value: number,
    type?: string
}