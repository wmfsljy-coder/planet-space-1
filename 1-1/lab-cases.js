/* 행성우주과학 Ⅰ-1 우주 탐사와 태양 활동 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";
/* 스튜디오 말투 그림 도구(../assets/kit.js) — 큰 글자 · 흰 판정 카드 · 입체 공 */
var K = window.sthKit, LT = K.LT;
function bigT(ctx, a, b) { K.bigText(ctx, a, 22, 42, 24, "#ffffff"); if (b) K.bigText(ctx, b, 22, 70, 15, "#ffd35a"); }
function jcard(ctx, x, y, w, h, title, rows, tip, good) {
  K.card(ctx, x, y, w, h, title);
  var yy = y + 62;
  rows.forEach(function (r) {
    if (r[3]) { K.t(ctx, r[0], x + 18, yy, { s: 12, w: "700", c: LT.mute }); K.t(ctx, r[1], x + 18, yy + 28, { s: 24, w: "900", c: r[2] || LT.ink }); yy += 50; }
    else { K.row(ctx, r[0], r[1], x + 18, x + w - 18, yy, r[2]); yy += 28; }
  });
  if (tip) K.tip(ctx, tip, x + 12, y + h - 46, w - 24, good);
}
function photo(ctx, x, y, w, h, seed) {
  ctx.save(); ctx.shadowColor = "rgba(20,30,60,.28)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5; ctx.fillStyle = "#fbfbf7";
  ctx.beginPath(); ctx.roundRect(x - 8, y - 8, w + 16, h + 30, 8); ctx.fill(); ctx.restore();
  K.stage(ctx, x, y, w, h, "space", { seed: seed || 5, r: 4 });
}
window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 거리의 역제곱과 탐사선 전력 */
  {
    id: "c1", about: "01", tag: "탐사선 설계", title: "목성까지 가는 태양 전지", short: "태양 전지 면적",
    who: "🛰️", name: "행성 탐사선 설계팀",
    say: "“목성 궤도선에 태양 전지판을 달아 <b>500 W</b>를 얻어야 해요. 지구 궤도에서 햇빛은 1 m²에 <b>1361 W</b>, 전지판 효율은 <b>28%</b>. 전지판이 무거우면 발사비가 폭등하니 <b>40 m²</b>를 넘기면 안 됩니다. 목성은 태양에서 5.2 AU 떨어져 있어요.”",
    predict: {
      q: "태양에서 거리가 5.2배 멀어지면 같은 넓이에 닿는 햇빛의 세기는?",
      options: ["㉠ 1/5.2로 줄어든다", "㉡ 1/27 (1/5.2²)로 줄어든다", "㉢ 우주 공간에서는 거리와 상관없이 같다"],
      answer: 1
    },
    task: "목적지를 고르고 전지판 넓이를 정해 <b>목성 궤도에서 500 W 이상, 40 m² 이하</b>가 되게 하세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(310), ctx = cv.ctx, W = cv.W;
      var DEST = { mars: { t: "화성 (1.52 AU)", a: 1.52 }, jup: { t: "목성 (5.2 AU)", a: 5.2 }, sat: { t: "토성 (9.5 AU)", a: 9.5 } };
      var dest = "mars", A = 10;
      function flux() { return 1361 / Math.pow(DEST[dest].a, 2); }
      function power() { return flux() * 0.28 * A; }
      function draw() {
        H.paper(ctx, W, cv.H);
        var P = power(), F = flux(), ok = dest === "jup" && P >= 500 && A <= 40;
        bigT(ctx, "1 m²에 " + F.toFixed(0) + " W · 전력 " + P.toFixed(0) + " W", "햇빛은 거리의 제곱에 반비례해 약해진다");
        /* 태양에서 퍼져 나가는 빛: 같은 빛이 거리 r 에서는 r² 넓이에 퍼진다 */
        var sx = 70, sy = 190, sc = 52;
        K.sun(ctx, sx, sy, 16); K.planet(ctx, sx, sy, 15, "#fff3c4", "#f08a1a");
        ["mars", "jup", "sat"].forEach(function (k) {
          var x = sx + 40 + DEST[k].a * sc * 0.85, on = k === dest, hw = 10 + DEST[k].a * 7;
          ctx.fillStyle = on ? "rgba(245,159,0,.16)" : "rgba(20,40,90,.05)"; ctx.beginPath(); ctx.moveTo(sx + 16, sy - 4); ctx.lineTo(x, sy - hw); ctx.lineTo(x, sy + hw); ctx.lineTo(sx + 16, sy + 4); ctx.closePath(); ctx.fill();
          K.planet(ctx, x, sy, on ? 11 : 7, k === "mars" ? "#ef8f60" : (k === "jup" ? "#ecd6b2" : "#f3e2b6"), k === "mars" ? "#5a2412" : "#7a5634");
          K.t(ctx, DEST[k].t, x, sy + 34, { s: 11, w: on ? "900" : "700", a: "center", c: on ? LT.orange : LT.mute });
        });
        var ex = sx + 40 + sc * 0.85; K.earth(ctx, ex, sy, 7); K.t(ctx, "지구 1 AU", ex, sy - 16, { s: 10.5, w: "800", a: "center", c: LT.blue });
        /* 태양 전지판 미니어처(넓이에 따라 커진다) */
        var I = K.iso({ ox: 300, oy: 250, s: 1, L: 10, D: 10 }), sd = Math.sqrt(A) * 7;
        I.box(ctx, -sd / 2, -sd * .35, 0, sd / 2, sd * .35, 2.5, "#2f5fb3", "#24498c", "#1b386c");
        ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1;
        for (var i = 1; i < 5; i++) { var a1 = I.P(-sd / 2 + sd * i / 5, -sd * .35, 2.5), b1 = I.P(-sd / 2 + sd * i / 5, sd * .35, 2.5); ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(b1.x, b1.y); ctx.stroke(); }
        K.t(ctx, "전지판 " + A + " m²", 300, 296, { s: 11.5, w: "900", a: "center", c: A > 40 ? LT.red : LT.ink });
        jcard(ctx, 610, 14, 276, cv.H - 28, "판정", [
          ["1 m²에 닿는 햇빛", F.toFixed(1) + " W"],
          ["전지판 넓이", A + " m²", A > 40 ? LT.red : LT.ink],
          ["얻는 전력 (효율 28%)", P.toFixed(0) + " W", ok ? LT.green : LT.red, true],
          ["목표", "목성 궤도 500 W · 40 m² 이하"]
        ], ok ? "목성 궤도에서 500 W 확보" : (dest !== "jup" ? "목적지는 목성" : (A > 40 ? "너무 무겁다" : "전력이 모자라다")), ok ? true : null);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "목적지", value: "mars", options: [{ v: "mars", t: "화성" }, { v: "jup", t: "목성" }, { v: "sat", t: "토성" }], onPick: function (x) { dest = x; draw(); } });
      api.slider({ label: "태양 전지판 넓이", min: 2, max: 80, step: 0.5, value: 10, fmt: function (x) { return x + " m²"; }, onInput: function (x) { A = x; draw(); } });
      api.info("같은 빛이 거리 r 에서는 넓이 4πr²에 퍼집니다. 거리가 2배면 빛은 1/4, 5.2배면?");
      draw();
      return {
        judge: function () {
          if (dest !== "jup") return { ok: false, msg: "이 탐사선의 목적지는 목성입니다." };
          var P = power();
          if (A > 40) return { ok: false, msg: A + " m² — 너무 무거워 발사할 수 없습니다(40 m² 이하)." };
          if (P >= 500) return { ok: true, msg: "목성 궤도 · " + A + " m² → " + P.toFixed(0) + " W. 지구에서라면 1.3 m²로 충분했을 전력이에요." };
          return { ok: false, msg: "목성 궤도에서 " + P.toFixed(0) + " W — 500 W에 모자랍니다." };
        }
      };
    },
    hints: [
      "목성 궤도의 햇빛 = 1361 ÷ 5.2² ≈ 50 W/m². 효율 28%면 1 m²에서 약 14 W.",
      "500 ÷ 14 ≈ ? m²"
    ],
    solution: "<b>목성</b>, 전지판 <b>35.5~40 m²</b>.",
    why: "태양 에너지는 거리의 <b>제곱에 반비례</b>해 약해집니다. 그래서 목성 탐사선 주노는 지구의 1/27 인 햇빛으로 버티려고 버스 여러 대만 한 전지판을 펼쳤습니다. 토성 너머로 가는 탐사선(보이저, 카시니, 뉴호라이즌스)은 태양 전지 대신 방사성 원소의 붕괴열로 전기를 만드는 장치를 씁니다.<br>" +
      "멀수록 전력도 통신 속도도 줄어들고 명령도 늦게 닿으니, 먼 곳의 탐사선일수록 스스로 판단하는 능력이 중요해집니다."
  },

  /* ------------------------------------------------------------------ 2. 코로나 질량 방출의 도착 예보 */
  {
    id: "c2", about: "02", tag: "태양 활동 감시 · CME", title: "태양 폭풍 도착 예보", short: "CME 도착",
    who: "🌞", name: "우주 전파 센터",
    say: "“태양 관측 위성의 코로나그래프에 <b>코로나 질량 방출(CME)</b>이 잡혔어요. 10시에는 앞머리가 태양 중심에서 <b>태양 반지름의 4배</b>, 12시에는 <b>16배</b> 거리에 있었습니다. 전력망과 위성 운영자에게 지구 도착 시각을 알려야 해요. (태양 반지름 6.96 × 10⁵ km, 1 AU = 1.496 × 10⁸ km)”",
    predict: {
      q: "태양 표면 폭발(플레어)의 빛과 CME의 물질 가운데 지구에 먼저 닿는 것은?",
      options: ["㉠ CME 물질 — 질량이 크므로", "㉡ 플레어의 빛(X선) — 약 8분 20초 만에 닿는다", "㉢ 동시에 닿는다"],
      answer: 1
    },
    task: "두 사진으로 <b>CME의 속도</b>를 구하고(± 40 km/s), 12시 이후 <b>지구 도착까지 걸리는 시간</b>을 예보하세요(± 2시간).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var RS = 6.96e5, AU = 1.496e8, v = 600, t = 60;
      var TV = 12 * RS / 7200, TT = (AU - 16 * RS) / TV / 3600;
      function draw() {
        H.paper(ctx, W, cv.H);
        var okV = Math.abs(v - TV) <= 40, okT = Math.abs(t - TT) <= 2;
        bigT(ctx, "2시간에 12 R☉ → 속도 " + v + " km/s", "코로나그래프 사진 두 장 (가운데 원판은 가린 태양)");
        [[170, "10시", 4, 31], [440, "12시", 16, 32]].forEach(function (p) {
          var cx = p[0], cy = 192, sc = 6.2, w = 236, h = 196;
          photo(ctx, cx - w / 2, cy - h / 2, w, h, p[3]);
          ctx.save(); ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 4); ctx.clip();
          var co = ctx.createRadialGradient(cx, cy, 2 * sc, cx, cy, 9 * sc); co.addColorStop(0, "rgba(255,230,190,.35)"); co.addColorStop(1, "rgba(255,230,190,0)"); ctx.fillStyle = co; ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
          ctx.strokeStyle = "rgba(255,255,255,.3)"; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
          [4, 8, 12, 16].forEach(function (r) { ctx.beginPath(); ctx.arc(cx, cy, r * sc, 0, Math.PI * 2); ctx.stroke(); });
          ctx.setLineDash([]);
          var cg = ctx.createRadialGradient(cx, cy, (p[2] - 3) * sc, cx, cy, p[2] * sc); cg.addColorStop(0, "rgba(255,210,150,0)"); cg.addColorStop(1, "rgba(255,210,150,.55)");
          ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, p[2] * sc, -0.9, 0.3); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = "rgba(255,220,170,.95)"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(cx, cy, p[2] * sc, -0.9, 0.3); ctx.stroke();
          ctx.restore();
          ctx.fillStyle = "#4a4f5c"; ctx.beginPath(); ctx.arc(cx, cy, 2 * sc, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, 1 * sc, 0, Math.PI * 2); ctx.stroke();
          K.t(ctx, p[1] + " — 앞머리 " + p[2] + " R☉", cx, cy + h / 2 + 18, { s: 12, w: "900", a: "center", c: LT.ink });
        });
        jcard(ctx, 610, 14, 276, cv.H - 28, "판정 · 도착 예보", [
          ["내가 정한 CME 속도", v + " km/s", okV ? LT.green : LT.red],
          ["남은 거리 (1 AU − 16 R☉)", ((AU - 16 * RS) / 1e8).toFixed(3) + "×10⁸ km"],
          ["내 예보: 12시 이후", t + " 시간", okV && okT ? LT.green : LT.ink, true]
        ], !okV ? "먼저 사진 두 장으로 속도 구하기" : (okT ? "경보: 내일 밤 도착" : "남은 거리 ÷ 속도 다시 계산"), okV && okT ? true : null);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "CME 속도", min: 200, max: 2000, step: 40, value: 600, fmt: function (x) { return x + " km/s"; }, onInput: function (x) { v = x; draw(); } });
      api.slider({ label: "12시 이후 지구 도착까지", min: 10, max: 80, step: 1, value: 60, fmt: function (x) { return x + " 시간"; }, onInput: function (x) { t = x; draw(); } });
      api.info("2시간 동안 앞머리가 몇 R☉ 나아갔는지 보고 km로 바꾸세요. CME는 속도가 일정하다고 봅니다.");
      draw();
      return {
        judge: function () {
          if (Math.abs(v - TV) > 40) return { ok: false, msg: "속도 " + v + " km/s — 2시간 동안 12 R☉ 를 간 속도와 맞지 않습니다." };
          if (Math.abs(t - TT) > 2) return { ok: false, msg: "속도는 맞았습니다. 남은 거리 ÷ 속도를 시간으로 다시 계산해 보세요." };
          return { ok: true, msg: "약 " + Math.round(TV) + " km/s → 12시에서 약 " + TT.toFixed(0) + "시간 뒤(내일 밤 9시 무렵) 도착. 전력망은 부하를 줄이고, 위성은 안전 모드로 대비합니다." };
        }
      };
    },
    hints: [
      "12 R☉ = 12 × 6.96 × 10⁵ km. 이것을 7200 초로 나누면 속도(km/s)입니다.",
      "남은 거리 ≈ 1.385 × 10⁸ km. 이것을 속도로 나눈 초를 3600으로 나누세요."
    ],
    solution: "속도 <b>약 1160 km/s</b>, 도착까지 <b>약 33시간</b>(31~35시간).",
    why: "플레어의 빛은 8분 20초 만에 닿지만, CME의 플라스마 구름은 하루 ~ 사흘 걸려 도착합니다. 이 ‘시간 차’ 덕분에 <b>태양 활동 감시 시스템</b>은 경보를 낼 수 있습니다.<br>" +
      "CME가 지구 자기장과 부딪치면 지자기 폭풍이 일어나 전력망 변압기가 타고(1989년 퀘벡 대정전), 위성 고장·GPS 오차·항공 통신 장애가 생깁니다. 태양을 11년 흑점 주기 내내 지켜보는 까닭입니다. ※ 실제 CME는 태양풍에 부딪쳐 속도가 조금씩 변합니다."
  },

  /* ------------------------------------------------------------------ 3. 지구 접근 천체의 크기 */
  {
    id: "c3", about: "03", tag: "지구 접근 천체", title: "밝기만 보이는 소행성", short: "소행성 크기",
    who: "☄️", name: "지구 위협 천체 감시팀",
    say: "“새로 발견한 지구 접근 소행성의 절대 등급이 <b>22</b>예요. 망원경으로는 점으로만 보여서 밝기만 알 수 있죠. 크기를 알아야 위험도를 판단하는데, 표면이 얼마나 빛을 잘 반사하는지(알베도)에 따라 크기가 달라집니다. 마침 레이더 관측으로 지름이 <b>약 140 m</b>로 나왔어요. 알베도는 얼마일까요?”",
    predict: {
      q: "같은 밝기로 보이는 두 소행성 가운데 표면이 더 어두운(알베도가 작은) 쪽은?",
      options: ["㉠ 더 작다", "㉡ 더 크다", "㉢ 크기가 같다"],
      answer: 1
    },
    task: "알베도를 정해 <b>절대 등급 22 인 소행성의 지름이 레이더 값(140 m ± 5 m)</b>과 같아지게 하세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(300), ctx = cv.ctx, W = cv.W;
      var p = 0.05, HM = 22;
      function D() { return 1329 / Math.sqrt(p) * Math.pow(10, -HM / 5) * 1000; }
      function draw() {
        H.paper(ctx, W, cv.H);
        var d = D(), ok = Math.abs(d - 140) <= 5, r = Math.min(92, d / 3.4), cx = 210, cy = 172;
        var E = 0.5 * (4 / 3 * Math.PI * Math.pow(d / 2, 3) * 2600) * Math.pow(17000, 2) / 4.184e15;
        bigT(ctx, "지름 " + d.toFixed(0) + " m", "절대 등급 22 — 같은 밝기, 알베도에 따라 다른 크기");
        /* 바닥 그림자 + 알베도에 따라 밝기가 다른 입체 소행성 */
        ctx.fillStyle = "rgba(20,30,60,.2)"; ctx.beginPath(); ctx.ellipse(cx + 6, cy + Math.min(r, 100) + 12, r * .9, r * .18, 0, 0, 6.2832); ctx.fill();
        var gv = Math.min(225, Math.round(50 + p * 420));
        K.planet(ctx, cx, cy, r, "rgb(" + gv + "," + gv + "," + Math.max(0, gv - 12) + ")", "rgb(" + Math.round(gv * .25) + "," + Math.round(gv * .25) + "," + Math.round(gv * .22) + ")");
        var R = K.rng(3); ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.clip();
        for (var i = 0; i < 7; i++) { var qx = cx + (R() - .5) * r * 1.3, qy = cy + (R() - .5) * r * 1.3, qr = r * (.08 + R() * .14); ctx.fillStyle = "rgba(20,14,10,.28)"; ctx.beginPath(); ctx.arc(qx, qy, qr, 0, 6.2832); ctx.fill(); }
        ctx.restore();
        /* 레이더 지름 140 m 자(같은 축척) */
        var rr = 140 / 1.7 / 2, rx0 = 430, ry = 246;
        K.line(ctx, { x: rx0, y: ry }, { x: rx0 + 2 * rr, y: ry }, LT.red, 3);
        [0, 2].forEach(function (k) { K.line(ctx, { x: rx0 + k * rr, y: ry - 6 }, { x: rx0 + k * rr, y: ry + 6 }, LT.red, 2); });
        K.t(ctx, "레이더로 잰 지름 140 m (같은 축척)", rx0, ry + 22, { s: 11, w: "900", c: LT.red });
        K.t(ctx, "알베도 " + p.toFixed(3) + (p < 0.1 ? " · 어두운 탄소질" : p < 0.3 ? " · 암석질" : " · 밝은 표면"), 430, 150, { s: 13, w: "900", c: LT.ink });
        K.bar(ctx, 430, 162, 150, p / 0.5, LT.yellow);
        K.t(ctx, "어둡다", 430, 190, { s: 10, c: LT.dim }); K.t(ctx, "밝다", 580, 190, { s: 10, c: LT.dim, a: "right" });
        jcard(ctx, 610, 14, 276, cv.H - 28, "판정", [
          ["알베도", p.toFixed(3)],
          ["계산한 지름", d.toFixed(0) + " m", ok ? LT.green : LT.red, true],
          ["충돌 에너지 (17 km/s, TNT)", E >= 1 ? E.toFixed(0) + " 메가톤" : (E * 1000).toFixed(0) + " 킬로톤"]
        ], ok ? "레이더 값과 같다 · 암석질" : (d > 140 ? "너무 크다 → 알베도를 키우기" : "너무 작다 → 알베도를 줄이기"), ok ? true : null);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "알베도 (빛을 반사하는 비율)", min: 0.02, max: 0.5, step: 0.005, value: 0.05, fmt: function (x) { return x.toFixed(3); }, onInput: function (x) { p = x; draw(); } });
      api.info("밝기는 ‘크기 × 반사율’로 정해집니다. 지름(km) = 1329 ÷ √알베도 × 10^(−절대 등급 ÷ 5).");
      draw();
      return {
        judge: function () {
          var d = D();
          if (Math.abs(d - 140) <= 5) return { ok: true, msg: "알베도 " + p.toFixed(3) + " → 지름 " + d.toFixed(0) + " m — 암석질(S형) 소행성으로 보입니다. 지구 근처 140 m 이상은 ‘잠재적 위험 천체’ 감시 기준입니다." };
          return { ok: false, msg: "지름 " + d.toFixed(0) + " m — 레이더 값 140 m와 다릅니다." };
        }
      };
    },
    hints: [
      "알베도가 작으면(어두우면) 같은 밝기를 내기 위해 더 커야 합니다. 지금 지름이 레이더보다 크다면 알베도를 어느 쪽으로?",
      "√알베도 = 1329 × 10^(−4.4) ÷ 0.14 ≈ 0.378 → 알베도 ≈ ?"
    ],
    solution: "알베도 <b>약 0.14</b>(0.135~0.15).",
    why: "소행성은 너무 작고 멀어 점으로만 보이므로, 밝기(절대 등급)와 <b>알베도</b>를 함께 알아야 크기를 정할 수 있습니다. 적외선으로 열을 재거나 레이더로 직접 크기를 재면 알베도를 알아낼 수 있습니다.<br>" +
      "크기는 충돌 에너지를 좌우합니다. 2013년 첼랴빈스크 운석은 지름 약 20 m 였는데도 폭발로 1500명이 다쳤습니다. 그래서 140 m 이상 지구 접근 천체를 일찍 찾아 궤도를 추적하고, 필요하면 DART처럼 ‘살짝 밀어’ 빗나가게 하는 기술을 준비합니다."
  }
  ]
});
})();
