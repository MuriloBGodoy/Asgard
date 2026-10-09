import { useState, useEffect } from "react";
import { ProfilePopover } from "./ProfilePopover";
import type { Realm } from "../bindings/Realm";
import type { User } from "../bindings/User";
import type { ConnectionStatus } from "../hooks/useAsgard";
import type { Channel } from "../bindings/Channel";
import type { VoiceParticipant } from "../bindings/VoiceParticipant";

interface Props {
  realm?: Realm;
  activeTextId?: string;
  activeVoiceId?: string;
  onSelectText: (id: string) => void;
  onSelectVoice: (id: string) => void;
  me?: User;
  status: ConnectionStatus;
  voiceStates?: Record<string, VoiceParticipant[]>;
  onCreateChannel?: (realmId: string, name: string, kind: "text" | "voice") => Promise<void>;
  onEditChannel?: (realmId: string, channelId: string, name: string) => Promise<void>;
  onDeleteChannel?: (realmId: string, channelId: string) => Promise<void>;
}

export function ChannelList({ realm, activeTextId, activeVoiceId, onSelectText, onSelectVoice, voiceStates, onCreateChannel, onEditChannel, onDeleteChannel }: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState<"text" | "voice">("text");

  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; channel: Channel | null }>({
    visible: false, x: 0, y: 0, channel: null
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");

  const text = realm?.channels.filter((c) => c.kind === "text") ?? [];
  const voice = realm?.channels.filter((c) => c.kind === "voice") ?? [];

  const [speakers, setSpeakers] = useState<string[]>([]);

  useEffect(() => {
    function handleSpeaking(e: any) {
      setSpeakers(e.detail || []);
    }
    window.addEventListener("asgard_speaking_update", handleSpeaking);
    return () => window.removeEventListener("asgard_speaking_update", handleSpeaking);
  }, []);

  useEffect(() => {
    function handleClick() {
      if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [contextMenu]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!channelName.trim() || !realm || !onCreateChannel) return;
    try {
      await onCreateChannel(realm.id, channelName, channelType);
      setShowCreateModal(false);
      setChannelName("");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim() || !realm || !onEditChannel || !contextMenu.channel) return;
    try {
      await onEditChannel(realm.id, contextMenu.channel.id, editName);
      setShowEditModal(false);
      setEditName("");
    } catch (err) {
      console.error(err);
    }
  }

  function handleRightClick(e: React.MouseEvent, channel: Channel) {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      channel,
    });
  }

  async function handleDelete() {
    if (!realm || !onDeleteChannel || !contextMenu.channel) return;
    try {
      await onDeleteChannel(realm.id, contextMenu.channel.id);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <nav className="channel-list-minimal" style={{ position: "relative" }}>
        <div className="channel-group-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Salas de Texto
          {onCreateChannel && (
            <button className="icon-button" onClick={() => { setChannelType("text"); setShowCreateModal(true); }} title="Criar Canal" style={{ cursor: "pointer", background: "none", border: "none", color: "inherit", opacity: 0.6 }}>
              +
            </button>
          )}
        </div>
        {text.map((c) => (
          <div
            key={c.id}
            className={`channel-item ${c.id === activeTextId ? "active" : ""}`}
            onClick={() => onSelectText(c.id)}
            onContextMenu={(e) => handleRightClick(e, c)}
          >
            {c.name}
          </div>
        ))}

        <div className="channel-group-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
          Voz
          {onCreateChannel && (
            <button className="icon-button" onClick={() => { setChannelType("voice"); setShowCreateModal(true); }} title="Criar Canal" style={{ cursor: "pointer", background: "none", border: "none", color: "inherit", opacity: 0.6 }}>
              +
            </button>
          )}
        </div>
        {voice.map((c) => (
          <div key={c.id}>
            <div 
              className={`channel-item ${c.id === activeVoiceId ? "active" : ""}`}
              onClick={() => onSelectVoice(c.id)}
              onContextMenu={(e) => handleRightClick(e, c)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
              {c.name}
            </div>
            {voiceStates?.[c.id]?.map((participant) => {
              const isSpeaking = speakers.includes(participant.user.username);
              return (
                <ProfilePopover key={participant.user.id} user={participant.user}>
                  <div style={{ display: "flex", alignItems: "center", padding: "4px 12px 4px 32px", fontSize: "12px", color: "var(--text-secondary)", gap: "8px" }}>
                                      <div style={{ 
                      width: 24, height: 24, borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", flexShrink: 0,
                      border: isSpeaking ? "2px solid #43b581" : "2px solid transparent",
                      boxShadow: isSpeaking ? "0 0 8px rgba(67, 181, 129, 0.4)" : "none",
                      transition: "all 0.1s",
                      backgroundImage: participant.user.avatarUrl ? `url(${participant.user.avatarUrl})` : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}>
                      {!participant.user.avatarUrl && participant.user.username.substring(0, 2).toUpperCase()}
                    </div>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, color: isSpeaking ? "var(--text-primary)" : "inherit" }}>
                    {participant.user.username}
                  </span>
                  
                  {/* Ãcones de status de voz */}
                  <div style={{ display: "flex", gap: "4px" }}>
                    {participant.micMuted && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                      <line x1="4" y1="4" x2="20" y2="20" />
                    </svg>
                  )}
                  {participant.deafened && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                      <line x1="4" y1="4" x2="20" y2="20" />
                    </svg>
                  )}
                </div>
              </div>
            </ProfilePopover>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.channel && (
        <div 
          className="context-menu"
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "8px 0",
            minWidth: 160,
            boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
            zIndex: 9999
          }}
        >
          <div 
            className="context-menu-item"
            style={{ padding: "8px 16px", cursor: "pointer", fontSize: "13px", color: "var(--text-primary)" }}
            onClick={(e) => {
              e.stopPropagation();
              setEditName(contextMenu.channel!.name);
              setShowEditModal(true);
              setContextMenu({ ...contextMenu, visible: false });
            }}
          >
            Editar Canal
          </div>
          <div 
            className="context-menu-item"
            style={{ padding: "8px 16px", cursor: "pointer", fontSize: "13px", color: "var(--danger)" }}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
              setContextMenu({ ...contextMenu, visible: false });
            }}
          >
            Excluir Canal
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginTop: 0, fontSize: "16px", color: "var(--text)" }}>Criar Canal</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 8, fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>Tipo de Canal</label>
                <select
                  value={channelType}
                  onChange={(e) => setChannelType(e.target.value as "text" | "voice")}
                  style={{ width: "100%", padding: "8px 12px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4 }}
                >
                  <option value="text">Texto</option>
                  <option value="voice">Voz</option>
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 8, fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>Nome do Canal</label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="novo-canal"
                  style={{ width: "100%", padding: "8px 12px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4 }}
                  autoFocus
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: "8px 16px" }}>Cancelar</button>
                <button type="submit" style={{ background: "var(--primary)", border: "none", color: "#fff", cursor: "pointer", padding: "8px 16px", borderRadius: 4, fontWeight: 500 }}>Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginTop: 0, fontSize: "16px", color: "var(--text)" }}>Editar Canal</h2>
            <form onSubmit={handleEdit}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 8, fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>Nome do Canal</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="nome-do-canal"
                  style={{ width: "100%", padding: "8px 12px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 4 }}
                  autoFocus
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: "8px 16px" }}>Cancelar</button>
                <button type="submit" style={{ background: "var(--primary)", border: "none", color: "#fff", cursor: "pointer", padding: "8px 16px", borderRadius: 4, fontWeight: 500 }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


