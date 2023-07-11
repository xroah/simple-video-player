use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu};

pub fn build() -> SystemTray {
    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("", "显示窗口"))
        .add_item(CustomMenuItem::new("", "退出"));
    let tray = SystemTray::new().with_menu(tray_menu);

    tray
}
