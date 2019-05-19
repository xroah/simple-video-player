export default class Listener {
    fn: Function
    once: boolean

    constructor(fn: Function, once = false) {
        this.fn = fn
        this.once = once
    }
}