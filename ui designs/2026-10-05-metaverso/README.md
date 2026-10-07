# 2026-10-05 · Metaverso 2D do Asgard

Moodboard privado (pasta no `.gitignore`). As imagens são de terceiros: servem só de referência e **nunca** entram em `apps/` nem em nenhum asset do app.

## O pedido (Murilo)

Um metaverso 2D dentro do Asgard, "igual" à referência `metaverse ideas/images.jpeg` (escritório pixel art top-down no estilo weme / Gather / LimeZu Modern Office: mesas pessoais com computador, plantas, cadeiras, gatinhos, nome em badge acima do avatar com bolinha verde de online). Requisitos:

- chat por proximidade (texto agora, voz depois);
- salas que espelham os canais de voz: entrar na sala = entrar no canal, a sala mostra quem está e quem fala;
- do `ideas.md`: lousa de eventos no mapa, sessões/minigames, mesa pessoal quando o usuário não está em canal de voz (chegar perto ativa conversa), salas de café/pausa, ver a tela de alguém se a pessoa permitir.

Pediu referências e mockup na mesma rodada.

## Buscas feitas

Pinterest (br.pinterest.com, renderizado em Chrome headless):
`pixel art office top down`, `gather town office`, `virtual office pixel art`, `pixel art metaverse ui`, `cozy pixel office`, `pixel game ui hud minimap`, `escritorio pixel art`.
Baixei 134 imagens em tamanho cheio (descartei placeholders e miniaturas abaixo de 400 px), olhei todas em folhas de contato e separei as 10 abaixo.

Fallback em produtos reais: site do Gather (gather.town), que trouxe as melhores referências de UI sobre o mapa, e o site do WorkAdventure (só uma imagem de marketing, sem nada aproveitável).

Observação sobre as fontes: o DOM renderizado do Pinterest não expõe o link da página do pin (os links são montados por JavaScript). Por isso o crédito abaixo é a URL da imagem no CDN do Pinterest mais a busca onde ela apareceu.

## Referências curadas

| Arquivo | O que é | O que roubar | Fonte |
|---|---|---|---|
| `01-gather-zonas-e-badges-de-nome.png` | Escritório do Gather visto de cima | Badges escuros com bolinha verde e ícone de fone; **rótulo de zona** ("Product team") flutuando no piso; badge de grupo ("Som, Morgan") quando duas pessoas conversam; balão "..." de digitando. É o padrão de UI que o mockup segue. | https://framerusercontent.com/images/KxCGvHrugQWXfjN6yztHZcQOz8U.png (gather.town) |
| `02-gather-bolha-de-proximidade.png` | Close de duas pessoas conversando | O vídeo da pessoa aparece **acima do avatar** quando você chega perto. Usei isso para a câmera simulada acima do seu avatar. | https://framerusercontent.com/images/6nnhodxtnzYO8Yl0FQIFTVcw.png (gather.town) |
| `03-gather-hud-barra-inferior-e-videos.jpg` | Gather em uso, com faixa de vídeos | Barra inferior compacta (avatar, nome, status, ícones); faixa de vídeos no topo só para quem está na conversa. Mostra também o limite: com 7 vídeos o mapa some. | https://i.pinimg.com/736x/35/ba/1d/35ba1d2173f377eba3b336a7cd261c5f.jpg (busca "gather town office") |
| `04-baias-topdown-cinza.jpg` | Planta de escritório com baias | A gramática das **mesas pessoais**: duas mesas costas com costas, divisória clara, monitor de costas na fileira de cima e de frente na de baixo, cadeira para fora. Foi a base do meu "cluster" de 4 mesas. | https://i.pinimg.com/736x/58/93/64/589364a630ffa14e621ec72094c86ec5.jpg ("pixel art office top down") |
| `05-salas-com-portas-coloridas.jpg` | Duas salas de auditório ligadas por corredor | **Porta com cor** marcando a sala (vermelho / azul). Virou o tapete da porta na cor do realm: verde-água para Midgard HQ, roxo para Valhalla. Balões acima das cabeças. | https://i.pinimg.com/736x/a4/50/7e/a4507e801125309024644bda486eca4c.jpg ("pixel art office top down") |
| `06-copa-lounge-yukipixels.jpg` | Sala com copa e lounge (arte assinada YukiPixels / Spellborne) | Copa com bancada, sofás e mesinhas redondas no mesmo ambiente; piso de madeira com tapetes que delimitam zonas sem precisar de parede. | https://i.pinimg.com/736x/94/54/85/945485e91c16d99c353da738d292771e.jpg ("pixel art office top down") |
| `07-escritorio-noturno-paleta.jpg` | Escritório à noite em perspectiva 3/4 | Paleta da direção **Noturno Asgard**: piso azul profundo, mesas de madeira quente, luz que vem dos monitores e das luminárias. Atenção: não é top-down puro e tem personagens de franquia; vale só pela luz. | https://i.pinimg.com/736x/88/a3/50/88a3509e7f3ae856fb9e523dcc3cdee3.jpg ("pixel art office top down") |
| `08-mapa-pixel-dentro-de-app-escuro.jpg` | Escritório pixel dentro de um painel do VS Code | Prova de que um mapa pixel art convive com um app escuro sem virar "jogo dentro do app": o mapa ocupa a área de conteúdo e o resto da interface continua nativa. É exatamente o encaixe no layout do Asgard. | https://i.pinimg.com/736x/5b/1f/06/5b1f064f84a35f6804d037b4eca18cde.jpg ("virtual office pixel art") |
| `09-salas-rotuladas-e-paineis-laterais.jpg` | Conceito "Neomood" de metaverso social | Placas com nome em cima de cada sala, painéis laterais (chat, eventos, amigos online) em volta do mapa. Provavelmente gerada por IA, então serve só como ideia de organização, não como referência de pixel. | https://i.pinimg.com/736x/bb/01/bf/bb01bf327be4089878fa43677b10c466.jpg ("pixel art metaverse ui") |
| `10-minimapa-pixel-moldura.jpg` | Minimapa de jogo pixel | Minimapa em blocos de cor sólida com o jogador em destaque e moldura discreta. Foi o modelo do minimapa (2 px por tile). | https://i.pinimg.com/736x/34/91/93/349193e2e10ee7f64814936e56df40a2.jpg ("pixel game ui hud minimap") |

