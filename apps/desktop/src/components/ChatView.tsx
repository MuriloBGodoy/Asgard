import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Channel } from "../bindings/Channel";
import type { Message } from "../bindings/Message";

interface Props {
  channel?: Channel;
  messages: Message[];
  error?: string;
  onSend: (content: string) => void;
}

const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function ChatView({ channel, messages, error, onSend }: Props) {
  const [draft, setDraft] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    setDraft("");
  }

  if (!channel) return <main className="chat empty">Selecione um canal</main>;

  return (
    <main className="chat">
      <header># {channel.name}</header>
      <div className="messages">
        {messages.length === 0 && <p className="hint">Nenhuma mensagem ainda. Diga olá!</p>}
        {messages.map((m) => (
          <article key={m.id} className="message">
            <div className="meta">
              <strong>{m.author.username}</strong>
              <time>{timeFormat.format(m.sentAt)}</time>
            </div>
            <p>{m.content}</p>
          </article>
        ))}
        <div ref={bottom} />
      </div>
      {error && <div className="error">{error}</div>}
      <form className="composer" onSubmit={submit}>
        <input
          placeholder={`Conversar em #${channel.name}`}
          value={draft}
          maxLength={2000}
          onChange={(e) => setDraft(e.target.value)}
        />
      </form>
    </main>
  );
}
