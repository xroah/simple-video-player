// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rplayer::tray;
use tauri::WindowEvent;

fn main() {
    tauri::Builder::default()
        .system_tray(tray::build())
        .on_system_tray_event(tray::handle_system_tray_event)
        .on_window_event(|event| match event.event() {
            WindowEvent::CloseRequested { api, .. } => {
                let win = event.window();

                if win.label() == "main" {
                    let _ = win.hide();
                    api.prevent_close();
                }
            },
            _ => (),
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
