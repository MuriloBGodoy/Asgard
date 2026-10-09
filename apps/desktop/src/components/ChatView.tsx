import { useEffect, useRef, useState, type FormEvent } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Channel } from "../bindings/Channel";
import type { Message } from "../bindings/Message";
import type { User } from "../bindings/User";
import { ProfilePopover } from "./ProfilePopover";

interface Props {
  channel?: Channel;
  messages: Message[];
  error?: string;
  online: User[];
  onSend: (content: string) => void;
}

const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function ChatView({ channel, messages, error, online, onSend }: Props) {
  const [draft, setDraft] = useState("");
  const [showMembers, setShowMembers] = useState(true);
  
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && parentRef.current) {
      rowVirtualizer.scrollToIndex(messages.length - 1, { align: "end" });
    }
  }, [messages.length, rowVirtualizer]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    setDraft("");
  }

  if (!channel) return <div style={{padding: 24, color: "var(--text-secondary)"}}>Selecione um canal</div>;

  // Categorizar usuários para exibir na barra lateral (Status real)
  const availableOrBusy: (User & { st: { label: string, color: string } })[] = [];
  const away: (User & { st: { label: string, color: string } })[] = [];
  const offline: (User & { st: { label: string, color: string } })[] = [];

  const statusMap = {
    online: { label: "Disponível", color: "#43b581" },
    away: { label: "Ausente", color: "#faa61a" },
    busy: { label: "Ocupado", color: "#f04747" },
    invisible: { label: "Invisível", color: "#747f8d" },
  };

  online.forEach(u => {
    const st = statusMap[u.status] || statusMap.online;

    if (u.status === "invisible") {
      offline.push({ ...u, st });
    } else if (u.status === "away") {
      away.push({ ...u, st });
    } else {
      availableOrBusy.push({ ...u, st });
    }
  });

  // Ordenar usuários (Disponível primeiro, Ocupado depois) - opcional
  availableOrBusy.sort((a, b) => {
    if (a.status === b.status) return a.username.localeCompare(b.username);
    return a.status === "online" ? -1 : 1;
  });

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", minWidth: 0, width: "100%" }}>
      {/* Coluna principal do Chat */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <header className="chat-header">
          <div className="chat-title">{channel.name}</div>
          <button 
            className="members-toggle-btn"
            onClick={() => setShowMembers(!showMembers)}
            title="Alternar Lista de Membros"
            style={{
              background: showMembers ? "var(--bg-hover)" : "var(--bg-panel)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "6px 10px",
              display: "grid",
              placeItems: "center",
              color: showMembers ? "var(--text-primary)" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </button>
        </header>

        <div 
          ref={parentRef}
          className="messages-list" 
          style={{ overflowY: "auto", flex: 1, padding: 0 }}
        >
          {messages.length === 0 && <p style={{color: "var(--text-secondary)", padding: 24}}>Nenhuma mensagem ainda.</p>}
          
          {messages.length > 0 && (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const m = messages[virtualRow.index];
                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                      padding: "0 24px",
                    }}
                  >
                    <div className="message-item" style={{ padding: "12px 0" }}>
                      <div className="message-header">
                        <ProfilePopover user={m.author}>
                          <span className="message-author">{m.author.username}</span>
                        </ProfilePopover>
                        <span className="message-time">{timeFormat.format(m.sentAt)}</span>
                      </div>
                      <div className="message-content">
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {error && <div style={{margin: "0 24px 16px", padding: 12, background: "rgba(224, 94, 94, 0.15)", color: "var(--danger)", borderRadius: 8}}>{error}</div>}

        <form className="chat-input-container" onSubmit={submit}>
          <input
            className="chat-input"
            placeholder={`Conversar em ${channel.name}`}
            value={draft}
            maxLength={2000}
            onChange={(e) => setDraft(e.target.value)}
          />
        </form>
      </div>

      {/* Painel lateral de Membros */}
      {showMembers && (
        <aside className="members-sidebar" style={{ 
          width: 260, 
          background: "var(--bg-panel)", 
          borderLeft: "1px solid var(--border)", 
          display: "flex", 
          flexDirection: "column", 
          overflowY: "auto",
          padding: "16px 8px"
        }}>
          {availableOrBusy.length > 0 && (
            <>
              <div className="channel-group-title">Disponíveis - {availableOrBusy.length}</div>
              {availableOrBusy.map(user => (
                <ProfilePopover key={user.id} user={user}>
                  <div className="member-item">
                    <div style={{ position: "relative", width: 32, height: 32 }}>
                      <span className="user-avatar" style={{width: "100%", height: "100%", backgroundImage: user.avatar_url ? `url(${user.avatar_url})` : "none", backgroundSize: "cover", backgroundPosition: "center"}}>
                        {!user.avatar_url && user.username.substring(0, 2).toUpperCase()}
                      </span>
                      <span style={{
                        position: "absolute",
                        bottom: -2, right: -2,
                        width: 12, height: 12,
                        borderRadius: "50%",
                        background: user.st.color,
                        border: "2px solid var(--bg-panel)"
                      }} title={user.st.label} />
                    </div>
                    <div className="member-info">
                      <span className="member-name">{user.username}</span>
                    </div>
                  </div>
                </ProfilePopover>
              ))}
            </>
          )}

          {away.length > 0 && (
            <>
              <div className="channel-group-title" style={availableOrBusy.length > 0 ? { marginTop: 16 } : {}}>
                Ausentes - {away.length}
              </div>
              {away.map(user => (
                <ProfilePopover key={user.id} user={user}>
                  <div className="member-item" style={{ opacity: 0.5 }}>
                    <div style={{ position: "relative", width: 32, height: 32 }}>
                      <span className="user-avatar" style={{width: "100%", height: "100%", backgroundImage: user.avatar_url ? `url(${user.avatar_url})` : "none", backgroundSize: "cover", backgroundPosition: "center"}}>
                        {!user.avatar_url && user.username.substring(0, 2).toUpperCase()}
                      </span>
                      <span style={{
                        position: "absolute",
                        bottom: -2, right: -2,
                        width: 12, height: 12,
                        borderRadius: "50%",
                        background: user.st.color,
                        border: "2px solid var(--bg-panel)"
                      }} title={user.st.label} />
                    </div>
                    <div className="member-info">
                      <span className="member-name">{user.username}</span>
                    </div>
                  </div>
                </ProfilePopover>
              ))}
            </>
          )}

          {offline.length > 0 && (
            <>
              <div className="channel-group-title" style={(availableOrBusy.length > 0 || away.length > 0) ? { marginTop: 16 } : {}}>
                Offline - {offline.length}
              </div>
              {offline.map(user => (
                <ProfilePopover key={user.id} user={user}>
                  <div className="member-item" style={{ opacity: 0.5 }}>
                    <div style={{ position: "relative", width: 32, height: 32 }}>
                      <span className="user-avatar" style={{width: "100%", height: "100%", backgroundImage: user.avatar_url ? `url(${user.avatar_url})` : "none", backgroundSize: "cover", backgroundPosition: "center"}}>
                        {!user.avatar_url && user.username.substring(0, 2).toUpperCase()}
                      </span>
                      <span style={{
                        position: "absolute",
                        bottom: -2, right: -2,
                        width: 12, height: 12,
                        borderRadius: "50%",
                        background: user.st.color,
                        border: "2px solid var(--bg-panel)"
                      }} title="Offline" />
                    </div>
                    <div className="member-info">
                      <span className="member-name">{user.username}</span>
                    </div>
                  </div>
                </ProfilePopover>
              ))}
            </>
          )}
        </aside>
      )}
    </div>
  );
}

