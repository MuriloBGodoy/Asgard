use std::{
    collections::HashMap,
    sync::Arc,
    time::{SystemTime, UNIX_EPOCH},
};

use asgard_protocol::{Channel, ChannelKind, Message, Realm, RealmKind, ServerEvent, User};
use tokio::sync::{RwLock, broadcast};
use uuid::Uuid;

/// Quantas mensagens por canal ficam em memória.
const HISTORY_LIMIT: usize = 200;

/// Estado compartilhado do servidor.
///
/// Por enquanto tudo vive em memória. O próximo passo natural é trocar
/// `realms`/`messages` por Postgres (sqlx) mantendo a mesma interface.
#[derive(Clone)]
pub struct AppState {
    inner: Arc<Inner>,
}

struct Inner {
    realms: RwLock<Vec<Realm>>,
    messages: RwLock<HashMap<Uuid, Vec<Message>>>,
    online: RwLock<HashMap<Uuid, User>>,
    events: broadcast::Sender<ServerEvent>,
}

impl AppState {
    pub fn with_seed_data() -> Self {
        let (events, _) = broadcast::channel(1024);
        Self {
            inner: Arc::new(Inner {
                realms: RwLock::new(seed_realms()),
                messages: RwLock::default(),
                online: RwLock::default(),
                events,
            }),
        }
    }

    pub async fn realms(&self) -> Vec<Realm> {
        self.inner.realms.read().await.clone()
    }

    pub async fn channel_exists(&self, channel_id: Uuid) -> bool {
        self.inner
            .realms
            .read()
            .await
            .iter()
            .flat_map(|r| &r.channels)
            .any(|c| c.id == channel_id && c.kind == ChannelKind::Text)
    }

    pub async fn create_channel(&self, realm_id: Uuid, name: String, kind: ChannelKind) -> Option<Channel> {
        let mut realms = self.inner.realms.write().await;
        let realm = realms.iter_mut().find(|r| r.id == realm_id)?;
        let channel = Channel {
            id: Uuid::new_v4(),
            realm_id,
            name,
            kind,
        };
        realm.channels.push(channel.clone());
        Some(channel)
    }

    pub async fn edit_channel(&self, realm_id: Uuid, channel_id: Uuid, name: String) -> Option<Channel> {
        let mut realms = self.inner.realms.write().await;
        let realm = realms.iter_mut().find(|r| r.id == realm_id)?;
        let channel = realm.channels.iter_mut().find(|c| c.id == channel_id)?;
        channel.name = name;
        Some(channel.clone())
    }

    pub async fn delete_channel(&self, realm_id: Uuid, channel_id: Uuid) -> bool {
        let mut realms = self.inner.realms.write().await;
        let realm = match realms.iter_mut().find(|r| r.id == realm_id) {
            Some(r) => r,
            None => return false,
        };
        let len_before = realm.channels.len();
        realm.channels.retain(|c| c.id != channel_id);
        realm.channels.len() < len_before
    }

    pub async fn messages(&self, channel_id: Uuid) -> Vec<Message> {
        self.inner
            .messages
            .read()
            .await
            .get(&channel_id)
            .cloned()
            .unwrap_or_default()
    }

    pub async fn post_message(&self, author: User, channel_id: Uuid, content: String) -> Message {
        let message = Message {
            id: Uuid::new_v4(),
            channel_id,
            author,
            content,
            sent_at: now_millis(),
        };
        {
            let mut messages = self.inner.messages.write().await;
            let history = messages.entry(channel_id).or_default();
            history.push(message.clone());
            if history.len() > HISTORY_LIMIT {
                let overflow = history.len() - HISTORY_LIMIT;
                history.drain(..overflow);
            }
        }
        self.broadcast(ServerEvent::MessageCreated(message.clone()));
        message
    }

    pub async fn connect(&self, user: User) -> Vec<User> {
        let mut online = self.inner.online.write().await;
        online.insert(user.id, user.clone());
        self.broadcast(ServerEvent::UserJoined(user));
        online.values().cloned().collect()
    }

    pub async fn disconnect(&self, user: &User) {
        self.inner.online.write().await.remove(&user.id);
        self.broadcast(ServerEvent::UserLeft(user.clone()));
    }

    pub fn subscribe(&self) -> broadcast::Receiver<ServerEvent> {
        self.inner.events.subscribe()
    }

    fn broadcast(&self, event: ServerEvent) {
        // Erro aqui só significa que ninguém está conectado.
        let _ = self.inner.events.send(event);
    }
}

fn now_millis() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or_default()
}

fn seed_realms() -> Vec<Realm> {
    let realm = |name: &str, kind: RealmKind, channels: &[(&str, ChannelKind)]| {
        let id = Uuid::new_v4();
        Realm {
            id,
            name: name.into(),
            kind,
            channels: channels
                .iter()
                .map(|(name, kind)| Channel {
                    id: Uuid::new_v4(),
                    realm_id: id,
                    name: (*name).into(),
                    kind: *kind,
                })
                .collect(),
        }
    };

    vec![
        realm(
            "Valhalla",
            RealmKind::Gaming,
            &[
                ("geral", ChannelKind::Text),
                ("lfg", ChannelKind::Text),
                ("clips", ChannelKind::Text),
                ("Squad 1", ChannelKind::Voice),
                ("Squad 2", ChannelKind::Voice),
            ],
        ),
        realm(
            "Midgard HQ",
            RealmKind::Work,
            &[
                ("anuncios", ChannelKind::Text),
                ("daily", ChannelKind::Text),
                ("dev", ChannelKind::Text),
                ("Reunião", ChannelKind::Voice),
            ],
        ),
    ]
}
