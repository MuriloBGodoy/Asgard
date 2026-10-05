import { useEffect, useState } from "react";
import { ChannelList } from "./components/ChannelList";
import { ChatView } from "./components/ChatView";
import { Login } from "./components/Login";
import { MemberList } from "./components/MemberList";
import { RealmBar } from "./components/RealmBar";
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
  const [realmId, setRealmId] = useState<string>();
  const [channelId, setChannelId] = useState<string>();

  const realm = asgard.realms.find((r) => r.id === realmId) ?? asgard.realms[0];
  const channel =
    realm?.channels.find((c) => c.id === channelId) ??
    realm?.channels.find((c) => c.kind === "text");

  const { loadHistory } = asgard;
  useEffect(() => {
    if (channel?.kind === "text") loadHistory(channel.id);
  }, [channel?.id, channel?.kind, loadHistory]);

  return (
    <div className="layout">
      <RealmBar realms={asgard.realms} activeId={realm?.id} onSelect={setRealmId} />
      <ChannelList
        realm={realm}
        activeId={channel?.id}
        onSelect={setChannelId}
        me={asgard.me}
        status={asgard.status}
      />
      <ChatView
        channel={channel}
        messages={channel ? (asgard.messages[channel.id] ?? []) : []}
        error={asgard.lastError}
        onSend={(content) => channel && asgard.sendMessage(channel.id, content)}
      />
      <MemberList online={Object.values(asgard.online)} />
    </div>
  );
}
