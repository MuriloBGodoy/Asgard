import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ChannelList } from "./components/ChannelList";
import { ChatView } from "./components/ChatView";
import { VoiceRoom } from "./components/VoiceRoom";
import { Login } from "./components/Login";
import { RealmBar } from "./components/RealmBar";
import { UserProfileBar } from "./components/UserProfileBar";
import { SettingsGeneral } from "./components/SettingsGeneral";
import { ProfileSettings } from "./components/ProfileSettings";
import { useAsgard } from "./hooks/useAsgard";
import { getAppInfo, type AppInfo } from "./lib/config";

import { Titlebar } from "./components/Titlebar";

export function App() {
  const [info, setInfo] = useState<AppInfo>();
  const [username, setUsername] = useState<string>();

  useEffect(() => {
    getAppInfo().then(setInfo);
  }, []);

  if (!info) return null;

  return (
    <>
      <Titlebar />
      {!username ? (
        <Login version={info.version} onSubmit={setUsername} />
      ) : (
        <Workspace serverUrl={info.serverUrl} username={username} />
      )}
    </>
  );
}

function Workspace({ serverUrl, username }: { serverUrl: string; username: string }) {
  const asgard = useAsgard(serverUrl, username);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

  const [manualStatus, setManualStatus] = useState<"online" | "away" | "busy" | "invisible">(
    "online",
  );
  const [isIdle, setIsIdle] = useState(false);

  // Auto-away detector
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    function resetIdle() {
      setIsIdle(false);
      clearTimeout(idleTimer);
      // Set to away after 5 minutes of inactivity (300_000 ms)
      idleTimer = setTimeout(() => setIsIdle(true), 300_000);
    }

    // Add event listeners for activity
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    window.addEventListener("click", resetIdle);
    window.addEventListener("scroll", resetIdle);

    resetIdle(); // Start timer initially

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      window.removeEventListener("click", resetIdle);
      window.removeEventListener("scroll", resetIdle);
    };
  }, []);

  // Update backend status when manual status or idle state changes
  useEffect(() => {
    if (asgard.status === "open") {
      if (manualStatus === "invisible" || manualStatus === "away") {
        asgard.updateUserStatus(manualStatus);
      } else {
        asgard.updateUserStatus(isIdle ? "away" : manualStatus);
      }
    }
  }, [manualStatus, isIdle, asgard.status, asgard.updateUserStatus]);

  // Enviar para o servidor sempre que mudar
  useEffect(() => {
    if (activeVoiceId) {
      asgard.updateVoiceState(micMuted, audioMuted);
    }
  }, [micMuted, audioMuted, activeVoiceId, asgard.updateVoiceState]);

  if (asgard.realms.length === 0) return null;

  const activeRealm = asgard.realms[0];
  const activeVoiceChannel = activeVoiceId
    ? activeRealm.channels.find((c) => c.id === activeVoiceId)
    : null;

  // The effectively displayed status in the UserProfileBar
  const effectiveStatus =
    manualStatus === "invisible" || manualStatus === "away"
      ? manualStatus
      : isIdle
        ? "away"
        : manualStatus;

  return (
    <div className="layout-minimal">
      <aside className="sidebar">
        <RealmBar realms={asgard.realms} activeId={activeRealm.id} onSelect={() => {}} />

        <ChannelList
          realm={activeRealm}
          activeTextId={location.pathname.split("/").pop()}
          activeVoiceId={activeVoiceId ?? undefined}
          onSelectText={(id) => navigate(`/channels/${id}`)}
          onSelectVoice={(id) => setActiveVoiceId(id)}
          me={asgard.me}
          status={asgard.status}
          voiceStates={asgard.voiceStates}
          onCreateChannel={asgard.createChannel}
          onEditChannel={asgard.editChannel}
          onDeleteChannel={asgard.deleteChannel}
        />

        <UserProfileBar
          user={asgard.me!}
          inVoiceChannel={!!activeVoiceId}
          onDisconnect={() => setActiveVoiceId(null)}
          micMuted={micMuted}
          audioMuted={audioMuted}
          onToggleMic={() => setMicMuted(!micMuted)}
          onToggleAudio={() => {
            const next = !audioMuted;
            setAudioMuted(next);
            if (next) {
              setMicMuted(true); // Deafen also mutes mic
            } else {
              setMicMuted(false); // Undeafening also unmutes mic
            }
          }}
          currentStatus={effectiveStatus}
          onChangeStatus={setManualStatus}
        />
      </aside>

      <main className="chat-area">
        <Routes>
          <Route path="/" element={<HomeRedirect realm={activeRealm} />} />
          <Route
            path="/channels/:channelId"
            element={<ChannelRoute asgard={asgard} realm={activeRealm} />}
          />
          <Route
            path="/settings/profile"
            element={<ProfileSettings me={asgard.me!} onUpdate={asgard.updateProfile} />}
          />
          <Route path="/settings/general" element={<SettingsGeneral />} />
          <Route
            path="/meta"
            element={<div style={{ padding: 24 }}>Carregando Metaverso 2D...</div>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Renderiza a conexão de voz globalmente em background */}
      {activeVoiceChannel && (
        <VoiceRoom
          key={activeVoiceChannel.id}
          channel={activeVoiceChannel}
          asgard={asgard}
          serverUrl={serverUrl}
          micMuted={micMuted}
          audioMuted={audioMuted}
        />
      )}
    </div>
  );
}

function HomeRedirect({ realm }: { realm: any }) {
  const firstTextChannel = realm.channels.find((c: any) => c.kind === "text");
  if (firstTextChannel) {
    return <Navigate to={`/channels/${firstTextChannel.id}`} replace />;
  }
  return <div style={{ padding: 24 }}>Nenhum canal disponível.</div>;
}

function ChannelRoute({ asgard, realm }: { asgard: ReturnType<typeof useAsgard>; realm: any }) {
  const channelId = useLocation().pathname.split("/").pop();
  const channel = realm.channels.find((c: any) => c.id === channelId);

  useEffect(() => {
    if (channel && channel.kind === "text") {
      asgard.loadHistory(channel.id);
    }
  }, [channel?.id, channel?.kind, asgard.loadHistory]);

  if (!channel) {
    return <div style={{ padding: 24, color: "var(--text-secondary)" }}>Canal não encontrado.</div>;
  }

  // Se por acaso alguém navegar para a rota de voz via URL, a gente pode
  // só mostrar um aviso ou redirecionar. Na nova arquitetura não navegamos pra voz.
  if (channel.kind === "voice") {
    return (
      <div style={{ padding: 24, color: "var(--text-secondary)" }}>
        Os canais de voz funcionam em background agora. Clique em um canal de texto para ver o chat!
      </div>
    );
  }

  return (
    <ChatView
      channel={channel}
      messages={channel ? (asgard.messages[channel.id] ?? []) : []}
      error={asgard.lastError}
      online={Object.values(asgard.online)}
      onSend={(content) => channel && asgard.sendMessage(channel.id, content)}
    />
  );
}
