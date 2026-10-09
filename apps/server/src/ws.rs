use asgard_protocol::{
    ClientEvent, ErrorPayload, Identify, MAX_MESSAGE_LEN, Ready, SendMessage, ServerEvent,
    USERNAME_LEN, User,
};
use axum::{
    extract::{
        State,
        ws::{Message as WsMessage, WebSocket, WebSocketUpgrade},
    },
    response::Response,
};
use futures_util::{SinkExt, StreamExt, stream::SplitSink};
use tokio::sync::{broadcast::error::RecvError, mpsc};
use uuid::Uuid;

use crate::state::AppState;

pub async fn handler(ws: WebSocketUpgrade, State(state): State<AppState>) -> Response {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: AppState) {
    let (sink, mut stream) = socket.split();

    // Toda escrita no socket passa por este canal, assim a task de broadcast
    // e o loop de leitura podem enviar eventos sem disputar o `sink`.
    let (tx, rx) = mpsc::unbounded_channel::<ServerEvent>();
    let writer = tokio::spawn(write_loop(sink, rx));

    // 1. Handshake: o primeiro evento precisa ser `identify`.
    let mut user = loop {
        match next_event(&mut stream).await {
            Some(Ok(ClientEvent::Identify(Identify { username }))) => {
                let username = username.trim().to_owned();
                if USERNAME_LEN.contains(&username.chars().count()) {
                    break User {
                        id: Uuid::new_v4(),
                        username,
                        status: asgard_protocol::UserStatus::Online,
                        avatar_url: None,
                        banner_color: None,
                        bio: None,
                    };
                }
                send_error(&tx, "username deve ter entre 2 e 32 caracteres");
            }
            Some(Ok(_)) => send_error(&tx, "envie `identify` antes de qualquer outro evento"),
            Some(Err(err)) => send_error(&tx, &format!("evento inválido: {err}")),
            None => {
                writer.abort();
                return;
            }
        }
    };

    tracing::info!(user = %user.username, "conectado");

    // Inscreve antes de anunciar a entrada para não perder eventos.
    let mut events = state.subscribe();
    let online = state.connect(user.clone()).await;
    let _ = tx.send(ServerEvent::Ready(Ready {
        user: user.clone(),
        realms: state.realms().await,
        online,
        voice_states: state.voice_states().await,
    }));

    // 2. Repassa eventos globais para este cliente.
    let forward_tx = tx.clone();
    let forwarder = tokio::spawn(async move {
        loop {
            match events.recv().await {
                Ok(event) => {
                    if forward_tx.send(event).is_err() {
                        break;
                    }
                }
                Err(RecvError::Lagged(skipped)) => {
                    tracing::warn!(skipped, "cliente lento, eventos descartados");
                }
                Err(RecvError::Closed) => break,
            }
        }
    });

    // 3. Processa eventos do cliente até ele desconectar.
    while let Some(event) = next_event(&mut stream).await {
        match event {
            Ok(ClientEvent::SendMessage(SendMessage {
                channel_id,
                content,
            })) => {
                let content = content.trim().to_owned();
                if content.is_empty() || content.chars().count() > MAX_MESSAGE_LEN {
                    send_error(&tx, "mensagem vazia ou longa demais");
                } else if !state.channel_exists(channel_id).await {
                    send_error(&tx, "canal não encontrado");
                } else {
                    state.post_message(user.clone(), channel_id, content).await;
                }
            }
            Ok(ClientEvent::JoinVoice(payload)) => {
                state
                    .join_voice(
                        user.clone(),
                        payload.channel_id,
                        payload.mic_muted,
                        payload.deafened,
                    )
                    .await;
            }
            Ok(ClientEvent::LeaveVoice) => {
                state.leave_voice(&user).await;
            }
            Ok(ClientEvent::UpdateVoiceState(payload)) => {
                state
                    .update_voice_state(&user, payload.mic_muted, payload.deafened)
                    .await;
            }
            Ok(ClientEvent::UpdateUserStatus(payload)) => {
                user.status = payload.status;
                state.update_user(&user).await;
            }
            Ok(ClientEvent::UpdateProfile(payload)) => {
                if let Some(username) = payload.username {
                    let trimmed = username.trim().to_owned();
                    if USERNAME_LEN.contains(&trimmed.chars().count()) {
                        user.username = trimmed;
                    }
                }
                if let Some(avatar) = payload.avatar_url {
                    user.avatar_url = if avatar.is_empty() {
                        None
                    } else {
                        Some(avatar)
                    };
                }
                if let Some(banner) = payload.banner_color {
                    user.banner_color = if banner.is_empty() {
                        None
                    } else {
                        Some(banner)
                    };
                }
                if let Some(bio) = payload.bio {
                    user.bio = if bio.is_empty() { None } else { Some(bio) };
                }
                state.update_user(&user).await;
            }
            Ok(ClientEvent::Identify(_)) => send_error(&tx, "já identificado"),
            Err(err) => send_error(&tx, &format!("evento inválido: {err}")),
        }
    }

    forwarder.abort();
    writer.abort();
    state.disconnect(&user).await;
    tracing::info!(user = %user.username, "desconectado");
}

/// Lê o próximo evento de texto do socket. `None` = conexão encerrada.
async fn next_event(
    stream: &mut futures_util::stream::SplitStream<WebSocket>,
) -> Option<Result<ClientEvent, serde_json::Error>> {
    while let Some(Ok(msg)) = stream.next().await {
        match msg {
            WsMessage::Text(text) => return Some(serde_json::from_str(text.as_str())),
            WsMessage::Close(_) => return None,
            // Ping/Pong são respondidos automaticamente pelo axum.
            _ => continue,
        }
    }
    None
}

async fn write_loop(
    mut sink: SplitSink<WebSocket, WsMessage>,
    mut rx: mpsc::UnboundedReceiver<ServerEvent>,
) {
    while let Some(event) = rx.recv().await {
        let Ok(json) = serde_json::to_string(&event) else {
            continue;
        };
        if sink.send(WsMessage::Text(json.into())).await.is_err() {
            break;
        }
    }
}

fn send_error(tx: &mpsc::UnboundedSender<ServerEvent>, message: &str) {
    let _ = tx.send(ServerEvent::Error(ErrorPayload {
        message: message.into(),
    }));
}
