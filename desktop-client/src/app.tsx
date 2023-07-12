import { useEffect } from "react"
import {TauriEvent, listen} from "@tauri-apps/api/event"

function App() {
    useEffect(
        () => {
            listen(TauriEvent.WINDOW_CLOSE_REQUESTED, e => {
                if (e.windowLabel === "main") {
                    console.log("closing")
                }
            })
        },
        []
    )

    return (
        <div className="container">
            
        </div>
    )
}

export default App
