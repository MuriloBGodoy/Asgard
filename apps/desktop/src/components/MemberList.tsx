import type { User } from "../bindings/User";

export function MemberList({ online }: { online: User[] }) {
  return (
    <aside className="member-list">
      <h3>Online — {online.length}</h3>
      {online.map((u) => (
        <div key={u.id} className="member">
          <span className="avatar">{u.username.slice(0, 1).toUpperCase()}</span>
          {u.username}
        </div>
      ))}
    </aside>
  );
}
