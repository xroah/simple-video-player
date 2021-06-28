import { Player } from "../.."
import classNames from "../../commons/class-names"
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

export default function requestFullscreen(p: Player) {
    const video = p.video.el as any

    if (!fullscreenApi.hasApi) {
        //ios
        if (video.webkitEnterFullScreen) {
            video.webkitEnterFullScreen()
        }

        return
    }

    const doc = document as any
    const toggleFS = () => {
        const root = p.root as any

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
        const { classList } = p.root
        const fn = getEl() ? "add" : "remove"

        classList[fn](classNames.commons.FULLSCREEN)
    }

    addListener(document, fullscreenApi.change, handleFSChange)
    p
        .on("keydown", handleKeydown)
        .on("fullscreen", toggleFS)
        .once(
            "destroy",
            () => removeListener(
                document,
                fullscreenApi.change,
                handleFSChange
            )
        )
}