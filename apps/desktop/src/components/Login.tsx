import { useState, type FormEvent } from "react";

interface Props {
  version: string;
  onSubmit: (username: string) => void;
}

/** Login provisório: só um nome. Autenticação de verdade vem depois. */
export function Login({ version, onSubmit }: Props) {
  const [name, setName] = useState("");
  const trimmed = name.trim();
  const valid = trimmed.length >= 2 && trimmed.length <= 32;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (valid) onSubmit(trimmed);
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <h1>ASGARD</h1>
        <p>Games e trabalho, no mesmo reino.</p>
        <input
          autoFocus
          placeholder="Seu nome"
          value={name}
          maxLength={32}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" disabled={!valid}>
          Entrar
        </button>
        <small>v{version}</small>
      </form>
    </div>
  );
}
