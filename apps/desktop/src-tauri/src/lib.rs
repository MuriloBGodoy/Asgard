//! Lado nativo do app desktop.
//!
//! Aqui entra tudo que o webview não faz bem: áudio/voz, overlay em jogos,
//! detecção do jogo em execução (rich presence), atalhos globais, tray, etc.
//! Exponha funcionalidades ao front com `#[tauri::command]`.

use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AppInfo {
    version: &'static str,
    server_url: String,
}

#[tauri::command]
fn app_info() -> AppInfo {
    AppInfo {
        version: env!("CARGO_PKG_VERSION"),
        server_url: std::env::var("ASGARD_SERVER_URL")
            .unwrap_or_else(|_| "http://127.0.0.1:8080".into()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![app_info])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o Asgard");
}
