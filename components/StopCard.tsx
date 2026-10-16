"use client";

import { TYPES } from "@/lib/seed";
import type { LogKey, Stop, StopType } from "@/lib/types";
import { fmtStamp, fmtTime, mapUrl, navUrl } from "@/lib/utils";

interface Props {
  stop: Stop;
  open: boolean;
  onToggle: () => void;
  onCheckin: (btn: HTMLButtonElement) => void;
  onUncheck: () => void;
  onSwap: (i: number) => void;
  onAddBackup: () => void;
  onDelete: () => void;
  onLog: (key: LogKey, value: string) => void;
  onProp: (prop: "time" | "type" | "name" | "query" | "blurb", value: string) => void;
  onTimeBlur: () => void;
}

function NumField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <label className="f">
      {label}
      <input type="number" inputMode="decimal" step="any" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export default function StopCard(p: Props) {
  const s = p.stop;
  const L = s.log || {};
  const here = s.checkin && s.checkin.lat != null && s.checkin.lng != null ? `${s.checkin.lat.toFixed(5)},${s.checkin.lng.toFixed(5)}` : null;
  const isCharge = s.type === "charge";

  return (
    <li className={`stop ${s.checkin ? "done" : ""} ${p.open ? "open" : ""}`} id={`stop-${s.id}`}>
      <span className="marker" aria-hidden="true" />
      <div className="card">
        <button className="summary" onClick={p.onToggle} aria-expanded={p.open}>
          <span className="time">{s.time || "–"}</span>
          <span className="name">{s.name}</span>
          {s.checkin ? (
            <span className="chip done">เช็คอิน {fmtTime(s.checkin.ts)}</span>
          ) : (
            <span className={`chip ${isCharge ? "charge" : ""}`}>{TYPES[s.type] || "อื่น ๆ"}</span>
          )}
          {s.blurb && <span className="blurb">{s.blurb}</span>}
        </button>
        <div className="body">
          <div className="actions">
            {s.checkin ? (
              <button className="btn ghost" onClick={p.onUncheck}>ยกเลิกเช็คอิน</button>
            ) : (
              <button className="btn primary" onClick={(e) => p.onCheckin(e.currentTarget)}>เช็คอินตอนนี้</button>
            )}
            <a className="btn blue" href={navUrl(s.query)} target="_blank" rel="noopener">นำทาง</a>
            <a className="btn" href={mapUrl(s.query)} target="_blank" rel="noopener">เปิดใน Maps</a>
            {here && <a className="btn" href={mapUrl(here)} target="_blank" rel="noopener">จุดที่เช็คอินจริง</a>}
          </div>
          {s.checkin && (
            <p className="stamp">
              เช็คอินเมื่อ <strong>{fmtStamp(s.checkin.ts)}</strong>
              {here ? "" : " (ไม่ได้บันทึกพิกัด)"}
            </p>
          )}
          <fieldset>
            <legend>การขับขี่</legend>
            <div className="grid g3">
              <NumField label="เลขไมล์ (กม.)" value={L.odo} onChange={(v) => p.onLog("odo", v)} />
              <NumField label={isCharge ? "แบตตอนถึง (%)" : "แบตตอนนี้ (%)"} value={L.socIn} onChange={(v) => p.onLog("socIn", v)} />
              {isCharge && <NumField label="แบตตอนออก (%)" value={L.socOut} onChange={(v) => p.onLog("socOut", v)} />}
            </div>
          </fieldset>
          {isCharge && (
            <fieldset>
              <legend>การชาร์จ</legend>
              <div className="grid g3">
                <NumField label="ไฟที่ชาร์จ (kWh)" value={L.kwh} onChange={(v) => p.onLog("kwh", v)} />
                <NumField label="ค่าชาร์จ (บาท)" value={L.costCharge} onChange={(v) => p.onLog("costCharge", v)} />
                <NumField label="เวลาชาร์จ (นาที)" value={L.minutes} onChange={(v) => p.onLog("minutes", v)} />
              </div>
            </fieldset>
          )}
          <fieldset>
            <legend>ค่าใช้จ่ายอื่น</legend>
            <div className="grid">
              <NumField label="ค่ากิน (บาท)" value={L.costFood} onChange={(v) => p.onLog("costFood", v)} />
              <NumField label="อื่น ๆ (บาท)" value={L.costOther} onChange={(v) => p.onLog("costOther", v)} />
              <label className="f wide">
                บันทึก
                <textarea
                  value={L.note ?? ""}
                  onChange={(e) => p.onLog("note", e.target.value)}
                  placeholder="ถนน สภาพการจราจร เมนูที่กิน มุมถ่ายรูป…"
                />
              </label>
            </div>
          </fieldset>
          {s.backups.length > 0 && (
            <fieldset>
              <legend>จุดชาร์จสำรอง</legend>
              <ul className="backups">
                {s.backups.map((b, i) => (
                  <li key={i}>
                    <span className="bn">
                      {b.name}
                      {b.note && <small>{b.note}</small>}
                    </span>
                    <span className="ba">
                      <a className="mini" href={navUrl(b.query)} target="_blank" rel="noopener">นำทาง</a>
                      <button className="mini" onClick={() => p.onSwap(i)}>ใช้แทน</button>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="note" style={{ margin: "8px 0 0" }}>
                กด “ใช้แทน” เพื่อสลับเป็นจุดหลัก จุดเดิมจะย้ายไปอยู่ในรายการสำรอง
              </p>
            </fieldset>
          )}
          <details className="edit">
            <summary>แก้ไขจุดนี้</summary>
            <div className="grid" style={{ marginTop: 8 }}>
              <label className="f">
                เวลา
                <input type="time" value={s.time} onChange={(e) => p.onProp("time", e.target.value)} onBlur={p.onTimeBlur} />
              </label>
              <label className="f">
                ประเภท
                <select value={s.type} onChange={(e) => p.onProp("type", e.target.value as StopType)}>
                  {Object.entries(TYPES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>
              <label className="f wide">
                ชื่อจุด
                <input value={s.name} onChange={(e) => p.onProp("name", e.target.value)} />
              </label>
              <label className="f wide">
                คำค้นใน Google Maps
                <input value={s.query} onChange={(e) => p.onProp("query", e.target.value)} />
              </label>
              <label className="f wide">
                รายละเอียด
                <input value={s.blurb} onChange={(e) => p.onProp("blurb", e.target.value)} />
              </label>
            </div>
            <div className="actions" style={{ margin: "10px 0 0" }}>
              <button className="btn" onClick={p.onAddBackup}>เพิ่มจุดสำรอง</button>
              <button className="btn danger" onClick={p.onDelete}>ลบจุดนี้</button>
            </div>
          </details>
        </div>
      </div>
    </li>
  );
}
