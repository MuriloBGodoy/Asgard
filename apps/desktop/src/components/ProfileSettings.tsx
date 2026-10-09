import { useState, type FormEvent } from "react";
import type { User } from "../bindings/User";

interface Props {
  me: User;
  onUpdate: (profile: { username?: string, avatarUrl?: string, bannerColor?: string, bio?: string }) => void;
}

export function ProfileSettings({ me, onUpdate }: Props) {
  const [username, setUsername] = useState(me.username);
  const [avatarUrl, setAvatarUrl] = useState(me.avatar_url ?? "");
  const [bannerColor, setBannerColor] = useState(me.banner_color ?? "#5865F2");
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
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ 
                background: "var(--bg-hover)", 
                padding: "8px 16px", 
                borderRadius: 4, 
                cursor: "pointer", 
                fontSize: 14, 
                fontWeight: 500,
                border: "1px solid var(--border)"
              }}>
                Escolher Arquivo
                <input 
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageUpload(e, setAvatarUrl)}
                  style={{ display: "none" }}
                />
              </label>
              {avatarUrl && (
                <button 
                  type="button" 
                  onClick={() => setAvatarUrl("")}
                  style={{ background: "transparent", color: "var(--danger)", border: "none", cursor: "pointer", fontSize: 14 }}
                >
                  Remover
                </button>
              )}
            </div>
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
              
              <label style={{ 
                background: "var(--bg-hover)", 
                padding: "8px 16px", 
                borderRadius: 4, 
                cursor: "pointer", 
                fontSize: 14, 
                fontWeight: 500,
                border: "1px solid var(--border)"
              }}>
                Escolher Imagem
                <input 
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageUpload(e, setBannerColor)}
                  style={{ display: "none" }}
                />
              </label>

              {bannerColor.startsWith("data:") && (
                <button 
                  type="button" 
                  onClick={() => setBannerColor("#5865F2")}
                  style={{ background: "transparent", color: "var(--danger)", border: "none", cursor: "pointer", fontSize: 14 }}
                >
                  Remover Imagem
                </button>
              )}
            </div>
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

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button 
              type="button"
              onClick={() => {
                setUsername(me.username);
                setAvatarUrl(me.avatar_url ?? "");
                setBannerColor(me.banner_color ?? "#5865F2");
                setBio(me.bio ?? "");
              }}
              style={{ 
                background: "transparent", 
                color: "var(--text-primary)", 
                border: "1px solid var(--border)", 
                padding: "12px 24px", 
                borderRadius: 4, 
                fontWeight: 600, 
                cursor: "pointer",
                transition: "opacity 0.2s"
              }}
            >
              Descartar Alterações
            </button>
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
                transition: "opacity 0.2s"
              }}
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
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
            backgroundColor: (bannerColor && !bannerColor.startsWith("data:")) ? bannerColor : "#5865F2",
            backgroundImage: (bannerColor && bannerColor.startsWith("data:")) ? `url(${bannerColor})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }} />
          
                    <div style={{ padding: "0 16px 16px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", marginTop: "-30px", marginBottom: "12px" }}>
              {/* Avatar Profile Box */}
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: "50%", 
                background: "var(--bg-panel)", 
                padding: 6,
                boxSizing: "border-box",
                flexShrink: 0
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
              <div style={{ paddingBottom: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>{username || "Sem Nome"}</div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ 
                    width: 10, height: 10, borderRadius: "50%", 
                    backgroundColor: me.status === "online" ? "#43b581" : me.status === "away" ? "#faa61a" : me.status === "busy" ? "#f04747" : "#747f8d" 
                  }} />
                  {me.status === "online" ? "Online" : me.status === "away" ? "Ausente" : me.status === "busy" ? "Ocupado" : "Invisível"}
                </div>
              </div>
            </div>
              
            <div style={{ 
              background: "var(--bg-hover)", 
              borderRadius: 8, 
              padding: 12, 
              border: "1px solid var(--border)"
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8 }}>
                Sobre Mim
              </div>
              <div style={{ fontSize: 14, whiteSpace: "pre-wrap", color: "var(--text-primary)", lineHeight: 1.4 }}>
                {bio || "Este usuário não tem nada a dizer sobre si mesmo."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


