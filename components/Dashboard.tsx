"use client";

import { DAYS, DAY_KEYS } from "@/lib/seed";
import type { DayKey, Stop, TripState } from "@/lib/types";
import { baht, fmtTime, num } from "@/lib/utils";

export function summaryText(state: TripState): string {
  const lines = ["ทริปปากเกร็ด ⇄ เขาค้อ 5–8 พ.ย."];
  DAY_KEYS.forEach((k) => {
    state.days[k]
      .filter((s) => s.checkin)
      .forEach((s) => {
        const L = s.log || {};
        const c = num(L.costCharge) + num(L.costFood) + num(L.costOther);
        const day = DAYS.find((x) => x.key === k)!.d;
        lines.push(`${day}/11 ${fmtTime(s.checkin!.ts)} ${s.name}${num(L.kwh) ? ` ${num(L.kwh)}kWh` : ""}${c ? ` ${baht(c)}` : ""}`);
      });
  });
  return lines.join("\n");
}

export default function Dashboard({ state, onCopy, onReset }: { state: TripState; onCopy: () => void; onReset: () => void }) {
  const all: { k: DayKey; s: Stop }[] = [];
  DAY_KEYS.forEach((k) => state.days[k].forEach((s) => all.push({ k, s })));

  let charge = 0, food = 0, other = 0, kwh = 0, mins = 0, nCharges = 0;
  const odos: number[] = [];
  const perDay: Record<string, { c: number; f: number; o: number }> = {};
  all.forEach(({ k, s }) => {
    const L = s.log || {};
    const c = num(L.costCharge), f = num(L.costFood), o = num(L.costOther);
    charge += c; food += f; other += o; kwh += num(L.kwh); mins += num(L.minutes);
    if (num(L.kwh) > 0 || c > 0) nCharges++;
    if (num(L.odo) > 0) odos.push(num(L.odo));
    perDay[k] = perDay[k] || { c: 0, f: 0, o: 0 };
    perDay[k].c += c; perDay[k].f += f; perDay[k].o += o;
  });
  const total = charge + food + other;
  const dist = odos.length >= 2 ? Math.max(...odos) - Math.min(...odos) : 0;
  const perKwh = kwh > 0 ? charge / kwh : 0;
  const eff = dist > 0 && kwh > 0 ? (kwh / dist) * 100 : 0;
  const perKm = dist > 0 ? charge / dist : 0;
  const checked = all.filter((x) => x.s.checkin);
  const pct = all.length ? Math.round((checked.length / all.length) * 100) : 0;
  const maxDay = Math.max(1, ...Object.values(perDay).map((d) => d.c + d.f + d.o));
  const sorted = checked.slice().sort((a, b) => a.s.checkin!.ts - b.s.checkin!.ts);

  return (
    <>
      <div className="dayhead">
        <div>
          <h2>สรุปทริป</h2>
          <p>คำนวณจากที่บันทึกไว้ในแต่ละจุด</p>
        </div>
      </div>
      <section className="hero">
        <div className="lab">ค่าใช้จ่ายรวมทั้งทริป</div>
        <div className="big">{baht(total)}</div>
        <div className="split">
          <span>ชาร์จ <b>{baht(charge)}</b></span>
          <span>กิน <b>{baht(food)}</b></span>
          <span>อื่น ๆ <b>{baht(other)}</b></span>
        </div>
      </section>
      <div className="stats">
        <div className="stat"><div className="v">{dist ? dist.toLocaleString("th-TH") + " กม." : "–"}</div><div className="k">ระยะทาง (จากเลขไมล์)</div></div>
        <div className="stat"><div className="v">{kwh ? kwh.toFixed(1) + " kWh" : "–"}</div><div className="k">ไฟที่ชาร์จทั้งหมด {nCharges} ครั้ง</div></div>
        <div className="stat"><div className="v">{perKwh ? "฿" + perKwh.toFixed(2) : "–"}</div><div className="k">ค่าไฟเฉลี่ยต่อหน่วย</div></div>
        <div className="stat"><div className="v">{eff ? eff.toFixed(1) : "–"}</div><div className="k">kWh/100 กม. (โดยประมาณ)</div></div>
        <div className="stat"><div className="v">{perKm ? "฿" + perKm.toFixed(2) : "–"}</div><div className="k">ค่าไฟต่อกิโลเมตร</div></div>
        <div className="stat"><div className="v">{mins ? Math.round(mins) + " นาที" : "–"}</div><div className="k">เวลารอชาร์จรวม</div></div>
      </div>
      <section className="panel">
        <h3>ความคืบหน้า {checked.length}/{all.length} จุด</h3>
        <div className="prog"><span style={{ width: `${pct}%` }} /></div>
      </section>
      <section className="panel">
        <h3>ค่าใช้จ่ายรายวัน</h3>
        {DAY_KEYS.map((k) => {
          const d = perDay[k] || { c: 0, f: 0, o: 0 };
          const t = d.c + d.f + d.o;
          const m = DAYS.find((x) => x.key === k)!;
          return (
            <div className="bar" key={k}>
              <span>{m.d} พ.ย.</span>
              <span className="track">
                {t > 0 && (
                  <>
                    <span className="seg-c" style={{ width: `${(d.c / maxDay) * 100}%` }} />
                    <span className="seg-f" style={{ width: `${(d.f / maxDay) * 100}%` }} />
                    <span className="seg-o" style={{ width: `${(d.o / maxDay) * 100}%` }} />
                  </>
                )}
              </span>
              <span style={{ textAlign: "right" }}>{baht(t)}</span>
            </div>
          );
        })}
        <div className="legend">
          <span><i className="seg-c" />ชาร์จ</span>
          <span><i className="seg-f" />กิน</span>
          <span><i className="seg-o" />อื่น ๆ</span>
        </div>
      </section>
      <section className="panel">
        <h3>บันทึกการเช็คอิน</h3>
        {sorted.length ? (
          <ul className="log">
            {sorted.map(({ k, s }) => {
              const L = s.log || {};
              const c = num(L.costCharge) + num(L.costFood) + num(L.costOther);
              const extra = [
                L.socIn != null && L.socIn !== "" ? `แบต ${L.socIn}%${L.socOut ? `→${L.socOut}%` : ""}` : "",
                num(L.kwh) ? `${num(L.kwh)} kWh` : "",
              ].filter(Boolean).join(", ");
              return (
                <li key={s.id}>
                  <span className="lt">{fmtTime(s.checkin!.ts)}<br /><span className="note">{DAYS.find((x) => x.key === k)!.d} พ.ย.</span></span>
                  <span>
                    {s.name}
                    {extra && <><br /><span className="note">{extra}</span></>}
                    {L.note && <><br /><span className="note">{L.note}</span></>}
                  </span>
                  <span className="lc">{c ? baht(c) : ""}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="note" style={{ margin: 0 }}>ยังไม่มีการเช็คอิน กด “เช็คอินตอนนี้” ที่จุดแรกเมื่อออกเดินทาง</p>
        )}
      </section>
      <section className="panel">
        <h3>ข้อมูลทริป</h3>
        <p className="note" style={{ margin: "0 0 10px" }}>ข้อมูลเก็บไว้ในเครื่องนี้ (localStorage) เท่านั้น</p>
        <div className="actions" style={{ margin: 0 }}>
          <button className="btn" onClick={onCopy}>คัดลอกสรุป</button>
          <button className="btn danger" onClick={onReset}>ล้างข้อมูลทั้งหมด</button>
        </div>
      </section>
    </>
  );
}
