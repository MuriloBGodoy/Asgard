import { useEffect, useRef, useState, type FormEvent } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Channel } from "../bindings/Channel";
import type { Message } from "../bindings/Message";
import type { User } from "../bindings/User";

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
  const [showMembers, setShowMembers] = useState(false);
  
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

  if (!channel) return <main className="chat-area"><div style={{padding: 24, color: "var(--text-secondary)"}}>Selecione um canal</div></main>;

  return (
    <>
      <header className="chat-header">
        <div className="chat-title">{channel.name}</div>
        <button 
          className="members-toggle"
          onClick={() => setShowMembers(!showMembers)}
        >
          Membros ({online.length})
        </button>
      </header>

      {showMembers && (
        <div className="members-drawer">
          <div className="channel-group-title" style={{ margin: "0 0 12px 0" }}>Online — {online.length}</div>
          {online.map(user => (
            <div key={user.id} className="member-mock">
              <span className="user-avatar" style={{width: 24, height: 24}}>
                {user.username.substring(0, 2).toUpperCase()}
              </span> 
              {user.username}
            </div>
          ))}
        </div>
      )}

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
                      <span className="message-author">{m.author.username}</span>
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
    </>
  );
}
