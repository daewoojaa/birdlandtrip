import type { Stop } from "./types";

export const num = (v: unknown): number => {
  const n = parseFloat(String(v));
  return isFinite(n) ? n : 0;
};

export const baht = (n: number) => "฿" + Math.round(n).toLocaleString("th-TH");

export const mapUrl = (q: string) =>
  "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);

export const navUrl = (q: string) =>
  "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q);

export const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

export const fmtStamp = (ts: number) =>
  new Date(ts).toLocaleDateString("th-TH", { day: "numeric", month: "short" }) + " " + fmtTime(ts);

export const sortStops = (stops: Stop[]) =>
  [...stops].sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));

export const nextId = () => "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
