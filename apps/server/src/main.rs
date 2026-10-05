mod routes;
mod state;
mod ws;

use std::net::SocketAddr;

use axum::{Router, routing::get};
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use tracing_subscriber::EnvFilter;

use crate::state::AppState;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "asgard_server=debug,tower_http=info".into()),
        )
        .init();

    let addr: SocketAddr = std::env::var("ASGARD_ADDR")
        .unwrap_or_else(|_| "127.0.0.1:8080".into())
        .parse()?;

    let state = AppState::with_seed_data();

    let app = Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/api/realms", get(routes::list_realms))
        .route("/api/channels/{id}/messages", get(routes::channel_messages))
        .route("/ws", get(ws::handler))
        // TODO: restringir origens antes de ir para produção.
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    tracing::info!("Asgard server ouvindo em http://{addr}");
    axum::serve(listener, app)
        .with_graceful_shutdown(async {
            tokio::signal::ctrl_c().await.ok();
        })
        .await?;
    Ok(())
}
