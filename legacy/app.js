// ทริปเขาค้อ EX2 — logic หลักของแอป
// เก็บข้อมูลใน localStorage และซิงก์กับ Claude artifact db ถ้ามี window.claude
(function(){
  // ---- Seed plan ----
  const B = (name, query, note) => ({name, query: query||name, note: note||""});
  const SARABURI = [B("PEA VOLTA แก่งคอย"),B("PEA VOLTA หินกอง"),B("PEA VOLTA วิหารแดง"),B("EleX by EGAT สระบุรี","EleX by EGAT สระบุรี","เช็กในแอป EleXA"),B("PTT EV Station PluZ สระบุรี","PTT EV Station สระบุรี")];
  const MID = [B("PT วิเชียรบุรี 2","สถานีบริการน้ำมัน PT วิเชียรบุรี","น่าจะเป็น EleX by EGAT เช็กแอป EleXA"),B("จุดชาร์จ ศรีเทพ","EV charging station ศรีเทพ","ค้นหาจุดใกล้ที่สุดใน Maps"),B("จุดชาร์จ ชัยบาดาล","EV charging station ชัยบาดาล","ค้นหาจุดใกล้ที่สุดใน Maps"),B("PEA VOLTA หนองไผ่ #1","PEA VOLTA หนองไผ่","DC 50kW")];
  const PHET = [B("PEA VOLTA หนองไผ่ #2","PEA VOLTA หนองไผ่","DC 50kW"),B("PEA VOLTA เมืองเพชรบูรณ์"),B("PTT เพชรชมภูปิโตรเลียม","พีทีที สเตชั่น เพชรชมภูปิโตรเลียม","PTT EV Station DC 120kW"),B("PTT ม.ราชภัฏเพชรบูรณ์","PTT Station มหาวิทยาลัยราชภัฏเพชรบูรณ์","PTT EV Station"),B("PEA VOLTA บึงสามพัน")];
  const KHAOKHO = [B("PEA VOLTA หล่มสัก"),B("PTT นางั่ว (วีรชัยหล่มสักเซอร์วิส)","พีทีที สเตชั่น วีรชัยหล่มสักเซอร์วิส นางั่ว","PTT EV Station DC 120kW"),B("PEA VOLTA แคมป์สน"),B("PEA VOLTA เมืองเพชรบูรณ์")];

  let seq = 0;
  const S = (time,type,name,query,blurb,backups) => ({id:"s"+(++seq),time,type,name,query:query||name,blurb:blurb||"",backups:backups||[],custom:false,checkin:null,log:{}});
  function seed(){
    seq = 0;
    return {v:1, updatedAt:0, days:{
      d5:[
        S("06:30","drive","ออกจากศุภาลัยวิสต้า ห้าแยกปากเกร็ด","ศุภาลัย วิสต้า แยกปากเกร็ด","ชาร์จ 100% ก่อนออก ใช้แจ้งวัฒนะ โทลเวย์ แล้วต่อถนนสาย 1"),
        S("08:00","charge","ชาร์จ #1 PEA VOLTA เมืองสระบุรี","PEA VOLTA สระบุรี","ชาร์จถึงราว 85% กินมื้อเช้าระหว่างรอ",SARABURI),
        S("09:30","view","ทุ่งทานตะวันเขาจีนแล / เขื่อนป่าสักชลสิทธิ์","เขื่อนป่าสักชลสิทธิ์","ต้น พ.ย. ดอกเพิ่งเริ่มบาน แวะสั้น ๆ 30–45 นาที"),
        S("10:15","charge","ชาร์จกลางทาง ช่วงชัยบาดาล–ศรีเทพ","EV charging station ชัยบาดาล","จำเป็นถ้าขับ 120 ขึ้นไป ข้ามได้ถ้าขับ 100–110",MID),
        S("11:00","view","อุทยานประวัติศาสตร์ศรีเทพ","อุทยานประวัติศาสตร์ศรีเทพ","มรดกโลก ถ่ายเขาคลังใน"),
        S("13:00","charge","ชาร์จ #2 PEA VOLTA หนองไผ่","PEA VOLTA หนองไผ่","ชาร์จถึง 85–90% กินมื้อกลางวัน",PHET),
        S("15:30","charge","ขึ้นเขาค้อ / PEA VOLTA เขาค้อ 120kW","PEA VOLTA เขาค้อ","แวะชาร์จถ้าแบตต่ำกว่า 30% ทางชันคดเคี้ยว",KHAOKHO),
        S("16:30","stay","เช็กอิน Birdland Resort","Bird Land Resort เขาค้อ ทุ่งสมอ","ถามเรื่องปลั๊กชาร์จ AC ข้ามคืน"),
        S("17:15","view","แนวกังหันลมเขาค้อ ชมพระอาทิตย์ตก","กังหันลม เขาค้อ","ช่วง golden hour ใกล้รีสอร์ต")
      ],
      d6:[], d7:[],
      d8:[
        S("05:45","view","ทะเลหมอก แนวกังหันลมเขาค้อ","จุดชมวิว กังหันลม เขาค้อ","ต้น พ.ย. มีโอกาสเจอหมอก"),
        S("07:30","food","อาหารเช้า + เช็กเอาต์","Bird Land Resort เขาค้อ ทุ่งสมอ",""),
        S("08:30","view","วัดพระธาตุผาซ่อนแก้ว","วัดพระธาตุผาซ่อนแก้ว","ไปเช้าคนยังน้อย"),
        S("10:30","charge","PEA VOLTA เขาค้อ 120kW","PEA VOLTA เขาค้อ","ชาร์จถึงราว 80% ก่อนลงเขา",KHAOKHO),
        S("12:00","charge","มื้อกลางวัน + ชาร์จ เมืองเพชรบูรณ์","PEA VOLTA เมืองเพชรบูรณ์","ชาร์จถึงราว 85%",PHET),
        S("13:30","charge","ชาร์จกลางทาง วิเชียรบุรี–ศรีเทพ","สถานีบริการน้ำมัน PT วิเชียรบุรี","จำเป็นถ้าขับเร็ว",MID),
        S("14:30","view","เขื่อนป่าสักชลสิทธิ์","เขื่อนป่าสักชลสิทธิ์","วิวอ่างเก็บน้ำช่วงบ่าย"),
        S("15:45","charge","PEA VOLTA ย่านสระบุรี","PEA VOLTA สระบุรี","ชาร์จ 60–70% พอถึงบ้าน",SARABURI),
        S("18:00","stay","ถึงศุภาลัยวิสต้า ปากเกร็ด","ศุภาลัย วิสต้า แยกปากเกร็ด","เผื่อรถติดถนนสาย 1 เย็นวันอาทิตย์")
      ]
    }};
  }

  const DAYS = [
    {key:"d5",d:"5",w:"พฤ.",title:"วันพฤหัสบดีที่ 5 พ.ย.",sub:"ขาไป ปากเกร็ด → เขาค้อ"},
    {key:"d6",d:"6",w:"ศ.",title:"วันศุกร์ที่ 6 พ.ย.",sub:"เที่ยวเขาค้อ เพิ่มรายการเองได้"},
    {key:"d7",d:"7",w:"ส.",title:"วันเสาร์ที่ 7 พ.ย.",sub:"เที่ยวเขาค้อ เพิ่มรายการเองได้"},
    {key:"d8",d:"8",w:"อา.",title:"วันอาทิตย์ที่ 8 พ.ย.",sub:"ขากลับ เขาค้อ → ปากเกร็ด"},
    {key:"dash",d:"สรุป",w:"ภาพรวม",title:"สรุปทริป"}
  ];
  const TYPES = {drive:"ออกเดินทาง",charge:"ชาร์จไฟ",food:"กิน",view:"แวะวิว",stay:"ที่พัก",other:"อื่น ๆ"};

  // ---- State & storage ----
  const LS_KEY = "khaokho-trip-v1";
  let state = null, db = null, docRef = null, saveTimer = null;
  let tab = "d5"; const open = new Set();
  const $ = s => document.querySelector(s);
  const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const baht = n => "฿" + Math.round(n).toLocaleString("th-TH");
  const mapUrl = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  const navUrl = q => "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q);

  function setSave(t){ $("#save").textContent = t; }
  function toast(t){ const el=$("#toast"); el.textContent=t; el.classList.add("show"); clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove("show"),1800); }

  function loadLocal(){
    try{ const raw = localStorage.getItem(LS_KEY); if(raw) return JSON.parse(raw); }catch(e){}
    return null;
  }
  function saveLocal(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }catch(e){} }
  function nextId(){ return "u"+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

  function changed(){
    state.updatedAt = Date.now();
    saveLocal();
    setSave("กำลังบันทึก…");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(pushRemote, 700);
  }
  async function pushRemote(){
    if(!docRef){ setSave("บันทึกในเครื่องนี้"); return; }
    try{ await docRef.set(JSON.parse(JSON.stringify(state))); setSave("บันทึกแล้ว"); }
    catch(e){ setSave("บันทึกในเครื่องนี้"); }
  }

  // ---- Helpers ----
  function findStop(id){
    for(const k of ["d5","d6","d7","d8"]){ const i = state.days[k].findIndex(s=>s.id===id); if(i>-1) return {day:k,i,stop:state.days[k][i]}; }
    return null;
  }
  function fmtTime(ts){ const d=new Date(ts); return d.toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"}); }
  function fmtStamp(ts){ const d=new Date(ts); return d.toLocaleDateString("th-TH",{day:"numeric",month:"short"})+" "+fmtTime(ts); }
  function sortDay(k){ state.days[k].sort((a,b)=>(a.time||"99").localeCompare(b.time||"99")); }

  // ---- Render ----
  function renderTabs(){
    $("#tabs").innerHTML = DAYS.map(d=>`<button class="tab" role="tab" aria-selected="${tab===d.key}" data-tab="${d.key}"><span class="d">${d.d}</span><span class="w">${d.w}</span></button>`).join("");
  }
  function render(){
    renderTabs();
    if(tab==="dash") return renderDash();
    const meta = DAYS.find(d=>d.key===tab);
    const stops = state.days[tab];
    const done = stops.filter(s=>s.checkin).length;
    let h = `<div class="dayhead"><div><h2>${meta.title}</h2><p>${meta.sub}</p></div><div class="chip">${done}/${stops.length} เช็คอิน</div></div>`;
    if(!stops.length){
      h += `<div class="empty"><strong>ยังไม่มีรายการในวันนี้</strong>เพิ่มจุดที่อยากไป ร้านอาหาร หรือจุดชาร์จได้จากช่องด้านล่าง</div>`;
    } else {
      h += `<ol class="road">` + stops.map(stopHTML).join("") + `</ol>`;
    }
    h += addBoxHTML();
    $("#view").innerHTML = h;
  }

  function stopHTML(s){
    const isOpen = open.has(s.id), L = s.log||{};
    const chip = s.checkin ? `<span class="chip done">เช็คอิน ${fmtTime(s.checkin.ts)}</span>` : `<span class="chip ${s.type==="charge"?"charge":""}">${TYPES[s.type]||"อื่น ๆ"}</span>`;
    const here = s.checkin && s.checkin.lat!=null ? `${s.checkin.lat.toFixed(5)},${s.checkin.lng.toFixed(5)}` : null;
    let body = `<div class="actions">
      ${s.checkin ? `<button class="btn ghost" data-act="uncheck" data-id="${s.id}">ยกเลิกเช็คอิน</button>` : `<button class="btn primary" data-act="checkin" data-id="${s.id}">เช็คอินตอนนี้</button>`}
      <a class="btn blue" href="${navUrl(s.query)}" target="_blank" rel="noopener">นำทาง</a>
      <a class="btn" href="${mapUrl(s.query)}" target="_blank" rel="noopener">เปิดใน Maps</a>
      ${here?`<a class="btn" href="${mapUrl(here)}" target="_blank" rel="noopener">จุดที่เช็คอินจริง</a>`:""}
    </div>`;
    if(s.checkin) body += `<p class="stamp">เช็คอินเมื่อ <strong>${fmtStamp(s.checkin.ts)}</strong>${here?"":" (ไม่ได้บันทึกพิกัด)"}</p>`;
    body += `<fieldset><legend>การขับขี่</legend><div class="grid g3">
      ${field(s,"odo","เลขไมล์ (กม.)",L.odo)}
      ${field(s,"socIn",s.type==="charge"?"แบตตอนถึง (%)":"แบตตอนนี้ (%)",L.socIn)}
      ${s.type==="charge"?field(s,"socOut","แบตตอนออก (%)",L.socOut):""}
    </div></fieldset>`;
    if(s.type==="charge") body += `<fieldset><legend>การชาร์จ</legend><div class="grid g3">
      ${field(s,"kwh","ไฟที่ชาร์จ (kWh)",L.kwh)}
      ${field(s,"costCharge","ค่าชาร์จ (บาท)",L.costCharge)}
      ${field(s,"minutes","เวลาชาร์จ (นาที)",L.minutes)}
    </div></fieldset>`;
    body += `<fieldset><legend>ค่าใช้จ่ายอื่น</legend><div class="grid">
      ${field(s,"costFood","ค่ากิน (บาท)",L.costFood)}
      ${field(s,"costOther","อื่น ๆ (บาท)",L.costOther)}
      <label class="f wide">บันทึก<textarea data-id="${s.id}" data-log="note" placeholder="ถนน สภาพการจราจร เมนูที่กิน มุมถ่ายรูป…">${esc(L.note||"")}</textarea></label>
    </div></fieldset>`;
    if(s.backups && s.backups.length){
      body += `<fieldset><legend>จุดชาร์จสำรอง</legend><ul class="backups">` + s.backups.map((b,i)=>`
        <li><span class="bn">${esc(b.name)}${b.note?`<small>${esc(b.note)}</small>`:""}</span>
        <span class="ba"><a class="mini" href="${navUrl(b.query)}" target="_blank" rel="noopener">นำทาง</a><button class="mini" data-act="swap" data-id="${s.id}" data-i="${i}">ใช้แทน</button></span></li>`).join("") +
        `</ul><p class="note" style="margin:8px 0 0">กด “ใช้แทน” เพื่อสลับเป็นจุดหลัก จุดเดิมจะย้ายไปอยู่ในรายการสำรอง</p></fieldset>`;
    }
    body += `<details class="edit"><summary>แก้ไขจุดนี้</summary><div class="grid" style="margin-top:8px">
      <label class="f">เวลา<input type="time" value="${esc(s.time)}" data-id="${s.id}" data-prop="time"></label>
      <label class="f">ประเภท<select data-id="${s.id}" data-prop="type">${Object.entries(TYPES).map(([k,v])=>`<option value="${k}" ${s.type===k?"selected":""}>${v}</option>`).join("")}</select></label>
      <label class="f wide">ชื่อจุด<input value="${esc(s.name)}" data-id="${s.id}" data-prop="name"></label>
      <label class="f wide">คำค้นใน Google Maps<input value="${esc(s.query)}" data-id="${s.id}" data-prop="query"></label>
      <label class="f wide">รายละเอียด<input value="${esc(s.blurb)}" data-id="${s.id}" data-prop="blurb"></label>
    </div><div class="actions" style="margin:10px 0 0"><button class="btn" data-act="addbackup" data-id="${s.id}">เพิ่มจุดสำรอง</button><button class="btn danger" data-act="delete" data-id="${s.id}">ลบจุดนี้</button></div></details>`;
    return `<li class="stop ${s.checkin?"done":""} ${isOpen?"open":""}" id="stop-${s.id}">
      <span class="marker" aria-hidden="true"></span>
      <div class="card">
        <button class="summary" data-act="toggle" data-id="${s.id}" aria-expanded="${isOpen}">
          <span class="time">${esc(s.time||"–")}</span><span class="name">${esc(s.name)}</span>${chip}
          ${s.blurb?`<span class="blurb">${esc(s.blurb)}</span>`:""}
        </button>
        <div class="body">${body}</div>
      </div></li>`;
  }
  function field(s,key,label,val){
    return `<label class="f">${label}<input type="number" inputmode="decimal" step="any" value="${val==null?"":esc(val)}" data-id="${s.id}" data-log="${key}"></label>`;
  }
  function addBoxHTML(){
    return `<div class="addbox"><h3>เพิ่มรายการในวันนี้</h3><div class="grid">
      <label class="f">เวลา<input type="time" id="nTime"></label>
      <label class="f">ประเภท<select id="nType">${Object.entries(TYPES).map(([k,v])=>`<option value="${k}" ${k==="view"?"selected":""}>${v}</option>`).join("")}</select></label>
      <label class="f wide">ชื่อจุด<input id="nName" placeholder="เช่น ร้านกาแฟวิวเขา, PEA VOLTA หล่มสัก"></label>
      <label class="f wide">คำค้นใน Google Maps (ไม่ใส่ก็ได้)<input id="nQuery" placeholder="ถ้าเว้นว่าง จะใช้ชื่อจุด"></label>
    </div><div class="actions" style="margin:12px 0 0"><button class="btn primary" data-act="add">เพิ่มรายการ</button></div></div>`;
  }

  // ---- Dashboard ----
  function renderDash(){
    const all = []; ["d5","d6","d7","d8"].forEach(k=>state.days[k].forEach(s=>all.push({k,s})));
    let charge=0, food=0, other=0, kwh=0, mins=0, nCharges=0; const odos=[]; const perDay={};
    all.forEach(({k,s})=>{ const L=s.log||{};
      const c=num(L.costCharge), f=num(L.costFood), o=num(L.costOther);
      charge+=c; food+=f; other+=o; kwh+=num(L.kwh); mins+=num(L.minutes);
      if(num(L.kwh)>0||c>0) nCharges++;
      if(num(L.odo)>0) odos.push(num(L.odo));
      perDay[k]=perDay[k]||{c:0,f:0,o:0}; perDay[k].c+=c; perDay[k].f+=f; perDay[k].o+=o;
    });
    const total = charge+food+other;
    const dist = odos.length>=2 ? Math.max(...odos)-Math.min(...odos) : 0;
    const perKwh = kwh>0 ? charge/kwh : 0;
    const eff = dist>0 && kwh>0 ? kwh/dist*100 : 0;
    const perKm = dist>0 ? charge/dist : 0;
    const checked = all.filter(x=>x.s.checkin); const pct = all.length? Math.round(checked.length/all.length*100):0;
    const maxDay = Math.max(1,...Object.values(perDay).map(d=>d.c+d.f+d.o));

    let h = `<div class="dayhead"><div><h2>สรุปทริป</h2><p>คำนวณจากที่บันทึกไว้ในแต่ละจุด</p></div></div>
    <section class="hero"><div class="lab">ค่าใช้จ่ายรวมทั้งทริป</div><div class="big">${baht(total)}</div>
      <div class="split"><span>ชาร์จ <b>${baht(charge)}</b></span><span>กิน <b>${baht(food)}</b></span><span>อื่น ๆ <b>${baht(other)}</b></span></div></section>
    <div class="stats">
      <div class="stat"><div class="v">${dist?dist.toLocaleString("th-TH")+" กม.":"–"}</div><div class="k">ระยะทาง (จากเลขไมล์)</div></div>
      <div class="stat"><div class="v">${kwh?kwh.toFixed(1)+" kWh":"–"}</div><div class="k">ไฟที่ชาร์จทั้งหมด ${nCharges} ครั้ง</div></div>
      <div class="stat"><div class="v">${perKwh?"฿"+perKwh.toFixed(2):"–"}</div><div class="k">ค่าไฟเฉลี่ยต่อหน่วย</div></div>
      <div class="stat"><div class="v">${eff?eff.toFixed(1):"–"}</div><div class="k">kWh/100 กม. (โดยประมาณ)</div></div>
      <div class="stat"><div class="v">${perKm?"฿"+perKm.toFixed(2):"–"}</div><div class="k">ค่าไฟต่อกิโลเมตร</div></div>
      <div class="stat"><div class="v">${mins?Math.round(mins)+" นาที":"–"}</div><div class="k">เวลารอชาร์จรวม</div></div>
    </div>
    <section class="panel"><h3>ความคืบหน้า ${checked.length}/${all.length} จุด</h3><div class="prog"><span style="width:${pct}%"></span></div></section>
    <section class="panel"><h3>ค่าใช้จ่ายรายวัน</h3>
      ${["d5","d6","d7","d8"].map(k=>{ const d=perDay[k]||{c:0,f:0,o:0}; const t=d.c+d.f+d.o; const m=DAYS.find(x=>x.key===k);
        return `<div class="bar"><span>${m.d} พ.ย.</span><span class="track">${t?`<span class="seg-c" style="width:${d.c/maxDay*100}%"></span><span class="seg-f" style="width:${d.f/maxDay*100}%"></span><span class="seg-o" style="width:${d.o/maxDay*100}%"></span>`:""}</span><span style="text-align:right">${baht(t)}</span></div>`;}).join("")}
      <div class="legend"><span><i class="seg-c"></i>ชาร์จ</span><span><i class="seg-f"></i>กิน</span><span><i class="seg-o"></i>อื่น ๆ</span></div>
    </section>
    <section class="panel"><h3>บันทึกการเช็คอิน</h3>`;
    const sorted = checked.slice().sort((a,b)=>a.s.checkin.ts-b.s.checkin.ts);
    h += sorted.length ? `<ul class="log">` + sorted.map(({k,s})=>{ const L=s.log||{}; const c=num(L.costCharge)+num(L.costFood)+num(L.costOther);
      const extra=[L.socIn!=null&&L.socIn!==""?`แบต ${esc(L.socIn)}%${L.socOut?`→${esc(L.socOut)}%`:""}`:"", num(L.kwh)?`${num(L.kwh)} kWh`:""].filter(Boolean).join(", ");
      return `<li><span class="lt">${fmtTime(s.checkin.ts)}<br><span class="note">${DAYS.find(x=>x.key===k).d} พ.ย.</span></span><span>${esc(s.name)}${extra?`<br><span class="note">${extra}</span>`:""}${L.note?`<br><span class="note">${esc(L.note)}</span>`:""}</span><span class="lc">${c?baht(c):""}</span></li>`;}).join("") + `</ul>`
      : `<p class="note" style="margin:0">ยังไม่มีการเช็คอิน กด “เช็คอินตอนนี้” ที่จุดแรกเมื่อออกเดินทาง</p>`;
    h += `</section>
    <section class="panel"><h3>ข้อมูลทริป</h3><p class="note" style="margin:0 0 10px">ข้อมูลบันทึกไว้กับบัญชี Claude ของคุณ และเก็บสำเนาในเครื่องนี้ด้วย</p>
      <div class="actions" style="margin:0"><button class="btn" data-act="copy">คัดลอกสรุป</button><button class="btn danger" data-act="reset">ล้างข้อมูลทั้งหมด</button></div></section>`;
    $("#view").innerHTML = h;
  }

  function summaryText(){
    const lines=["ทริปปากเกร็ด ⇄ เขาค้อ 5–8 พ.ย."];
    ["d5","d6","d7","d8"].forEach(k=>{ state.days[k].filter(s=>s.checkin).forEach(s=>{ const L=s.log||{};
      const c=num(L.costCharge)+num(L.costFood)+num(L.costOther);
      lines.push(`${DAYS.find(x=>x.key===k).d}/11 ${fmtTime(s.checkin.ts)} ${s.name}${num(L.kwh)?` ${num(L.kwh)}kWh`:""}${c?` ${baht(c)}`:""}`); }); });
    return lines.join("\n");
  }

  // ---- Events ----
  document.addEventListener("click", async e=>{
    const t = e.target.closest("[data-tab],[data-act]"); if(!t) return;
    if(t.dataset.tab){ tab=t.dataset.tab; render(); window.scrollTo(0,0); return; }
    const act=t.dataset.act, id=t.dataset.id, f=id?findStop(id):null;
    if(act==="toggle"){ open.has(id)?open.delete(id):open.add(id); const li=document.getElementById("stop-"+id); li.classList.toggle("open"); t.setAttribute("aria-expanded",open.has(id)); return; }
    if(act==="checkin" && f){
      t.disabled=true; t.textContent="กำลังบันทึกเวลา…";
      const rec={ts:Date.now(),lat:null,lng:null};
      const pos = await new Promise(res=>{ if(!navigator.geolocation) return res(null);
        navigator.geolocation.getCurrentPosition(p=>res(p),()=>res(null),{enableHighAccuracy:true,timeout:8000,maximumAge:60000}); });
      if(pos){ rec.lat=pos.coords.latitude; rec.lng=pos.coords.longitude; }
      f.stop.checkin=rec; changed(); render(); toast("เช็คอินแล้ว "+fmtTime(rec.ts)); return;
    }
    if(act==="uncheck" && f){ if(!confirm("ยกเลิกเวลาเช็คอินของจุดนี้?")) return; f.stop.checkin=null; changed(); render(); return; }
    if(act==="swap" && f){
      const i=+t.dataset.i, b=f.stop.backups[i];
      f.stop.backups[i]={name:f.stop.name,query:f.stop.query,note:"จุดเดิมในแผน"};
      f.stop.name=b.name; f.stop.query=b.query; if(b.note) f.stop.blurb=b.note;
      changed(); render(); toast("เปลี่ยนเป็น "+b.name); return;
    }
    if(act==="addbackup" && f){
      const name=prompt("ชื่อจุดชาร์จสำรอง"); if(!name) return;
      const q=prompt("คำค้นใน Google Maps (เว้นว่างได้)",name)||name;
      f.stop.backups=f.stop.backups||[]; f.stop.backups.push({name:name.trim(),query:q.trim(),note:""}); changed(); render(); return;
    }
    if(act==="delete" && f){ if(!confirm("ลบ “"+f.stop.name+"” ออกจากแผน?")) return; state.days[f.day].splice(f.i,1); open.delete(id); changed(); render(); toast("ลบแล้ว"); return; }
    if(act==="add"){
      const name=$("#nName").value.trim(); if(!name){ $("#nName").focus(); toast("ใส่ชื่อจุดก่อน"); return; }
      const s={id:nextId(),time:$("#nTime").value||"",type:$("#nType").value,name,query:$("#nQuery").value.trim()||name,blurb:"",backups:[],custom:true,checkin:null,log:{}};
      state.days[tab].push(s); sortDay(tab); open.add(s.id); changed(); render(); toast("เพิ่มรายการแล้ว");
      const li=document.getElementById("stop-"+s.id); if(li) li.scrollIntoView({block:"center"}); return;
    }
    if(act==="copy"){ try{ await navigator.clipboard.writeText(summaryText()); toast("คัดลอกสรุปแล้ว"); }catch(_){ prompt("คัดลอกข้อความนี้",summaryText()); } return; }
    if(act==="reset"){ if(!confirm("ล้างบันทึก เช็คอิน และรายการที่เพิ่มเองทั้งหมด แล้วกลับไปเป็นแผนตั้งต้น?")) return; state=seed(); open.clear(); changed(); render(); toast("ล้างข้อมูลแล้ว"); return; }
  });

  document.addEventListener("input", e=>{
    const el=e.target, id=el.dataset.id; if(!id) return; const f=findStop(id); if(!f) return;
    if(el.dataset.log){ f.stop.log=f.stop.log||{}; f.stop.log[el.dataset.log]=el.value; changed(); return; }
    if(el.dataset.prop && el.tagName!=="SELECT" && el.type!=="time"){ f.stop[el.dataset.prop]=el.value; changed(); }
  });
  document.addEventListener("change", e=>{
    const el=e.target, id=el.dataset.id; if(!id||!el.dataset.prop) return; const f=findStop(id); if(!f) return;
    f.stop[el.dataset.prop]=el.value;
    if(el.dataset.prop==="time") sortDay(f.day);
    changed(); render();
  });

  // ---- Service worker (offline) ----
  if("serviceWorker" in navigator && location.protocol.startsWith("http")){
    window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  }

  // ---- Boot ----
  state = loadLocal() || seed();
  if(!state.days || !state.days.d6) state = seed();
  render(); setSave("บันทึกในเครื่องนี้");

  (async ()=>{
    try{
      if(!window.claude || !window.claude.use) return;
      const [dbNs, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
      if(!dbNs || !user) return;
      const uid = await user.id(); if(!uid) return;
      db = dbNs; docRef = db.doc("data/users/"+uid+"/trip");
      const snap = await docRef.get();
      if(snap.exists){
        const remote = snap.data();
        if(remote && remote.days && (remote.updatedAt||0) >= (state.updatedAt||0)){ state = JSON.parse(JSON.stringify(remote)); saveLocal(); render(); }
        else if(state.updatedAt) await pushRemote();
      } else if(state.updatedAt){ await pushRemote(); }
      setSave("บันทึกแล้ว");
    }catch(e){ setSave("บันทึกในเครื่องนี้"); }
  })();
})();
