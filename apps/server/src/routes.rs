use asgard_protocol::{Channel, CreateChannelPayload, EditChannelPayload, Message, Realm};
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

pub async fn create_channel(
    State(state): State<AppState>,
    Path(realm_id): Path<Uuid>,
    Json(payload): Json<CreateChannelPayload>,
) -> Result<Json<Channel>, StatusCode> {
    if let Some(channel) = state
        .create_channel(realm_id, payload.name, payload.kind)
        .await
    {
        Ok(Json(channel))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

pub async fn edit_channel(
    State(state): State<AppState>,
    Path((realm_id, channel_id)): Path<(Uuid, Uuid)>,
    Json(payload): Json<EditChannelPayload>,
) -> Result<Json<Channel>, StatusCode> {
    if let Some(channel) = state.edit_channel(realm_id, channel_id, payload.name).await {
        Ok(Json(channel))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

pub async fn delete_channel(
    State(state): State<AppState>,
    Path((realm_id, channel_id)): Path<(Uuid, Uuid)>,
) -> Result<StatusCode, StatusCode> {
    if state.delete_channel(realm_id, channel_id).await {
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}
