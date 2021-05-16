import RPlayer from "../.."
import { addListener, removeListener } from "../../commons/dom-event"
import { EventObject } from "../../commons/event-emitter"

const fullscreenApi = (() => {
    const el = document.createElement("el")
    const apis = [{
        request: "requestFullscreen",
        exit: "exitFullscreen",
        element: "fullscreenElement",
        change: "fullscreenchange",
        error: "fullscreenerror"
    }, {
        request: "webkitRequestFullscreen",
        exit: "webkitExitFullscreen",
        element: "webkitFullscreenElement",
        change: "webkitfullscreenchange",
        error: "webkitfullscreenerror"
    }, {
        request: "mozRequestFullscreen",
        exit: "mozFullscreen",
        element: "mozFullscreenElement",
        change: "mozfullscreenchange",
        error: "mozfullscreenerror"
    }]
    let ret: any = {
        hasApi: false
    }

    for (let val of apis) {
        if (val.request in el) {
            ret = val
            ret.hasApi = true

            break
        }
    }

    return ret
})()

export default function requestFullscreen(rp: RPlayer) {
    const video = rp.video.el as any

    if (!fullscreenApi.hasApi) {
        //ios
        if (video.webkitEnterFullScreen) {
            video.webkitEnterFullScreen()
        }

        return
    }

    const doc = document as any
    const toggleFS = () => {
        const root = rp.root as any

        if (!getEl()) {
            root[fullscreenApi.request]()
        } else {
            doc[fullscreenApi.exit]()
        }
    }
    const getEl = () => doc[fullscreenApi.element]
    const handleKeydown = (evt: EventObject) => {
        if (evt.details === "enter") {
            toggleFS()
        }
    }
    const handleFSChange = () => {
        const {classList} = rp.root
        const fn: "add" | "remove" = getEl() ? "add" : "remove"

        classList[fn]("rplayer-fullscreen")
    }

    addListener(document, fullscreenApi.change, handleFSChange)
    rp
        .on("keydown", handleKeydown)
        .on("fullscreen", toggleFS)
        .once(
            "destroy",
            () => removeListener(document, fullscreenApi.change, handleFSChange)
        )
}