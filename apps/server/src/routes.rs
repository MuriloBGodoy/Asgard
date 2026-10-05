use asgard_protocol::{Message, Realm};
use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use uuid::Uuid;

use crate::state::AppState;

pub async fn list_realms(State(state): State<AppState>) -> Json<Vec<Realm>> {
    Json(state.realms().await)
}

pub async fn channel_messages(
    State(state): State<AppState>,
    Path(channel_id): Path<Uuid>,
) -> Result<Json<Vec<Message>>, StatusCode> {
    if !state.channel_exists(channel_id).await {
        return Err(StatusCode::NOT_FOUND);
    }
    Ok(Json(state.messages(channel_id).await))
}
