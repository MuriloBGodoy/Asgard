import { useEffect, useState } from "react";
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant } from "@livekit/components-react";
import "@livekit/components-styles";
import type { Channel } from "../bindings/Channel";

interface Props {
  channel: Channel;
  asgard: any;
  serverUrl: string;
  micMuted?: boolean;
  audioMuted?: boolean;
}

// Sincroniza o estado de mute local com o LiveKit
function LiveKitMuteSync({ micMuted }: { micMuted: boolean }) {
  const { localParticipant } = useLocalParticipant();
  useEffect(() => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(!micMuted);
    }
  }, [micMuted, localParticipant]);
  return null;
}

import { RoomEvent } from "livekit-client";
function ActiveSpeakersSync() {
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return;

    const onSpeakersChanged = (speakers: any[]) => {
      const names = speakers.map((s) => s.name).filter(Boolean);
      window.dispatchEvent(new CustomEvent("asgard_speaking_update", { detail: names }));
    };

    room.on(RoomEvent.ActiveSpeakersChanged, onSpeakersChanged);
    return () => {
      room.off(RoomEvent.ActiveSpeakersChanged, onSpeakersChanged);
      window.dispatchEvent(new CustomEvent("asgard_speaking_update", { detail: [] }));
    };
  }, [room]);

  return null;
}

// Sincroniza os dispositivos de hardware com o LiveKit
import { useRoomContext } from "@livekit/components-react";
function LiveKitDeviceSync() {
  const room = useRoomContext();
  const [micId, setMicId] = useState(localStorage.getItem("asgard_mic_device"));
  const [speakerId, setSpeakerId] = useState(localStorage.getItem("asgard_speaker_device"));

  useEffect(() => {
    function handleDeviceChange() {
      setMicId(localStorage.getItem("asgard_mic_device"));
      setSpeakerId(localStorage.getItem("asgard_speaker_device"));
    }
    window.addEventListener("asgard_device_change", handleDeviceChange);
    return () => window.removeEventListener("asgard_device_change", handleDeviceChange);
  }, []);

  useEffect(() => {
    if (room && micId && micId !== "default") {
      room.switchActiveDevice("audioinput", micId).catch(console.error);
    }
  }, [room, micId]);

  useEffect(() => {
    if (room && speakerId && speakerId !== "default") {
      room.switchActiveDevice("audiooutput", speakerId).catch(console.error);
    }
  }, [room, speakerId]);

  return null;
}

import { KrispNoiseFilter, isKrispNoiseFilterSupported } from "@livekit/krisp-noise-filter";

let krispFilter: any = null;
if (isKrispNoiseFilterSupported()) {
  krispFilter = KrispNoiseFilter();
}

export function VoiceRoom({
  channel,
  asgard,
  serverUrl,
  micMuted = false,
  audioMuted = false,
}: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [liveKitUrl, setLiveKitUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    asgard.joinVoice(channel.id, micMuted, audioMuted);
    return () => asgard.leaveVoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.id, asgard.joinVoice, asgard.leaveVoice]);

  useEffect(() => {
    // Busca o token do nosso backend Rust
    // O serverUrl no config j tem o "http://ip:porta", s precisamos adicionar /api/livekit/token
    const fetchToken = async () => {
      if (!asgard.me) return;
      try {
        const httpUrl = serverUrl.replace("ws://", "http://").replace("wss://", "https://");
        const res = await fetch(
          `${httpUrl}/api/livekit/token?room=${encodeURIComponent(channel.id)}&participant_name=${encodeURIComponent(asgard.me.username)}`,
        );
        if (!res.ok) {
          throw new Error("Falha ao obter token de voz");
        }
        const data = await res.json();
        setToken(data.token);
        setLiveKitUrl(data.livekit_url);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchToken();
  }, [channel.id, asgard.me, serverUrl]);

  const [noiseFilterEnabled, setNoiseFilterEnabled] = useState(
    localStorage.getItem("asgard_noise_filter") !== "false",
  ); // Default true

  useEffect(() => {
    function handleNoiseFilterChange() {
      setNoiseFilterEnabled(localStorage.getItem("asgard_noise_filter") !== "false");
    }
    window.addEventListener("asgard_noise_filter_change", handleNoiseFilterChange);
    return () => window.removeEventListener("asgard_noise_filter_change", handleNoiseFilterChange);
  }, []);

  if (error) {
    console.error("Erro na sala de voz:", error);
    return null;
  }

  if (!token || !liveKitUrl) {
    return null; // Connecting...
  }

  const savedMicId = localStorage.getItem("asgard_mic_device");
  const audioOptions = !micMuted
    ? {
        deviceId: savedMicId && savedMicId !== "default" ? savedMicId : undefined,
        processor: noiseFilterEnabled && krispFilter ? krispFilter : undefined,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    : false;

  return (
    <div style={{ display: "none" }}>
      <LiveKitRoom video={false} audio={audioOptions} token={token} serverUrl={liveKitUrl}>
        <LiveKitMuteSync micMuted={micMuted} />
        <LiveKitDeviceSync />
        <ActiveSpeakersSync />
        {!audioMuted && <RoomAudioRenderer />}
      </LiveKitRoom>
    </div>
  );
}
