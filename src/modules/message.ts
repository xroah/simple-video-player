import Transition from "./transition"

export interface MessageOptions {
    duration?: number
    content?: string
}

let uid = 0

export class Message extends Transition {
    public id = uid++

    constructor(
        parent: HTMLElement,
        { 
            duration, 
            content,
            ...restOptions 
        }: MessageOptions = {}
    ) {
        super("rplayer-message-item", {
            hideTimeout: duration ?? 3000,
            autoHide: true,
            removeOnHidden: true,
            ...restOptions
        })

        this.el.innerHTML = content ?? ""

        parent.appendChild(this.el)
    }
}