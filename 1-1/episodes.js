/* 행성우주과학1 Ⅰ-1 우주 탐사와 태양 활동 — 소단원별 이야기 세 편
   01 22분 늦게 닿는 명령 / 02 8분 20초 뒤의 첫 신호 / 03 빗나가게 하라
   공용 부품: ../assets/theme.js (sthUnit·sthState·sthGate·sthWork·setupCanvas·cssVar·drawArrow)
             ../assets/story.js (sthStory·sthMission·sthSort·sthOrder·sthPick) */
(function () {
"use strict";

window.sthUnit("psp-1-1");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
var C_KMS = 299792.458;          // 빛(전파)의 속력 km/s
var AU_KM = 149597870.7;         // 1 AU

function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function log10(x) { return Math.log(x) / Math.LN10; }   /* 구형 기기에는 Math.log10이 없다 */
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
function paper(ctx, W, H) { ctx.clearRect(0, 0, W, H); ctx.fillStyle = v("--panel"); ctx.fillRect(0, 0, W, H); }
function text(ctx, s, x, y, o) {
  o = o || {};
  ctx.font = (o.w || "500") + " " + (o.s || 12) + "px " + FONT;
  ctx.fillStyle = o.c || v("--ink"); ctx.textAlign = o.a || "left";
  ctx.fillText(s, x, y);
}
function fmtTime(sec) {
  if (sec < 60) return (sec < 10 ? sec.toFixed(2) : sec.toFixed(1)) + "초";
  var s = Math.round(sec);
  if (s < 3600) return Math.floor(s / 60) + "분 " + (s % 60) + "초";
  var mm = Math.round(sec / 60);
  if (mm < 1440) return Math.floor(mm / 60) + "시간 " + (mm % 60) + "분";
  var hh = Math.round(sec / 3600);
  return Math.floor(hh / 24) + "일 " + (hh % 24) + "시간";
}
function fmtKm(d) {
  if (d < 10000) return Math.round(d).toLocaleString() + " km";
  if (d < 1e8) return Math.round(d / 1e4).toLocaleString() + "만 km";
  if (d < 1e12) return (d / 1e8).toFixed(d < 1e10 ? 2 : 0) + "억 km";
  return (d / 1e8).toFixed(0) + "억 km";
}
function fmtAU(d) { var a = d / AU_KM; return (a < 0.01 ? a.toFixed(4) : (a < 10 ? a.toFixed(2) : a.toFixed(1))) + " AU"; }

/* 그림 도구(무대) */
var K = window.sthKit, KC = K.C, REDUCE = K.REDUCE;
function playBtn(id, on, onTxt, offTxt, set) {
  var b = $(id); if (!b) return;
  b.textContent = on ? onTxt : offTxt;
  b.addEventListener("click", function () { on = !on; set(on); b.textContent = on ? onTxt : offTxt; });
}
/* 울퉁불퉁한 암석 덩어리(소행성·바위) */
function rock(ctx, x, y, r, seed, light, dark) {
  var R = K.rng(seed || 3), n = 14, pts = [], i;
  for (i = 0; i < n; i++) pts.push(1 + (R() - .5) * .22);
  ctx.save();
  ctx.beginPath();
  for (i = 0; i <= n; i++) {
    var a = i / n * 6.2832, rr = r * pts[i % n];
    if (i) ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  var g = ctx.createRadialGradient(x - r * .4, y - r * .45, r * .08, x, y, r * 1.1);
  g.addColorStop(0, light || "#c9b8a2"); g.addColorStop(.55, dark ? "#6f5f50" : "#7a6a5a"); g.addColorStop(1, dark || "#2a221c");
  ctx.fillStyle = g; ctx.fill(); ctx.clip();
  for (i = 0; i < 6; i++) {
    var cx = x + (R() - .5) * r * 1.2, cy = y + (R() - .5) * r * 1.2, cr = r * (.08 + R() * .16);
    ctx.fillStyle = "rgba(20,14,10,.35)"; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = "rgba(255,240,220,.18)"; ctx.lineWidth = Math.max(.8, r * .03); ctx.beginPath(); ctx.arc(cx + cr * .15, cy + cr * .15, cr, 3.6, 5.6); ctx.stroke();
  }
  ctx.restore();
}

/* ---- 스튜디오 + 우주 진열장(블록 모형) 공용 ----
   밝은 스튜디오 바닥 위에 '우주를 담은 투명 상자'를 아이소메트릭으로 놓는다.
   caseBack → (안쪽 천체) → caseFront 순서로 그린다. I = K.iso({ … }), ZH = 상자 높이 */
var LT = K.LT;
function poly(ctx, pts, fill, stroke, lw) {
  ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
}
function caseBack(ctx, I, ZH, seed, grid) {
  var L = I.L, D = I.D, f00 = I.P(0, 0, 0), fL0 = I.P(L, 0, 0), fLD = I.P(L, D, 0), f0D = I.P(0, D, 0);
  var t00 = I.P(0, 0, ZH), tL0 = I.P(L, 0, ZH), t0D = I.P(0, D, ZH), tLD = I.P(L, D, ZH);
  ctx.save(); ctx.shadowColor = "rgba(20,30,60,.28)"; ctx.shadowBlur = 22; ctx.shadowOffsetY = 10;
  poly(ctx, [f0D, fLD, fL0, tL0, t00, t0D], "#141a46"); ctx.restore();
  var g = ctx.createLinearGradient(0, t00.y, 0, fLD.y); g.addColorStop(0, "#0b1030"); g.addColorStop(1, "#1a1f4e");
  poly(ctx, [f00, fL0, tL0, t00], g); poly(ctx, [f00, f0D, t0D, t00], "#0d1238"); poly(ctx, [f00, fL0, fLD, f0D], "#141a46");
  ctx.save(); poly(ctx, [f0D, f00, fL0, tL0, t00, t0D]); ctx.lineTo(fLD.x, fLD.y); ctx.clip();
  var R = K.rng(seed || 83), minX = Math.min(t0D.x, f0D.x), maxX = Math.max(tL0.x, fL0.x), n = Math.round((maxX - minX) * (fLD.y - t00.y) / 900);
  for (var i = 0; i < n; i++) { ctx.globalAlpha = .25 + R() * .6; ctx.fillStyle = R() > .9 ? "#ffe2b8" : "#ffffff"; ctx.beginPath(); ctx.arc(minX + R() * (maxX - minX), t00.y + R() * (fLD.y - t00.y), R() > .95 ? 1.4 : .7, 0, 6.2832); ctx.fill(); }
  ctx.globalAlpha = 1; ctx.restore();
  var st = grid || 50;
  ctx.strokeStyle = "rgba(160,175,255,.14)"; ctx.lineWidth = 1;
  for (var gx = st; gx < L; gx += st) { var a1 = I.P(gx, 0, 0), b1 = I.P(gx, D, 0); ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(b1.x, b1.y); ctx.stroke(); }
  for (var gy = st; gy < D; gy += st) { var a2 = I.P(0, gy, 0), b2 = I.P(L, gy, 0); ctx.beginPath(); ctx.moveTo(a2.x, a2.y); ctx.lineTo(b2.x, b2.y); ctx.stroke(); }
}
function caseFront(ctx, I, ZH) {
  var L = I.L, D = I.D, fL0 = I.P(L, 0, 0), fLD = I.P(L, D, 0), f0D = I.P(0, D, 0);
  var t00 = I.P(0, 0, ZH), tL0 = I.P(L, 0, ZH), t0D = I.P(0, D, ZH), tLD = I.P(L, D, ZH);
  var gl = ctx.createLinearGradient(f0D.x, f0D.y, fLD.x, tLD.y); gl.addColorStop(0, "rgba(255,255,255,.10)"); gl.addColorStop(1, "rgba(200,225,255,.04)");
  poly(ctx, [f0D, fLD, tLD, t0D], gl, "rgba(255,255,255,.55)", 1.2);
  poly(ctx, [fLD, fL0, tL0, tLD], "rgba(190,215,255,.07)", "rgba(255,255,255,.55)", 1.2);
  poly(ctx, [t00, tL0, tLD, t0D], "rgba(255,255,255,.05)", "rgba(255,255,255,.7)", 1.2);
  ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(t0D.x + 8, t0D.y + 10); ctx.lineTo(t0D.x + 28, t0D.y + 40); ctx.stroke();
}
/* 움직이지 않는 부분(블록·지형)은 숨은 캔버스에 한 번 그려 두고 drawImage 한다. key 가 바뀔 때만 다시 그린다 */
function cached(canvas, W, H, memo, key, paint) {
  if (!memo.c || memo.key !== key || memo.c.width !== canvas.width) {
    if (!memo.c) memo.c = document.createElement("canvas");
    memo.c.width = canvas.width; memo.c.height = canvas.height;
    var x = memo.c.getContext("2d"), dpr = canvas.width / W;
    x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
    paint(x); memo.key = key;
  }
  return memo.c;
}
/* 오른쪽 흰 판정 카드: rows = [[이름, 값, 색], …] */
function verdict(ctx, x, y, w, h, head, headCol, rows, y0, gap) {
  K.card(ctx, x, y, w, h, "판정");
  ctx.font = "900 22px " + FONT; var hs = 22; while (ctx.measureText(head).width > w - 36 && hs > 14) { hs -= 1; ctx.font = "900 " + hs + "px " + FONT; }
  K.t(ctx, head, x + 18, y + 64, { s: hs, w: "900", c: headCol || LT.ink });
  var yy = y + (y0 || 104);
  rows.forEach(function (r) { K.row(ctx, r[0], r[1], x + 18, x + w - 18, yy, r[2]); yy += gap || 28; });
  return yy;
}

/* =========================================================================
   이야기 ① 22분 늦게 닿는 명령
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "임무 기록 ①", onDone: finish });

  /* ---- 장면 1 — 첫 추리 ---- */
  window.sthGate({
    gate: "a-g1", key: "p1", title: "신참 관제사의 첫 추리",
    question: "관제사가 ‘정지’ 명령을 보내는 순간, 화성의 로버는 어떤 상태일까요?",
    options: [
      "㉠ 명령이 곧바로 닿아 그 자리에서 멈춘다",
      "㉡ 명령이 닿을 때까지 11분 동안, 아무도 모르는 채 계속 굴러간다",
      "㉢ 로버가 스스로 구덩이를 알아보고 이미 멈춰 있다"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* ---- 장면 2 — 탐사 방식 분류 + 인공위성의 필요성 ---- */
  (function () {
    var okSort = !!window.sthState("a2sort"), okQ = !!window.sthState("a2q");
    function check() {
      if (okSort) done("a-m2a");
      if (okQ) done("a-m2b");
      if (okSort && okQ) {
        window.sthMission("a-m2", true, "<span class='m-tag'>미션 완료</span>목표가 정해지면 방식이 정해집니다. <b>훑어보기는 근접 통과, 지도 만들기는 궤도선, 한 자리 정밀 분석은 착륙선, 여러 곳을 돌아보려면 로버, 실험실에서 따져 보려면 시료 귀환.</b> 그리고 대기 밖으로 나가야만 볼 수 있는 빛이 있습니다.");
        ep.clear(1);
      }
    }
    window.sthSort({
      mount: "a-sort",
      buckets: [
        { id: "fly", label: "근접 통과", sub: "스쳐 지나가며 짧게 관측" },
        { id: "orb", label: "궤도선", sub: "둘레를 돌며 오래 관측" },
        { id: "lan", label: "착륙선", sub: "한 자리에 내려앉아 정밀 관측" },
        { id: "rov", label: "탐사차(로버)", sub: "표면을 옮겨 다니며 관측" },
        { id: "ret", label: "시료 귀환", sub: "흙·돌을 담아 지구로 가져옴" }
      ],
      items: [
        { t: "🛰️ 보이저 2호 — 천왕성과 해왕성 곁을 스쳐 지나며 처음으로 가까이서 찍었다", a: "fly", why: "지금까지 천왕성·해왕성을 가까이서 본 유일한 탐사선입니다.", hint: "두 행성 곁에 머무르지 않고 지나갔습니다." },
        { t: "🛰️ 뉴호라이즌스 — 명왕성 곁을 빠르게 지나가며 하트 모양 얼음 평원을 찍었다", a: "fly", why: "속력이 너무 빨라 궤도에 붙잡히지 못하고 스쳐 지나갔습니다." },
        { t: "🔄 카시니 — 13년 동안 토성 둘레를 돌며 고리와 위성들을 살폈다", a: "orb", why: "오래 머무르며 계절 변화까지 지켜본 궤도선입니다." },
        { t: "🔄 마젤란 — 금성 둘레를 돌며 구름을 뚫는 레이더로 표면 지도를 만들었다", a: "orb", why: "표면 전체를 지도로 만들려면 둘레를 여러 번 돌아야 합니다.", hint: "지도를 만들려면 표면 전체를 훑어야 합니다." },
        { t: "🔄 다누리 — 달 둘레를 돌며 달 표면을 촬영하고 착륙 후보지를 골랐다", a: "orb", why: "2022년에 발사된 우리나라 최초의 달 궤도선입니다." },
        { t: "🪂 하위헌스 — 토성의 위성 타이탄 표면에 내려앉아 그곳의 모습을 보내왔다", a: "lan", why: "카시니가 데려가 떨어뜨린 착륙선으로, 2005년 타이탄에 내려앉았습니다." },
        { t: "🪂 인사이트 — 화성의 한 자리에 머물며 땅속으로 전해지는 흔들림을 쟀다", a: "lan", why: "움직이지 않고 한 자리에서 화성의 지진을 관측했습니다.", hint: "지진계는 움직이면 안 됩니다." },
        { t: "🤖 큐리오시티 — 화성 게일 분화구 안을 옮겨 다니며 바위를 뚫어 분석했다", a: "rov", why: "여러 지점을 스스로 찾아다닌 탐사차입니다." },
        { t: "🤖 퍼서비어런스 — 화성 예제로 분화구의 옛 삼각주를 돌며 암석을 채취해 두었다", a: "rov", why: "옮겨 다니며 시료를 모아 두는 탐사차입니다. 시료를 지구로 가져오는 일은 다음 임무의 몫입니다.", hint: "아직 지구로 가져오지는 못했습니다." },
        { t: "📦 하야부사2 — 소행성 류구에 잠깐 내려앉아 시료를 담아 2020년 지구로 돌려보냈다", a: "ret", why: "캡슐만 지구 대기로 떨어뜨려 회수했습니다." },
        { t: "📦 오시리스-렉스 — 소행성 베누의 시료를 2023년 지구로 가져왔다", a: "ret", why: "실험실에서 직접 다루면 탐사선에 실을 수 없는 정밀 장비를 쓸 수 있습니다." }
      ],
      doneText: "같은 천체라도 무엇을 알고 싶은가에 따라 다가가는 방식이 달라집니다.",
      onDone: function () { okSort = true; window.sthState("a2sort", 1); check(); }
    });
    window.sthPick({
      mount: "a-q1",
      q: "지상에도 거대 망원경이 있는데, 굳이 인공위성과 우주 망원경을 올리는 가장 큰 까닭은 무엇일까요?",
      options: [
        "우주에서는 망원경을 훨씬 크게 만들 수 있기 때문",
        "지구 대기가 X선·자외선과 적외선의 대부분을 흡수해, 지상에서는 그 빛으로 우주를 볼 수 없기 때문",
        "우주에는 중력이 없어 망원경이 전혀 흔들리지 않기 때문",
        "대기 밖에서는 빛이 더 빨리 달려 먼 곳이 잘 보이기 때문"
      ],
      answer: 1,
      why: [
        "오히려 반대입니다. 로켓에 실을 수 있는 크기가 정해져 있어 우주 망원경은 지상 망원경보다 작게 만듭니다.",
        "대기는 가시광선과 전파만 잘 통과시킵니다(대기의 창). 태양 플레어의 X선, 뜨거운 별의 자외선, 성운 속의 적외선은 대기 밖으로 나가야만 볼 수 있습니다. 게다가 대기의 흔들림 때문에 지상에서는 상이 번지고, 밤에만 관측할 수 있다는 한계도 있습니다.",
        "궤도를 도는 위성은 중력이 없는 것이 아니라 계속 자유 낙하를 하고 있는 상태입니다. 무중력처럼 보일 뿐 지구 중력은 그대로 작용합니다.",
        "빛의 속력은 진공에서 어디서나 같습니다. 대기 밖이라고 더 빨라지지 않습니다."
      ],
      onDone: function () { okQ = true; window.sthState("a2q", 1); check(); }
    });
    check();
    if (ep.cleared(1)) window.sthMission("a-m2", true);
  })();

  /* ---- 장면 3 — 전파 신호 지연 시간 계산기 ---- */
  (function () {
    var canvas = $("a-c-delay"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var idx = 150, got = window.sthState("a3") || { a: false, b: false, c: false };
    var REF = [
      { n: "달", d: 384400 },
      { n: "화성 (가장 가까울 때)", d: 0.37 * AU_KM },
      { n: "태양", d: AU_KM },
      { n: "화성 (가장 멀 때)", d: 2.67 * AU_KM },
      { n: "목성 (가장 가까울 때)", d: 4.2 * AU_KM },
      { n: "해왕성", d: 29 * AU_KM },
      { n: "보이저 1호 (2025년 무렵)", d: 167 * AU_KM }
    ];
    function dist(i) { return 30000 * Math.pow(10, 6 * i / 400); }   // 3만 km~300억 km, 로그 눈금
    /* 그림용: 천체 모양·짧은 이름·이름표 위/아래 */
    var LOOK = [
      { s: "달", up: 1, f: function (x, y) { K.planet(ctx, x, y, 5, "#d6d6d6", "#4b4e55"); } },
      { s: "화성 최근접", up: 1, f: function (x, y) { K.planet(ctx, x, y, 5.5, "#ec8a5c", "#5a2412"); } },
      { s: "태양", up: 0, f: function (x, y) { K.sun(ctx, x, y, 5); } },
      { s: "화성 최원", up: 1, f: function (x, y) { K.planet(ctx, x, y, 5.5, "#ec8a5c", "#5a2412"); } },
      { s: "목성", up: 0, f: function (x, y) { K.planet(ctx, x, y, 8, "#ead2ad", "#7a5634"); } },
      { s: "해왕성", up: 0, f: function (x, y) { K.planet(ctx, x, y, 6.5, "#8cc0ff", "#1d3f8a"); } },
      { s: "보이저 1호", up: 1, f: function (x, y) { K.glow(ctx, x, y, 2, "rgba(220,235,255,.95)", 4); } }
    ];
    var playing = !REDUCE, ph = REDUCE ? 1 : 0;
    function shortT(sec) { return sec < 60 ? sec.toFixed(1) + "초" : (sec < 3600 ? Math.round(sec / 60) + "분" : Math.round(sec / 3600) + "시간"); }

    /* 스튜디오 위 '우주 진열장' 블록 모형: 지구(왼쪽 위 끝)에서 오른쪽 아래로 거리 10배씩 커지는 눈금 */
    var LW = 628, ZH = 64, DL = 660;
    var I = K.iso({ ox: 150, oy: 150, s: 0.64, L: DL, D: 56 });
    /* 이름표 자리: 오른쪽(1) / 왼쪽(-1), 지시선 길이 */
    var SIDE = [[-1, 34], [-1, 40], [1, 40], [-1, 74], [1, 52], [1, 44], [1, 40]];
    function zone(sec) { return sec < 2 ? 0 : (sec < 300 ? 1 : 2); }
    var ZN = [["실시간 조종 가능", LT.green], ["명령을 묶어 보내기", LT.yellow], ["자율 기능이 필수", LT.red]];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var d = dist(idx), one = d / C_KMS, zc = ZH / 2, yc = I.D / 2;
      function X(dd) { return 14 + clamp(log10(dd / 30000) / 6, 0, 1) * (DL - 24); }
      K.studio(ctx, 0, 0, LW, H, { x: I.P(DL * .62, I.D, 0).x, y: I.P(DL * .62, I.D, 0).y + 6, rx: 320, ry: 60 });
      caseBack(ctx, I, ZH, 21, 55);
      /* 눈금(바닥) */
      [[3e4, "3만 km"], [3e5, "30만"], [3e6, "300만"], [3e7, "3천만"], [3e8, "3억"], [3e9, "30억"], [3e10, "300억 km"]].forEach(function (q) {
        var a = I.P(X(q[0]), 0, 0), b = I.P(X(q[0]), I.D, 0);
        K.line(ctx, a, b, "rgba(255,211,107,.35)", 1, [2, 3]);
      });
      /* 신호 길 */
      var e0 = I.P(6, yc, zc), mxw = X(d), tg = I.P(mxw, yc, zc);
      var bg = ctx.createLinearGradient(e0.x, e0.y, tg.x, tg.y); bg.addColorStop(0, "rgba(127,211,255,.75)"); bg.addColorStop(1, "rgba(127,211,255,.2)");
      ctx.strokeStyle = bg; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(e0.x, e0.y); ctx.lineTo(tg.x, tg.y); ctx.stroke();
      K.line(ctx, tg, I.P(DL, yc, zc), "rgba(200,210,255,.25)", 1.2, [3, 5]);
      /* 천체(바닥 그림자 + 높이 막대) */
      REF.forEach(function (r, k) {
        var xw = X(r.d), p = I.P(xw, yc, zc), f = I.P(xw, yc, 0);
        ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(f.x, f.y, 7, 3.2, 0, 0, 6.2832); ctx.fill();
        K.line(ctx, f, p, "rgba(200,210,255,.3)", 1, [2, 3]);
        LOOK[k].f(p.x, p.y);
      });
      K.earth(ctx, e0.x, e0.y, 13);
      /* 전파 펄스 */
      var pw = 6 + (mxw - 6) * ph, pp = I.P(pw, yc, zc), ang = Math.atan2(tg.y - e0.y, tg.x - e0.x);
      for (var j = 0; j < 3; j++) {
        ctx.strokeStyle = "rgba(127,211,255," + (.85 - j * .25) + ")"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(pp.x - Math.cos(ang) * j * 7, pp.y - Math.sin(ang) * j * 7, 8 + j * 3, ang - .7, ang + .7); ctx.stroke();
      }
      K.glow(ctx, pp.x, pp.y, 2.6, "rgba(127,211,255,.95)", 4);
      /* 목표 표시 */
      ctx.strokeStyle = KC.yellow; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(tg.x, tg.y, 12, 0, 6.2832); ctx.stroke();
      [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (q) { ctx.beginPath(); ctx.moveTo(tg.x + q[0] * 9, tg.y + q[1] * 9); ctx.lineTo(tg.x + q[0] * 16, tg.y + q[1] * 16); ctx.stroke(); });
      caseFront(ctx, I, ZH);
      /* 이름표 */
      var box = [0, LW];
      REF.forEach(function (r, k) {
        var near = Math.abs(Math.log(r.d / d)) < 0.12, sd = SIDE[k];
        I.label(ctx, X(r.d), yc, zc, LOOK[k].s + " · " + shortT(r.d / C_KMS), sd[0] * sd[1], sd[0] < 0 ? sd[1] * .55 : -sd[1] * .55, near ? "#ffd35a" : "#e8ecff", box);
      });
      I.label(ctx, 6, yc, zc + 10, "지구 · 심우주 안테나", 58, -4, "#bfe6ff", box);
      /* 큰 글자 */
      K.bigText(ctx, "편도 " + fmtTime(one), 18, 52, 28, "#ffd35a");
      K.bigText(ctx, "왕복 " + fmtTime(one * 2), 18, 86, 19, "#ffffff");
      K.warn(ctx, LW - 14, H - 16, "⚠ 거리는 10배씩 커지는 눈금 · 천체 크기는 과장", "right");

      /* 오른쪽 판정 카드 */
      var RX = LW + 10, px = RX + 18, cw = W - RX, z = zone(one);
      var yy = verdict(ctx, RX, 0, cw, H, ZN[z][0], ZN[z][1], [["거리", fmtKm(d)], ["", fmtAU(d), LT.mute], ["편도 지연", fmtTime(one), LT.blue], ["왕복 (명령 → 응답)", fmtTime(one * 2), LT.orange]], 106, 30);
      /* 왕복 시간 눈금(10배씩): 세 구간 */
      function T(sec) { return px + clamp(log10(sec / 0.1) / 6.4, 0, 1) * (cw - 36); }
      var by = yy + 6;
      K.t(ctx, "왕복 시간 눈금 (10배씩)", px, by, { s: 11.5, w: "800", c: LT.mute });
      [[0.1, 2, "#c8eedd"], [2, 300, "#fde7b0"], [300, 251000, "#fbd0d0"]].forEach(function (q) {
        ctx.fillStyle = q[2]; ctx.fillRect(T(q[0]), by + 10, T(q[1]) - T(q[0]), 14);
      });
      var mk = T(one * 2);
      ctx.fillStyle = LT.ink; ctx.beginPath(); ctx.moveTo(mk, by + 8); ctx.lineTo(mk - 6, by - 1); ctx.lineTo(mk + 6, by - 1); ctx.closePath(); ctx.fill();
      ctx.fillRect(mk - 1, by + 8, 2, 18);
      [[0.1, "0.1초"], [60, "1분"], [86400, "1일"]].forEach(function (q, i) { K.t(ctx, q[1], T(q[0]), by + 40, { s: 10, a: i === 0 ? "left" : (i === 2 ? "right" : "center"), c: LT.dim }); });
      K.t(ctx, "초록 실시간 · 노랑 묶음 명령 · 빨강 자율", px, by + 58, { s: 10.5, c: LT.mute });
      K.t(ctx, "전파의 속력 = 빛의 속력", px, by + 92, { s: 11.5, w: "800", c: LT.mute });
      K.t(ctx, "299,792 km/s", px, by + 112, { s: 13, w: "900", c: LT.ink });
      K.tip(ctx, z === 0 ? "화면을 보며 바로 조종" : (z === 1 ? "조이스틱으로는 이미 늦음" : "사람이 끼어들 틈이 없음"), px - 4, H - 50, cw - 28, z === 0);
      readout(d, one);
    }
    function readout(d, one) {
      var e = $("a-read"); if (!e) return;
      e.innerHTML = "<span class='k'>거리</span><span class='v b'>" + fmtKm(d) + "</span><span class='sub'>" + fmtAU(d) + " · 빛의 속력 299,792 km/s</span>" +
        "<span class='k'>편도</span><span class='v y'>" + fmtTime(one) + "</span>" +
        "<span class='k'>왕복</span><span class='v r'>" + fmtTime(one * 2) + "</span>" +
        "<span class='ok " + (one < 2 ? "g" : "r") + "'>" + (one < 2 ? "실시간 조종이 가능한 수준" : (one < 300 ? "실시간 조종은 불편 · 계획 명령이 필요" : "실시간 조종 불가능 · 자율 기능이 필수")) + "</span>";
    }
    canvas._redraw = draw;
    playBtn("a-play", playing, "⏸ 신호 멈추기", "▶ 신호 보내기", function (on) { playing = on; });
    K.animate(canvas, function (dt) {
      if (!playing) return;
      var one = dist(idx) / C_KMS, dur = 700 + 480 * clamp(log10(one / 0.1), 0, 6.4);
      ph += dt / dur; if (ph > 1) ph = 0; draw();
    });

    function mission() {
      if (got.a) done("a-m3a");
      if (got.b) done("a-m3b");
      if (got.c) done("a-m3c");
      if (got.a && got.b && got.c) {
        window.sthMission("a-m3", true, "<span class='m-tag'>미션 완료</span>화성은 가까울 때 편도 <b>3분</b>, 멀 때 <b>22분</b>입니다. 왕복이면 6분에서 44분. 이 시간 동안 관제소는 <b>지나간 과거만</b> 볼 수 있습니다.");
        ep.clear(2);
      }
    }
    function update() {
      var d = dist(idx), one = d / C_KMS, ch = false;
      $("a-d-val").textContent = fmtKm(d);
      if (!got.a && one >= 180 && one < 240) { got.a = ch = true; }
      if (!got.b && one >= 1200) { got.b = ch = true; }
      if (!got.c && one >= 43200) { got.c = ch = true; }
      if (ch) { window.sthState("a3", got); mission(); }
      $("a-delay-info").innerHTML = "거리 <b>" + fmtKm(d) + "</b> (" + fmtAU(d) + ") 에서는 편도 지연이 <b>" + fmtTime(one) + "</b>, 왕복은 <b>" + fmtTime(one * 2) + "</b>입니다. " +
        (one < 2 ? "지연이 몇 초도 되지 않아 화면을 보며 실시간으로 조종할 수 있습니다. 달 탐사차가 여기에 해당합니다."
          : (one < 300 ? "지연이 몇 분이라, 조이스틱으로 조종하면 이미 늦습니다. 하루치 명령을 <b>묶어서</b> 보내고 결과를 기다리는 방식이라야 합니다."
            : "지연이 몇 시간에서 하루가 넘습니다. 사람이 끼어들 틈이 없으므로, 탐사선이 <b>스스로 판단하는 기능</b>이 반드시 있어야 합니다."));
      draw();
    }
    $("a-d").addEventListener("input", function (e) { idx = +e.target.value; update(); });
    update(); mission();
    if (ep.cleared(2)) window.sthMission("a-m3", true);
  })();

  /* ---- 장면 4 — 로버 하루치 명령 (자율 항법) ---- */
  var roverBest = window.sthState("a4best") || null;
  (function () {
    var canvas = $("a-c-rover"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var GOAL = 900, SOLS = 30, SAFE = 25, EFF = 0.8, DAY_MAX = 100;
    var L = 20, auto = false;
    var ROCK = [55, 130, 190, 265, 330, 410, 470, 545, 620, 690, 760, 835];

    function run() {
      var crash = (!auto && L > SAFE);
      var per = auto ? Math.min(L * EFF, DAY_MAX) : Math.min(L, SAFE);
      var path = [0], pos = 0, stop = 0;
      for (var s = 1; s <= SOLS; s++) {
        if (crash && s === 2) { stop = s; break; }
        pos = Math.min(GOAL, pos + per);
        path.push(pos);
        if (pos >= GOAL) { stop = s; break; }
      }
      return { crash: crash, per: per, path: path, pos: pos, sol: pos >= GOAL ? path.length - 1 : 0 };
    }

    var shown = null, target = 0, wheel = 0;
    /* 블록 모형: 화성 예제로 분화구 바닥을 잘라 낸 땅. x = 진행 방향(900 m), 앞면·오른쪽 면 = 땅속 지층 */
    var LW = 628, BL = 560, BD = 130, ZG = 56, memo = {};
    var I = K.iso({ ox: 196, oy: 142, s: 0.66, L: BL, D: BD });
    var YC = BD * 0.56, XD = BL - 52;                     /* 길(y)과 삼각주 바위 자리(x) */
    function X(m) { return 14 + clamp(m, 0, GOAL) / GOAL * (XD - 44); }
    function zOf(x, y) { return ZG + 2.6 * Math.sin(x / 37 + 1) + 1.8 * Math.sin(y / 13 + x / 61) + (x > XD - 14 ? 0 : 0); }
    var BANDS = [[0, "#4b2a22", "#5e352a"], [14, "#a65a36", "#b8683f"], [25, "#7e4130", "#8c4b37"], [33, "#c27448", "#cf8153"], [43, "#d58c5a", "#e09a66"]];
    function strata(c, side) {
      I.face(c, side, function (Lw) {
        var top = side === "front" ? function (u) { return zOf(u, BD); } : function (u) { return zOf(BL, u); };
        c.save(); I.profile(c, side, top, 0); c.clip();
        BANDS.forEach(function (b, i) {
          var z1 = i < BANDS.length - 1 ? BANDS[i + 1][0] : 80, g = c.createLinearGradient(0, b[0], 0, z1);
          g.addColorStop(0, b[1]); g.addColorStop(1, b[2]); c.fillStyle = g; c.fillRect(0, b[0], Lw, z1 - b[0]);
          c.strokeStyle = "rgba(40,15,8,.35)"; c.lineWidth = .8; c.beginPath(); c.moveTo(0, b[0]); c.lineTo(Lw, b[0] + (side === "front" ? 2 : -1)); c.stroke();
        });
        var R = K.rng(side === "front" ? 7 : 17);
        for (var i = 0; i < Lw * 0.9; i++) { c.fillStyle = R() > .5 ? "rgba(255,230,200,.18)" : "rgba(40,15,5,.25)"; c.fillRect(R() * Lw, R() * 54, 1.3, 1.3); }
        c.restore();
      });
      I.shade(c, side, side === "front" ? function (u) { return zOf(u, BD); } : function (u) { return zOf(BL, u); });
    }
    function paintLand(c) {
      var fl = I.P(BL * .55, BD, 0);
      K.studio(c, 0, 0, LW, H, { x: fl.x + 10, y: fl.y - 4, rx: 300, ry: 64 });
      c.save(); c.beginPath(); c.roundRect(0, 0, LW, H, 14); c.clip();
      strata(c, "front"); strata(c, "right");
      I.field(c, zOf, function (x, y, z, lt) { var n = 0.985 + 0.025 * Math.sin(x * .21 + y * .37); return K.tint("#c96a3c", lt * n); }, 42, 9);
      /* 자갈 무늬 */
      var R = K.rng(19);
      for (var i = 0; i < 160; i++) { var x = R() * BL, y = R() * BD, q = I.P(x, y, zOf(x, y)); c.fillStyle = "rgba(60,22,8," + (.25 + R() * .3) + ")"; c.beginPath(); c.ellipse(q.x, q.y, 1 + R() * 2.2, .6 + R() * .8, 0, 0, 6.2832); c.fill(); }
      /* 지구에서 확인한 안전 구간 */
      var s0 = I.P(X(0) - 8, YC - 26, zOf(X(0), YC) + .5), s1 = I.P(X(SAFE), YC - 26, zOf(X(SAFE), YC) + .5), s2 = I.P(X(SAFE), YC + 26, zOf(X(SAFE), YC) + .5), s3 = I.P(X(0) - 8, YC + 26, zOf(X(0), YC) + .5);
      poly(c, [s0, s1, s2, s3], "rgba(63,211,163,.45)", "rgba(63,211,163,.95)", 1.4);
      /* 바위들(길 위·옆) */
      ROCK.forEach(function (m, k) { var y = YC + (k % 2 ? 9 : -11), q = I.P(X(m), y, zOf(X(m), y)); rock(c, q.x, q.y - 3, 3.6 + (k % 3) * 1.4, 30 + k, "#e09a6c", "#4a1c0c"); });
      /* 삼각주 바위: 층층이 쌓인 퇴적암 언덕 */
      var LAY = ["#8f5233", "#c98a5e", "#a8663f", "#d9a274", "#7d4428", "#c07a50"];
      for (var k = 0; k < LAY.length; k++) {
        var z0 = ZG - 2 + k * 7.5, sh = k * 2.4;
        I.box(c, XD - 12 + sh, BD * .2 + sh, z0, BL - 6 - sh * .4, BD * .86 - sh, z0 + 7.5, K.tint(LAY[k], 1.12), LAY[k], K.tint(LAY[k], .72));
      }
      c.restore();
    }
    function roverIso(c, xw, crash) {
      var z = zOf(xw, YC) + 1.5, k = 1.9;
      c.save();
      if (crash) { var pv = I.P(xw, YC, z); c.translate(pv.x, pv.y); c.rotate(-.32); c.translate(-pv.x, -pv.y); }
      var f = I.P(xw, YC, z); c.fillStyle = "rgba(0,0,0,.3)"; c.beginPath(); c.ellipse(f.x + 4, f.y + 3, 30, 10, 0, 0, 6.2832); c.fill();
      function B(x0, y0, z0, x1, y1, z1, a, b, d) { I.box(c, xw + x0 * k, YC + y0 * k, z + z0 * k, xw + x1 * k, YC + y1 * k, z + z1 * k, a, b, d); }
      var wheels = [];
      [-8, 0, 8].forEach(function (dx) { [-7, 7].forEach(function (dy) { wheels.push([dx, dy]); }); });
      wheels.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); });
      function wheelAt(q) {
        var p = I.P(xw + q[0] * k, YC + q[1] * k, z + 2.6 * k), wg = c.createRadialGradient(p.x - 1.5, p.y - 1.5, .5, p.x, p.y, 4 * k);
        wg.addColorStop(0, "#a3aab2"); wg.addColorStop(1, "#22262c"); c.fillStyle = wg; c.beginPath(); c.ellipse(p.x, p.y, 3.8 * k, 3.3 * k, 0, 0, 6.2832); c.fill();
        c.strokeStyle = "rgba(255,255,255,.4)"; c.lineWidth = 1; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + Math.cos(wheel + q[0]) * 3 * k, p.y + Math.sin(wheel + q[0]) * 2.6 * k); c.stroke();
      }
      wheels.filter(function (q) { return q[1] < 0; }).forEach(wheelAt);
      B(-9, -7.5, 3.4, 9, -6, 5, "#aab2bc", "#8c95a1", "#6d7682");      /* 바퀴 팔(로커-보기) */
      B(-10, -6, 5, 10, 6, 10, "#f3f5f8", "#c3cad3", "#8a94a1");         /* 몸통 */
      B(-9, -6.5, 10, 2, 6.5, 11, "#2c3f6b", "#1f2d52", "#18223f");     /* 위 덮개 */
      B(6, -1.5, 10, 8, 1.5, 24, "#e6e9ee", "#cfd5dd", "#a3acb8");      /* 카메라 기둥 */
      B(4, -3, 24, 11, 3, 28, "#f1f3f6", "#d7dce3", "#a8b1bd");         /* 카메라 머리 */
      B(-12, -1, 9, -10, 1, 16, "#d9dee5", "#b9c0ca", "#97a0ac");       /* 안테나 */
      B(-9, 6, 3.4, 9, 7.5, 5, "#aab2bc", "#8c95a1", "#6d7682");
      wheels.filter(function (q) { return q[1] > 0; }).forEach(wheelAt);
      var eye = I.P(xw + 11 * k, YC + 1 * k, z + 26 * k); c.fillStyle = "#1c2230"; c.beginPath(); c.arc(eye.x, eye.y, 2, 0, 6.2832); c.fill();
      c.restore();
      if (!crash) K.glow(c, eye.x + 1, eye.y, 1.3, "rgba(127,211,255,.9)", 3);
      return I.P(xw, YC, z + 30 * k);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var r = run();
      target = r.pos; if (shown === null || REDUCE) shown = target;
      ctx.drawImage(cached(canvas, W, H, memo, "land", paintLand), 0, 0, W, H);
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      /* 바퀴 자국 */
      var xr = X(shown);
      [-7, 7].forEach(function (dy) {
        ctx.strokeStyle = "rgba(50,16,6,.55)"; ctx.lineWidth = 1.6; ctx.beginPath();
        for (var x = X(0); x <= xr; x += 6) { var q = I.P(x, YC + dy, zOf(x, YC + dy) + .4); if (x === X(0)) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y); }
        ctx.stroke();
      });
      var crashNow = r.crash && Math.abs(shown - target) < 1;
      var head = roverIso(ctx, xr, crashNow);
      if (crashNow) { var cp = I.P(xr + 16, YC, zOf(xr, YC) + 6); K.glow(ctx, cp.x, cp.y, 5, "rgba(255,107,129,.9)", 4); }
      ctx.restore();
      /* 이름표 */
      var box = [0, LW];
      I.label(ctx, X(SAFE) * .5, YC - 26, zOf(X(SAFE) * .5, YC - 26), "지구에서 사진으로 확인한 안전 구간 25 m", 92, -34, "#9ff0d0", box);
      I.label(ctx, BL - 16, BD * .52, ZG + 45, "삼각주 바위 · 900 m", 30, -70, "#ffd35a", box);
      I.label(ctx, BL, BD * .7, 20, "땅속 퇴적층", 28, 16, "#ffd9b8", box);
      K.pill(ctx, crashNow ? "충돌! 보지 못한 바위" : "로버 · " + Math.round(shown) + " m", head.x, Math.max(head.y - 12, 116), { s: 11.5, a: "center", c: crashNow ? "#ff9aac" : "#bfe6ff", box: box });
      K.bigText(ctx, r.crash ? "보지 못한 땅에서 사고" : "하루 " + Math.round(r.per) + " m 전진", 18, 50, 27, r.crash ? "#ff8a9e" : "#ffd35a");
      K.bigText(ctx, r.crash ? "안전 구간은 앞쪽 25 m뿐" : (r.sol ? r.sol + "솔 만에 900 m 도착" : "30솔 뒤 " + Math.round(r.pos) + " m / 900 m"), 18, 82, 18, "#ffffff");
      K.warn(ctx, LW - 14, H - 16, "⚠ 거리·로버·바위 크기는 실제 비율이 아님", "right");

      /* 오른쪽 판정 카드: 솔마다 쌓인 거리 */
      var RX = LW + 10, px = RX + 18, cw = W - RX, ok = r.pos >= GOAL;
      var yy = verdict(ctx, RX, 0, cw, H, ok ? r.sol + "솔 만에 도착" : (r.crash ? "사고 · 임무 중단" : (L === 0 ? "멈춰 있음" : "900 m에 못 닿음")), ok ? LT.green : (r.crash ? LT.red : LT.mute),
        [["자율 항법", auto ? "켜짐" : "꺼짐", auto ? LT.green : LT.mute], ["하루치 명령", L + " m"], ["하루 전진", Math.round(r.per) + " m", LT.blue]], 102, 28);
      var g = K.chart(ctx, { x: RX + 4, y: yy - 8, w: cw - 10, h: H - yy - 50, x0: 0, x1: SOLS, y0: 0, y1: GOAL, xt: 3, yt: 3, pl: 40, pr: 14, pt: 14, pb: 26, light: true, xf: function (s) { return Math.round(s) + "솔"; } });
      var col = ok ? LT.green : (r.crash ? LT.red : LT.blue), bw = Math.max(2, (g.R - g.L) / SOLS * .7);
      for (var i = 1; i < r.path.length; i++) { var top = g.Y(clamp(r.path[i], 0, GOAL)); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(g.X(i) - bw / 2, top, bw, g.B - top, [2, 2, 0, 0]); ctx.fill(); }
      K.line(ctx, { x: g.L, y: g.Y(GOAL) }, { x: g.R, y: g.Y(GOAL) }, LT.orange, 1.4, [5, 4]);
      K.t(ctx, "목표 900 m", g.L + 4, g.Y(GOAL) - 5, { s: 10.5, w: "800", c: LT.orange });
      K.tip(ctx, ok ? "스스로 바위를 피해 하루에 멀리" : (r.crash ? "지연 때문에 피하라는 명령이 늦음" : "하루 한 번 명령으로는 부족"), px - 4, H - 46, cw - 28, ok ? true : (r.crash ? false : null));
      return r;
    }
    canvas._redraw = draw;
    K.animate(canvas, function (dt) {
      if (shown === null || Math.abs(shown - target) < .5) { if (shown !== null && shown !== target) { shown = target; draw(); } return; }
      var step = (target - shown) * Math.min(1, dt / 260);
      if (Math.abs(step) < .4) step = (target > shown ? 1 : -1) * Math.min(.4 * dt / 33, Math.abs(target - shown));
      shown += step; wheel += step * .35; draw();
    });

    function update() {
      $("a-L-val").textContent = L + " m";
      $("a-auto").textContent = auto ? "🤖 로버의 자율 항법 끄기" : "🤖 로버의 자율 항법 켜기";
      $("a-auto").classList.toggle("on", auto);
      var r = draw();
      var msg;
      if (L === 0) msg = "명령 거리가 0 m입니다. 로버가 한 발짝도 움직이지 않습니다.";
      else if (r.crash) msg = "❌ <b>사고.</b> 자율 항법이 꺼진 상태에서 " + L + " m를 가라고 했습니다. 지구에서 사진으로 확인한 안전 구간은 앞쪽 <b>25 m</b>뿐이라, 그 너머의 보지 못한 바위에 부딪혀 임무가 끝났습니다.";
      else if (!auto) msg = "자율 항법이 꺼져 있어 하루에 <b>최대 25 m</b>까지만 안전하게 보낼 수 있습니다. 30솔을 모두 써도 " + Math.round(25 * SOLS) + " m — 900 m에 <b>닿지 못합니다.</b> 지연 때문에 명령을 하루 한 번밖에 못 보내는 것이 이렇게 발목을 잡습니다.";
      else if (r.pos >= 900) msg = "✅ <b>" + r.sol + "솔 만에 도착!</b> 자율 항법이 스스로 바위를 피해 돌아가느라 명령한 거리의 80%만 전진하지만, 그래도 하루 <b>" + Math.round(r.per) + " m</b>를 갑니다. 사람이 일일이 보지 않아도 되니 하루에 갈 수 있는 거리가 크게 늘었습니다.";
      else msg = "자율 항법은 켰지만 하루 <b>" + Math.round(r.per) + " m</b>로는 30솔 동안 " + Math.round(r.pos) + " m밖에 못 갑니다. 하루치 명령 거리를 더 늘려 보세요.";
      $("a-rover-info").innerHTML = msg;

      if (r.pos >= 900 && auto) {
        roverBest = L;
        window.sthState("a4best", L);
        window.sthMission("a-m4", true, "<span class='m-tag'>미션 완료</span>자율 항법을 켜고 하루 <b>" + L + " m</b> 명령으로 <b>" + r.sol + "솔</b> 만에 도착했습니다. 전파 지연이 길수록 탐사선은 더 많은 것을 <b>스스로</b> 결정해야 합니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    $("a-L").addEventListener("input", function (e) { L = +e.target.value; update(); });
    $("a-auto").addEventListener("click", function () { auto = !auto; update(); });
    update();
    if (ep.cleared(3)) window.sthMission("a-m4", true);
  })();

  /* ---- 장면 5 — 결말 ---- */
  function vs() {
    var p = window.sthState("p1") || "";
    $("a-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉠") === 0
        ? "전파도 빛의 속력이 한계입니다. 즉시 닿는 명령은 없습니다."
        : "기본은 ㉡입니다. 명령은 11분 동안 허공을 달리고, 그 사이 로버는 계속 굴러갑니다. 로버에 자율 항법이 있을 때만 ㉢처럼 스스로 멈출 수 있어서, 자율 항법이 꼭 필요합니다.") +
      "<br><b>내가 정한 하루치 명령</b> " + (roverBest ? roverBest + " m (자율 항법 켬)" : "-");
  }
  function finish() {
    window.sthState("r1", "완료 · 자율 항법 + 하루 " + (roverBest || "-") + " m 명령으로 30솔 안에 900 m 주파 (편도 지연 최대 22분)");
  }
  ep.onShow(function (i) { if (i === 4) vs(); });
  if (ep.at() === 4) vs();

  window.sthWork({
    mount: "wk1", unitLabel: "[행성우주과학1 Ⅰ-1] 이야기 ① 22분 늦게 닿는 명령",
    items: [
      { id: "e1a", label: "관제소 신참 교육 자료: 화성 로버를 실시간으로 조종할 수 없는 까닭", hint: "거리와 빛의 속력에서 시작해 편도·왕복 지연의 실제 숫자를 들고, 그래서 로버에 어떤 기능이 필요한지까지 이어서 쓰세요." },
      { id: "e1b", label: "토론: 인공위성을 활용한 우주 탐사는 그만한 값어치가 있는가", hint: "대기의 창, 지상 망원경의 한계, 실제 탐사선이 알아낸 성과를 근거로 자기 입장을 정하고, 반대편이 들 만한 근거 하나에도 답하세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ② 8분 20초 뒤의 첫 신호
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "예보 기록 ②", onDone: finish });

  window.sthGate({
    gate: "b-g1", key: "p2", title: "새 예보관의 첫 판단",
    question: "태양에서 큰 폭발이 일어났습니다. 지구는 언제 영향을 받을까요?",
    options: [
      "㉠ 폭발과 거의 동시에",
      "㉡ 빛이 오는 시간인 8분 20초 뒤에 한꺼번에",
      "㉢ 8분 20초 뒤부터 사흘에 걸쳐, 여러 번 나누어"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* ---- 장면 2 — 태양 활동 주기 ---- */
  (function () {
    var canvas = $("b-c-sun"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var y = 2.5, got = window.sthState("b2") || { lo: false, hi: false }, okQ = !!window.sthState("b2q");
    function act(yy) { return (1 - Math.cos(yy / 11 * Math.PI * 2)) / 2; }
    function spots(yy) { return Math.round(5 + act(yy) * 160); }

    var rot = 0, spinning = !REDUCE;
    /* 밝은 스튜디오: 왼쪽 흑점 수 카드 그래프, 가운데 필터 망원경으로 본 태양(입체 공), 오른쪽 판정 카드 */
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var a = act(y), n = spots(y), LW = 628, latDeg = 28 - 20 * y / 11;
      var stage = a >= 0.9 ? 2 : (a <= 0.06 ? 0 : 1);
      K.studio(ctx, 0, 0, LW, H, { x: 512, y: H - 40, rx: 120, ry: 22 });
      /* ── 흑점 수 곡선(밝은 그래프) ── */
      var g = K.chart(ctx, { x: 8, y: 104, w: 392, h: H - 110, x0: 0, x1: 11, y0: 0, y1: 200, xt: 11, yt: 4, pl: 44, pr: 12, pt: 18, pb: 40, xl: "주기 진행(년)", yl: "흑점 수(개)", light: true });
      var pts = [];
      for (var p = 0; p <= 220; p++) { var yy = p / 220 * 11; pts.push([yy, spots(yy)]); }
      var fill = ctx.createLinearGradient(0, g.T, 0, g.B); fill.addColorStop(0, "rgba(232,89,12,.22)"); fill.addColorStop(1, "rgba(232,89,12,0)");
      ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(g.X(0), g.B);
      pts.forEach(function (q) { ctx.lineTo(g.X(q[0]), g.Y(q[1])); }); ctx.lineTo(g.X(11), g.B); ctx.closePath(); ctx.fill();
      K.line(ctx, { x: g.L, y: g.Y(150) }, { x: g.R, y: g.Y(150) }, LT.red, 1.3, [5, 4]);
      K.line(ctx, { x: g.L, y: g.Y(10) }, { x: g.R, y: g.Y(10) }, LT.green, 1.3, [5, 4]);
      K.plot(ctx, g, pts, LT.orange, { light: true, w: 2.8 });
      K.t(ctx, "극대기 기준 150개", g.R - 4, g.Y(150) - 6, { s: 10.5, w: "800", a: "right", c: LT.red });
      K.t(ctx, "극소기 기준 10개", (g.L + g.R) / 2, g.Y(10) - 6, { s: 10.5, w: "800", a: "center", c: LT.green });
      var cx = g.X(y), cy = g.Y(n);
      K.line(ctx, { x: cx, y: cy }, { x: cx, y: g.B }, LT.ink, 1.2, [3, 3]);
      K.line(ctx, { x: g.L, y: cy }, { x: cx, y: cy }, LT.ink, 1.2, [3, 3]);
      ctx.fillStyle = "#fff"; ctx.strokeStyle = LT.orange; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, 6.2832); ctx.fill(); ctx.stroke();

      /* ── 필터를 단 망원경으로 본 태양 ── */
      var sx = 512, sy = 222, er = 104, sr = 70;
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
      ctx.fillStyle = "#2b3350"; ctx.beginPath(); ctx.arc(sx, sy, er + 7, 0, 6.2832); ctx.fill(); ctx.restore();
      var rim = ctx.createLinearGradient(sx - er, sy - er, sx + er, sy + er); rim.addColorStop(0, "#5b6684"); rim.addColorStop(1, "#1c2236");
      ctx.strokeStyle = rim; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(sx, sy, er + 3, 0, 6.2832); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, er, 0, 6.2832); ctx.fillStyle = "#05071a"; ctx.fill(); ctx.clip();
      var co = ctx.createRadialGradient(sx, sy, sr * .9, sx, sy, sr * (1.35 + a * .45));
      co.addColorStop(0, "rgba(255,200,120," + (.35 + a * .3) + ")"); co.addColorStop(1, "rgba(255,170,80,0)");
      ctx.fillStyle = co; ctx.beginPath(); ctx.arc(sx, sy, sr * (1.35 + a * .45), 0, 6.2832); ctx.fill();
      var seed = Math.round(y * 2) * 7919 + 13;
      function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
      /* 홍염(코로나 고리) — 활동이 클 때 */
      var promN = a > 0.55 ? 3 : (a > 0.3 ? 1 : 0);
      for (var f = 0; f < promN; f++) {
        var fa = -2.6 + f * 1.9 + rnd() * .5, hh = sr * (.18 + rnd() * .14);
        var p1 = { x: sx + Math.cos(fa - .09) * sr, y: sy + Math.sin(fa - .09) * sr }, p2 = { x: sx + Math.cos(fa + .09) * sr, y: sy + Math.sin(fa + .09) * sr };
        var pc = { x: sx + Math.cos(fa) * (sr + hh * 2), y: sy + Math.sin(fa) * (sr + hh * 2) };
        ctx.save(); ctx.shadowColor = "rgba(255,90,60,.9)"; ctx.shadowBlur = 10; ctx.strokeStyle = "rgba(255,120,80,.85)"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.quadraticCurveTo(pc.x, pc.y, p2.x, p2.y); ctx.stroke(); ctx.restore();
      }
      var dg = ctx.createRadialGradient(sx - sr * .1, sy - sr * .1, sr * .05, sx, sy, sr);
      dg.addColorStop(0, "#fff4cf"); dg.addColorStop(.55, "#ffcf62"); dg.addColorStop(.85, "#f39a2c"); dg.addColorStop(1, "#b8510f");
      ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 6.2832); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 6.2832); ctx.clip();
      var GR = K.rng(77);
      for (var q = 0; q < 260; q++) { var ga = GR() * 6.2832, gd = Math.sqrt(GR()) * sr; ctx.fillStyle = GR() > .5 ? "rgba(255,255,230,.10)" : "rgba(150,60,0,.10)"; ctx.beginPath(); ctx.arc(sx + Math.cos(ga) * gd, sy + Math.sin(ga) * gd, 1.2 + GR() * 1.8, 0, 6.2832); ctx.fill(); }
      /* 흑점 무리: 주기 초반에는 고위도, 후반에는 적도 가까이(태양 자전을 따라 돈다) */
      var groups = Math.round(a * 9), latB = latDeg * Math.PI / 180;
      for (var g2 = 0; g2 < groups; g2++) {
        var lon = rnd() * 6.2832, lat = (rnd() > .5 ? 1 : -1) * (latB + (rnd() - .5) * .14);
        for (var k = 0; k < 3; k++) {
          var lam = lon + rot + (k - 1) * .07 + (rnd() - .5) * .03, la = lat + (rnd() - .5) * .05, size = 2 + rnd() * 3.2;
          var cz = Math.cos(lam) * Math.cos(la);
          if (cz < .08) continue;
          var px = sx + sr * Math.cos(la) * Math.sin(lam), py = sy - sr * Math.sin(la);
          var fx = Math.max(.25, Math.cos(lam));
          ctx.fillStyle = "rgba(255,250,220,.25)"; ctx.beginPath(); ctx.ellipse(px, py, size * 2.4 * fx, size * 2, 0, 0, 6.2832); ctx.fill();
          ctx.fillStyle = "rgba(120,50,10,.75)"; ctx.beginPath(); ctx.ellipse(px, py, size * 1.5 * fx, size * 1.4, 0, 0, 6.2832); ctx.fill();
          ctx.fillStyle = "#2a1005"; ctx.beginPath(); ctx.ellipse(px, py, size * .75 * fx, size * .7, 0, 0, 6.2832); ctx.fill();
        }
      }
      ctx.restore();
      /* 흑점이 생기는 위도 띠(점선) */
      if (groups) {
        ctx.strokeStyle = "rgba(127,211,255,.55)"; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]);
        [1, -1].forEach(function (sg) { var yy = sy - sr * Math.sin(sg * latB), hw = sr * Math.cos(latB); ctx.beginPath(); ctx.ellipse(sx, yy, hw, hw * .08, 0, 0, 6.2832); ctx.stroke(); });
        ctx.setLineDash([]);
      }
      ctx.restore();
      if (a > 0.85) K.glow(ctx, sx - sr * .25, sy - sr * .2, 3, "rgba(255,255,255,.95)", 6);
      K.pill(ctx, "필터를 단 망원경으로 본 태양", sx, sy - er - 18, { s: 11.5, a: "center", c: "#bfe6ff", box: [400, LW] });
      if (groups) K.pill(ctx, "검은 점 = 흑점 · 점선 = 흑점이 많은 위도 ±" + Math.round(latDeg) + "°", sx, sy + er + 30, { s: 10.5, a: "center", c: "#e8ecff", box: [404, LW - 4] });
      else K.pill(ctx, "흑점이 거의 보이지 않음", sx, sy + er + 30, { s: 10.5, a: "center", c: "#e8ecff", box: [404, LW - 4] });
      /* 큰 글자 */
      K.bigText(ctx, "흑점 수 " + n + "개", 18, 50, 28, stage === 2 ? "#ff8a6b" : "#ffd35a");
      K.bigText(ctx, ["극소기 · 태양이 조용하다", "극대기와 극소기 사이", "극대기 · 폭발이 잦다"][stage], 18, 84, 18, "#ffffff");

      /* 오른쪽 판정 카드 */
      var RX = LW + 10, px0 = RX + 18, cw = W - RX;
      var yy2 = verdict(ctx, RX, 0, cw, H, ["극소기", "중간", "극대기"][stage], [LT.green, LT.mute, LT.red][stage],
        [["흑점 수", n + "개", LT.orange], ["주기 진행", y.toFixed(1) + "년 / 11년"], ["활동 지수", Math.round(a * 100) + "%"], ["흑점이 많은 위도", "±" + Math.round(latDeg) + "°", LT.blue]], 104, 30);
      K.bar(ctx, px0, yy2 - 4, cw - 36, a, a >= 0.9 ? LT.red : LT.yellow);
      K.t(ctx, "조용", px0, yy2 + 22, { s: 10, c: LT.dim }); K.t(ctx, "활발", W - 18, yy2 + 22, { s: 10, a: "right", c: LT.dim });
      K.t(ctx, "주기가 진행될수록 흑점은", px0, yy2 + 58, { s: 11.5, w: "700", c: LT.mute });
      K.t(ctx, "고위도 → 적도 쪽으로 옮겨 간다", px0, yy2 + 76, { s: 11.5, w: "700", c: LT.mute });
      K.tip(ctx, ["큰 폭발은 드물다", "흑점이 늘거나 줄어드는 중", "플레어·코로나 질량 방출이 잦다"][stage], px0 - 4, H - 50, cw - 28, stage === 0 ? true : (stage === 2 ? false : null));
      var e = $("b-read");
      if (e) e.innerHTML = "<span class='k'>흑점 수</span><span class='v y'>" + n + "개</span>" +
        "<span class='k'>주기 진행</span><span class='v b'>" + y.toFixed(1) + "년</span><span class='sub'>활동 지수 " + Math.round(a * 100) + "% · 한 주기 약 11년</span>" +
        (n >= 150 ? "<span class='ok r'>극대기 · 우주 위험이 커지는 때</span>" : (n <= 10 ? "<span class='ok g'>극소기 · 태양이 조용한 때</span>" : ""));
    }
    canvas._redraw = draw;
    playBtn("b-sun-play", spinning, "⏸ 태양 자전 멈추기", "▶ 태양 자전 보기", function (on) { spinning = on; });
    K.animate(canvas, function (dt) { if (spinning) { rot += dt * 6.2832 / 24000; draw(); } });

    function mission() {
      if (got.lo) done("b-m2a");
      if (got.hi) done("b-m2b");
      if (okQ) done("b-m2c");
      if (got.lo && got.hi && okQ) {
        window.sthMission("b-m2", true, "<span class='m-tag'>미션 완료</span>흑점 수는 약 11년을 주기로 <b>극소기와 극대기</b>를 오갑니다. 흑점이 많은 극대기에는 플레어와 코로나 질량 방출이 잦아져 <b>우주 위험도 함께 커집니다.</b>");
        ep.clear(1);
      }
    }
    function update() {
      $("b-y-val").textContent = y.toFixed(1);
      var n = spots(y), a = act(y), ch = false;
      if (!got.lo && n <= 10) { got.lo = ch = true; }
      if (!got.hi && n >= 150) { got.hi = ch = true; }
      if (ch) { window.sthState("b2", got); mission(); }
      $("b-sun-info").innerHTML = "주기 진행 <b>" + y.toFixed(1) + "년</b> · 흑점 수 <b>" + n + "개</b> · 활동 지수 <b>" + Math.round(a * 100) + "%</b><br>" +
        (a >= 0.9 ? "<b>극대기</b>입니다. 큰 흑점 무리 둘레에서 <b>플레어</b>가 자주 터지고, 코로나에서 플라스마 덩어리가 통째로 떨어져 나가는 <b>코로나 질량 방출</b>도 잦아집니다. 예보관이 가장 바쁜 시기입니다."
          : (a <= 0.06 ? "<b>극소기</b>입니다. 흑점이 며칠씩 하나도 보이지 않기도 합니다. 큰 폭발은 드물지만 <b>전혀 없는 것은 아닙니다.</b>"
            : "극대기와 극소기 사이입니다. 흑점이 늘어나는 중인지 줄어드는 중인지는 슬라이더를 좌우로 움직여 보면 알 수 있습니다."));
      draw();
    }
    $("b-y").addEventListener("input", function (e) { y = +e.target.value; update(); });
    window.sthPick({
      mount: "b-q1",
      q: "흑점은 왜 검게 보일까요?",
      options: [
        "태양 표면에 뚫린 구멍이라 그 자리에서는 빛이 나오지 않기 때문",
        "강한 자기장이 아래에서 올라오는 열을 막아, 주위 광구보다 온도가 훨씬 낮기 때문",
        "흑점 자리에만 차가운 구름이 떠서 빛을 가리기 때문",
        "행성이나 달의 그림자가 태양 표면에 비치기 때문"
      ],
      answer: 1,
      why: [
        "구멍이 아닙니다. 흑점에서도 빛은 나옵니다. 다만 둘레보다 적게 나올 뿐입니다.",
        "흑점의 온도는 약 4,000 K로, 둘레 광구의 약 5,800 K보다 훨씬 낮습니다. 강한 자기장이 아래에서 올라오는 대류를 막기 때문입니다. 흑점만 따로 떼어 밤하늘에 놓으면 여전히 눈부시게 밝습니다. <b>둘레가 더 밝아서 상대적으로 검게 보일 뿐입니다.</b>",
        "태양 표면에는 그런 구름이 없습니다. 흑점은 태양 자체의 현상입니다.",
        "행성이 태양 앞을 지나는 일(일면 통과)은 아주 드물고, 흑점은 태양 자전을 따라 며칠에 걸쳐 함께 돌아갑니다."
      ],
      onDone: function () { okQ = true; window.sthState("b2q", 1); mission(); }
    });
    update(); mission();
    if (ep.cleared(1)) window.sthMission("b-m2", true);
  })();

  /* ---- 장면 3 — 도달 시간과 경보 ---- */
  var alertBest = window.sthState("b3best") || null;
  (function () {
    var canvas = $("b-c-storm"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var L1_KM = 1500000, PART_FRAC = 0.3;        // L1 거리, 고에너지 입자의 속력(광속 대비)
    var vc = 1200, hh = 0, clock = 72;
    var got = window.sthState("b3") || { slow: false, fast: false, alert: false };
    var running = false;

    function times() {
      var tx = AU_KM / C_KMS;                     // X선·전파
      var tp = AU_KM / (PART_FRAC * C_KMS);       // 고에너지 입자
      var tc = AU_KM / vc;                        // 코로나 질량 방출
      return { x: tx, p: tp, c: tc, l1: L1_KM / vc };
    }

    /* ── 위: 우주 디오라마(유리 진열장) — x = 태양(왼쪽 뒤) → 지구(오른쪽 앞), y = 깊이, z = 위 ── */
    var TH = 452;
    var I = K.iso({ ox: 262, oy: 98, s: 0.68, L: 820, D: 180 });
    var BL = I.L, BD = I.D, BZ = 104, Z0 = 48, DC = BD / 2;
    var SX = 70, EX = 740, LXW = EX - (L1_KM / AU_KM) * (EX - SX) * 12;   /* L1 은 12배 과장 */
    var LANE = [-62, 0, 62], ph = 0, amb = !REDUCE;
    var STARS = (function () { var R = K.rng(41), a = [], i; for (i = 0; i < 80; i++) a.push([R(), R(), R()]); return a; })();
    function laneP(k, u) { return I.P(SX + u * (EX - SX), DC + LANE[k] * (1 - u), Z0); }
    function poly(pts, fill, stroke, lw) {
      ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
    }
    function headline(t, arrH) {
      var s = clock * 3600;
      if (running) {
        if (s < t.x) return ["X급 플레어가 터졌다", "지구는 아직 아무것도 모른다"];
        if (s < t.p) return ["첫 신호 — 섬광이 먼저 닿았다", "폭발 " + fmtTime(t.x) + " 뒤에 본 빛"];
        if (s < t.c) return ["입자는 닿았다 — 이제 구름이 온다", "구름(CME) 도착까지 " + Math.max(0, arrH - clock).toFixed(1) + "시간"];
        return ["자기 폭풍 — 오로라가 내려온다", "폭발 " + arrH.toFixed(1) + "시간 뒤 · 자기권이 눌렸다"];
      }
      var sub = "1 AU ÷ " + vc.toLocaleString() + " km/s = " + arrH.toFixed(1) + "시간";
      if (arrH > 48) return ["느린 구름 — 이틀을 넘겨 닿는다", sub];
      if (arrH < 24) return ["빠른 구름 — 하루 안에 닿는다", sub];
      return ["태양 폭풍은 한 덩어리가 아니다", sub];
    }

    function drawBox(t, arrH) {
      var s = clock * 3600, fr = [clamp(s / t.x, 0, 1), clamp(s / t.p, 0, 1), clamp(s / t.c, 0, 1)], hitC = fr[2] >= 1, k, i, p, q;
      K.studio(ctx, 0, 0, W, TH, { x: 455, y: 330, rx: 360, ry: 110 });
      var A = I.P(0, 0, BZ), B = I.P(BL, 0, BZ), Cc = I.P(BL, 0, 0), Dd = I.P(BL, BD, 0), E = I.P(0, BD, 0), F = I.P(0, BD, BZ), O = I.P(0, 0, 0), Bt = I.P(BL, BD, BZ);
      /* 진열장 안쪽: 어두운 우주 */
      var sp = ctx.createLinearGradient(A.x, A.y, Dd.x, Dd.y); sp.addColorStop(0, "#0b1030"); sp.addColorStop(1, "#151c4a");
      poly([A, B, Cc, Dd, E, F], sp);
      ctx.save(); poly([A, B, Cc, Dd, E, F]); ctx.clip();
      STARS.forEach(function (st) { var sx = F.x + st[0] * (B.x - F.x), sy = A.y + st[1] * (Dd.y - A.y); ctx.fillStyle = "rgba(230,236,255," + (.25 + st[2] * .55).toFixed(2) + ")"; ctx.fillRect(sx, sy, st[2] > .8 ? 2 : 1.2, st[2] > .8 ? 2 : 1.2); });
      /* 뒤쪽 모서리 */
      ctx.strokeStyle = "rgba(200,215,255,.18)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(O.x, O.y); ctx.lineTo(Cc.x, Cc.y); ctx.moveTo(O.x, O.y); ctx.lineTo(E.x, E.y); ctx.moveTo(O.x, O.y); ctx.lineTo(A.x, A.y); ctx.stroke();
      /* 궤도면(황도면) */
      I.plane(ctx, Z0, "rgba(120,150,255,.10)", "rgba(170,190,255,.40)");
      ctx.strokeStyle = "rgba(170,190,255,.10)"; ctx.lineWidth = 1;
      for (var gx = 100; gx < BL; gx += 100) { p = I.P(gx, 0, Z0); q = I.P(gx, BD, Z0); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      for (var gy = 45; gy < BD; gy += 45) { p = I.P(0, gy, Z0); q = I.P(BL, gy, Z0); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      /* 지구 공전 궤도(태양을 중심으로 한 원의 한 토막) */
      ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = "rgba(127,211,255,.55)"; ctx.lineWidth = 1.4; ctx.beginPath();
      for (i = 0; i <= 20; i++) { var th = -0.134 + i / 20 * 0.268, op = I.P(SX + (EX - SX) * Math.cos(th), DC + (EX - SX) * Math.sin(th), Z0); if (i) ctx.lineTo(op.x, op.y); else ctx.moveTo(op.x, op.y); }
      ctx.stroke(); ctx.restore();
      /* 늘 부는 태양풍(은은한 움직임) */
      var WR = K.rng(19);
      for (i = 0; i < 34; i++) { var wu = (WR() + ph * .004 * (.6 + WR() * .8)) % 1, wy = (WR() - .5) * BD * .9; p = I.P(SX + 40 + wu * (BL - SX - 60), DC + wy, Z0 + (WR() - .5) * 30); ctx.fillStyle = "rgba(220,230,255," + (.12 + .2 * (1 - wu)).toFixed(2) + ")"; ctx.fillRect(p.x, p.y, 2.2, 1.2); }
      /* 태양 */
      var sP = I.P(SX, DC, Z0);
      K.sun(ctx, sP.x, sP.y, 32);
      var fl = .55 + .45 * Math.sin(ph * .25);
      K.glow(ctx, sP.x + 14, sP.y - 8, running && s < 600 ? 7 : 2 + 1.5 * fl, "rgba(255,255,240,.95)", 4);
      /* 세 가지 도착 */
      for (k = 2; k >= 0; k--) {
        var f = fr[k], fp = laneP(k, f);
        ctx.save(); ctx.setLineDash([2, 5]); ctx.strokeStyle = "rgba(200,210,255,.22)"; ctx.lineWidth = 1; p = laneP(k, 0); q = laneP(k, 1);
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); ctx.restore();
        if (k === 0 && f > 0) {
          ctx.save(); ctx.shadowColor = KC.yellow; ctx.shadowBlur = 8; ctx.strokeStyle = KC.yellow; ctx.lineWidth = 2; ctx.beginPath();
          for (i = 0; i <= 80; i++) { var uu = f * i / 80, pp = laneP(0, uu), wv = Math.sin(uu * 60 - ph * .5) * 3.5; if (i) ctx.lineTo(pp.x - wv * .5, pp.y + wv * .866); else ctx.moveTo(pp.x, pp.y); }
          ctx.stroke(); ctx.restore();
          if (f < 1) K.glow(ctx, fp.x, fp.y, 3, "rgba(255,211,107,.95)", 4);
        } else if (k === 1 && f > 0) {
          var PR = K.rng(8);
          for (i = 0; i < 30; i++) { var pu = PR() * f, jt = (PR() - .5) * 26, pq = I.P(SX + pu * (EX - SX), DC + LANE[1] * (1 - pu) + jt, Z0 + (PR() - .5) * 18); ctx.globalAlpha = .3 + .65 * (pu / f); K.glow(ctx, pq.x, pq.y, 1.6, "rgba(182,156,255,.95)", 3); }
          ctx.globalAlpha = 1; if (f < 1) K.glow(ctx, fp.x, fp.y, 3, "rgba(182,156,255,.95)", 4);
        } else if (k === 2 && f > 0) {
          var st0 = laneP(2, 0), rx = 8 + 30 * f, ry = 12 + 44 * f;
          var tg = ctx.createLinearGradient(st0.x, st0.y, fp.x, fp.y); tg.addColorStop(0, "rgba(255,140,60,0)"); tg.addColorStop(1, "rgba(255,140,60,.28)");
          ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(st0.x, st0.y - 5); ctx.lineTo(fp.x + ry * .5, fp.y - ry * .866); ctx.lineTo(fp.x - ry * .5, fp.y + ry * .866); ctx.lineTo(st0.x, st0.y + 5); ctx.closePath(); ctx.fill();
          ctx.save(); ctx.translate(fp.x, fp.y); ctx.rotate(Math.PI / 6);
          var cg = ctx.createRadialGradient(-rx * .3, 0, 2, 0, 0, Math.max(rx, ry)); cg.addColorStop(0, "rgba(255,150,70,.05)"); cg.addColorStop(.7, hitC ? "rgba(255,150,70,.12)" : "rgba(255,150,70,.30)"); cg.addColorStop(1, hitC ? "rgba(255,200,140,.40)" : "rgba(255,200,140,.75)");
          ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 6.2832); ctx.fill();
          ctx.strokeStyle = "rgba(255,220,170,.85)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, -1.3, 1.3); ctx.stroke();
          ctx.restore();
        }
      }
      /* L1 감시 위성(막대로 궤도면에 꽂아 높이를 보인다) */
      var l1b = I.P(LXW, DC, Z0), l1 = I.P(LXW, DC, Z0 + 34);
      K.line(ctx, l1b, l1, "rgba(63,211,163,.7)", 1.2, [3, 3]);
      ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(l1b.x, l1b.y, 7, 2.5, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#c9d2de"; ctx.fillRect(l1.x - 3, l1.y - 4, 6, 7);
      ctx.fillStyle = "#3a6fd8"; ctx.fillRect(l1.x - 14, l1.y - 3, 9, 5); ctx.fillRect(l1.x + 5, l1.y - 3, 9, 5);
      if (SX + fr[2] * (EX - SX) >= LXW && !hitC) K.glow(ctx, l1.x, l1.y, 6, "rgba(63,211,163,.9)", 3);
      /* 지구와 자기권(태양 쪽은 눌리고 반대쪽은 꼬리처럼 길다) */
      var eP = I.P(EX, DC, Z0), cmp = hitC ? .74 : 1;
      ctx.save(); ctx.translate(eP.x, eP.y); ctx.rotate(Math.PI / 6);
      ctx.strokeStyle = hitC ? "rgba(255,180,120,.6)" : "rgba(127,211,255,.5)"; ctx.lineWidth = 1.4;
      [26, 38, 50].forEach(function (rr) {
        rr *= cmp; var ex = rr * .7, ey = rr * 1.4;
        ctx.beginPath(); ctx.ellipse(6, 0, ex, ey, 0, Math.PI * .55, Math.PI * 1.45); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(6 - ex * .156, -ey * .988); ctx.quadraticCurveTo(rr * 1.2, -rr * 1.1, rr * 2.3, -rr * .6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(6 - ex * .156, ey * .988); ctx.quadraticCurveTo(rr * 1.2, rr * 1.1, rr * 2.3, rr * .6); ctx.stroke();
      });
      ctx.restore();
      ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(eP.x + 4, eP.y + 15, 12, 3.5, 0, 0, 6.2832); ctx.fill();
      K.earth(ctx, eP.x, eP.y, 14);
      if (hitC) {
        var al = .55 + .3 * Math.sin(ph * .3);
        [-1, 1].forEach(function (sg) {
          ctx.save(); ctx.translate(eP.x, eP.y + sg * 11); ctx.strokeStyle = "rgba(63,230,160," + al.toFixed(2) + ")"; ctx.lineWidth = 2.4; ctx.shadowColor = "#3fe6a0"; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.ellipse(0, 0, 8, 2.6, 0, 0, 6.2832); ctx.stroke(); ctx.restore();
        });
      }
      /* 유리 앞면·오른쪽 면·윗면 */
      var gl = ctx.createLinearGradient(E.x, E.y, Dd.x, Dd.y - 80); gl.addColorStop(0, "rgba(220,235,255,.10)"); gl.addColorStop(.45, "rgba(255,255,255,.03)"); gl.addColorStop(.55, "rgba(255,255,255,.12)"); gl.addColorStop(1, "rgba(220,235,255,.05)");
      poly([E, Dd, Bt, F], gl);
      poly([Dd, Cc, B, Bt], "rgba(200,220,255,.10)");
      poly([A, B, Bt, F], "rgba(255,255,255,.06)");
      ctx.restore();
      poly([A, B, Cc, Dd, E, F], null, "rgba(255,255,255,.75)", 1.3);
      ctx.beginPath(); ctx.moveTo(F.x, F.y); ctx.lineTo(Bt.x, Bt.y); ctx.lineTo(B.x, B.y); ctx.moveTo(Bt.x, Bt.y); ctx.lineTo(Dd.x, Dd.y); ctx.stroke();
      /* 이름표 */
      var box = [0, W];
      K.pill(ctx, "태양", sP.x, sP.y + 54, { s: 11, a: "center", c: KC.yellow, box: box });
      K.pill(ctx, "L1 감시 위성", l1.x - 18, l1.y - 2, { s: 10.5, a: "right", c: KC.green, box: box });
      K.pill(ctx, "지구", eP.x - 6, eP.y + 46, { s: 11, a: "center", c: KC.blue, box: box });
      K.pill(ctx, hitC ? "자기권이 눌리고 오로라" : "자기권(지구 자기장)", eP.x + 34, eP.y - 34, { s: 10.5, c: hitC ? KC.orange : KC.blue, box: box });
      K.pill(ctx, "태양 → 지구 1 AU", 14, 24, { s: 11, c: KC.ink, box: box });
      /* 큰 제목 */
      var hl = headline(t, arrH);
      K.bigText(ctx, hl[0], W - 18, 54, 25, "#ffffff", "right");
      K.bigText(ctx, hl[1], W - 18, 86, 17, "#ffd35a", "right");
      K.pill(ctx, "폭발 후 " + (clock >= 72 ? "72" : clock.toFixed(1)) + "시간", W - 18, 114, { s: 11.5, a: "right", c: KC.ink, box: box });
      /* 범례(왼쪽 아래) */
      var LG = [
        { n: "플레어의 X선·전파 · 빛과 같은 속력", t: t.x, c: KC.yellow },
        { n: "고에너지 입자 · 광속의 약 " + Math.round(PART_FRAC * 100) + "%로 보면", t: t.p, c: KC.violet },
        { n: "코로나 질량 방출 · " + vc.toLocaleString() + " km/s", t: t.c, c: KC.orange }
      ];
      LG.forEach(function (lg, j) {
        K.pill(ctx, lg.n + " — " + (s >= lg.t ? "도착 ✓ " : "도착까지 ") + fmtTime(lg.t), 14, 352 + j * 26, { s: 11, c: lg.c, box: box });
      });
      K.warn(ctx, 14, 438, "⚠ 크기·거리는 실제 비율이 아님 · L1까지의 거리는 12배 과장");
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var t = times(), arrH = t.c / 3600;
      drawBox(t, arrH);

      /* ── 아래: 경보 시각표 ── */
      var BY = TH + 8, tx0 = 60, tx1 = 860, ty = BY + 112;
      function TX(h) { return tx0 + clamp(h, 0, 72) / 72 * (tx1 - tx0); }
      K.card(ctx, 0, BY, W, H - BY, "경보 시각표 · 폭발 후 0~72시간");
      K.t(ctx, "L1 감시 위성이 벌어 주는 여유 " + fmtTime(t.l1), W - 18, BY + 28, { s: 12, w: "900", a: "right", c: LT.green });
      var aA = clamp(arrH - 6, 0, 72), aB = clamp(arrH, 0, 72);
      ctx.fillStyle = "rgba(15,159,118,.22)"; ctx.fillRect(TX(aA), BY + 66, TX(aB) - TX(aA), ty - BY - 66);
      K.t(ctx, "보호 모드를 켜기 알맞은 6시간", TX(aA) - 6, BY + 60, { s: 11, w: "800", a: "right", c: LT.green });
      ctx.strokeStyle = LT.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tx0, ty); ctx.lineTo(tx1, ty); ctx.stroke();
      for (var gh = 0; gh <= 72; gh += 12) {
        var gx = TX(gh); ctx.beginPath(); ctx.moveTo(gx, ty); ctx.lineTo(gx, ty + 5); ctx.stroke();
        K.t(ctx, gh + "시간", gx, ty + 18, { s: 10.5, a: "center", c: LT.mute, w: "700" });
      }
      var cxp = TX(arrH);
      K.line(ctx, { x: cxp, y: BY + 46 }, { x: cxp, y: ty + 6 }, LT.red, 2.4);
      K.t(ctx, "폭풍 도착 " + arrH.toFixed(1) + "시간", Math.min(cxp + 6, W - 130), BY + 60, { s: 11.5, w: "900", c: LT.red });
      if (clock < 72) { K.line(ctx, { x: TX(clock), y: BY + 62 }, { x: TX(clock), y: ty }, LT.ink, 1.5, null, .6); }
      var hxp = TX(hh), inB = (hh <= arrH && hh >= arrH - 6), hc = inB ? LT.green : LT.blue;
      ctx.fillStyle = hc; ctx.beginPath(); ctx.moveTo(hxp, ty - 1); ctx.lineTo(hxp - 7, ty - 14); ctx.lineTo(hxp + 7, ty - 14); ctx.closePath(); ctx.fill();
      K.t(ctx, "보호 모드 " + hh + "시간", clamp(hxp, 70, W - 70), BY + 94, { s: 11.5, w: "900", a: "center", c: hc });
      var e = $("b-storm-read");
      if (e) e.innerHTML = "<span class='k'>X선</span><span class='v y'>" + fmtTime(t.x) + "</span>" +
        "<span class='k'>고에너지 입자</span><span class='v b'>" + fmtTime(t.p) + "</span>" +
        "<span class='k'>코로나 질량 방출</span><span class='v r'>" + arrH.toFixed(1) + "시간</span><span class='sub'>1 AU ÷ " + vc.toLocaleString() + " km/s</span>" +
        "<span class='ok " + (inB ? "g" : "r") + "'>" + (inB ? "보호 모드 " + hh + "시간 · 알맞은 시각" : (hh > arrH ? "보호 모드 " + hh + "시간 · 너무 늦습니다" : "보호 모드 " + hh + "시간 · 너무 이릅니다")) + "</span>";
    }
    canvas._redraw = draw;
    /* 은은한 움직임(태양풍·섬광·오로라) — 미션과 상관없이 그림만 다시 그린다 */
    K.animate(canvas, function (dt) { if (!amb || running) return; ph += dt / 40; draw(); }, 20);
    playBtn("b-storm-anim", amb, "⏸ 태양풍 멈추기", "▶ 태양풍 보기", function (on) { amb = on; });

    function mission() {
      if (got.slow) done("b-m3a");
      if (got.fast) done("b-m3b");
      if (got.alert) done("b-m3c");
      if (got.slow && got.fast && got.alert) {
        window.sthMission("b-m3", true, "<span class='m-tag'>미션 완료</span>같은 폭발이라도 <b>X선은 8분, 입자는 수십 분, 코로나 질량 방출은 하루에서 사흘</b>. 이 시간 차이가 곧 우리가 쓸 수 있는 <b>경보 시간</b>입니다.");
        ep.clear(2);
      }
    }
    function update() {
      var t = times(), arrH = t.c / 3600, ch = false;
      $("b-v-val").textContent = vc.toLocaleString() + " km/s";
      $("b-h-val").textContent = hh + "시간";
      if (!got.slow && arrH > 48) { got.slow = ch = true; }
      if (!got.fast && arrH < 24) { got.fast = ch = true; }
      var inBand = (hh <= arrH && hh >= arrH - 6);
      if (!got.alert && inBand) { got.alert = ch = true; alertBest = { v: vc, h: hh, a: arrH }; window.sthState("b3best", alertBest); }
      if (ch) { window.sthState("b3", got); mission(); }
      $("b-storm-info").innerHTML =
        "속력 <b>" + vc.toLocaleString() + " km/s</b> 인 코로나 질량 방출은 1 AU(약 1억 4,960만 km)를 <b>" + fmtTime(t.c) + "</b> 만에 건너옵니다. " +
        "같은 폭발에서 나온 X선은 <b>" + fmtTime(t.x) + "</b>, 고에너지 입자는 <b>" + fmtTime(t.p) + "</b> 만에 닿습니다.<br>" +
        (inBand
          ? "✅ <b>보호 모드 " + hh + "시간</b> — 폭풍 도착(" + arrH.toFixed(1) + "시간) 전 6시간 안쪽입니다. 손실을 최소로 줄이면서 송전망을 지킬 수 있습니다."
          : (hh > arrH
            ? "❌ <b>너무 늦습니다.</b> 폭풍은 " + arrH.toFixed(1) + "시간에 도착하는데 보호 모드는 " + hh + "시간에 켭니다. 유도 전류가 먼저 변압기를 때립니다."
            : "⚠️ <b>너무 이릅니다.</b> 도착까지 " + (arrH - hh).toFixed(1) + "시간이나 남았습니다. 그동안 송전 용량을 낮춘 채 기다려야 해 손실이 큽니다. 도착 6시간 안쪽으로 당겨 보세요."));
      draw();
    }
    $("b-v").addEventListener("input", function (e) { vc = +e.target.value; update(); });
    $("b-h").addEventListener("input", function (e) { hh = +e.target.value; update(); });
    $("b-run").addEventListener("click", function () {
      if (running) return;
      running = true; $("b-run").disabled = true;
      var k = 0;
      (function step() {                                   // rAF는 가려진 탭에서 멈추므로 setTimeout을 쓴다
        k++; clock = k / 60 * 72; ph += 1; draw();
        if (k < 60) window.setTimeout(step, 24);
        else { clock = 72; running = false; $("b-run").disabled = false; draw(); }
      })();
    });
    update(); mission();
    if (ep.cleared(2)) window.sthMission("b-m3", true);
  })();

  /* ---- 장면 4 — 피해 신고 분류 ---- */
  window.sthSort({
    mount: "b-sort",
    buckets: [
      { id: "x", label: "플레어의 X선", sub: "8분 20초 만에 도착" },
      { id: "p", label: "고에너지 입자", sub: "수십 분 ~ 수 시간" },
      { id: "c", label: "코로나 질량 방출", sub: "1~3일 · 지자기 폭풍" }
    ],
    items: [
      { t: "X선이 급증해 대낮 쪽 전리층이 교란되어 단파 무선 통신이 갑자기 두절되는 델린저 현상이 나타났다", a: "x", why: "X선은 빛과 같은 속력으로 와서 낮 반구의 전리층을 순식간에 교란합니다.", hint: "‘갑자기’, 그리고 ‘대낮 쪽에서만’ 일어났다는 점을 보세요." },
      { t: "관측 위성의 X선 검출기가 폭발 8분 20초 만에 눈금 꼭대기까지 튀어 올라 한동안 아무것도 구분하지 못했다", a: "x", why: "8분 20초는 1 AU를 빛의 속력으로 건너오는 시간입니다." },
      { t: "고에너지 입자가 인공위성의 전자 장비를 때려 기억 장치의 값이 뒤집히고, 위성 고장 위험이 높아졌다", a: "p", why: "빠른 입자가 반도체를 직접 때려 기억 장치의 값을 뒤집기도 합니다." },
      { t: "극지방 항로를 날던 여객기 승무원의 피폭량이 평소의 몇 배로 올라가, 항공사가 항로를 낮은 위도로 돌렸다", a: "p", why: "고에너지 양성자는 자기력선이 열려 있는 극지방으로 쏟아져 들어옵니다.", hint: "지구 자기장이 막아 주지 못하는 곳이 어디일까요?" },
      { t: "고에너지 양성자가 극지방 상공의 전리층을 때려, 극지방을 지나는 단파 통신이 며칠 동안 끊겼다", a: "p", why: "극관 흡수라고 부르는 현상으로, 입자가 계속 쏟아지는 동안 이어집니다." },
      { t: "많은 양의 플라스마가 지구 자기장을 강하게 흔들어 지자기 폭풍을 일으키고, 송전망에 유도 전류가 흘러 대규모 정전 사고로 이어졌다", a: "c", why: "1989년 퀘벡 정전이 바로 이것입니다. 변압기에 흐른 유도 전류가 원인이었습니다." },
      { t: "지자기 폭풍으로 고층 대기가 부풀어 올라, 낮은 궤도를 돌던 인공위성들이 공기 저항을 받아 고도가 조금씩 낮아졌다", a: "c", why: "대기가 부풀면 위성이 받는 저항이 커집니다. 궤도 수명이 줄어듭니다.", hint: "하루 넘게 걸려 도착한 플라스마 덩어리가 자기권 전체를 흔든 결과입니다." },
      { t: "지자기 폭풍이 이어지는 동안 입자가 지구 자기장을 따라 고층 대기로 쏟아져, 오로라가 관측되는 지역이 평소보다 낮은 위도까지 넓어졌다", a: "c", why: "코로나 질량 방출이 강한 지자기 폭풍을 일으키면 오로라가 평소보다 훨씬 낮은 위도에서도 보입니다. 오로라는 입자가 고층 대기의 기체와 부딪쳐 내는 빛이에요." }
    ],
    doneText: "같은 폭발이라도 무엇이 언제 도착했느냐에 따라 피해의 종류가 달라집니다.",
    onDone: function () {
      window.sthMission("b-m4", true, "<span class='m-tag'>미션 완료</span>통신·항법·항공·전력·인공위성까지, 태양 활동은 <b>실생활 전체</b>에 닿아 있습니다. 그래서 태양 활동 감시 시스템은 천문 관측이 아니라 <b>재난 대비</b>입니다.");
      window.sthState("b4", 1);
      ep.clear(3); ep.clear(4);
    }
  });
  if (ep.cleared(3)) window.sthMission("b-m4", true);

  /* ---- 장면 5 — 결말 ---- */
  function vs() {
    var p = window.sthState("p2") || "";
    var best = window.sthState("b3best");
    $("b-vs").innerHTML = "<b>나의 첫 판단</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉢") === 0
        ? "정확했습니다. 폭풍이 나뉘어 도착하기 때문에 예보가 성립합니다."
        : "직접 재 보니 ㉢이었습니다. 한꺼번에 왔다면 경보를 낼 시간 자체가 없었을 것입니다.") +
      "<br><b>내가 낸 경보</b> " + (best ? "CME " + best.v.toLocaleString() + " km/s → 도착 " + best.a.toFixed(1) + "시간, 보호 모드 " + best.h + "시간 뒤 발령" : "-");
  }
  function finish() {
    var best = window.sthState("b3best");
    window.sthState("r2", best
      ? "완료 · CME " + best.v.toLocaleString() + " km/s, 도착 " + best.a.toFixed(1) + "h → 보호 모드 " + best.h + "h 발령"
      : "완료 · 태양 폭풍 경보 훈련");
  }
  ep.onShow(function (i) { if (i === 4) vs(); });
  if (ep.at() === 4) vs();

  window.sthWork({
    mount: "wk2", unitLabel: "[행성우주과학1 Ⅰ-1] 이야기 ② 8분 20초 뒤의 첫 신호",
    items: [
      { id: "w1", label: "태양 활동이 지구에 닿는 경로", hint: "흑점 수가 늘 때 지구에서 무슨 일이 생기는지, 중간 과정을 빠뜨리지 말고 순서대로 쓰세요. 도착까지 걸리는 시간도 함께 적으면 좋습니다." },
      { id: "w2", label: "감시가 필요한 이유", hint: "우주 위험 감시 기술이 왜 재난 대비인지, 구체적 사례 하나를 들어 쓰세요. L1 감시 위성이 벌어 주는 시간을 근거로 삼아도 좋습니다." }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 빗나가게 하라
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "방어 기록 ③", onDone: finish });

  window.sthGate({
    gate: "c-g1", key: "p3", title: "감시팀 신참의 첫 판단",
    question: "지름 150 m짜리 소행성이 몇 년 뒤 지구로 옵니다. 막을 방법이 있을까요?",
    options: [
      "㉠ 핵무기를 쏘아 산산조각 낸다",
      "㉡ 미리 찾아내 살짝 밀어서 궤도를 어긋나게 한다",
      "㉢ 지금 기술로는 막을 방법이 없다"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* ---- 장면 2 — 충돌 에너지 ---- */
  (function () {
    var canvas = $("c-c-energy"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var RHO = 3000, V = 19000, KT = 4.184e12;
    var KE = 0.5 * RHO * (Math.PI / 6) * V * V;     // E = KE · d³
    var d = 60, got = window.sthState("c2") || { a: false, b: false };
    var MARK = [
      { n: "히로시마 원자 폭탄", kt: 15 },
      { n: "2013 첼랴빈스크", kt: 500 },
      { n: "1908 퉁구스카(추정)", kt: 10000 }
    ];
    function energyJ(dd) { return KE * dd * dd * dd; }
    function fmtE(kt) {
      if (kt < 1000) return kt.toFixed(0) + " kt";
      if (kt < 1e6) return (kt / 1000).toFixed(kt < 1e4 ? 1 : 0) + " Mt";
      return (kt / 1e6).toFixed(1) + " Gt";
    }

    function tonText(dd) {
      var ton = RHO * (Math.PI / 6) * dd * dd * dd / 1000;
      return ton < 1e4 ? Math.round(ton).toLocaleString() + " 톤"
        : (ton < 1e8 ? (ton / 1e4 < 100 ? (ton / 1e4).toFixed(1) : Math.round(ton / 1e4).toLocaleString()) + "만 톤"
          : (ton / 1e8).toFixed(1) + "억 톤");
    }
    /* 블록 모형: 가로 1.2 km 도시 블록(축구장·아파트) 위에 실제 크기 그대로의 소행성을 띄운다(1 m = 0.2 그림 단위) */
    var LW = 628, BLK = 1200, BDP = 600, memo = {};
    var I = K.iso({ ox: 330, oy: 150, s: 0.2, L: BLK, D: BDP });
    var APTS = (function () {
      var R = K.rng(9), out = [], i, j;
      for (i = 0; i < 4; i++) for (j = 0; j < 3; j++) out.push([90 + i * 70, 330 + j * 80, 36, 18, 38 + Math.round(R() * 14)]);
      for (i = 0; i < 5; i++) out.push([760 + (i % 3) * 120, 60 + Math.floor(i / 3) * 140, 40, 24, 28 + Math.round(R() * 30)]);
      return out.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); });
    })();
    function paintCity(c) {
      var fc = I.P(BLK * .55, BDP * .6, 0);
      K.studio(c, 0, 0, LW, H, { x: fc.x, y: fc.y + 40, rx: 260, ry: 56 });
      /* 땅 블록(앞·오른쪽 면 = 흙과 기반암) */
      var T = 0, B = -70;
      I.face(c, "front", function (Lw) { var g = c.createLinearGradient(0, B, 0, T); g.addColorStop(0, "#5d4636"); g.addColorStop(.7, "#8b6a4c"); g.addColorStop(1, "#6f8f4a"); c.fillStyle = g; c.fillRect(0, B, Lw, T - B); });
      I.face(c, "right", function (Lw) { var g = c.createLinearGradient(0, B, 0, T); g.addColorStop(0, "#4c392c"); g.addColorStop(.7, "#755a40"); g.addColorStop(1, "#5d7a3e"); c.fillStyle = g; c.fillRect(0, B, Lw, T - B); });
      I.plane(c, 0, "#c9d3c0");
      /* 길 */
      I.plane(c, .5, "#9aa3ad", null, 0, BLK, 268, 300); I.plane(c, .5, "#9aa3ad", null, 690, 720, 0, BDP);
      /* 축구장 105 m × 68 m */
      I.plane(c, 1, "#3f9a4a", "#ffffff", 300, 405, 90, 158);
      var m1 = I.P(352.5, 90, 1), m2 = I.P(352.5, 158, 1); c.strokeStyle = "#fff"; c.lineWidth = 1; c.beginPath(); c.moveTo(m1.x, m1.y); c.lineTo(m2.x, m2.y); c.stroke();
      /* 공원 나무 */
      var R = K.rng(4); for (var k = 0; k < 26; k++) { var tx = 40 + R() * 220, ty = 30 + R() * 200; I.tree(c, tx, ty, 0, .55); }
      APTS.forEach(function (a) { I.box(c, a[0], a[1], 0, a[0] + a[2], a[1] + a[3], a[4], "#eef1f5", "#d5dbe3", "#aeb7c3"); });
      I.edges(c, 0, 0);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var E = energyJ(d), kt = E / KT, big = kt >= 1e5, air = d <= 25;
      ctx.drawImage(cached(canvas, W, H, memo, "city", paintCity), 0, 0, W, H);
      /* 소행성(실제 크기) — 땅에 그림자, 도시 위에 떠 있다 */
      var rM = d / 2, ax = 640, ay = 330, az = rM + 160 + (1 - d / 1000) * 200, rp = Math.max(2.4, rM * I.s);
      var sh = I.P(ax, ay, 0);
      ctx.fillStyle = "rgba(10,15,30," + (.12 + .2 * Math.min(1, d / 600)) + ")"; ctx.beginPath(); ctx.ellipse(sh.x, sh.y, Math.max(4, rp * 1.1), Math.max(2, rp * .55), 0, 0, 6.2832); ctx.fill();
      var cp = I.P(ax, ay, az);
      K.line(ctx, sh, { x: cp.x, y: cp.y + rp }, "rgba(20,30,60,.35)", 1, [3, 3]);
      /* 대기에 들어오며 달궈진 꼬리 */
      var tr = ctx.createLinearGradient(cp.x + rp * 3, cp.y - rp * 3, cp.x, cp.y);
      tr.addColorStop(0, "rgba(255,150,70,0)"); tr.addColorStop(1, "rgba(255,150,70,.55)");
      ctx.fillStyle = tr; ctx.beginPath(); ctx.moveTo(cp.x - rp * .7, cp.y - rp * .7); ctx.lineTo(cp.x + Math.max(30, rp * 3.4), cp.y - Math.max(30, rp * 3.4)); ctx.lineTo(cp.x + rp * .7, cp.y + rp * .7); ctx.closePath(); ctx.fill();
      if (rp > 4) rock(ctx, cp.x, cp.y, rp, 5, "#cbbba6", "#2a221c"); else K.planet(ctx, cp.x, cp.y, rp, "#b9a48c", "#3a2e24");
      /* 이름표 */
      var box = [0, LW];
      K.pill(ctx, "소행성 지름 " + d + " m · 약 " + tonText(d), cp.x + rp + 14, cp.y - Math.min(rp, 30) - 6, { s: 12, c: big ? "#ff9aac" : "#ffd35a", box: box });
      I.label(ctx, 352, 158, 1, "축구장 105 m", -30, 34, "#9ff0d0", box);
      I.label(ctx, 160, 400, 45, "아파트 약 45 m", -40, -26, "#e8ecff", box);
      I.label(ctx, BLK, BDP * .5, -30, "도시 블록 가로 1.2 km", 34, 26, "#ffd9b8", box);
      K.bigText(ctx, "충돌 에너지 " + fmtE(kt), 18, 50, 27, big ? "#ff8a9e" : "#ffd35a");
      var hx = kt / 15; K.bigText(ctx, "히로시마 원자 폭탄의 약 " + (hx < 10 ? hx.toFixed(1) : (hx < 1e4 ? Math.round(hx).toLocaleString() : Math.round(hx / 1e4).toLocaleString() + "만 ")) + "배", 18, 82, 17, "#ffffff");
      K.warn(ctx, LW - 14, H - 16, "⚠ 소행성·건물·땅은 같은 축척 · 소행성 높이만 임의", "right");

      /* 오른쪽 판정 카드: 충돌 에너지 눈금(10배씩) */
      var RX = LW + 10, px = RX + 18, cw = W - RX;
      K.card(ctx, RX, 0, cw, H, "판정 · 충돌 에너지 (TNT 환산)");
      K.t(ctx, big ? "도시 하나가 사라질 규모" : (air ? "대부분 공중에서 폭발" : "땅에 닿아 크레이터"), px, 62, { s: 18, w: "900", c: big ? LT.red : (air ? LT.blue : LT.orange) });
      var by0 = 96, by1 = H - 66, ax0 = px + 40;
      function yp(k) { return by1 - clamp((log10(k) + 1) / 9, 0, 1) * (by1 - by0); }
      [[0.1, "0.1 kt"], [10, "10 kt"], [1000, "1 Mt"], [1e5, "100 Mt"], [1e7, "10 Gt"]].forEach(function (q) {
        var gy = yp(q[0]); K.line(ctx, { x: ax0, y: gy }, { x: W - 18, y: gy }, LT.grid, 1);
        K.t(ctx, q[1], ax0 - 6, gy + 4, { s: 10, a: "right", c: LT.mute, w: "700" });
      });
      K.line(ctx, { x: ax0, y: by0 }, { x: ax0, y: by1 }, LT.line, 1.5);
      var cyv = yp(kt), bg = ctx.createLinearGradient(0, by1, 0, cyv);
      bg.addColorStop(0, "#ffd8a8"); bg.addColorStop(1, big ? LT.red : LT.orange);
      ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(ax0 + 6, cyv, 34, by1 - cyv, [6, 6, 0, 0]); ctx.fill();
      MARK.forEach(function (m) {
        var my = yp(m.kt); K.line(ctx, { x: ax0, y: my }, { x: W - 18, y: my }, LT.dim, 1, [4, 3]);
        K.t(ctx, m.n.replace("(추정)", "") + " " + fmtE(m.kt), W - 18, my - 4, { s: 10.5, w: "800", a: "right", c: LT.ink });
      });
      K.line(ctx, { x: ax0, y: yp(1e5) }, { x: W - 18, y: yp(1e5) }, LT.red, 2);
      K.t(ctx, "100 Mt · 도시 하나 규모", W - 18, yp(1e5) - 4, { s: 10.5, w: "900", a: "right", c: LT.red });
      K.t(ctx, fmtE(kt), ax0 + 23, Math.max(cyv - 6, by0 + 10), { s: 13, w: "900", a: "center", c: big ? LT.red : LT.orange });
      K.tip(ctx, air ? "25 m 이하 · 대기에서 부서지기 쉬움" : (big ? "미리 찾아 궤도를 바꾸는 수밖에" : "떨어진 곳이 도시면 재난"), px - 4, H - 48, cw - 28, air ? null : false);
      var e = $("c-read");
      if (e) e.innerHTML = "<span class='k'>지름</span><span class='v b'>" + d + " m</span><span class='sub'>질량 약 " + tonText(d) + " (밀도 3,000 kg/m³)</span>" +
        "<span class='k'>충돌 에너지</span><span class='v " + (big ? "r" : "y") + "'>" + fmtE(kt) + "</span><span class='sub'>E = ½ m v², v = 19 km/s · 히로시마 원자 폭탄의 약 " + (kt / 15 < 10 ? (kt / 15).toFixed(1) : Math.round(kt / 15).toLocaleString()) + "배</span>" +
        (big ? "<span class='ok r'>도시 하나를 통째로 없앨 수 있는 규모</span>" : "");
    }
    canvas._redraw = draw;

    function mission() {
      if (got.a) done("c-m2a");
      if (got.b) done("c-m2b");
      if (got.a && got.b) {
        window.sthMission("c-m2", true, "<span class='m-tag'>미션 완료</span>지름이 <b>2배</b>가 되면 부피가 8배가 되어 에너지도 <b>8배</b>가 됩니다. 20 m가 500 kt, 120 m면 벌써 100 Mt이 넘습니다. 크기를 조금만 잘못 재도 위험도가 완전히 달라집니다.");
        ep.clear(1);
      }
    }
    function update() {
      var E = energyJ(d), kt = E / KT, ch = false;
      $("c-d-val").textContent = d + " m";
      if (!got.a && kt >= 400 && kt <= 700) { got.a = ch = true; }
      if (!got.b && kt >= 1e5) { got.b = ch = true; }
      if (ch) { window.sthState("c2", got); mission(); }
      $("c-energy-info").innerHTML = "지름 <b>" + d + " m</b> 인 암석질 소행성이 초속 19 km로 부딪치면 충돌 에너지는 <b>" + fmtE(kt) + "</b> (TNT 환산)입니다. " +
        (d <= 25 ? "이 정도 크기는 대부분 대기를 뚫지 못하고 <b>공중에서 터집니다.</b> 크레이터는 남지 않지만, 2013년 첼랴빈스크처럼 충격파만으로도 큰 피해가 납니다."
          : (kt < 1e5 ? "이 정도 크기부터는 대기를 뚫고 지표에 닿아 크레이터를 만들 수 있습니다. 다만 50 m 안팎의 암석질 천체는 1908년 퉁구스카처럼 공중에서 폭발하기도 합니다. 떨어지는 곳이 도시라면 재난이 됩니다."
            : "<b>도시 하나를 통째로 없앨 수 있는 규모</b>입니다. 이런 크기는 미리 찾아내 궤도를 바꾸는 것 말고는 방법이 없습니다."));
      draw();
    }
    $("c-d").addEventListener("input", function (e) { d = +e.target.value; update(); });
    update(); mission();
    if (ep.cleared(1)) window.sthMission("c-m2", true);
  })();

  /* ---- 장면 3 — 궤도 편향 ---- */
  var dartBest = window.sthState("c3best") || null;
  (function () {
    var canvas = $("c-c-dart"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var YEAR = 3.1557e7, NEED = 12000, DV_MAX = 40, R_EARTH = 6371;
    var t = 5, dv = 5;
    function drift(tt, dd) { return dd * tt * 94.671; }      // km ≈ 3 · Δv · 남은 시간

    var u = REDUCE ? 1 : 0, moving = !REDUCE;
    /* 우주 진열장 블록 모형: 소행성은 왼쪽 위 끝에서 들어와 오른쪽 아래의 지구로 온다. 밀면 궤도가 위로 비껴 올라간다 */
    var LW = 628, ZH = 210, memo = {};
    var I = K.iso({ ox: 300, oy: 205, s: 0.56, L: 560, D: 130 });
    var EX = 450, EY = 65, EZ = 70, ER = 58;                /* 지구 자리(그림 단위)와 반지름 */
    function pathZ(x, off) { var k = clamp((x - 150) / (EX - 150), 0, 1); return EZ + off * k * k * (3 - 2 * k) + (x > EX ? off * 0 : 0); }
    function paintCase(c) {
      var fl = I.P(I.L * .6, I.D, 0);
      K.studio(c, 0, 0, LW, H, { x: fl.x, y: fl.y + 4, rx: 300, ry: 58 });
      caseBack(c, I, ZH, 23, 70);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var s = drift(t, dv), ok = s >= NEED && dv <= DV_MAX && dv > 0, SCALE = R_EARTH / ER;
      var off = s / SCALE, clipped = off > ZH - EZ - 12, offD = Math.min(off, ZH - EZ - 12), col = ok ? KC.green : KC.orange;
      ctx.drawImage(cached(canvas, W, H, memo, "case", paintCase), 0, 0, W, H);
      /* 지구 그림자와 높이 막대 */
      var ef = I.P(EX, EY, 0), ep = I.P(EX, EY, EZ), erp = ER * I.s;
      ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(ef.x, ef.y, erp * .9, erp * .4, 0, 0, 6.2832); ctx.fill();
      /* 밀지 않았을 때: 곧장 지구로 */
      var a0 = I.P(10, EY, EZ);
      K.line(ctx, a0, { x: ep.x - erp * .8, y: ep.y - erp * .45 }, KC.red, 2.4, [7, 5], .95);
      K.earth(ctx, ep.x, ep.y, erp);
      var hz = ctx.createRadialGradient(ep.x, ep.y, erp, ep.x, ep.y, erp + 9); hz.addColorStop(0, "rgba(127,211,255,.4)"); hz.addColorStop(1, "rgba(127,211,255,0)");
      ctx.fillStyle = hz; ctx.beginPath(); ctx.arc(ep.x, ep.y, erp + 9, 0, 6.2832); ctx.fill();
      /* 밀었을 때: 위로 비껴 간다 */
      ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 8; ctx.strokeStyle = col; ctx.lineWidth = 2.8; ctx.beginPath();
      for (var x = 10; x <= I.L - 4; x += 6) { var q = I.P(x, EY, pathZ(x, offD)); if (x === 10) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y); }
      ctx.stroke(); ctx.restore();
      /* 어긋난 거리 막대(지구 자리) */
      if (offD > 6) {
        var b0 = I.P(EX + 24, EY, EZ), b1 = I.P(EX + 24, EY, EZ + offD);
        K.line(ctx, b0, b1, col, 1.6, [3, 3]);
        [b0, b1].forEach(function (b) { ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(b.x - 5, b.y); ctx.lineTo(b.x + 5, b.y); ctx.stroke(); });
      }
      /* 충돌체가 민 자리 */
      K.glow(ctx, a0.x, a0.y, 4, "rgba(255,236,190,.95)", 4.5);
      if (dv > 0) K.arrow(ctx, { x: a0.x, y: a0.y + 30 }, { x: a0.x, y: a0.y + 7 }, KC.yellow, 2.2);
      /* 소행성 */
      var xa = 10 + (I.L - 14) * u, ap = I.P(xa, EY, pathZ(xa, offD)), af = I.P(xa, EY, 0);
      ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.ellipse(af.x, af.y, 6, 2.6, 0, 0, 6.2832); ctx.fill();
      K.line(ctx, af, ap, "rgba(200,210,255,.3)", 1, [2, 3]);
      rock(ctx, ap.x, ap.y, 7.5, 5);
      caseFront(ctx, I, ZH);
      /* 이름표 */
      var box = [0, LW];
      I.label(ctx, 10, EY, EZ - 6, "충돌체로 밀기 · " + dv + " mm/s", -10, 46, "#ffd35a", box);
      I.label(ctx, 260, EY, EZ, "밀지 않았을 때 · 충돌", -24, 58, "#ff9aac", box);
      var lp = I.L - 40; I.label(ctx, lp, EY, pathZ(lp, offD), "밀었을 때 · " + Math.round(s).toLocaleString() + " km" + (clipped ? " (상자 밖)" : ""), 18, -26, ok ? "#9ff0d0" : "#ffd9a8", box);
      I.label(ctx, EX, EY + ER, EZ - ER * .3, "지구 (반지름 6,371 km)", -40, 30, "#bfe6ff", box);
      K.bigText(ctx, Math.round(s).toLocaleString() + " km 비껴감", 18, 50, 27, ok ? "#7dffc4" : (dv > DV_MAX ? "#ff8a9e" : "#ffd35a"));
      K.bigText(ctx, "충돌 " + t + "년 전 · " + dv + " mm/s로 밀기", 18, 82, 17, "#ffffff");
      K.warn(ctx, LW - 14, H - 16, "⚠ 진행 방향 거리는 줄여 그림 · 위아래는 지구 크기와 같은 축척", "right");

      /* 오른쪽 판정 카드 */
      var RX = LW + 10, px = RX + 18, cw = W - RX;
      var yy = verdict(ctx, RX, 0, cw, H, ok ? "작전 성공" : (dv > DV_MAX ? "너무 세게 밀었다" : (dv === 0 ? "밀지 않았다" : "아직 모자람")), ok ? LT.green : LT.red,
        [["미는 때", "충돌 " + t + "년 전"], ["속도 변화", dv + " mm/s", dv > DV_MAX ? LT.red : LT.ink], ["", "시속 약 " + (dv * 3.6).toFixed(1) + " m", LT.mute], ["어긋난 거리", Math.round(s).toLocaleString() + " km", s >= NEED ? LT.green : LT.red]], 104, 28);
      /* 10배씩 커지는 눈금 위 막대 */
      function xp(km) { return px + clamp((log10(Math.max(km, 10)) - 1) / 5, 0, 1) * (cw - 36); }
      var by = yy + 8;
      K.t(ctx, "어긋난 거리 (10배씩 커지는 눈금)", px, by, { s: 11, w: "800", c: LT.mute });
      ctx.fillStyle = "#e3e9f1"; ctx.beginPath(); ctx.roundRect(px, by + 12, cw - 36, 14, 7); ctx.fill();
      ctx.fillStyle = s >= NEED ? LT.green : LT.red; ctx.beginPath(); ctx.roundRect(px, by + 12, Math.max(6, xp(s) - px), 14, 7); ctx.fill();
      var nx = xp(NEED); K.line(ctx, { x: nx, y: by + 6 }, { x: nx, y: by + 32 }, LT.ink, 2);
      K.t(ctx, "필요 12,000 km", nx, by + 46, { s: 10.5, w: "900", a: "center", c: LT.ink });
      [[10, "10"], [1000, "1천"], [1e6, "100만 km"]].forEach(function (q, i) { K.t(ctx, q[1], xp(q[0]), by + 62, { s: 10, a: i === 0 ? "left" : (i === 2 ? "right" : "center"), c: LT.dim }); });
      K.t(ctx, "어긋남 ≈ 3 × 속도 변화 × 남은 시간", px, by + 92, { s: 11.5, w: "800", c: LT.mute });
      K.tip(ctx, ok ? "지구 반지름의 약 2배 바깥으로" : (dv > DV_MAX ? "40 mm/s 넘으면 부서질 위험" : "더 일찍, 또는 더 세게"), px - 4, H - 48, cw - 28, ok);
      var e = $("c-dart-read");
      if (e) e.innerHTML = "<span class='k'>미는 때</span><span class='v b'>충돌 " + t + "년 전</span>" +
        "<span class='k'>속도 변화</span><span class='v " + (dv > DV_MAX ? "r" : "y") + "'>" + dv + " mm/s</span><span class='sub'>시속 약 " + (dv * 3.6).toFixed(1) + " m</span>" +
        "<span class='k'>어긋난 거리</span><span class='v " + (s >= NEED ? "g" : "r") + "'>" + Math.round(s).toLocaleString() + " km</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "작전 성공 · 지구를 비켜 갑니다" : (dv > DV_MAX ? "너무 세게 밀었습니다 · 부서질 위험" : "아직 " + Math.round(Math.max(0, NEED - s)).toLocaleString() + " km 모자랍니다")) + "</span>";
    }
    canvas._redraw = draw;
    playBtn("c-play", moving, "⏸ 소행성 멈추기", "▶ 소행성 움직이기", function (on) { moving = on; });
    K.animate(canvas, function (dt) { if (moving) { u += dt / 4200; if (u > 1) u = 0; draw(); } });

    function update() {
      var s = drift(t, dv);
      $("c-t-val").textContent = t + "년 전";
      $("c-dv-val").textContent = dv + " mm/s";
      var okS = s >= NEED, okV = (dv > 0 && dv <= DV_MAX);
      $("c-dart-info").innerHTML =
        "충돌 <b>" + t + "년 전</b>에 <b>" + dv + " mm/s</b>(시속 약 " + (dv * 3.6).toFixed(1) + " m)만큼 밀어 주면, 소행성은 남은 " + t + "년 동안 조금씩 어긋나 충돌 시점에 <b>" + Math.round(s).toLocaleString() + " km</b> 떨어진 곳을 지나갑니다.<br>" +
        (okS && okV ? "✅ <b>작전 성공.</b> 지구 반지름(6,371 km)의 두 배 가까이 비껴갑니다. 필요한 속도 변화는 걸어가는 속력의 <b>수십~수백 분의 1</b>에 지나지 않습니다."
          : (!okV && dv > DV_MAX ? "❌ 어긋남은 충분하지만 <b>" + dv + " mm/s는 너무 셉니다.</b> 소행성이 부서져 조각들이 쏟아지면 오히려 더 나쁠 수 있습니다. 40 mm/s 이하로 줄이고, 대신 <b>더 일찍</b> 밀어 보세요."
            : (dv === 0 ? "속도 변화가 0입니다. 소행성은 원래 궤도 그대로 옵니다."
              : "❌ 아직 <b>" + Math.round(NEED - s).toLocaleString() + " km</b> 모자랍니다. 더 세게 밀거나, 더 <b>일찍</b> 밀어야 합니다. 같은 힘이라도 시간이 두 배면 어긋남도 두 배입니다.")));
      if (okS && okV) {
        dartBest = { t: t, dv: dv, s: Math.round(s) };
        window.sthState("c3best", dartBest);
        window.sthMission("c-m3", true, "<span class='m-tag'>미션 완료</span>충돌 <b>" + t + "년 전</b>에 <b>" + dv + " mm/s</b>로 밀어 <b>" + Math.round(s).toLocaleString() + " km</b> 빗나가게 했습니다. 3년 전이었다면 40 mm/s를 다 써도 모자랐을 것입니다. <b>발견이 곧 방어입니다.</b>");
        ep.clear(2);
      }
      draw();
    }
    $("c-t").addEventListener("input", function (e) { t = +e.target.value; update(); });
    $("c-dv").addEventListener("input", function (e) { dv = +e.target.value; update(); });
    update();
    if (ep.cleared(2)) window.sthMission("c-m3", true);
  })();

  /* ---- 장면 4 — 대응 순서 + 감시의 값어치 ---- */
  (function () {
    var okOrder = !!window.sthState("c4order"), okQ = !!window.sthState("c4q");
    var STEPS = [
      "탐사 관측으로 하늘을 훑어 새로운 지구 접근 천체를 발견한다",
      "여러 날의 관측 자료를 모아 궤도를 계산하고 충돌 확률을 따진다",
      "레이더와 추가 관측으로 궤도를 더 정밀하게 좁힌다",
      "남은 시간에 맞추어 편향 임무를 설계하고 충돌체를 발사한다",
      "충돌 뒤 궤도가 실제로 얼마나 바뀌었는지 다시 관측해 확인한다"
    ];
    function check() {
      if (okOrder) done("c-m4a");
      if (okQ) done("c-m4b");
      if (okOrder && okQ) {
        window.sthMission("c-m4", true, "<span class='m-tag'>미션 완료</span>감시는 ‘발견 → 궤도 계산 → 정밀 추적 → 편향 → 확인’의 다섯 단계입니다. 앞의 세 단계가 빠를수록 네 번째 단계가 쉬워집니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    if (okOrder) {
      $("c-order").innerHTML = "<div class='order sort'><div class='slots'>" +
        STEPS.map(function (s) { return "<div class='slot filled'>" + s + "</div>"; }).join("") + "</div></div>";
    } else {
      window.sthOrder({
        mount: "c-order", steps: STEPS,
        onDone: function () { okOrder = true; window.sthState("c4order", 1); check(); }
      });
    }
    window.sthPick({
      mount: "c-q1",
      q: "“아직 아무 일도 일어나지 않았는데 왜 감시에 돈을 쓰느냐”는 질문에 가장 정확한 답은?",
      options: [
        "지구 접근 천체의 수가 해마다 늘어나고 있기 때문",
        "충돌이 임박한 뒤에도 힘만 충분히 주면 언제든 막을 수 있기 때문",
        "미리 찾아낼수록 아주 작은 속도 변화만으로도 궤도를 바꿀 수 있어, 발견이 빠를수록 막기 쉬워지기 때문",
        "감시 위성이 소행성을 직접 부술 수 있기 때문"
      ],
      answer: 2,
      why: [
        "천체의 수가 늘어나는 것이 아니라, 우리가 <b>찾아낸</b> 수가 늘어나는 것입니다. 원래 있던 것을 이제야 보고 있는 셈입니다.",
        "방금 계산해 보았듯이 시간이 짧으면 같은 12,000 km를 어긋나게 하는 데 훨씬 큰 속도 변화가 필요하고, 너무 세게 밀면 소행성이 부서질 위험이 있습니다.",
        "어긋나는 거리는 속도 변화와 남은 시간의 <b>곱</b>에 비례합니다. 20년 전이면 7 mm/s로 충분한 일이, 3년 전이면 40 mm/s로도 모자랍니다. 감시는 곧 시간을 벌어 두는 일입니다.",
        "감시 장비는 관측만 합니다. 부수는 것은 목표도 아닙니다. 조각이 쏟아지면 오히려 더 위험할 수 있습니다."
      ],
      onDone: function () { okQ = true; window.sthState("c4q", 1); check(); }
    });
    check();
    if (ep.cleared(3)) window.sthMission("c-m4", true);
  })();

  /* ---- 장면 5 — 결말 ---- */
  function vs() {
    var p = window.sthState("p3") || "";
    var best = window.sthState("c3best");
    $("c-vs").innerHTML = "<b>나의 첫 판단</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0
        ? "정확했습니다. 실제로 2022년 DART가 바로 그렇게 했습니다."
        : (p.indexOf("㉠") === 0
          ? "부수면 조각이 쏟아져 오히려 더 위험할 수 있습니다. 실제 계획은 ‘살짝 밀기’입니다."
          : "막을 방법은 있습니다. 다만 <b>일찍 찾아냈을 때만</b> 그렇습니다.")) +
      "<br><b>내가 세운 편향 계획</b> " + (best ? "충돌 " + best.t + "년 전에 " + best.dv + " mm/s → " + best.s.toLocaleString() + " km 빗나감" : "-");
  }
  function finish() {
    var best = window.sthState("c3best");
    window.sthState("r3", best
      ? "완료 · 충돌 " + best.t + "년 전 " + best.dv + " mm/s로 밀어 " + best.s.toLocaleString() + " km 빗나감"
      : "완료 · 지구 접근 천체 편향 훈련");
  }
  ep.onShow(function (i) { if (i === 4) vs(); });
  if (ep.at() === 4) vs();

  window.sthWork({
    mount: "wk3", unitLabel: "[행성우주과학1 Ⅰ-1] 이야기 ③ 빗나가게 하라",
    items: [
      { id: "e3a", label: "국회 보고: 지구 접근 천체 감시에 예산이 필요한 까닭", hint: "충돌 에너지가 지름의 세제곱에 비례한다는 점과, 어긋난 거리가 ‘속도 변화 × 남은 시간’에 비례한다는 점을 숫자와 함께 근거로 드세요." },
      { id: "e3b", label: "우주 재난 대비 계획서", hint: "태양 폭풍과 지구 접근 천체, 두 우주 위험의 <b>경보 시간</b>이 각각 얼마나 되는지 비교하고, 그 차이 때문에 대비 방법이 어떻게 달라지는지 쓰세요." }
    ]
  });
})();

/* ========================================================================= 04 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[행성우주과학1 Ⅰ-1] 우주 탐사와 태양 활동 — 정리",
  recap: [
    { key: "r1", label: "① 22분 늦게 닿는 명령" },
    { key: "r2", label: "② 8분 20초 뒤의 첫 신호" },
    { key: "r3", label: "③ 빗나가게 하라" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rReal", label: "실제 자료" }
  ],
  items: [
    { id: "all", label: "세 기록을 꿰는 한 문장", hint: "화성까지의 22분, 태양 폭풍의 사흘, 소행성의 20년. 세 이야기에 공통으로 들어 있는 것을 ‘거리’와 ‘시간’이라는 말을 넣어 한 문장으로 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 05 우리 반 */
window.sthShare({
  mount: "share", unit: "psp-1-1", unitLabel: "[행성우주과학1 Ⅰ-1] 우주 탐사와 태양 활동",
  rows: [
    { key: "r1", label: "① 22분 늦게 닿는 명령" },
    { key: "r2", label: "② 8분 20초 뒤의 첫 신호" },
    { key: "r3", label: "③ 빗나가게 하라" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "세 기록을 꿰는 한 문장" }
});

})();
