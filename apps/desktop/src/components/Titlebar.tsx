import { getCurrentWindow } from "@tauri-apps/api/window";
import { isTauri } from "@tauri-apps/api/core";

export function Titlebar() {
  if (!isTauri()) return null;

  const appWindow = getCurrentWindow();

  return (
    <div
      className="titlebar"
      style={{
        height: 32,
        background: "var(--bg-panel)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingLeft: 16,
        userSelect: "none",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <div
        onPointerDown={(e) => {
          if (e.buttons === 1) {
            e.preventDefault();
            appWindow.startResizeDragging("North");
          }
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          cursor: "ns-resize",
          zIndex: 9999,
        }}
      />

      <div 
        data-tauri-drag-region 
        style={{
          position: "absolute",
          top: 4,
          left: 0,
          right: 140, // Espaço para os 3 botões da direita
          bottom: 0,
        }}
      />

      <div 
        style={{ 
          fontSize: 12, 
          fontWeight: 600, 
          color: "var(--text-secondary)", 
          pointerEvents: "none",
          position: "relative",
        }}
      >
        ASGARD
      </div>
      
      <div className="titlebar-actions" style={{ display: "flex", height: "100%", position: "relative" }}>
        <button
          className="titlebar-button"
          onClick={() => appWindow.minimize()}
          title="Minimizar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor">
            <line x1="2" y1="6" x2="10" y2="6" strokeWidth="1.2" />
          </svg>
        </button>
        <button
          className="titlebar-button"
          onClick={() => appWindow.toggleMaximize()}
          title="Maximizar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor">
            <rect x="2.5" y="2.5" width="7" height="7" strokeWidth="1.2" />
          </svg>
        </button>
        <button
          className="titlebar-button titlebar-close"
          onClick={() => appWindow.close()}
          title="Fechar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor">
            <line x1="3" y1="3" x2="9" y2="9" strokeWidth="1.2" />
            <line x1="3" y1="9" x2="9" y2="3" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
