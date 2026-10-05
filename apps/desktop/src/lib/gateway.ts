import type { ClientEvent } from "../bindings/ClientEvent";
import type { ServerEvent } from "../bindings/ServerEvent";

type Status = "connecting" | "open" | "closed";

interface GatewayOptions {
  url: string;
  username: string;
  onEvent: (event: ServerEvent) => void;
  onStatus: (status: Status) => void;
}

/**
 * Conexão WebSocket com o servidor, com reconexão automática (backoff exponencial).
 * Se no futuro a conexão migrar para o lado Rust do Tauri, só este arquivo muda.
 */
export class Gateway {
  private socket?: WebSocket;
  private retries = 0;
  private closedByUser = false;
  private retryTimer?: ReturnType<typeof setTimeout>;

  constructor(private readonly opts: GatewayOptions) {}

  connect(): void {
    this.closedByUser = false;
    this.opts.onStatus("connecting");
    const socket = new WebSocket(this.opts.url);
    this.socket = socket;

    socket.onopen = () => {
      this.retries = 0;
      this.opts.onStatus("open");
      this.send({ type: "identify", data: { username: this.opts.username } });
    };
    socket.onmessage = (msg) => {
      this.opts.onEvent(JSON.parse(msg.data) as ServerEvent);
    };
    socket.onclose = () => {
      this.opts.onStatus("closed");
      if (!this.closedByUser) this.scheduleReconnect();
    };
  }

  send(event: ClientEvent): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
    }
  }

  close(): void {
    this.closedByUser = true;
    clearTimeout(this.retryTimer);
    this.socket?.close();
  }

  private scheduleReconnect(): void {
    const delay = Math.min(1000 * 2 ** this.retries, 15_000);
    this.retries += 1;
    this.retryTimer = setTimeout(() => this.connect(), delay);
  }
}
