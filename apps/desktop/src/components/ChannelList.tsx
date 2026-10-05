import type { Realm } from "../bindings/Realm";
import type { User } from "../bindings/User";
import type { ConnectionStatus } from "../hooks/useAsgard";

interface Props {
  realm?: Realm;
  activeId?: string;
  onSelect: (id: string) => void;
  me?: User;
  status: ConnectionStatus;
}

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connecting: "Conectando…",
  open: "Online",
  closed: "Reconectando…",
};

export function ChannelList({ realm, activeId, onSelect, me, status }: Props) {
  const text = realm?.channels.filter((c) => c.kind === "text") ?? [];
  const voice = realm?.channels.filter((c) => c.kind === "voice") ?? [];

  return (
    <aside className="channel-list">
      <header>{realm?.name ?? "…"}</header>
      <div className="channels">
        <h3>Texto</h3>
        {text.map((c) => (
          <button
            key={c.id}
            className={c.id === activeId ? "active" : ""}
            onClick={() => onSelect(c.id)}
          >
            # {c.name}
          </button>
        ))}
        <h3>Voz</h3>
        {voice.map((c) => (
          <button key={c.id} disabled title="Voz chega em breve">
            🔊 {c.name}
          </button>
        ))}
      </div>
      <footer>
        <span className={`dot ${status}`} />
        <div>
          <strong>{me?.username ?? "…"}</strong>
          <small>{STATUS_LABEL[status]}</small>
        </div>
      </footer>
    </aside>
  );
}
