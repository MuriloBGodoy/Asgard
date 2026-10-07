//! Protocolo compartilhado entre o servidor e o app desktop.
//!
//! Todo tipo com `#[ts(export)]` vira um arquivo `.ts` em
//! `apps/desktop/src/bindings` ao rodar `npm run bindings`.
//! Mudou algo aqui? Regenere os bindings e faça commit junto.

use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

pub const MAX_MESSAGE_LEN: usize = 2000;
pub const USERNAME_LEN: std::ops::RangeInclusive<usize> = 2..=32;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub enum UserStatus {
    Online,
    Away,
    Busy,
    Invisible,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub status: UserStatus,
}

/// Um "Realm" é o equivalente a um servidor do Discord / time do Teams.
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Realm {
    pub id: Uuid,
    pub name: String,
    pub kind: RealmKind,
    pub channels: Vec<Channel>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub enum RealmKind {
    Gaming,
    Work,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Channel {
    pub id: Uuid,
    pub realm_id: Uuid,
    pub name: String,
    pub kind: ChannelKind,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub enum ChannelKind {
    Text,
    Voice,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct CreateChannelPayload {
    pub name: String,
    pub kind: ChannelKind,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct EditChannelPayload {
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Message {
    pub id: Uuid,
    pub channel_id: Uuid,
    pub author: User,
    pub content: String,
    /// Unix epoch em milissegundos.
    #[ts(type = "number")]
    pub sent_at: i64,
}

// ---------------------------------------------------------------------------
// Gateway (WebSocket). Formato no fio: { "type": "...", "data": { ... } }
// ---------------------------------------------------------------------------

/// Eventos enviados pelo cliente.
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(tag = "type", content = "data", rename_all = "camelCase")]
#[ts(export)]
pub enum ClientEvent {
    /// Deve ser o primeiro evento aps conectar.
    Identify(Identify),
    SendMessage(SendMessage),
    JoinVoice(JoinVoice),
    LeaveVoice,
    UpdateVoiceState(UpdateVoiceState),
    UpdateUserStatus(UpdateUserStatus),
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct UpdateUserStatus {
    pub status: UserStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct UpdateVoiceState {
    pub mic_muted: bool,
    pub deafened: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct JoinVoice {
    pub channel_id: Uuid,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Identify {
    pub username: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct SendMessage {
    pub channel_id: Uuid,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct VoiceParticipant {
    pub user: User,
    pub mic_muted: bool,
    pub deafened: bool,
}

/// Eventos enviados pelo servidor.
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(tag = "type", content = "data", rename_all = "camelCase")]
#[ts(export)]
pub enum ServerEvent {
    Ready(Ready),
    MessageCreated(Message),
    UserJoined(User),
    UserLeft(User),
    UserUpdated(User),
    VoicePresenceUpdated(VoicePresenceUpdated),
    Error(ErrorPayload),
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct VoicePresenceUpdated {
    pub channel_id: Uuid,
    pub participants: Vec<VoiceParticipant>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Ready {
    pub user: User,
    pub realms: Vec<Realm>,
    pub online: Vec<User>,
    /// Mapa de channel_id -> usuarios conectados com status de voz
    pub voice_states: std::collections::HashMap<Uuid, Vec<VoiceParticipant>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ErrorPayload {
    pub message: String,
}
