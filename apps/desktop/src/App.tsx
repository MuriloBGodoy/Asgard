import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ChannelList } from "./components/ChannelList";
import { ChatView } from "./components/ChatView";
import { VoiceRoom } from "./components/VoiceRoom";
import { Login } from "./components/Login";
import { RealmBar } from "./components/RealmBar";
import { UserProfileBar } from "./components/UserProfileBar";
import { SettingsGeneral } from "./components/SettingsGeneral";
import { useAsgard } from "./hooks/useAsgard";
import { getAppInfo, type AppInfo } from "./lib/config";

export function App() {
  const [info, setInfo] = useState<AppInfo>();
  const [username, setUsername] = useState<string>();

  useEffect(() => {
    getAppInfo().then(setInfo);
  }, []);

  if (!info) return null;

  return (
    <>
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

  // Enviar para o servidor sempre que mudar
  useEffect(() => {
    if (activeVoiceId) {
      asgard.updateVoiceState(micMuted, audioMuted);
    }
  }, [micMuted, audioMuted, activeVoiceId, asgard.updateVoiceState]);

  if (asgard.realms.length === 0) return null;

  const activeRealm = asgard.realms[0];
  const activeVoiceChannel = activeVoiceId 
    ? activeRealm.channels.find(c => c.id === activeVoiceId)
    : null;

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
          username={username} 
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
        />
      </aside>

      <main className="chat-area">
        <Routes>
          <Route path="/" element={<HomeRedirect realm={activeRealm} />} />
          <Route 
            path="/channels/:channelId" 
            element={<ChannelRoute asgard={asgard} realm={activeRealm} />} 
          />
          <Route path="/settings/profile" element={<div style={{padding: 24}}>Configurações de Perfil</div>} />
          <Route path="/settings/general" element={<SettingsGeneral />} />
          <Route path="/meta" element={<div style={{padding: 24}}>Carregando Metaverso 2D...</div>} />
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
  return <div style={{padding: 24}}>Nenhum canal disponível.</div>;
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
    return <div style={{padding: 24, color: "var(--text-secondary)"}}>Canal não encontrado.</div>;
  }

  // Se por acaso alguém navegar para a rota de voz via URL, a gente pode 
  // só mostrar um aviso ou redirecionar. Na nova arquitetura não navegamos pra voz.
  if (channel.kind === "voice") {
    return <div style={{padding: 24, color: "var(--text-secondary)"}}>Os canais de voz funcionam em background agora. Clique em um canal de texto para ver o chat!</div>;
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
