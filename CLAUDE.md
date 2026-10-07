# Asgard: contexto para o Claude Code

Leia o `README.md` para stack, estrutura e comandos. Este arquivo guarda o que **não** está no código: decisões, combinados do time e onde a conversa parou.

## Time e branches
- **Murilo** (`dev-murilo`): metaverso 2D e, depois, o "workverse" (ambiente para desenvolvedores). Trabalhe sempre na `dev-murilo`.
- **Shuenk** (`dev-schwenke`): canais de voz (LiveKit). O metaverso se conecta à voz dele depois.
- `main` recebe as mudanças via Pull Request.
- Responda em pt-BR. Identificadores de código ficam em inglês.

## Combinados
- **Persistência:** por enquanto tudo fica local (memória do servidor + `localStorage` no cliente). Banco de dados (Postgres/sqlx) fica para depois, então não introduza banco sem perguntar.
- **Stack:** Tauri v2 (escolhido no lugar do Electron), React 19 + TS, servidor Rust/Axum. Protocolo em `crates/protocol`; depois de mudar, rode `npm run bindings`.
- **Agente de design:** `jesse` (`.claude/agents/jesse.md`). O arquivo foi escrito para outro projeto (L.I.L.Y.). Ao chamá-lo, passe o contexto do Asgard e diga para ignorar caminhos, tokens e marca do L.I.L.Y.

## Metaverso 2D: onde paramos (2026-10-05)
Ideia: escritório pixel art top-down (estilo Gather / weme / LimeZu Modern Office) dentro do app, com:
- chat por proximidade (texto agora, voz depois);
- salas ligadas aos canais de voz (entrar na sala = entrar no canal);
- mesa pessoal, copa e lousa de eventos;
- minigames e ver a tela de alguém se a pessoa permitir (depois).

Material:
- Referência do Murilo: `metaverse ideas/images.jpeg`. Ideias: `ideas.md`.
- Pesquisa e mockup do Jesse: `ui designs/2026-10-05-metaverso/`. O `README.md` dessa pasta tem as referências, os asset packs e as licenças.
- Mockup interativo: `ui designs/2026-10-05-metaverso/mockup/asgard-metaverso-standalone.html` (abre direto no navegador). Versão online: https://claude.ai/artifact/LHALZMYonpXg5Q68vLZ2X5
- ⚠️ As imagens de referência são de terceiros e o repositório é público. O Murilo vai removê-las depois. Elas **nunca** podem ir para `apps/`.

Stack técnica proposta para o metaverso:
- **Phaser** como motor 2D, com o WorkAdventure (open source) como referência de código;
- mapas no **Tiled**, com as salas como áreas marcadas com a propriedade `voiceChannel`;
- posições sincronizadas pelo WebSocket existente (`playerMove` ~10Hz + interpolação);
- voz por proximidade via LiveKit (parte do Shuenk).

O contrato com a voz deve ser só um evento: "entrou na sala X / canal Y" e "perto do usuário Z".

Recomendações do Jesse:
- direção visual **Noturno Asgard**;
- tiles de **16px exibidos em 2x**;
- arte final com **LimeZu Modern Office** (US$ 5, uso comercial permitido, exige crédito) ou Kenney (CC0) para protótipo.

### Decisões pendentes do Murilo (perguntar antes de codar o metaverso)
1. Direção visual: Noturno Asgard ou Aconchegante?
2. Um mapa compartilhado com as salas de todos os realms, ou um mapa por realm?
3. O painel de chat por proximidade pode ocupar a coluna de membros online enquanto o metaverso está aberto?
4. Arte: comprar o LimeZu agora, ou começar com Kenney / a arte do mockup?

### Próximo passo, após as respostas
Base técnica na `dev-murilo`:
1. Phaser montado dentro do React (entrada "Metaverso" na lista de canais);
2. mapa simples feito no Tiled;
3. movimento do avatar;
4. eventos `playerMove`/`playerJoined` no protocolo;
5. chat por proximidade.

Pause a renderização quando o metaverso não estiver visível, para economizar CPU/GPU de quem está jogando.
