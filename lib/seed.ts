import type { Backup, Stop, StopType, TabKey, TripState, DayKey } from "./types";

const B = (name: string, query?: string, note?: string): Backup => ({
  name,
  query: query || name,
  note: note || "",
});

const SARABURI = [
  B("PEA VOLTA แก่งคอย"),
  B("PEA VOLTA หินกอง"),
  B("PEA VOLTA วิหารแดง"),
  B("EleX by EGAT สระบุรี", "EleX by EGAT สระบุรี", "เช็กในแอป EleXA"),
  B("PTT EV Station PluZ สระบุรี", "PTT EV Station สระบุรี"),
];
const MID = [
  B("PT วิเชียรบุรี 2", "สถานีบริการน้ำมัน PT วิเชียรบุรี", "น่าจะเป็น EleX by EGAT เช็กแอป EleXA"),
  B("จุดชาร์จ ศรีเทพ", "EV charging station ศรีเทพ", "ค้นหาจุดใกล้ที่สุดใน Maps"),
  B("จุดชาร์จ ชัยบาดาล", "EV charging station ชัยบาดาล", "ค้นหาจุดใกล้ที่สุดใน Maps"),
  B("PEA VOLTA หนองไผ่ #1", "PEA VOLTA หนองไผ่", "DC 50kW"),
];
const PHET = [
  B("PEA VOLTA หนองไผ่ #2", "PEA VOLTA หนองไผ่", "DC 50kW"),
  B("PEA VOLTA เมืองเพชรบูรณ์"),
  B("PTT เพชรชมภูปิโตรเลียม", "พีทีที สเตชั่น เพชรชมภูปิโตรเลียม", "PTT EV Station DC 120kW"),
  B("PTT ม.ราชภัฏเพชรบูรณ์", "PTT Station มหาวิทยาลัยราชภัฏเพชรบูรณ์", "PTT EV Station"),
  B("PEA VOLTA บึงสามพัน"),
];
const KHAOKHO = [
  B("PEA VOLTA หล่มสัก"),
  B("PTT นางั่ว (วีรชัยหล่มสักเซอร์วิส)", "พีทีที สเตชั่น วีรชัยหล่มสักเซอร์วิส นางั่ว", "PTT EV Station DC 120kW"),
  B("PEA VOLTA แคมป์สน"),
  B("PEA VOLTA เมืองเพชรบูรณ์"),
];

export const DAY_KEYS: DayKey[] = ["d5", "d6", "d7", "d8"];

export const DAYS: { key: TabKey; d: string; w: string; title: string; sub?: string }[] = [
  { key: "d5", d: "5", w: "พฤ.", title: "วันพฤหัสบดีที่ 5 พ.ย.", sub: "ขาไป ปากเกร็ด → เขาค้อ" },
  { key: "d6", d: "6", w: "ศ.", title: "วันศุกร์ที่ 6 พ.ย.", sub: "เที่ยวเขาค้อ เพิ่มรายการเองได้" },
  { key: "d7", d: "7", w: "ส.", title: "วันเสาร์ที่ 7 พ.ย.", sub: "เที่ยวเขาค้อ เพิ่มรายการเองได้" },
  { key: "d8", d: "8", w: "อา.", title: "วันอาทิตย์ที่ 8 พ.ย.", sub: "ขากลับ เขาค้อ → ปากเกร็ด" },
  { key: "dash", d: "สรุป", w: "ภาพรวม", title: "สรุปทริป" },
];

export const TYPES: Record<StopType, string> = {
  drive: "ออกเดินทาง",
  charge: "ชาร์จไฟ",
  food: "กิน",
  view: "แวะวิว",
  stay: "ที่พัก",
  other: "อื่น ๆ",
};

