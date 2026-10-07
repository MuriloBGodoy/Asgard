# 💡 Ideias e Funcionalidades Futuras (Backlog Asgard)

Este arquivo centraliza todas as ideias de features, melhorias técnicas e lapidações de UI/UX que foram mapeadas para o futuro do projeto.

## 🔒 Segurança, Autenticação e Banco de Dados
- **Sistema de Autenticação Real:** Trocar o "mock" de login atual por um sistema de contas reais (Registro/Login) com validação de credenciais, armazenamento seguro de senha (hash) e geração de tokens JWT.
- **Persistência de Dados (DB):** Integrar um banco de dados relacional (ex: SQLite ou PostgreSQL via SQLx no Rust) para não perder o histórico de mensagens, canais e usuários quando o servidor for reiniciado.

## 📡 Servidores, Navegação e Permissões
- **Sistema de Realms Múltiplos:** Permitir que o usuário crie seus próprios servidores ("Realms"), gere links de convite e alterne entre as "bolinhas" de servidores na barra lateral esquerda? (modal de servidores ("Realms" ainda precisa ser pensado)).
- **Cargos e Permissões:** Criar um sistema base de RBAC (Role-Based Access Control) para definir quem pode criar canais, mutar membros, ou acessar salas privadas.

## 🎙️ Voz e Status
- **Indicador Visual de "Falando" (Voice Ring):** Utilizar os eventos do LiveKit para capturar quem está ativamente emitindo som e renderizar um anel brilhante (verde) no avatar da pessoa na lista de membros do canal de voz.
- **Regras Reais de Status (Online/Ausente/Ocupado):** 
  - Adicionar o campo de status no banco de dados.
  - Criar um evento no WebSocket (`UpdateUserStatus`) para o desktop avisar o backend da mudança feita no pop-up do `UserProfileBar`.
  - Fazer o backend disparar um `UserStatusUpdated` para todos os clientes refletirem a cor correta da bolinha.
- **Painel de Membros Dinâmico:** Atualizar o painel lateral direito (`members-drawer`) do chat para agrupar as pessoas online em categorias reais baseadas no status de cada uma.

## 🎨 Design, UI/UX e Desktop Nativo
- **Janela "Charmosa" e Frameless no Windows:**
  - Configurar `"decorations": false` no Tauri.
  - Implementar o pacote Rust `window-shadows` para recuperar o sombreamento nativo do Windows e os cantos arredondados na janela sem bordas.
  - Usar CSS `-webkit-app-region: drag` para permitir o arraste suave pela barra customizada.
  - Configurar o `@tauri-apps/plugin-window` com as capabilities corretas para fazer os botões nativos customizados (Minimizar, Maximizar, Fechar) operarem a API do Windows perfeitamente.
- **Modais Refinados:** Aprimorar as animações de abertura/fechamento e estética geral dos modais (ex: modal de criar e editar canais).
