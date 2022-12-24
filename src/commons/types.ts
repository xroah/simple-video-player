import Player from ".."

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