"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PROVINCES, MAP_PROJ } from "@/lib/provinces";
import { PLACES, TRIP_DATES, VIA_PAKKRET_SARABURI } from "@/lib/places";
import { distanceKm, inMap, project, type LatLng } from "@/lib/geo";
import type { Stop, TripState } from "@/lib/types";
import { fmtTime, navUrl } from "@/lib/utils";

type Leg = "d5" | "d8";
interface Pos {
  lat: number;
  lng: number;
  acc: number;
  ts: number;
}
interface RoutePt {
  p: [number, number];
  stop?: Stop;
}

function isTripDay(now = new Date()) {
  return now.getFullYear() === TRIP_DATES.year && now.getMonth() === TRIP_DATES.month && TRIP_DATES.days.includes(now.getDate());
}
function defaultLeg(): Leg {
  const n = new Date();
  return n.getFullYear() === TRIP_DATES.year && n.getMonth() === TRIP_DATES.month && n.getDate() >= 8 ? "d8" : "d5";
}

export default function RouteMap({ state }: { state: TripState }) {
  const [leg, setLeg] = useState<Leg>("d5");
  const [sel, setSel] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const [err, setErr] = useState("");
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    setLeg(defaultLeg());
  }, []);

  const stopWatch = useCallback(() => {
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setLive(false);
  }, []);

  const startWatch = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setErr("อุปกรณ์นี้ไม่รองรับการหาตำแหน่ง");
      return;
    }
    if (watchId.current != null) return;
    setErr("");
    setLive(true);
    watchId.current = navigator.geolocation.watchPosition(
      (g) => setPos({ lat: g.coords.latitude, lng: g.coords.longitude, acc: g.coords.accuracy, ts: g.timestamp }),
      (e) => {
        setErr(e.code === 1 ? "ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง เปิดสิทธิ์ตำแหน่งของเบราว์เซอร์แล้วลองใหม่" : "หาตำแหน่งไม่ได้ตอนนี้");
        if (e.code === 1) stopWatch();
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
  }, [stopWatch]);

  // วันเดินทาง: เริ่มติดตามให้เองถ้าเคยอนุญาตตำแหน่งไว้แล้ว (ไม่เด้งขอสิทธิ์เอง)
  useEffect(() => {
    if (!isTripDay() || !navigator.permissions?.query) return;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((r) => {
        if (r.state === "granted") startWatch();
      })
      .catch(() => {});
  }, [startWatch]);

  useEffect(() => () => stopWatch(), [stopWatch]);

  const { pts, stops } = useMemo(() => {
    const list = state.days[leg].filter((s) => PLACES[s.id]);
    const out: RoutePt[] = [];
    list.forEach((s, i) => {
      out.push({ p: project(PLACES[s.id]), stop: s });
      if (leg === "d5" && i === 0) VIA_PAKKRET_SARABURI.forEach((v) => out.push({ p: project(v) }));
    });
    if (leg === "d8" && out.length > 1) {
      const last = out.pop()!;
      [...VIA_PAKKRET_SARABURI].reverse().forEach((v) => out.push({ p: project(v) }));
      out.push(last);
    }
    return { pts: out, stops: list };
  }, [state, leg]);

  const line = (arr: RoutePt[]) => arr.map((q, i) => (i ? "L" : "M") + q.p[0].toFixed(1) + " " + q.p[1].toFixed(1)).join("");
  const fullPath = line(pts);
  let lastDone = -1;
  pts.forEach((q, i) => {
    if (q.stop?.checkin) lastDone = i;
  });
  const donePath = lastDone > 0 ? line(pts.slice(0, lastDone + 1)) : "";

  const next = stops.find((s) => !s.checkin);
  const here: LatLng | null = pos ? [pos.lat, pos.lng] : null;
  const herePt = here ? project(here) : null;
  const hereOnMap = herePt ? inMap(herePt) : false;
  const nextKm = here && next ? distanceKm(here, PLACES[next.id]) : null;
  const selStop = stops.find((s) => s.id === sel) ?? null;
  const doneCount = stops.filter((s) => s.checkin).length;

  return (
    <>
      <div className="dayhead">
        <div>
          <h2>แผนที่เส้นทาง</h2>
          <p>นนทบุรี → ปทุมธานี → อยุธยา → สระบุรี → ลพบุรี → เพชรบูรณ์ (แผนที่จำลอง)</p>
        </div>
        <div className="chip">{doneCount}/{stops.length} จุด</div>
      </div>

      <div className="seg" role="group" aria-label="เลือกขาเดินทาง">
        <button aria-pressed={leg === "d5"} onClick={() => { setLeg("d5"); setSel(null); }}>ขาไป 5 พ.ย.</button>
        <button aria-pressed={leg === "d8"} onClick={() => { setLeg("d8"); setSel(null); }}>ขากลับ 8 พ.ย.</button>
      </div>

      <div className="mapwrap">
        <svg viewBox={`0 0 ${MAP_PROJ.w} ${MAP_PROJ.h}`} role="img" aria-label="แผนที่จำลองเส้นทางปากเกร็ดถึงเขาค้อ">
          {PROVINCES.map((p) => (
            <path key={p.name} d={p.d} className={`prov ${p.name === "เพชรบูรณ์" ? "hi" : ""}`} />
          ))}
          {PROVINCES.map((p) => (
            <text key={p.name + "t"} x={p.cx} y={p.cy} className="provlab" textAnchor="middle">{p.name}</text>
          ))}
          {fullPath && <path d={fullPath} className="route-base" />}
          {fullPath && <path d={fullPath} className="route-run" />}
          {donePath && <path d={donePath} className="route-done" />}
          {fullPath && !live && (
            <circle r="3.2" className="simcar">
              <animateMotion dur="16s" repeatCount="indefinite" path={fullPath} />
            </circle>
          )}
          {pts.map((q, i) =>
            q.stop ? (
              <g key={q.stop.id} className="pin" onClick={() => setSel(q.stop!.id === sel ? null : q.stop!.id)}>
                <circle cx={q.p[0]} cy={q.p[1]} r="9" className="hit" />
                <circle
                  cx={q.p[0]}
                  cy={q.p[1]}
                  r={q.stop.type === "charge" ? 3.4 : 2.8}
                  className={`dot ${q.stop.checkin ? "done" : ""} ${q.stop.type === "charge" ? "chg" : ""} ${q.stop.id === sel ? "sel" : ""}`}
                />
              </g>
            ) : (
              <g key={"v" + i} />
            ),
          )}
          {herePt && hereOnMap && (
            <g>
              <circle cx={herePt[0]} cy={herePt[1]} r="7" className="me-pulse" />
              <circle cx={herePt[0]} cy={herePt[1]} r="3.4" className="me" />
            </g>
          )}
        </svg>
      </div>

      <div className="legend" style={{ marginBottom: 12 }}>
        <span><i style={{ background: "var(--go)" }} />จุดชาร์จ</span>
        <span><i style={{ background: "var(--sign)" }} />จุดอื่น</span>
        <span><i style={{ background: "var(--amber)" }} />เช็คอินแล้ว</span>
        <span><i style={{ background: "var(--warn)" }} />ตำแหน่งของคุณ</span>
      </div>

      <section className="panel">
        <h3>ตำแหน่งสด</h3>
        {live ? (
          <>
            <p className="note" style={{ margin: "0 0 8px" }}>
              {pos ? `อัปเดตล่าสุด ${fmtTime(pos.ts)} · ความแม่นยำ ±${Math.round(pos.acc)} ม.` : "กำลังหาตำแหน่ง…"}
              {pos && !hereOnMap && " · ตำแหน่งอยู่นอกพื้นที่แผนที่"}
            </p>
            {next && nextKm != null && (
              <p style={{ margin: "0 0 10px" }}>
                จุดถัดไป <strong>{next.name}</strong> ห่างตรงเส้นประมาณ <strong>{nextKm.toFixed(1)} กม.</strong>
              </p>
            )}
            <div className="actions" style={{ margin: 0 }}>
              {next && <a className="btn blue" href={navUrl(next.query)} target="_blank" rel="noopener">นำทางไปจุดถัดไป</a>}
              <button className="btn ghost" onClick={stopWatch}>หยุดติดตาม</button>
            </div>
          </>
        ) : (
          <>
            <p className="note" style={{ margin: "0 0 10px" }}>
              {isTripDay()
                ? "วันนี้เป็นวันเดินทาง กดเพื่อแสดงตำแหน่งรถบนแผนที่แบบเรียลไทม์"
                : "ตอนนี้แสดงรถจำลองวิ่งตามเส้นทาง ในวันเดินทางกดเพื่อดูตำแหน่งจริงแบบเรียลไทม์ได้"}
            </p>
            <div className="actions" style={{ margin: 0 }}>
              <button className="btn primary" onClick={startWatch}>เปิดตำแหน่งสด</button>
            </div>
          </>
        )}
        {err && <p className="note" style={{ margin: "8px 0 0", color: "var(--warn)" }}>{err}</p>}
      </section>

      {selStop && (
        <section className="panel">
          <h3>{selStop.time} {selStop.name}</h3>
          {selStop.blurb && <p className="note" style={{ margin: "0 0 10px" }}>{selStop.blurb}</p>}
          <div className="actions" style={{ margin: 0 }}>
            <a className="btn blue" href={navUrl(selStop.query)} target="_blank" rel="noopener">นำทาง</a>
          </div>
        </section>
      )}

      <p className="note">
        แผนที่เป็นภาพจำลอง ตำแหน่งจุดเป็นค่าโดยประมาณ ใช้ดูภาพรวมเส้นทางเท่านั้น เวลาขับจริงให้ใช้ปุ่ม “นำทาง” (Google Maps)
      </p>
    </>
  );
}
