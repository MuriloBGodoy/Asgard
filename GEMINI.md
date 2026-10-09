# Asgard - Contexto do Projeto

## Sobre o Projeto
O Asgard é uma aplicação similar ao Discord (chat de texto e salas de voz em tempo real). Ele usa um modelo cliente-servidor, sendo constituído por um Backend em Rust (Asgard Server) e um Frontend/Desktop app em Tauri + React (Asgard Desktop).

## Stack Tecnológica
**Frontend (Desktop App - \`apps/desktop\`)**
- **Tauri v2**: Framework para construir o desktop app de forma leve usando webviews.
- **React 19 & TypeScript 7**: Interface de usuário e tipagem.
- **Vite 8**: Bundler e dev server.
- **LiveKit Components**: Utilizado para implementação de canais de voz, transmissão de áudio e cancelamento de ruído (Krisp).

**Backend (Server - \`apps/server\`)**
- **Rust (2024 edition)**: Linguagem principal do servidor.
- **Axum 0.8 & Tokio**: Framework web assíncrono para rotas HTTP REST e conexões WebSocket.
- **LiveKit Server API**: Para gerenciar salas e permissões de voz.

**Compartilhado e Ferramentas**
- **Protocolo**: `ts-rs` gera tipos TypeScript a partir do Rust. `serde` e `uuid` para serialização e IDs.
- **Comunicação**: WebSocket para chat em tempo real e HTTP para listagens e histórico.
- **Monorepo**: Cargo Workspace (Rust) e NPM Workspaces (Node) lado a lado no mesmo repositório.

## Estado Atual
- Implementamos o Chat de Texto básico e listagem de canais/salas.
- Implementamos Canais de Voz usando **LiveKit**.
- Implementamos filtro de cancelamento de ruído **Krisp** com opção para o usuário ligar/desligar na tela de Configurações.
- As opções de configuração de filtro de ruído ficam na mesma rota de configuração de áudio.

## Problemas Crônicos a Evitar
1. **Regra dos Hooks (React)**: Não utilizar `useState` ou `useEffect` de forma condicional, especialmente após early-returns (como a verificação de token no `VoiceRoom.tsx`).
2. **Encoding de Caracteres no Windows**: Scripts PowerShell costumam quebrar caracteres especiais (acentos, `ç`, etc) ao usar `Set-Content` em UTF-8. Para buscar e substituir textos contendo acentos, utilizar scripts em NodeJS.
3. **Substituição Global de Strings Cega**: Nunca fazer _replace_ global e cego como `replace('no', 'não')` sem limites de palavra (`\b`), pois quebra keywords de código em inglês (ex: `none` -> `nãone`).

## Regras de Workflow do Assistente
- **NUNCA FAÇA COMMIT OU PUSH AUTOMATICAMENTE** sem perguntar primeiro ao usuário, conforme estabelecido no documento `ferramentas.md`.
- Leia este `GEMINI.md` periodicamente quando trocar de máquina ou perder o contexto.
