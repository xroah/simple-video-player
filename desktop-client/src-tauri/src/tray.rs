use std::{env, process};
use tauri::{AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, Wry};

enum TrayMenuItemType {
    ShowMainWindow,
    Quit,
}

impl Into<String> for TrayMenuItemType {
    fn into(self) -> String {
        match self {
            Self::ShowMainWindow => "showMainWindow".to_string(),
            Self::Quit => "quit".to_string(),
        }
    }
}

pub fn build() -> SystemTray {
    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new(
            TrayMenuItemType::ShowMainWindow,
            "显示窗口",
        ))
        .add_item(CustomMenuItem::new(TrayMenuItemType::Quit, "退出"));
    let tray = SystemTray::new().with_menu(tray_menu);

    tray
}

fn convert_type2string(t: TrayMenuItemType) -> String {
    <TrayMenuItemType as Into<String>>::into(t)
}

pub fn show_main_window(app: &AppHandle<Wry>) {
    if let Some(w) = app.get_window("main") {
        let _ = w.show();
        let _ = w.unminimize();
        w.set_focus().unwrap_or_else(|_| println!("Focused error!"));
    }
}

pub fn handle_system_tray_event(app: &AppHandle<Wry>, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            if env::consts::OS != "macos" {
                show_main_window(app);
            }
        }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            let show_menu = TrayMenuItemType::ShowMainWindow;
            let quit = TrayMenuItemType::Quit;

            if id == convert_type2string(show_menu) {
                show_main_window(app);
            } else if id == convert_type2string(quit) {
                process::exit(0);
            }
        }
        _ => (),
    }
}
