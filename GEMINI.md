# Contexto do Projeto: Asgard

## Visão Geral
Asgard é uma aplicação de chat de voz e texto, no estilo Discord.
Possui um backend em Rust (utilizando `axum` e `tokio` para WebSockets, além de integração com LiveKit) e um frontend em React + TypeScript + Vite.

## Arquitetura
- **Backend (Rust)**:
  - `apps/server`: Servidor HTTP e WebSocket.
  - O estado atual (`AppState` em `apps/server/src/state.rs`) guarda realms, channels, usuários conectados (`online`), mensagens e os estados de voz (`voice_states`).
  - `apps/server/src/ws.rs`: Lida com conexões WebSocket e propaga os eventos do protocolo.
- **Frontend (Tauri + React + Vite)**:
  - `apps/desktop/src`: Código fonte do frontend.
  - Utiliza `@livekit/components-react` para conexão de voz e vídeo (WebRTC).
  - O hook central `useAsgard.ts` gerencia o estado global (mensagens, voz, status, presença) comunicando-se via WebSocket.
- **Protocolo Compartilhado**:
  - `crates/protocol`: Biblioteca em Rust com definições de eventos e estruturas (`Message`, `User`, `JoinVoice`, `VoiceParticipant`, etc.).
  - Os tipos são exportados para TypeScript (`apps/desktop/src/bindings`) utilizando a macro `#[ts(export)]`. Para sincronizar, rode `npm run bindings`.

## Regras Importantes e Restrições
1. **Commits e Push**: NUNCA realize `git commit` ou `git push` sem a permissão explícita do usuário. SEMPRE PERGUNTAR SE PODE COMMITAR COM UM EXEMPLO DO COMMIT, SEMPRE REALIZAR COMMITS EM PT-BR (conforme definido em `ferramentas.md`).
2. **Edição de Arquivos (Codificação)**: Sempre utilize scripts em `Node.js` (ex: `fs.readFileSync` e `fs.writeFileSync`) ou a tool `replace_file_content` para editar arquivos que contenham acentuação ou caracteres especiais, pois o PowerShell corrompe a codificação UTF-8.
3. **Fluxos Assíncronos**: Atente-se à inicialização de instâncias e aos efeitos do React (`useEffect`). Evite acessar campos de objetos que podem estar indefinidos durante o primeiro render (como `asgard.me.username`).

## Dicas de Manutenção e Problemas Conhecidos
- **VoiceRoom e Crashes**: Ao usar processadores de áudio (ex: `KrispNoiseFilter`), certifique-se de não passar `null` para as props do LiveKit, o que causa um *crash* invisível (tela preta).
- **Mute de Áudio**: O estado de mudo (`micMuted`, `audioMuted`) é sincronizado globalmente no `App.tsx` e injetado tanto no protocolo (`JoinVoice`, `UpdateVoiceState`) quanto na `VoiceRoom`.
- **Status do Usuário**: A alteração de status afeta a visualização na barra lateral (`ChatView.tsx`) e requer sincronia com o backend (`updateUserStatus`).

Utilize este documento para revisar as diretrizes de desenvolvimento antes de tomar decisões complexas, economizando processamento e evitando alucinações.
