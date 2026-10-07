use axum::{
    extract::Query,
    http::StatusCode,
    Json,
};
use livekit_api::access_token::{AccessToken, VideoGrants};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Deserialize)]
pub struct TokenQuery {
    pub room: String,
    pub participant_name: String,
}

#[derive(Serialize)]
pub struct TokenResponse {
    pub token: String,
    pub livekit_url: String,
}

/// Rota para gerar um token de acesso ao LiveKit.
/// Na verso final, o `participant_name` (ou ID) e as permisses 
/// viriam da sesso autenticada do usurio.
pub async fn generate_token(
    Query(query): Query<TokenQuery>,
) -> Result<Json<TokenResponse>, StatusCode> {
    let api_key = std::env::var("LIVEKIT_API_KEY").map_err(|_| {
        tracing::error!("LIVEKIT_API_KEY não configurada no .env");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    let api_secret = std::env::var("LIVEKIT_API_SECRET").map_err(|_| {
        tracing::error!("LIVEKIT_API_SECRET não configurada no .env");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    let livekit_url = std::env::var("LIVEKIT_URL").map_err(|_| {
        tracing::error!("LIVEKIT_URL não configurada no .env");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // ID do participante pode ser gerado provisoriamente aqui para o demo,
    // ou podemos adicionar `participant_id` na query se preferir.
    let participant_id = Uuid::new_v4().to_string();

    let token = AccessToken::with_api_key(&api_key, &api_secret)
        .with_identity(&participant_id)
        .with_name(&query.participant_name)
        .with_grants(VideoGrants {
            room_join: true,
            room: query.room.clone(),
            ..Default::default()
        })
        .to_jwt()
        .map_err(|e| {
            tracing::error!("Erro ao gerar token do LiveKit: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(TokenResponse { token, livekit_url }))
}
