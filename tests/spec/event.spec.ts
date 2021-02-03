import EventEmitter, {EventObject} from "../../src/ts/event"

const noop1 = () => {}
const noop2 = () => {}

function addListener() {
    const e = new EventEmitter()

    e.on("test", noop1)
    e.on("test", noop2)
    e.on("test2", noop2)

    return e
}

describe("Add listener", () => {
    it("Should have listeners", () => {
        const e = addListener()
        const listeners = e.listeners("test")

        expect(listeners instanceof Array).toBeTrue()
        expect(listeners[0].fn).toBe(noop1)
        expect(listeners[1].fn).toBe(noop2)
    })

    it("Should listener unique", () => {
        const e = new EventEmitter()

        e.on("test", noop1)
        e.on("test", noop1)

        const listeners = e.listeners("test")

        expect(listeners.length).toBe(1)
    })

    it("Should get listeners and event names", () => {
        const e = addListener()
        
        expect(e.listenerCount("test")).toBe(2)
        expect(e.listeners("test2")[0].fn).toBe(noop2)
        expect(e.eventNames()).toEqual(["test", "test2"])
    })
})

describe("Remove listener", () => {
    it("Should remove specific listener", () => {
        const e = addListener()

        e.removeListener("test", noop1)
        e.removeListener("test2", noop2)

        const listeners = e.listeners("test")

        expect(listeners.length).toBe(1)
        expect(listeners[0].fn).toBe(noop2)
        expect(e.listeners("test2")).toEqual([])
    })

    it("Should listeners be removed when specified a event name", () => {
        const e = addListener()

        e.removeListener("test")

        expect(e.listeners("test")).toEqual([])
    })

    it("Should should remove all listeners", () => {
        const e = addListener()

        e.off()

        expect(e.eventNames()).toEqual([])
    })
})

describe("Emit listener", () => {
    it("Should be called orderly", () => {
        const spy1 = jasmine.createSpy()
        const spy2 = jasmine.createSpy()
        const e = new EventEmitter() 

        e.on("test", spy1)
        e.prependListener("test", spy2)
        e.emit("test")

        expect(spy2).toHaveBeenCalledBefore(spy1)
    })

    it("Should all listener should be called", () => {
        let calledArg: any
        const spy1 = jasmine.createSpy()
        const spy2 = jasmine.createSpy()
        const fn = (evt: EventObject) => calledArg = evt
        const e = new EventEmitter()

        e.on("test", spy1)
        e.on("test", spy2)
        e.on("test-arg", fn)
        e.emit("test")
        e.emit("test-arg", [1, 2, 3, 4])

        expect(spy1).toHaveBeenCalled()
        expect(spy2).toHaveBeenCalled()
        expect(spy1).toHaveBeenCalledBefore(spy2)
        expect(calledArg.type).toBe("test-arg")
        expect(calledArg.details).toEqual([1, 2, 3, 4])
        expect(calledArg.timeStamp).not.toBeUndefined()
    })

    it("Should be called once", () => {
        const spy = jasmine.createSpy()
        const e = new EventEmitter()

        e.once("test", spy)
        e.emit("test")
        e.emit("test")
        e.emit("test")

        expect(spy).toHaveBeenCalledTimes(1)
        expect(e.eventNames()).toEqual([])
    })
})