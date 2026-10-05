import { invoke, isTauri } from "@tauri-apps/api/core";

export interface AppInfo {
  version: string;
  serverUrl: string;
}

const FALLBACK_URL = import.meta.env.VITE_SERVER_URL ?? "http://127.0.0.1:8080";

/** Dentro do Tauri pergunta ao Rust; no navegador usa a env do Vite. */
export async function getAppInfo(): Promise<AppInfo> {
  if (isTauri()) {
    return invoke<AppInfo>("app_info");
  }
  return { version: "web-dev", serverUrl: FALLBACK_URL };
}

export function toWsUrl(httpUrl: string): string {
  return httpUrl.replace(/^http/, "ws") + "/ws";
}
