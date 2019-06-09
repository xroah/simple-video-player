import {
    addListener,
    removeListener,
    removeAllListeners,
    LISTENER_KEY
} from "../src/ts/dom"

function createBtn() {
    const btn = document.createElement("button")

    document.body.appendChild(btn)

    return btn
}

function getListeners(el: HTMLElement, eventName = "click") {
    const map = (el as any)[LISTENER_KEY]

    return map ? map.get(eventName) : undefined
}

describe("Event listener", () => {
    it("Should be called", () => {
        const btn = createBtn()
        const fn1 = jasmine.createSpy()
        const fn2 = jasmine.createSpy()

        addListener(btn, "click", fn1)
        addListener(btn, "focus", fn2)
        btn.click()
        btn.focus()

        expect(fn1).toHaveBeenCalled()
        expect(fn2).toHaveBeenCalled()
        expect(getListeners(btn).length).toBe(1)
        expect(getListeners(btn, "focus").length).toBe(1)
    })

    it("Should be called once", () => {
        const btn = createBtn()
        const fn = jasmine.createSpy()

        addListener(btn, "click", fn, {once: true})
        btn.click()
        btn.click()

        expect(fn).toHaveBeenCalledTimes(1)
        expect(getListeners(btn)).toBeUndefined()
    })

    it("Should add only once", () => {
        const btn = createBtn()
        const fn1 = jasmine.createSpy()
        const fn2 = jasmine.createSpy()

        addListener(btn, "click", fn1)
        addListener(btn, "click", fn1, {passive: false})

        addListener(btn, "click", fn2, {capture: true})
        addListener(btn, "click", fn2, true)

        btn.click()

        expect(fn1).toHaveBeenCalledTimes(1)
        expect(fn2).toHaveBeenCalledTimes(1)
        expect(getListeners(btn).length).toBe(2)
    })

    it("Should be add multiple times if capture is different", () => {
        const btn = createBtn()
        const fn = jasmine.createSpy()

        addListener(btn, "click", fn)
        addListener(btn, "click", fn, true)

        btn.click()

        expect(fn).toHaveBeenCalledTimes(2)
        expect(getListeners(btn).length).toBe(2)
    })

    it("Should all be removed", () => {
        const btn = createBtn()
        const fn1 = jasmine.createSpy()
        const fn2 = jasmine.createSpy()

        addListener(btn, "click", fn1)
        addListener(btn, "click", fn1, true)
        addListener(btn, "click", fn2)
        addListener(btn, "click", fn2, true)

        removeAllListeners(btn)

        btn.click()

        expect(fn1).toHaveBeenCalledTimes(0)
        expect(fn2).toHaveBeenCalledTimes(0)
        expect(getListeners(btn)).toBeUndefined()
    })

    it("Should a specified event name be removed", () => {
        const btn = createBtn()
        const fn1 = jasmine.createSpy()
        const fn2 = jasmine.createSpy()

        addListener(btn, "click", fn1)
        addListener(btn, "focus", fn2)

        removeListener(btn, "focus")

        btn.click()

        expect(fn1).toHaveBeenCalled()
        expect(fn2).toHaveBeenCalledTimes(0)
        expect(getListeners(btn, "focus")).toBeUndefined()
    })

    it("Should a specified listener be removed", () => {
        const btn = createBtn()
        const fn1 = jasmine.createSpy()
        const fn2 = jasmine.createSpy()

        addListener(btn, "click", fn1, true)
        addListener(btn, "click", fn2)

        btn.click()

        removeListener(btn, "click", fn1, true)

        btn.click()

        expect(fn1).toHaveBeenCalledTimes(1)
        expect(fn2).toHaveBeenCalledTimes(2)
        expect(getListeners(btn)[0].fn === fn2).toBeTrue()
    })

    it("Should listeners should be removed if capture is not same", () => {
        const btn = createBtn()
        const fn1 = jasmine.createSpy()
        const fn2 = jasmine.createSpy()

        addListener(btn, "click", fn1, true)
        addListener(btn, "click", fn2)

        btn.click()

        removeListener(btn, "click", fn1)

        btn.click()

        expect(fn1).toHaveBeenCalledTimes(2)
        expect(fn2).toHaveBeenCalledTimes(2)
        expect(getListeners(btn).length).toBe(2)
    })
})