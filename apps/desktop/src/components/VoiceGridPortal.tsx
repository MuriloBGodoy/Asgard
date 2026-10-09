import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useParticipants, useLocalParticipant, VideoTrack } from "@livekit/components-react";
import { Track } from "livekit-client";
import type { Channel } from "../bindings/Channel";

interface VoiceGridProps {
  channel: Channel;
  micMuted: boolean;
  audioMuted: boolean;
  onToggleMic: () => void;
  onToggleAudio: () => void;
  onDisconnect: () => void;
}

export function VoiceGridPortal({
  channel,
  micMuted,
  audioMuted,
  onToggleMic,
  onToggleAudio,
  onDisconnect,
}: VoiceGridProps) {
  const location = useLocation(); // Re-avalia quando a URL muda
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenOn, setIsScreenOn] = useState(false);

  useEffect(() => {
    // Busca o container após o React atualizar o DOM
    setContainer(document.getElementById("voice-grid-container"));
  }, [location.pathname]);

  useEffect(() => {
    setIsCameraOn(localParticipant?.isCameraEnabled ?? false);
    setIsScreenOn(localParticipant?.isScreenShareEnabled ?? false);
  }, [localParticipant?.isCameraEnabled, localParticipant?.isScreenShareEnabled]);

  if (!container) return null;

  return createPortal(
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-app)", height: "100%" }}>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-title">🔊 {channel.name}</div>
      </div>

      {/* Grid */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gap: 16,
          padding: 24,
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          overflowY: "auto",
          alignContent: "start"
        }}
      >
        {participants.map((p) => {
          const cameraTrack = p.getTrackPublication(Track.Source.Camera)?.videoTrack;
          const screenTrack = p.getTrackPublication(Track.Source.ScreenShare)?.videoTrack;
          const hasVideo = !!(screenTrack || cameraTrack);

          return (
            <div
              key={p.identity}
              style={{
                background: "var(--bg-panel)",
                borderRadius: 12,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 200,
                boxShadow: p.isSpeaking ? "0 0 0 4px #43b581" : "none",
                transition: "box-shadow 0.2s",
              }}
            >
              {hasVideo ? (
                <VideoTrack
                  trackRef={{ 
                    participant: p, 
                    source: screenTrack ? Track.Source.ScreenShare : Track.Source.Camera,
                    publication: screenTrack 
                      ? p.getTrackPublication(Track.Source.ScreenShare)! 
                      : p.getTrackPublication(Track.Source.Camera)!
                  }}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 32,
                    color: "#fff",
                  }}
                >
                  {p.identity.substring(0, 2).toUpperCase()}
                </div>
              )}

              {/* Username label */}
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: 12,
                  background: "rgba(0,0,0,0.6)",
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontSize: 13,
                  color: "#fff",
                  fontWeight: 500,
                }}
              >
                {p.identity}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls Footer */}
      <div
        style={{
          height: 80,
          background: "var(--bg-panel)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          borderTop: "1px solid var(--border)",
        }}
      >
        <button
          onClick={onToggleMic}
          className={`control-btn ${micMuted ? "muted" : ""}`}
          style={{ width: 56, height: 56, borderRadius: "50%", background: micMuted ? "var(--bg-hover)" : "var(--border)" }}
          title={micMuted ? "Mutado" : "Mutar"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
            {micMuted && <line x1="4" y1="4" x2="20" y2="20" stroke="var(--danger)" />}
          </svg>
        </button>
        <button
          onClick={onToggleAudio}
          className={`control-btn ${audioMuted ? "muted" : ""}`}
          style={{ width: 56, height: 56, borderRadius: "50%", background: audioMuted ? "var(--bg-hover)" : "var(--border)" }}
          title={audioMuted ? "Áudio Mutado" : "Mutar Áudio"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            {audioMuted && <line x1="4" y1="4" x2="20" y2="20" stroke="var(--danger)" />}
          </svg>
        </button>
        <button
          onClick={() => localParticipant?.setCameraEnabled(!isCameraOn)}
          className={`control-btn ${!isCameraOn ? "muted" : ""}`}
          style={{ width: 56, height: 56, borderRadius: "50%", background: isCameraOn ? "var(--accent)" : "var(--bg-hover)", color: isCameraOn ? "#fff" : "currentColor" }}
          title={isCameraOn ? "Desligar Câmera" : "Ligar Câmera"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            {!isCameraOn && <line x1="2" y1="2" x2="22" y2="22" stroke="var(--danger)" />}
          </svg>
        </button>
        <button
          onClick={() => localParticipant?.setScreenShareEnabled(!isScreenOn)}
          className={`control-btn ${!isScreenOn ? "muted" : ""}`}
          style={{ width: 56, height: 56, borderRadius: "50%", background: isScreenOn ? "var(--accent)" : "var(--bg-hover)", color: isScreenOn ? "#fff" : "currentColor" }}
          title={isScreenOn ? "Parar Compartilhamento" : "Compartilhar Tela"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
            {!isScreenOn && <line x1="2" y1="2" x2="22" y2="22" stroke="var(--danger)" />}
          </svg>
        </button>
        <button
          onClick={onDisconnect}
          className="control-btn"
          style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--danger)", color: "#fff" }}
          title="Desconectar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
            <line x1="22" y1="2" x2="2" y2="22" />
          </svg>
        </button>
      </div>
    </div>,
    container
  );
}
