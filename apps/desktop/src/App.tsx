import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ChannelList } from "./components/ChannelList";
import { ChatView } from "./components/ChatView";
import { Login } from "./components/Login";
import { RealmBar } from "./components/RealmBar";
import { UserProfileBar } from "./components/UserProfileBar";
import { useAsgard } from "./hooks/useAsgard";
import { getAppInfo, type AppInfo } from "./lib/config";

export function App() {
  const [info, setInfo] = useState<AppInfo>();
  const [username, setUsername] = useState<string>();

  useEffect(() => {
    getAppInfo().then(setInfo);
  }, []);

  if (!info) return null;
  if (!username) return <Login version={info.version} onSubmit={setUsername} />;
  return <Workspace serverUrl={info.serverUrl} username={username} />;
}

function Workspace({ serverUrl, username }: { serverUrl: string; username: string }) {
  const asgard = useAsgard(serverUrl, username);
  const navigate = useNavigate();
  const location = useLocation();

  if (asgard.realms.length === 0) return null;

  const activeRealm = asgard.realms[0];

  return (
    <div className="layout-minimal">
      <aside className="sidebar">
        <RealmBar realms={asgard.realms} activeId={activeRealm.id} onSelect={() => {}} />
        
        <ChannelList
          realm={activeRealm}
          activeId={location.pathname.split("/").pop()}
          onSelect={(id) => navigate(`/channels/${id}`)}
          me={asgard.me}
          status={asgard.status}
          onCreateChannel={asgard.createChannel}
          onEditChannel={asgard.editChannel}
          onDeleteChannel={asgard.deleteChannel}
        />

        <UserProfileBar username={username} />
      </aside>

      <main className="chat-area">
        <Routes>
          <Route path="/" element={<HomeRedirect realm={activeRealm} />} />
          <Route 
            path="/channels/:channelId" 
            element={<ChatRoute asgard={asgard} realm={activeRealm} />} 
          />
          <Route path="/settings/profile" element={<div style={{padding: 24}}>Configurações de Perfil</div>} />
          <Route path="/settings/general" element={<div style={{padding: 24}}>Configurações Gerais do Asgard</div>} />
          <Route path="/meta" element={<div style={{padding: 24}}>Carregando Metaverso 2D...</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
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

function ChatRoute({ asgard, realm }: { asgard: ReturnType<typeof useAsgard>; realm: any }) {
  const channelId = useLocation().pathname.split("/").pop();
  const channel = realm.channels.find((c: any) => c.id === channelId);

  useEffect(() => {
    if (channel && channel.kind === "text") {
      asgard.loadHistory(channel.id);
    }
  }, [channel?.id, channel?.kind, asgard.loadHistory]);

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
