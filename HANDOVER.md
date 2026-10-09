# Handover de Desenvolvimento - Projeto Asgard

Este documento serve como um ponto de restauração e passagem de contexto para que você possa continuar o desenvolvimento na nova máquina sem perder o fio da meada.

##  O Que Foi Implementado e Concluído Recentemente

### 1. Correção das Bordas e Sombras (Tauri no Windows 10)
- **O Problema:** As sombras nativas do Windows (DWM) em janelas sem bordas (frameless) estavam forçando a exibição de uma borda com a cor de destaque do sistema no Windows 10.
- **A Solução:** Removemos o plugin `window-shadows-v2`. Configuramos a janela do Tauri para ser totalmente transparente (`"transparent": true` no `tauri.conf.json`) e aplicamos um `box-shadow` via CSS diretamente na raiz da aplicação (`App.tsx`). Isso garante um visual limpo e à prova de falhas independente do SO.

### 2. Correção do "Flicker" no Popover de Perfil (ProfilePopover.tsx)
- **O Problema:** Quando o card de perfil era aberto, ele "piscava" rapidamente na posição `X: 0, Y: 0` da tela antes de ir para a posição correta.
- **A Solução:** Movemos o cálculo das coordenadas (Bounding Client Rect) de forma síncrona diretamente para o evento de clique (`onClick`), ao invés de depender de atualizações baseadas no `useEffect` após a montagem do componente. Isso eliminou o "thrashing" de layout.

### 3. Nova Visualização da Chamada de Voz (Voice Grid View)
- Criamos um visualizador no estilo Discord (`VoiceGridPortal.tsx`) totalmente integrado com o LiveKit.
- Quando o usuário está em uma call de voz e clica nela novamente, abrimos essa nova visualização na área principal (onde normalmente ficaria o chat).
- **Recursos Inclusos:** Avatares dos usuários, faixas de vídeo, um "Voice Ring" (anel verde ao redor do perfil quando a pessoa fala) e controles na parte inferior contendo ícones (Mic, Fone/Áudio, Câmera, Compartilhar Tela e Desconectar).

### 4. Correção de Layout Quebrado (VoiceRoom.tsx)
- **O Problema:** O layout CSS Grid estava quebrando porque o componente `<LiveKitRoom>` injeta seus próprios elementos no DOM, bagunçando as proporções da tela.
- **A Solução:** Envolvemos o `<LiveKitRoom>` em um container visualmente oculto (`position: absolute`, tamanho 0), mantendo a renderização da interface isolada via `createPortal` para a div `#voice-grid-container`.

---

##  O Que Está em Andamento / Próximos Passos (Na Nova Máquina)

### 1. Melhoria na Fluidez do Compartilhamento de Tela (WebRTC / LiveKit)
- O foco agora é melhorar os travamentos e a fluidez do *screen share*. 
- **Por que ocorre:** O padrão do LiveKit para compartilhamento de tela prioriza a clareza do texto (alta resolução) em detrimento do framerate, resultando em FPS baixo.
- **Ação Necessária:** Precisamos aplicar os presets de alta taxa de quadros (ex: `ScreenSharePresets.h1080fps60`) e forçar a propriedade `contentHint: "motion"` nas configurações do track dentro do LiveKit (provavelmente no `VoiceRoom.tsx` ou onde inicializamos o compartilhamento de tela). 

##  Como Estamos Agindo (Metodologia e Regras)
- **Commits e Push:** Estão **estritamente proibidos** a não ser que haja uma ordem explícita sua (como "pode commitar"). Mesmo elogios como "ficou legal" não autorizam o commit.
- **Linguagem:** O desenvolvimento e as interações continuam exclusivamente em português brasileiro.
- **Foco de Interface:** Manter componentes bem encapsulados, utilizando as APIs do LiveKit de forma limpa e tratando as idiossincrasias do Tauri (janelas e OS) de maneira elegante via CSS ou chamadas diretas à API Rust quando necessário.

---
Bom trabalho na nova máquina! Quando estiver pronto, me avise para atacarmos a fluidez da transmissão de tela.
