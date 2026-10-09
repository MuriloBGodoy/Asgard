import type { Realm } from "../bindings/Realm";

interface Props {
  realms: Realm[];
  activeId?: string;
  onSelect: (id: string) => void;
}

export function RealmBar({ realms, activeId, onSelect }: Props) {
  const activeRealm = realms.find((r) => r.id === activeId) ?? realms[0];
  if (!activeRealm) return null;

  return (
    <div className="realm-selector" onClick={() => onSelect(activeRealm.id)}>
      <div className="realm-icon-mock">{activeRealm.name.substring(0, 1).toUpperCase()}</div>
      <div className="realm-info">
        <div className="realm-name">{activeRealm.name}</div>
      </div>
      <div className="realm-chevron">▼</div>
    </div>
  );
}