A referência do próprio Murilo (`metaverse ideas/images.jpeg`, estilo weme) continua sendo a principal: mesas em pares com muito objeto pessoal, gatos, plantas e badge de nome com bolinha verde.

Descartados que valem registro: muitas cenas "lo-fi" de mesa em vista lateral (bonitas, mas não são top-down), várias referências isométricas (outra perspectiva, outro pipeline de arte) e algumas imagens claramente geradas por IA com objetos inconsistentes (por exemplo, a sala de madeira da busca "pixel art office top down" com marca d'água).

## Asset packs com licença para uso comercial

Verificados na página de cada pack em 2026-10-05. Preços em USD, podem mudar.

| Pack | Tile | Preço | Licença (resumo da página) | Observações |
|---|---|---|---|---|
| **LimeZu · Modern Office** (https://limezu.itch.io/modernoffice) | 16, 32 e 48 px | US$ 5 (estava em promoção por US$ 2,50) | Pode usar em projeto comercial; **não** pode revender nem redistribuir o asset; **crédito obrigatório** com link para limezu.itch.io | É o estilo da referência do Murilo. Não inclui personagens (vêm do Modern Interiors). Comentários na página dizem que alguns itens das imagens promocionais não estão nos arquivos. |
| **LimeZu · Modern Interiors** (https://limezu.itch.io/moderninteriors) | 16, 32 e 48 px | Versão completa a partir de US$ 1,50; existe versão grátis | Versão paga: pode editar e usar em projeto comercial; não pode revender/redistribuir; crédito obrigatório | Inclui o **Character Generator 2.0** (100+ roupas, 200 cabelos, 9 tons de pele, animações). A página não detalha a licença da versão grátis: tratar como não comercial até confirmar. |
| **Donarg · Office Tileset** (https://donarg.itch.io/officetileset) | 16, 32 e 48 px | a partir de US$ 2 | Pode editar e usar em projeto comercial; não pode revender/distribuir; crédito opcional; proíbe NFT e treino de IA | Só móveis, sem personagens. Bom complemento ao LimeZu. |
| **Masalimov Ilnur · Pixel Office** (https://masalimov-ilnur.itch.io/pixel-office) | 32 px | a partir de US$ 5 | Uso comercial e modificação permitidos; não pode revender, redistribuir ou reenviar os arquivos originais; crédito opcional | Tem personagens animados e sentados. Estilo diferente do LimeZu; não misturar os dois. |
| **Kenney · Roguelike Indoors** (https://kenney.nl/assets/roguelike-indoors) | 16 px (assumido, ver abaixo) | grátis | CC0 (domínio público) | Útil para protótipo sem risco de licença. Visual bem mais simples que a referência. |
| **Kenney · RPG Urban Pack** (https://kenney.nl/assets/rpg-urban-pack) | 16 px | grátis | CC0 | Personagens e exterior urbano. Bom para um "lado de fora" do escritório. |

A página do Roguelike Indoors não mostrou o tamanho do tile no texto que consegui ler; os packs Roguelike da Kenney costumam ser 16 px, mas confirme no zip.

**Ponto de licença que precisa de decisão:** todos os packs pagos proíbem "redistribuir o asset". Usar dentro do app é permitido, mas se o Asgard tiver **editor de mapas** em que usuários baixam ou exportam os tiles, isso pode contar como redistribuição. Vale perguntar ao LimeZu antes de construir um editor.

## O mockup

Artifact: https://claude.ai/artifact/LHALZMYonpXg5Q68vLZ2X5
Cópia local: `mockup/asgard-metaverso.html` (formato do Artifact) e `mockup/asgard-metaverso-standalone.html` (abre direto no navegador). Capturas em `mockup/`.

Âncoras para abrir num estado: `#reuniao`, `#squad1`, `#copa` (já começa dentro da sala), `#cozy` e `#noite` (direção visual).

Toda a arte é original, desenhada em código no canvas (tiles de 16 px, escala inteira 2x a 5x). Nenhuma imagem baixada foi usada.

O que tem:

- Janela do Asgard com barra de realms e lista de canais reais (`# anuncios`, `# daily`, `# dev`, `🔊 Reunião`; Valhalla com `# geral`, `# lfg`, `# clips`, `🔊 Squad 1`, `🔊 Squad 2`) e uma entrada nova, **🗺️ Metaverso**.
- Mapa "Asgard HQ": mesas pessoais (6 grupos de 4, com dono), sala Reunião (Midgard HQ), Squad 1 e Squad 2 (Valhalla), Copa, lousa de eventos no corredor, área de sessões e minigames com dois arcades e uma mesa de jogos.
- Avatar controlável por WASD/setas e clique para andar (com rota que desvia dos móveis), câmera que segue, minimapa clicável, zoom.
- Odin, Thor, Freya, Loki e mais Heimdall, Sif, Tyr, Baldur e Idunn, com badge de nome e status.
- Raio de proximidade visível. Você começa na sua mesa ao lado do Odin, então o painel "Conversa por perto" já abre com mensagens. Dá para mandar mensagem e ele responde.
- Entrar numa sala de voz conecta no canal: HUD "Conectado em 🔊 Reunião", canal destacado na lista com os participantes e quem está falando, caixa "Voz conectada" acima do usuário (como no Discord), contorno da sala no mapa. Sair da sala desconecta.
- Controles de mic, câmera, compartilhar tela e sair da sala (estado simulado). Freya está compartilhando a tela na Reunião; Odin não compartilha.
- Interações com `E`: lousa de eventos (lista e formulário para marcar evento), Quiz de Asgard na mesa de jogos, café, sua mesa (status Disponível / Foco / Ausente e permissão para verem sua tela).
- Estados: seletor "Estado do mockup" com Normal, Voz indisponível (erro ao entrar na sala, com "Tentar de novo") e Só você no mapa (estado vazio).
- Duas direções visuais alternáveis: **Noturno Asgard** e **Aconchegante**.
- Telas estreitas: lista de canais vira gaveta abaixo de 1100 px; abaixo de 700 px a barra de realms também, o painel vira folha inferior e os controles ficam só com ícones.

## Recomendação

**Direção: Noturno Asgard.** O app é escuro e o mapa claro do "Aconchegante" vira um bloco luminoso no meio da interface (dá para ver nas capturas). A noite também conversa com a marca: piso azul profundo, luz quente das luminárias e dos monitores, acabamento dourado nas paredes. O Aconchegante fica como tema alternativo do mapa, se alguém pedir.

**Tile: 16 px na arte, exibido em escala inteira (2x por padrão, 3x a 4x com zoom).** É a resolução base do LimeZu e do Donarg, então dá para trocar minha arte de mockup pelos packs sem mudar a grade. 2x a 1280×800 mostra cerca de 29×22 tiles: as salas e as mesas aparecem juntas. 32 px nativo deixaria o mapa pesado de desenhar e mais caro de editar sem ganho real nessa escala.

**UI sobre o mapa:** badge escuro com bolinha de status (padrão Gather), placas nas portas com contagem da sala, painel lateral único que muda de papel (conversa por perto, sala de voz, quem está no mapa) e barra de controles central. O painel lateral substitui a coluna de membros online enquanto o Metaverso está aberto.

## Decisões em aberto para o Murilo

1. **Um mapa por realm ou um mapa compartilhado?** No mockup o mapa junta as salas de Midgard HQ e de Valhalla, e a lista mostra as salas do outro realm em "Também no mapa". Entrar no Squad 1 troca a lateral para Valhalla. Se cada realm tiver o próprio mapa, essa seção some.
2. **Coluna de membros online** some enquanto o Metaverso está aberto (o painel lateral ocupa o lugar). Confirmar.
3. **Licença dos packs** se houver editor de mapas (ver acima).
4. Banheiro/"sala de pausa" extra do `ideas.md` não entrou; a Copa cobre a pausa.

## Aprovado / rejeitado

(preencher depois da resposta do Murilo)
