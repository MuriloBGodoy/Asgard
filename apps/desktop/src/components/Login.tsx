import { useState, type FormEvent } from "react";

interface Props {
  version: string;
  onSubmit: (username: string) => void;
}

export function Login({ version, onSubmit }: Props) {
  const [name, setName] = useState("");
  const trimmed = name.trim();
  const valid = trimmed.length >= 2 && trimmed.length <= 32;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (valid) onSubmit(trimmed);
  }

  return (
    <div className="login-wrapper">
      <form className="login-box" onSubmit={submit}>
        <div className="login-brand">ASGARD</div>
        <div className="login-subtitle">Workspace & Community</div>

        <div className="login-form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            autoFocus
            placeholder="Enter your name"
            value={name}
            maxLength={32}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <button type="submit" className="login-button" disabled={!valid}>
          Continue
        </button>

        <div className="login-footer">v{version}</div>
      </form>
    </div>
  );
}
