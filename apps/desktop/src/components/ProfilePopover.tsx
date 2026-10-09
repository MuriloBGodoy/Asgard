import React, { useState, useRef, useEffect } from "react";
import type { User } from "../bindings/User";
import { createPortal } from "react-dom";

interface Props {
  user: User;
  children: React.ReactNode;
}

export function ProfilePopover({ user, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Tentamos colocar a esquerda do elemento
      let left = rect.left - 320;
      let top = rect.top;

      if (left < 16) {
        // Se não couber à esquerda, colocamos à direita
        left = rect.right + 16;
      }

      setCoords({ top, left });
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node) && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {React.cloneElement(children as React.ReactElement<any>,  {
        ref: triggerRef,
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        },
        style: { ...((children as React.ReactElement<any>).props.style || {}), cursor: "pointer" }
      })}

      {isOpen && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: Math.max(16, Math.min(window.innerHeight - 380, coords.top)),
            left: coords.left,
            width: 320,
            background: "var(--bg-panel)",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            overflow: "hidden",
            zIndex: 9999,
          }}
        >
          {/* Banner */}
          <div style={{ 
            height: 120, 
            width: "100%",
            backgroundColor: (user.banner_color && !user.banner_color.startsWith("data:")) ? user.banner_color : "#5865F2",
            backgroundImage: (user.banner_color && user.banner_color.startsWith("data:")) ? `url(${user.banner_color})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }} />
          
          <div style={{ padding: "0 16px 16px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginTop: "12px", marginBottom: "16px" }}>
              {/* Avatar Profile Box */}
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: "50%", 
                background: "var(--bg-panel)", 
                padding: 6,
                boxSizing: "border-box",
                flexShrink: 0,
                marginTop: "-50px" // Move avatar up over the banner
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
                  backgroundImage: user.avatar_url ? `url(${user.avatar_url})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}>
                  {!user.avatar_url && user.username.substring(0, 2).toUpperCase()}
                </div>
              </div>

              {/* User Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>{user.username}</div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ 
                    width: 10, height: 10, borderRadius: "50%", 
                    backgroundColor: user.status === "online" ? "#43b581" : user.status === "away" ? "#faa61a" : user.status === "busy" ? "#f04747" : "#747f8d" 
                  }} />
                  {user.status === "online" ? "Online" : user.status === "away" ? "Ausente" : user.status === "busy" ? "Ocupado" : "Invisível"}
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
                {user.bio || "Este usuário não tem nada a dizer sobre si mesmo."}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}




