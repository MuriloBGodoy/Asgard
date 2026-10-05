import type { Realm } from "../bindings/Realm";

interface Props {
  realms: Realm[];
  activeId?: string;
  onSelect: (id: string) => void;
}

export function RealmBar({ realms, activeId, onSelect }: Props) {
  return (
    <nav className="realm-bar">
      {realms.map((realm) => (
        <button
          key={realm.id}
          title={`${realm.name} · ${realm.kind === "gaming" ? "Games" : "Trabalho"}`}
          className={`realm-icon ${realm.kind} ${realm.id === activeId ? "active" : ""}`}
          onClick={() => onSelect(realm.id)}
        >
          {realm.name.slice(0, 2).toUpperCase()}
        </button>
      ))}
    </nav>
  );
}
