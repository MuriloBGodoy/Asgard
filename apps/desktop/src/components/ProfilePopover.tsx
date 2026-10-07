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
      {React.cloneElement(children as React.ReactElement, {
        ref: triggerRef,
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        },
        style: { ...((children as React.ReactElement).props.style || {}), cursor: "pointer" }
      })}

      {isOpen && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: Math.max(16, Math.min(window.innerHeight - 380, coords.top)),
            left: coords.left,
            width: 300,
            background: "var(--bg-panel)",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            overflow: "hidden",
            zIndex: 9999,
          }}
        >
          {/* Banner */}
          <div style={{ 
            height: 100, 
            width: "100%",
            background: (user.bannerColor && user.bannerColor.startsWith("data:")) ? `url(${user.bannerColor})` : (user.bannerColor ?? "#5865F2"),
            backgroundSize: "cover",
            backgroundPosition: "center"
          }} />
          
          <div style={{ padding: "0 16px 16px", position: "relative" }}>
            {/* Avatar Profile Box */}
            <div style={{ 
              width: 72, 
              height: 72, 
              borderRadius: "50%", 
              background: "var(--bg-panel)", 
              position: "absolute", 
              top: -36, 
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
                fontSize: 20,
                fontWeight: 600,
                backgroundImage: user.avatarUrl ? `url(${user.avatarUrl})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}>
                {!user.avatarUrl && user.username.substring(0, 2).toUpperCase()}
              </div>
            </div>

            {/* User Details */}
            <div style={{ 
              background: "var(--bg-hover)", 
              borderRadius: 8, 
              padding: 16, 
              marginTop: 40,
              boxShadow: "inset 0 0 0 1px var(--border)"
            }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{user.username}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ 
                  width: 8, height: 8, borderRadius: "50%", 
                  backgroundColor: user.status === "online" ? "#43b581" : user.status === "away" ? "#faa61a" : user.status === "busy" ? "#f04747" : "#747f8d" 
                }} />
                {user.status}
              </div>
              
              <div style={{ width: "100%", height: 1, background: "var(--border)", margin: "12px 0" }} />
              
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8 }}>
                Sobre Mim
              </div>
              <div style={{ fontSize: 13, whiteSpace: "pre-wrap", color: "var(--text-primary)" }}>
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
