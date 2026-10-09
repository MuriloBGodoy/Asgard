import { useState, useEffect } from "react";

export function SettingsGeneral() {
  const [micId, setMicId] = useState(localStorage.getItem("asgard_mic_device") || "default");
  const [speakerId, setSpeakerId] = useState(
    localStorage.getItem("asgard_speaker_device") || "default",
  );
  const [micVolume, setMicVolume] = useState(
    Number(localStorage.getItem("asgard_mic_volume") ?? 100),
  );
  const [noiseFilterEnabled, setNoiseFilterEnabled] = useState(
    localStorage.getItem("asgard_noise_filter") !== "false",
  ); // Default true

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    // List devices. If names are empty, we need to request permission first.
    async function loadDevices() {
      try {
        let devs = await navigator.mediaDevices.enumerateDevices();
        if (devs.length > 0 && devs[0].label === "") {
          // Precisamos de permissão para ler os nomes
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          devs = await navigator.mediaDevices.enumerateDevices();
          stream.getTracks().forEach((t) => t.stop());
          setPermissionGranted(true);
        } else if (devs.length > 0) {
          setPermissionGranted(true);
        }
        setDevices(devs);
      } catch (err) {
        console.error("Erro ao listar dispositivos:", err);
      }
    }
    loadDevices();
  }, []);

  const audioInputs = devices.filter((d) => d.kind === "audioinput");
  const audioOutputs = devices.filter((d) => d.kind === "audiooutput");

  function saveMic(id: string) {
    setMicId(id);
    localStorage.setItem("asgard_mic_device", id);
    window.dispatchEvent(new Event("asgard_device_change"));
  }

  function saveSpeaker(id: string) {
    setSpeakerId(id);
    localStorage.setItem("asgard_speaker_device", id);
    window.dispatchEvent(new Event("asgard_device_change"));
  }

  function saveVolume(vol: number) {
    setMicVolume(vol);
    localStorage.setItem("asgard_mic_volume", vol.toString());
  }

  function saveNoiseFilter(enabled: boolean) {
    setNoiseFilterEnabled(enabled);
    localStorage.setItem("asgard_noise_filter", enabled.toString());
    window.dispatchEvent(new Event("asgard_noise_filter_change"));
  }

  const [activeTab, setActiveTab] = useState("voice");

  return (
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      {/* SIDEBAR DAS CONFIGURAÇÕES */}
      <div
        style={{
          width: 240,
          background: "var(--bg-panel)",
          borderRight: "1px solid var(--border)",
          padding: "24px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <h3
          style={{
            margin: "0 0 12px 12px",
            fontSize: 12,
            textTransform: "uppercase",
            color: "var(--text-secondary)",
          }}
        >
          Configurações do App
        </h3>
        <div
          onClick={() => setActiveTab("voice")}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            background: activeTab === "voice" ? "var(--bg-hover)" : "transparent",
            color: activeTab === "voice" ? "var(--text-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "voice" ? 500 : 400,
          }}
        >
          Voz e Áudio
        </div>
        <div
          onClick={() => setActiveTab("appearance")}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            background: activeTab === "appearance" ? "var(--bg-hover)" : "transparent",
            color: activeTab === "appearance" ? "var(--text-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "appearance" ? 500 : 400,
          }}
        >
          Aparência
        </div>
        <div
          onClick={() => setActiveTab("notifications")}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            background: activeTab === "notifications" ? "var(--bg-hover)" : "transparent",
            color: activeTab === "notifications" ? "var(--text-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "notifications" ? 500 : 400,
          }}
        >
          Notificações
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div style={{ flex: 1, padding: 40, overflowY: "auto", color: "var(--text-primary)" }}>
        {activeTab === "voice" && (
          <div style={{ maxWidth: 600 }}>
            <h2 style={{ margin: "0 0 24px 0", fontSize: 20 }}>Configurações de Voz e Áudio</h2>

            {!permissionGranted && (
              <div
                style={{
                  padding: 12,
                  background: "rgba(240,71,71,0.1)",
                  color: "var(--danger)",
                  borderRadius: 8,
                  marginBottom: 24,
                }}
              >
                Você precisa permitir o acesso ao microfone para ver a lista de dispositivos.
              </div>
            )}

            {/* DISPOSITIVO DE ENTRADA (MICROFONE) */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 12,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                Dispositivo de Entrada
              </label>
              <select
                value={micId}
                onChange={(e) => saveMic(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              >
                <option value="default">Padrão do Sistema</option>
                {audioInputs.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || "Microfone Desconhecido"}
                  </option>
                ))}
              </select>
            </div>

            {/* DISPOSITIVO DE SAÍDA (ALTO-FALANTE) */}
            <div style={{ marginBottom: 32 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 12,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                Dispositivo de Saída
              </label>
              <select
                value={speakerId}
                onChange={(e) => saveSpeaker(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              >
                <option value="default">Padrão do Sistema</option>
                {audioOutputs.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || "Alto-falante Desconhecido"}
                  </option>
                ))}
              </select>
            </div>

            {/* CONTROLE DE VOLUME DO MICROFONE */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                  }}
                >
                  Volume do Microfone
                </label>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{micVolume}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="200"
                value={micVolume}
                onChange={(e) => saveVolume(Number(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "var(--accent)",
                  cursor: "pointer",
                }}
              />
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 8 }}>
                * O controle de ganho de software por navegador está em desenvolvimento
                experimental. Ele ficará salvo para futuras atualizações.
              </div>
            </div>
            {/* FILTRO DE RUÍDO (KRISP) */}
            <div
              style={{
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  Supressão de Ruído (Krisp)
                </label>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Remove ruídos de fundo como ventiladores, digitação e trânsito usando IA.
                </div>
              </div>
              <label
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: 44,
                  height: 24,
                }}
              >
                <input
                  type="checkbox"
                  checked={noiseFilterEnabled}
                  onChange={(e) => saveNoiseFilter(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: noiseFilterEnabled ? "#43b581" : "var(--bg-hover)",
                    transition: ".4s",
                    borderRadius: 24,
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 2px",
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      backgroundColor: "#fff",
                      borderRadius: "50%",
                      transition: ".4s",
                      transform: noiseFilterEnabled ? "translateX(20px)" : "translateX(0)",
                    }}
                  />
                </span>
              </label>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div style={{ maxWidth: 600 }}>
            <h2 style={{ margin: "0 0 24px 0", fontSize: 20 }}>Aparência</h2>
            <div style={{ color: "var(--text-secondary)" }}>Em breve...</div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div style={{ maxWidth: 600 }}>
            <h2 style={{ margin: "0 0 24px 0", fontSize: 20 }}>Notificações</h2>
            <div style={{ color: "var(--text-secondary)" }}>Em breve...</div>
          </div>
        )}
      </div>
    </div>
  );
}
