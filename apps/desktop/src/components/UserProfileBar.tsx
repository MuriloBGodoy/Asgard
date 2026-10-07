import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  username: string;
  inVoiceChannel?: boolean;
  onDisconnect?: () => void;
  micMuted?: boolean;
  audioMuted?: boolean;
  onToggleMic?: () => void;
  onToggleAudio?: () => void;
}

export function UserProfileBar({ 
  username, 
  inVoiceChannel, 
  onDisconnect,
  micMuted = false,
  audioMuted = false,
  onToggleMic,
  onToggleAudio
}: Props) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Disponível");
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const statusOptions = [
    { id: "Disponível", color: "#43b581" },
    { id: "Ausente", color: "#faa61a" },
    { id: "Ocupado", color: "#f04747" },
    { id: "Invisível", color: "#747f8d" },
  ];
  const currentStatusObj = statusOptions.find(s => s.id === status) || statusOptions[0];

  function toggleAudio() {
    if (onToggleAudio) onToggleAudio();
  }

  function toggleMic() {
    if (audioMuted) return; // Cannot unmute mic if deafened
    if (onToggleMic) onToggleMic();
  }

  return (
    <div className="user-profile-bar">
      {/* Avatar (Redireciona para Perfil) */}
      <div 
        className="user-avatar interactive" 
        onClick={() => navigate("/settings/profile")}
        title="Configurações de Perfil"
      >
        {username.substring(0, 2).toUpperCase()}
      </div>
      
      {/* Informações (Status alterável) */}
      <div className="user-info" style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="user-name">{username}</div>
        <div 
          className="user-status interactive"
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          title="Alterar Status"
          style={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: currentStatusObj.color, flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{status}</span>
        </div>

        {/* Menu Pop-up de Status */}
        {showStatusMenu && (
          <div className="status-popup">
            {statusOptions.map(opt => (
              <div 
                key={opt.id} 
                className="status-option"
                onClick={() => {
                  setStatus(opt.id);
                  setShowStatusMenu(false);
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: opt.color, flexShrink: 0 }} />
                <span>{opt.id}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controles de Áudio */}
      <div className="audio-controls">
        {inVoiceChannel && onDisconnect && (
          <button 
            className="control-btn"
            onClick={onDisconnect}
            title="Desconectar da Voz"
            style={{ color: "var(--danger)" }}
          >
            {/* Ícone log-out (Lucide) */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        )}

        <button 
          className={`control-btn ${micMuted ? "muted" : ""}`}
          onClick={toggleMic}
          title={micMuted ? "Microfone Mutado" : "Mutar Microfone"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
            {micMuted && <line x1="4" y1="4" x2="20" y2="20" stroke="var(--danger)" />}
          </svg>
        </button>

        <button 
          className={`control-btn ${audioMuted ? "muted" : ""}`}
          onClick={toggleAudio}
          title={audioMuted ? "Áudio Mutado" : "Mutar Áudio"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            {audioMuted && <line x1="4" y1="4" x2="20" y2="20" stroke="var(--danger)" />}
          </svg>
        </button>

        {/* Engrenagem */}
        <button 
          className="control-btn"
          onClick={() => navigate("/settings/general")}
          title="Configurações Gerais"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
