import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Message } from "../bindings/Message";
import type { Realm } from "../bindings/Realm";
import type { ServerEvent } from "../bindings/ServerEvent";
import type { User } from "../bindings/User";
import { Gateway } from "../lib/gateway";
import { toWsUrl } from "../lib/config";

import type { VoiceParticipant } from "../bindings/VoiceParticipant";

export type ConnectionStatus = "connecting" | "open" | "closed";

interface State {
  status: ConnectionStatus;
  me?: User;
  realms: Realm[];
  online: Record<string, User>;
  messages: Record<string, Message[]>;
  voiceStates: Record<string, VoiceParticipant[]>;
  lastError?: string;
}

type Action =
  | { type: "status"; status: ConnectionStatus }
  | { type: "server"; event: ServerEvent }
  | { type: "history"; channelId: string; messages: Message[] }
  | { type: "channelCreated"; realmId: string; channel: any }
  | { type: "channelEdited"; realmId: string; channelId: string; channel: any }
  | { type: "channelDeleted"; realmId: string; channelId: string };

const initialState: State = { status: "connecting", realms: [], online: {}, messages: {}, voiceStates: {} };

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
        voiceStates: event.data.voiceStates,
        lastError: undefined,
      };
    case "voicePresenceUpdated":
      return {
        ...state,
        voiceStates: {
          ...state.voiceStates,
          [event.data.channelId]: event.data.participants,
        },
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
    case "userUpdated":
      if (state.me?.id === event.data.id) {
        return { ...state, me: event.data, online: { ...state.online, [event.data.id]: event.data } };
      }
      return { ...state, online: { ...state.online, [event.data.id]: event.data } };
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
    case "channelCreated":
      return {
        ...state,
        realms: state.realms.map((r) =>
          r.id === action.realmId ? { ...r, channels: [...r.channels, action.channel] } : r
        ),
      };
    case "channelEdited":
      return {
        ...state,
        realms: state.realms.map((r) =>
          r.id === action.realmId
            ? { ...r, channels: r.channels.map((c) => (c.id === action.channelId ? action.channel : c)) }
            : r
        ),
      };
    case "channelDeleted":
      return {
        ...state,
        realms: state.realms.map((r) =>
          r.id === action.realmId
            ? { ...r, channels: r.channels.filter((c) => c.id !== action.channelId) }
            : r
        ),
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

  const createChannel = useCallback(
    async (realmId: string, name: string, kind: "text" | "voice") => {
      const res = await fetch(`${serverUrl}/api/realms/${realmId}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, kind }),
      });
      if (res.ok) {
        const channel = await res.json();
        dispatch({ type: "channelCreated", realmId, channel });
        return channel;
      }
      throw new Error("Failed to create channel");
    },
    [serverUrl],
  );

  const editChannel = useCallback(
    async (realmId: string, channelId: string, name: string) => {
      const res = await fetch(`${serverUrl}/api/realms/${realmId}/channels/${channelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const channel = await res.json();
        dispatch({ type: "channelEdited", realmId, channelId, channel });
        return channel;
      }
      throw new Error("Failed to edit channel");
    },
    [serverUrl],
  );

  const deleteChannel = useCallback(
    async (realmId: string, channelId: string) => {
      const res = await fetch(`${serverUrl}/api/realms/${realmId}/channels/${channelId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        dispatch({ type: "channelDeleted", realmId, channelId });
        return;
      }
      throw new Error("Failed to delete channel");
    },
    [serverUrl],
  );

  const joinVoice = useCallback((channelId: string, micMuted: boolean, deafened: boolean) => {
    gateway.current?.send({ type: "joinVoice", data: { channelId, micMuted, deafened } } as any);
  }, []);

  const leaveVoice = useCallback(() => {
    gateway.current?.send({ type: "leaveVoice" } as any);
  }, []);

  const updateVoiceState = useCallback((micMuted: boolean, deafened: boolean) => {
    gateway.current?.send({ type: "updateVoiceState", data: { micMuted, deafened } } as any);
  }, []);

  const updateUserStatus = useCallback((status: "online" | "away" | "busy" | "invisible") => {
    gateway.current?.send({ type: "updateUserStatus", data: { status } } as any);
  }, []);

  const updateProfile = useCallback((profile: { username?: string, avatarUrl?: string, bannerColor?: string, bio?: string }) => {
    gateway.current?.send({ type: "updateProfile", data: profile } as any);
  }, []);

  return { ...state, sendMessage, loadHistory, createChannel, editChannel, deleteChannel, joinVoice, leaveVoice, updateVoiceState, updateUserStatus, updateProfile };
}
