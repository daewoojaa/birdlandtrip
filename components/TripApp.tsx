"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Dashboard, { summaryText } from "./Dashboard";
import StopCard from "./StopCard";
import RouteMap from "./RouteMap";
import { DAYS, TYPES, seed } from "@/lib/seed";
import type { DayKey, LogKey, Stop, StopType, TabKey, TripState } from "@/lib/types";
import { fmtTime, nextId, sortStops } from "@/lib/utils";

const LS_KEY = "khaokho-trip-v1";

function loadLocal(): TripState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const s = JSON.parse(raw) as TripState;
      if (s && s.days && s.days.d6) return s;
    }
  } catch (e) {
    // ignore corrupt storage
  }
  return null;
}

export default function TripApp() {
  const [state, setState] = useState<TripState | null>(null);
  const [tab, setTab] = useState<TabKey>("map");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [toastText, setToastText] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [draft, setDraft] = useState({ time: "", type: "view" as StopType, name: "", query: "" });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const nameRef = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    setState(loadLocal() ?? seed());
  }, []);

  // save to localStorage on every state change (skip the initial load)
  useEffect(() => {
    if (!state) return;
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) {
      // storage full or blocked
    }
  }, [state]);

  const toast = useCallback((t: string) => {
    setToastText(t);
    setToastShow(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 1800);
  }, []);

  const mutate = useCallback((fn: (d: TripState) => void) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      fn(next);
      next.updatedAt = Date.now();
      return next;
    });
  }, []);

  const mutateStop = useCallback(
    (id: string, fn: (s: Stop, day: DayKey, i: number, d: TripState) => void) =>
      mutate((d) => {
        for (const k of Object.keys(d.days) as DayKey[]) {
          const i = d.days[k].findIndex((s) => s.id === id);
          if (i > -1) return fn(d.days[k][i], k, i, d);
        }
      }),
    [mutate],
  );

  if (!state) {
    return (
      <>
        <Header save="กำลังโหลด" />
        <main />
      </>
    );
  }

  const meta = DAYS.find((d) => d.key === tab)!;
  const isDay = tab !== "dash" && tab !== "map";
  const stops = isDay ? state.days[tab as DayKey] : [];
  const done = stops.filter((s) => s.checkin).length;

  const toggle = (id: string) =>
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const checkin = async (id: string, btn: HTMLButtonElement) => {
    btn.disabled = true;
    btn.textContent = "กำลังบันทึกเวลา…";
    const rec = { ts: Date.now(), lat: null as number | null, lng: null as number | null };
    const pos = await new Promise<GeolocationPosition | null>((res) => {
      if (!navigator.geolocation) return res(null);
      navigator.geolocation.getCurrentPosition(res, () => res(null), { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 });
    });
    if (pos) {
      rec.lat = pos.coords.latitude;
      rec.lng = pos.coords.longitude;
    }
    mutateStop(id, (s) => {
      s.checkin = rec;
    });
    toast("เช็คอินแล้ว " + fmtTime(rec.ts));
  };

  const addStop = () => {
    const name = draft.name.trim();
    if (!name) {
      nameRef.current?.focus();
      toast("ใส่ชื่อจุดก่อน");
      return;
    }
    const s: Stop = {
      id: nextId(),
      time: draft.time || "",
      type: draft.type,
      name,
      query: draft.query.trim() || name,
      blurb: "",
      backups: [],
      custom: true,
      checkin: null,
      log: {},
    };
    mutate((d) => {
      d.days[tab as DayKey] = sortStops([...d.days[tab as DayKey], s]);
    });
    setOpen((o) => new Set(o).add(s.id));
    setDraft({ time: "", type: "view", name: "", query: "" });
    toast("เพิ่มรายการแล้ว");
    setTimeout(() => document.getElementById("stop-" + s.id)?.scrollIntoView({ block: "center" }), 50);
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText(state));
      toast("คัดลอกสรุปแล้ว");
    } catch (e) {
      prompt("คัดลอกข้อความนี้", summaryText(state));
    }
  };

  const reset = () => {
    if (!confirm("ล้างบันทึก เช็คอิน และรายการที่เพิ่มเองทั้งหมด แล้วกลับไปเป็นแผนตั้งต้น?")) return;
    const fresh = seed();
    fresh.updatedAt = Date.now();
    setState(fresh);
    setOpen(new Set());
    toast("ล้างข้อมูลแล้ว");
  };

  const renderStop = (s: Stop) => (
    <StopCard
      key={s.id}
      stop={s}
      open={open.has(s.id)}
      onToggle={() => toggle(s.id)}
      onCheckin={(btn) => checkin(s.id, btn)}
      onUncheck={() => {
        if (!confirm("ยกเลิกเวลาเช็คอินของจุดนี้?")) return;
        mutateStop(s.id, (x) => {
          x.checkin = null;
        });
      }}
      onSwap={(i) => {
        const b = s.backups[i];
        mutateStop(s.id, (x) => {
          x.backups[i] = { name: x.name, query: x.query, note: "จุดเดิมในแผน" };
          x.name = b.name;
          x.query = b.query;
          if (b.note) x.blurb = b.note;
        });
        toast("เปลี่ยนเป็น " + b.name);
      }}
      onAddBackup={() => {
        const name = prompt("ชื่อจุดชาร์จสำรอง");
        if (!name) return;
        const q = prompt("คำค้นใน Google Maps (เว้นว่างได้)", name) || name;
        mutateStop(s.id, (x) => {
          x.backups.push({ name: name.trim(), query: q.trim(), note: "" });
        });
      }}
      onDelete={() => {
        if (!confirm("ลบ “" + s.name + "” ออกจากแผน?")) return;
        mutateStop(s.id, (_x, day, i, d) => {
          d.days[day].splice(i, 1);
        });
        toast("ลบแล้ว");
      }}
      onLog={(key: LogKey, value) =>
        mutateStop(s.id, (x) => {
          x.log[key] = value;
        })
      }
      onProp={(prop, value) =>
        mutateStop(s.id, (x) => {
          if (prop === "type") x.type = value as StopType;
          else x[prop] = value;
        })
      }
      onTimeBlur={() =>
        mutate((d) => {
          d.days[tab as DayKey] = sortStops(d.days[tab as DayKey]);
        })
      }
    />
  );

  return (
    <>
      <Header save="บันทึกในเครื่องนี้" />
      <main>
        {isDay ? (
          <>
            <div className="dayhead">
              <div>
                <h2>{meta.title}</h2>
                <p>{meta.sub}</p>
              </div>
              <div className="chip">{done}/{stops.length} เช็คอิน</div>
            </div>
            {stops.length === 0 ? (
              <div className="empty">
                <strong>ยังไม่มีรายการในวันนี้</strong>
                เพิ่มจุดที่อยากไป ร้านอาหาร หรือจุดชาร์จได้จากช่องด้านล่าง
              </div>
            ) : (
              <ol className="road">{stops.map(renderStop)}</ol>
            )}
            <div className="addbox">
              <h3>เพิ่มรายการในวันนี้</h3>
              <div className="grid">
                <label className="f">
                  เวลา
                  <input type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
                </label>
                <label className="f">
                  ประเภท
                  <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as StopType })}>
                    {Object.entries(TYPES).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </label>
                <label className="f wide">
                  ชื่อจุด
                  <input
                    ref={nameRef}
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="เช่น ร้านกาแฟวิวเขา, PEA VOLTA หล่มสัก"
                  />
                </label>
                <label className="f wide">
                  คำค้นใน Google Maps (ไม่ใส่ก็ได้)
                  <input
                    value={draft.query}
                    onChange={(e) => setDraft({ ...draft, query: e.target.value })}
                    placeholder="ถ้าเว้นว่าง จะใช้ชื่อจุด"
                  />
                </label>
              </div>
              <div className="actions" style={{ margin: "12px 0 0" }}>
                <button className="btn primary" onClick={addStop}>เพิ่มรายการ</button>
              </div>
            </div>
          </>
        ) : (
          tab === "map" ? <RouteMap state={state} /> : <Dashboard state={state} onCopy={copySummary} onReset={reset} />
        )}
      </main>

      <nav className="tabs" aria-label="เลือกวัน">
        <div className="tabs-in" role="tablist">
          {DAYS.map((d) => (
            <button
              key={d.key}
              className="tab"
              role="tab"
              aria-selected={tab === d.key}
              onClick={() => {
                setTab(d.key);
                window.scrollTo(0, 0);
              }}
            >
              <span className="d">{d.d}</span>
              <span className="w">{d.w}</span>
            </button>
          ))}
        </div>
      </nav>
      <div className={`toast ${toastShow ? "show" : ""}`} role="status" aria-live="polite">{toastText}</div>
    </>
  );
}

function Header({ save }: { save: string }) {
  return (
    <header className="top">
      <div className="top-row">
        <div>
          <h1>ปากเกร็ด ⇄ Birdland เขาค้อ</h1>
          <div className="sub">5–8 พฤศจิกายน 2569, Geely EX2</div>
        </div>
        <div className="save">{save}</div>
      </div>
    </header>
  );
}
