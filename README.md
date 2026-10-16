# ทริปเขาค้อ EX2 (PWA)

แอปบันทึกทริป ปากเกร็ด ⇄ Birdland Resort เขาค้อ วันที่ 5–8 พ.ย. 2569 ด้วย Geely EX2
เช็คอินพร้อมเวลาและพิกัด, บันทึกการขับขี่/ชาร์จ/ค่ากิน, จุดชาร์จสำรอง, ลิงก์ Google Maps และหน้าสรุปทริป

สร้างด้วย Next.js 15 (App Router) + TypeScript

## โครงสร้างไฟล์

```
app/layout.tsx, page.tsx, globals.css   เลย์เอาต์ ฟอนต์ และธีม (light/dark ผ่าน CSS variables)
components/TripApp.tsx                  state หลัก แท็บวัน ฟอร์มเพิ่มรายการ
components/StopCard.tsx                 การ์ดแต่ละจุด
components/Dashboard.tsx                หน้าสรุปทริป
components/RegisterSW.tsx               ลงทะเบียน service worker (เฉพาะ production)
lib/                                    types, seed (แผนตั้งต้น), utils
public/                                 manifest.webmanifest, sw.js, icons/
legacy/                                 เวอร์ชัน vanilla JS เดิม (เก็บไว้อ้างอิง)
```

## รันในเครื่อง

```bash
npm install
npm run dev
```

ทดสอบ PWA/service worker ต้องใช้ production build

```bash
npm run build && npm start
```

## Deploy (Vercel + GitHub)

1. push โค้ดขึ้น GitHub branch `main`
2. ใน Vercel เลือก Add New Project แล้ว import repo นี้ (Framework: Next.js ตรวจอัตโนมัติ ไม่ต้องตั้งค่าเพิ่ม)
3. ทุกครั้งที่ push เข้า `main` Vercel จะ build และ deploy ให้อัตโนมัติ

เปิดบนมือถือแล้ว "เพิ่มไปยังหน้าจอโฮม" (ต้องเป็น HTTPS ซึ่ง Vercel มีให้)

## ข้อมูลและการบันทึก

- state ทั้งหมดเป็น object เดียว เก็บใน `localStorage` key `khaokho-trip-v1` (ไม่มีการซิงก์ขึ้นเซิร์ฟเวอร์)
- ถ้าแก้โครงสร้าง seed ให้เปลี่ยน `LS_KEY` ใน `components/TripApp.tsx` หรือกด "ล้างข้อมูลทั้งหมด" ในหน้าสรุป

## จุดที่ควรตรวจก่อนเดินทาง

- ชื่อจุดชาร์จสำรองบางจุดเป็นคำค้น (เช่น "EV charging station ชัยบาดาล") เพราะยังไม่ได้ยืนยันสถานีจริง ควรเช็กในแอป PEA VOLTA / EleXA / EV Station PluZ แล้วแก้ใน `lib/seed.ts` (ตัวแปร `SARABURI`, `MID`, `PHET`, `KHAOKHO`)
- ราคาค่าไฟและสถานะหัวชาร์จเปลี่ยนได้ ไม่ได้ดึงแบบ real-time
