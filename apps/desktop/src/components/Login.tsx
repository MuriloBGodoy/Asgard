import { useState } from "react";

interface Props {
  version: string;
  onSubmit: (username: string) => void;
}

export function Login({ version, onSubmit }: Props) {
  const [name, setName] = useState("");
  const trimmed = name.trim();
  const valid = trimmed.length >= 2 && trimmed.length <= 32;

  function submit(e?: any) {
    if (e && e.preventDefault) e.preventDefault();
    if (valid) onSubmit(trimmed);
  }

  return (
    <div className="login-wrapper">
      <div className="login-box" onKeyDown={(e) => { if (e.key === 'Enter') submit(e); }}>
        <div className="login-brand">ASGARD</div>
        <div className="login-subtitle">Workspace & Community</div>

        <div className="login-form-group">
          <label htmlFor="asgard-username">Username</label>
          <input
            id="asgard-username"
            name="asgard_username_field"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            placeholder="Enter your name"
            value={name}
            maxLength={32}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <button type="button" onClick={submit} className="login-button" disabled={!valid}>
          Continue
        </button>

        <div className="login-footer">v{version}</div>
      </div>
    </div>
  );
}
