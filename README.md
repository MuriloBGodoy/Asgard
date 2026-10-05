# ⚔️ Asgard

Games e trabalho no mesmo lugar: chat, voz e um metaverso 2D. Algo entre Discord, TeamSpeak e Teams.

## Stack

| Camada | Tecnologia |
| --- | --- |
| App desktop | **Tauri v2** (Rust) + **React 19** + **TypeScript** + Vite |
| Servidor | **Rust**: Axum + Tokio (REST + WebSocket) |
| Protocolo | Crate Rust compartilhado → tipos TS gerados com **ts-rs** |

## Estrutura

```
asgard/
├─ crates/
│  └─ protocol/          # Tipos do protocolo (fonte única de verdade)
├─ apps/
│  ├─ server/            # Servidor Axum: REST + gateway WebSocket
│  └─ desktop/
│     ├─ src/            # Front React/TS
│     │  ├─ bindings/    # ⚠️ GERADO pelo Rust, não editar à mão
│     │  ├─ components/
│     │  ├─ hooks/       # useAsgard: estado global do cliente
│     │  └─ lib/         # gateway WebSocket, config
│     └─ src-tauri/      # Lado nativo (Rust) do app
├─ Cargo.toml            # Workspace Rust
└─ package.json          # Workspace npm
```

## Pré-requisitos

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) 24+
- Windows: WebView2 (já vem no Windows 11) e as Build Tools do Visual Studio (C++)
- Mais detalhes: https://v2.tauri.app/start/prerequisites/

## Rodando

```bash
npm install

# Terminal 1: servidor
npm run dev:server

# Terminal 2: app desktop (Tauri)
npm run dev
```

Para testar com várias pessoas sem abrir vários apps, rode `npm run dev:web` e abra
http://localhost:1420 em abas diferentes do navegador.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | App desktop em modo dev (hot reload) |
| `npm run dev:web` | Só o front, no navegador |
| `npm run dev:server` | Servidor em `127.0.0.1:8080` |
| `npm run build` | Gera o instalador do app |
| `npm run bindings` | Regenera os tipos TS a partir de `crates/protocol` |
| `npm run check` | cargo check + clippy + typecheck (o mesmo que o CI roda) |
| `npm run fmt` | Formata Rust e TS |

## Como o protocolo funciona

Toda a comunicação é definida em `crates/protocol/src/lib.rs`. Para adicionar um evento:

1. Adicione a variante em `ClientEvent` ou `ServerEvent` (Rust)
2. `npm run bindings`: os tipos TS são atualizados em `apps/desktop/src/bindings`
3. Trate no servidor (`apps/server/src/ws.rs`) e no front (`hooks/useAsgard.ts`)

O TypeScript vai acusar erro em todo `switch` que não tratar o evento novo. O CI falha se
alguém esquecer de regenerar os bindings.

Formato no fio: `{ "type": "sendMessage", "data": { "channelId": "...", "content": "..." } }`

### API

| Rota | Descrição |
| --- | --- |
| `GET /health` | Health check |
| `GET /api/realms` | Realms (servidores) e seus canais |
| `GET /api/channels/{id}/messages` | Histórico de um canal de texto |
| `GET /ws` | Gateway WebSocket |

## Roadmap

**Fundação**
- [ ] Persistência com PostgreSQL (`sqlx`); hoje tudo fica em memória
- [ ] Autenticação real (contas, senha com argon2, tokens JWT/sessão)
- [ ] Criar/editar realms e canais, convites, cargos e permissões

**Voz e vídeo**
- [ ] Canais de voz, compartilhamento de tela e câmera com **LiveKit** (SFU open source, SDK em Rust e JS)
- [ ] Push-to-talk com atalho global e supressão de ruído

**Games**
- [ ] Rich presence: detectar o jogo em execução (lado Rust)
- [ ] Overlay in-game

**Trabalho**
- [ ] Threads, menções, reações, upload de arquivos
- [ ] Agenda e eventos, quadro de tarefas

**Metaverso 2D** (veja `ideas.md`)
- [ ] Mapa 2D com avatares (PixiJS ou Phaser)
- [ ] Voz por proximidade (LiveKit + volume por distância)
- [ ] Salas temáticas: café, reunião, mesas pessoais, lousa de eventos
- [ ] Minigames multiplayer
