import { useState, type FormEvent } from "react";
import type { User } from "../bindings/User";

interface Props {
  me: User;
  onUpdate: (profile: { username?: string, avatarUrl?: string, bannerColor?: string, bio?: string }) => void;
}

export function ProfileSettings({ me, onUpdate }: Props) {
  const [username, setUsername] = useState(me.username);
  const [avatarUrl, setAvatarUrl] = useState(me.avatarUrl ?? "");
  const [bannerColor, setBannerColor] = useState(me.bannerColor ?? "#5865F2");
  const [bio, setBio] = useState(me.bio ?? "");

  const [isSaving, setIsSaving] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    onUpdate({
      username: username || undefined,
      avatarUrl: avatarUrl || undefined,
      bannerColor: bannerColor || undefined,
      bio: bio || undefined
    });
    setTimeout(() => setIsSaving(false), 500);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setter(ev.target.result.toString());
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ padding: "60px", display: "flex", gap: "60px", maxWidth: "1000px", margin: "0 auto", width: "100%", color: "var(--text-primary)" }}>
      {/* Formulário */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 32 }}>
        <h2 style={{ marginBottom: 0 }}>Meu Perfil</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)" }}>Nome de exibição</label>
            <input 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              className="chat-input"
              style={{ padding: "12px", borderRadius: 6 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)" }}>Avatar (Imagem Local)</label>
            <input 
              type="file"
              accept="image/*"
              onChange={e => handleImageUpload(e, setAvatarUrl)}
              style={{ color: "var(--text-primary)" }}
            />
            {avatarUrl && (
              <button 
                type="button" 
                onClick={() => setAvatarUrl("")}
                style={{ background: "transparent", color: "var(--danger)", border: "none", cursor: "pointer", textAlign: "left", padding: 0, marginTop: 4 }}
              >
                Remover Avatar
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)" }}>Banner do Perfil</label>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <input 
                type="color"
                value={bannerColor.startsWith("#") ? bannerColor : "#5865F2"} 
                onChange={e => setBannerColor(e.target.value)}
                style={{ width: 64, height: 44, padding: 0, border: "none", borderRadius: 6, cursor: "pointer", background: "none" }}
                title="Escolher Cor Sólida"
              />
              <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>OU</span>
              <input 
                type="file"
                accept="image/*"
                onChange={e => handleImageUpload(e, setBannerColor)}
                style={{ color: "var(--text-primary)" }}
                title="Fazer Upload de Imagem"
              />
            </div>
            {bannerColor.startsWith("data:") && (
              <button 
                type="button" 
                onClick={() => setBannerColor("#5865F2")}
                style={{ background: "transparent", color: "var(--danger)", border: "none", cursor: "pointer", textAlign: "left", padding: 0, marginTop: 4 }}
              >
                Remover Imagem do Banner
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)" }}>Sobre Mim</label>
            <textarea 
              value={bio} 
              onChange={e => setBio(e.target.value)}
              className="chat-input"
              rows={5}
              style={{ padding: "12px", borderRadius: 6, resize: "vertical" }}
            />
          </div>

          <div style={{ width: "100%", height: 1, background: "var(--border)", margin: "8px 0" }} />

          <button 
            type="submit" 
            style={{ 
              background: "var(--primary)", 
              color: "#fff", 
              border: "none", 
              padding: "12px 24px", 
              borderRadius: 4, 
              fontWeight: 600, 
              cursor: "pointer",
              alignSelf: "flex-end",
              transition: "opacity 0.2s"
            }}
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>

      {/* Preview */}
      <div style={{ width: 340 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 16 }}>Preview</h3>
        <div style={{ 
          background: "var(--bg-panel)", 
          borderRadius: 8, 
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
        }}>
          {/* Banner */}
          <div style={{ 
            height: 120, 
            width: "100%",
            background: bannerColor.startsWith("data:") ? `url(${bannerColor})` : bannerColor,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }} />
          
          <div style={{ padding: "0 16px 16px", position: "relative" }}>
            {/* Avatar Profile Box */}
            <div style={{ 
              width: 80, 
              height: 80, 
              borderRadius: "50%", 
              background: "var(--bg-panel)", 
              position: "absolute", 
              top: -40, 
              padding: 6,
              boxSizing: "border-box"
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "var(--primary)",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontSize: 24,
                fontWeight: 600,
                backgroundImage: avatarUrl ? `url(${avatarUrl})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}>
                {!avatarUrl && (username ? username.substring(0, 2).toUpperCase() : "??")}
              </div>
            </div>

            {/* User Details */}
            <div style={{ 
              background: "var(--bg-hover)", 
              borderRadius: 8, 
              padding: 16, 
              marginTop: 48,
              boxShadow: "inset 0 0 0 1px var(--border)"
            }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{username || "Sem Nome"}</div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 2 }}>{username}</div>
              
              <div style={{ width: "100%", height: 1, background: "var(--border)", margin: "12px 0" }} />
              
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8 }}>
                Sobre Mim
              </div>
              <div style={{ fontSize: 14, whiteSpace: "pre-wrap", color: "var(--text-secondary)" }}>
                {bio || "Este usuário não tem nada a dizer sobre si mesmo."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