export function seed(): TripState {
  let seq = 0;
  const S = (
    time: string,
    type: StopType,
    name: string,
    query?: string,
    blurb?: string,
    backups?: Backup[],
  ): Stop => ({
    id: "s" + ++seq,
    time,
    type,
    name,
    query: query || name,
    blurb: blurb || "",
    backups: backups || [],
    custom: false,
    checkin: null,
    log: {},
  });

  return {
    v: 1,
    updatedAt: 0,
    days: {
      d5: [
        S("06:30", "drive", "ออกจากศุภาลัยวิสต้า ห้าแยกปากเกร็ด", "ศุภาลัย วิสต้า แยกปากเกร็ด", "ชาร์จ 100% ก่อนออก ใช้แจ้งวัฒนะ โทลเวย์ แล้วต่อถนนสาย 1"),
        S("08:00", "charge", "ชาร์จ #1 PEA VOLTA เมืองสระบุรี", "PEA VOLTA สระบุรี", "ชาร์จถึงราว 85% กินมื้อเช้าระหว่างรอ", SARABURI),
        S("09:30", "view", "ทุ่งทานตะวันเขาจีนแล / เขื่อนป่าสักชลสิทธิ์", "เขื่อนป่าสักชลสิทธิ์", "ต้น พ.ย. ดอกเพิ่งเริ่มบาน แวะสั้น ๆ 30–45 นาที"),
        S("10:15", "charge", "ชาร์จกลางทาง ช่วงชัยบาดาล–ศรีเทพ", "EV charging station ชัยบาดาล", "จำเป็นถ้าขับ 120 ขึ้นไป ข้ามได้ถ้าขับ 100–110", MID),
        S("11:00", "view", "อุทยานประวัติศาสตร์ศรีเทพ", "อุทยานประวัติศาสตร์ศรีเทพ", "มรดกโลก ถ่ายเขาคลังใน"),
        S("13:00", "charge", "ชาร์จ #2 PEA VOLTA หนองไผ่", "PEA VOLTA หนองไผ่", "ชาร์จถึง 85–90% กินมื้อกลางวัน", PHET),
        S("15:30", "charge", "ขึ้นเขาค้อ / PEA VOLTA เขาค้อ 120kW", "PEA VOLTA เขาค้อ", "แวะชาร์จถ้าแบตต่ำกว่า 30% ทางชันคดเคี้ยว", KHAOKHO),
        S("16:30", "stay", "เช็กอิน Birdland Resort", "Bird Land Resort เขาค้อ ทุ่งสมอ", "ถามเรื่องปลั๊กชาร์จ AC ข้ามคืน"),
        S("17:15", "view", "แนวกังหันลมเขาค้อ ชมพระอาทิตย์ตก", "กังหันลม เขาค้อ", "ช่วง golden hour ใกล้รีสอร์ต"),
      ],
      d6: [],
      d7: [],
      d8: [
        S("05:45", "view", "ทะเลหมอก แนวกังหันลมเขาค้อ", "จุดชมวิว กังหันลม เขาค้อ", "ต้น พ.ย. มีโอกาสเจอหมอก"),
        S("07:30", "food", "อาหารเช้า + เช็กเอาต์", "Bird Land Resort เขาค้อ ทุ่งสมอ", ""),
        S("08:30", "view", "วัดพระธาตุผาซ่อนแก้ว", "วัดพระธาตุผาซ่อนแก้ว", "ไปเช้าคนยังน้อย"),
        S("10:30", "charge", "PEA VOLTA เขาค้อ 120kW", "PEA VOLTA เขาค้อ", "ชาร์จถึงราว 80% ก่อนลงเขา", KHAOKHO),
        S("12:00", "charge", "มื้อกลางวัน + ชาร์จ เมืองเพชรบูรณ์", "PEA VOLTA เมืองเพชรบูรณ์", "ชาร์จถึงราว 85%", PHET),
        S("13:30", "charge", "ชาร์จกลางทาง วิเชียรบุรี–ศรีเทพ", "สถานีบริการน้ำมัน PT วิเชียรบุรี", "จำเป็นถ้าขับเร็ว", MID),
        S("14:30", "view", "เขื่อนป่าสักชลสิทธิ์", "เขื่อนป่าสักชลสิทธิ์", "วิวอ่างเก็บน้ำช่วงบ่าย"),
        S("15:45", "charge", "PEA VOLTA ย่านสระบุรี", "PEA VOLTA สระบุรี", "ชาร์จ 60–70% พอถึงบ้าน", SARABURI),
        S("18:00", "stay", "ถึงศุภาลัยวิสต้า ปากเกร็ด", "ศุภาลัย วิสต้า แยกปากเกร็ด", "เผื่อรถติดถนนสาย 1 เย็นวันอาทิตย์"),
      ],
    },
  };
}
