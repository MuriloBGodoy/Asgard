import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Message } from "../bindings/Message";
import type { Realm } from "../bindings/Realm";
import type { ServerEvent } from "../bindings/ServerEvent";
import type { User } from "../bindings/User";
import { Gateway } from "../lib/gateway";
import { toWsUrl } from "../lib/config";

export type ConnectionStatus = "connecting" | "open" | "closed";

interface State {
  status: ConnectionStatus;
  me?: User;
  realms: Realm[];
  online: Record<string, User>;
  messages: Record<string, Message[]>;
  lastError?: string;
}

type Action =
  | { type: "status"; status: ConnectionStatus }
  | { type: "server"; event: ServerEvent }
  | { type: "history"; channelId: string; messages: Message[] };

const initialState: State = { status: "connecting", realms: [], online: {}, messages: {} };

function mergeMessages(current: Message[] = [], incoming: Message[]): Message[] {
  const byId = new Map(current.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => a.sentAt - b.sentAt);
}

function reduceServerEvent(state: State, event: ServerEvent): State {
  switch (event.type) {
    case "ready":
      return {
        ...state,
        me: event.data.user,
        realms: event.data.realms,
        online: Object.fromEntries(event.data.online.map((u) => [u.id, u])),
        lastError: undefined,
      };
    case "messageCreated": {
      const msg = event.data;
      return {
        ...state,
        messages: {
          ...state.messages,
          [msg.channelId]: mergeMessages(state.messages[msg.channelId], [msg]),
        },
      };
    }
    case "userJoined":
      return { ...state, online: { ...state.online, [event.data.id]: event.data } };
    case "userLeft": {
      const online = { ...state.online };
      delete online[event.data.id];
      return { ...state, online };
    }
    case "error":
      return { ...state, lastError: event.data.message };
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "status":
      return { ...state, status: action.status };
    case "history":
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.channelId]: mergeMessages(state.messages[action.channelId], action.messages),
        },
      };
    case "server":
      return reduceServerEvent(state, action.event);
  }
}

/** Estado global do cliente: conexão, realms, presença e mensagens. */
export function useAsgard(serverUrl: string, username: string) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const gateway = useRef<Gateway | null>(null);

  useEffect(() => {
    const gw = new Gateway({
      url: toWsUrl(serverUrl),
      username,
      onEvent: (event) => dispatch({ type: "server", event }),
      onStatus: (status) => dispatch({ type: "status", status }),
    });
    gateway.current = gw;
    gw.connect();
    return () => gw.close();
  }, [serverUrl, username]);

  const sendMessage = useCallback((channelId: string, content: string) => {
    gateway.current?.send({ type: "sendMessage", data: { channelId, content } });
  }, []);

  const loadHistory = useCallback(
    async (channelId: string) => {
      const res = await fetch(`${serverUrl}/api/channels/${channelId}/messages`);
      if (res.ok) {
        dispatch({ type: "history", channelId, messages: (await res.json()) as Message[] });
      }
    },
    [serverUrl],
  );

  return { ...state, sendMessage, loadHistory };
}
