App desktop
- Tauri v2 (2.12): cria a janela do app usando Rust e o WebView do sistema. Por isso o app fica leve, em vez de pesado como no Electron.
- React 19: monta a interface.
- TypeScript 7: a linguagem do front.
- Vite 8: servidor de desenvolvimento e build do front.

Servidor
- Rust (edition 2024): a linguagem do servidor.
- Axum 0.8: framework web, cuida das rotas REST e do WebSocket.
- Tokio: motor assíncrono que roda as várias conexões ao mesmo tempo.
- tower-http: CORS e log das requisições.
- tracing: logs no terminal.
- dotenvy: lê as configurações do arquivo .env.

Protocolo compartilhado
- serde e serde_json: convertem os dados para JSON e de volta.
- ts-rs: gera os tipos TypeScript a partir das structs em Rust.
- uuid: gera os IDs de usuários, canais e mensagens.

Comunicação
- WebSocket: chat e presença em tempo real.
- REST/HTTP: lista de realms e histórico de mensagens.

Ferramentas
- npm workspaces e Cargo workspace: organizam o monorepo.
- Prettier formata o TypeScript, rustfmt formata o Rust e clippy é o linter do Rust.
- GitHub Actions: o CI que verifica o código a cada push e Pull Request.

Planejadas no roadmap, ainda não incluídas
- PostgreSQL com sqlx: banco de dados.
- LiveKit: voz, vídeo e compartilhamento de tela.
- PixiJS ou Phaser: o metaverso 2D.
- argon2 e JWT: login de verdade.

REGRAS
- não realizar commits e push sozinho, sempre questionar possiblidade do commit e, se aprovado, realizar o push.

