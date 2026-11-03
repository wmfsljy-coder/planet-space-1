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

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var d = dist(idx), one = d / C_KMS;
      /* ── 위: 지구에서 목표까지 ── */
      var TH = 182, ty = 112, x0 = 92, x1 = 846;
      function X(dd) { return x0 + clamp(log10(dd / 30000) / 6, 0, 1) * (x1 - x0); }
      K.stage(ctx, 0, 0, W, TH, "space", { seed: 21, title: "지구에서 보낸 전파가 목표에 닿기까지" });
      K.warn(ctx, W - 16, 28, "⚠ 거리는 10배씩 커지는 눈금", "right");
      ctx.strokeStyle = "rgba(200,210,255,.28)"; ctx.lineWidth = 1.2; ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(62, ty); ctx.lineTo(x1 + 8, ty); ctx.stroke(); ctx.setLineDash([]);
      var mx = X(d);
      /* 신호가 지나간 길 */
      var bg = ctx.createLinearGradient(62, 0, mx, 0); bg.addColorStop(0, "rgba(127,211,255,.55)"); bg.addColorStop(1, "rgba(127,211,255,.12)");
      ctx.strokeStyle = bg; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(62, ty); ctx.lineTo(mx, ty); ctx.stroke();
      REF.forEach(function (r, k) {
        var x = X(r.d), L = LOOK[k], near = Math.abs(Math.log(r.d / d)) < 0.12;
        L.f(x, ty);
        K.pill(ctx, L.s + " · " + shortT(r.d / C_KMS), x, L.up ? ty - 22 : ty + 34, { s: 11, a: "center", c: near ? KC.yellow : KC.mute, box: [0, W] });
      });
      K.earth(ctx, 46, ty, 15);
      K.pill(ctx, "지구", 46, ty + 40, { a: "center", c: KC.blue });
      /* 전파 펄스 */
      var px = 62 + (mx - 62) * ph;
      for (var j = 0; j < 3; j++) {
        ctx.strokeStyle = "rgba(127,211,255," + (.75 - j * .22) + ")"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(px - j * 7, ty, 9 + j * 3, -.7, .7); ctx.stroke();
      }
      K.glow(ctx, px, ty, 2.6, "rgba(127,211,255,.95)", 4);
      /* 지금 목표 */
      ctx.strokeStyle = KC.yellow; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(mx, ty, 12, 0, 6.2832); ctx.stroke();
      [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (q) { ctx.beginPath(); ctx.moveTo(mx + q[0] * 9, ty + q[1] * 9); ctx.lineTo(mx + q[0] * 16, ty + q[1] * 16); ctx.stroke(); });
      K.line(ctx, { x: mx, y: ty - 16 }, { x: mx, y: 66 }, KC.yellow, 1, [2, 3], .7);
      K.pill(ctx, "지금 목표 · " + fmtKm(d), mx, 62, { a: "center", s: 11.5, c: KC.yellow, box: [0, W] });

      /* ── 아래: 걸리는 시간 ── */
      var BY = TH + 8, ax0 = 60, ax1 = 840, ay = 286;
      function T(sec) { return ax0 + clamp(log10(sec / 0.1) / 6.4, 0, 1) * (ax1 - ax0); }
      K.stage(ctx, 0, BY, W, H - BY, "lab", { seed: 4, title: "신호가 걸리는 시간 (10배씩 커지는 눈금)" });
      [[0.1, 2, "rgba(63,211,163,.22)", KC.green, "실시간 조종 가능"], [2, 300, "rgba(255,211,107,.18)", KC.yellow, "하루치 명령을 묶어 보내기"], [300, 251000, "rgba(255,107,129,.18)", KC.red, "탐사선의 자율 기능 필수"]].forEach(function (z) {
        ctx.fillStyle = z[2]; ctx.fillRect(T(z[0]), ay - 24, T(z[1]) - T(z[0]), 24);
        K.t(ctx, z[4], (T(z[0]) + T(z[1])) / 2, ay - 8, { s: 11, a: "center", c: z[3] });
      });
      ctx.strokeStyle = KC.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ax0, ay); ctx.lineTo(ax1, ay); ctx.stroke();
      [[0.1, "0.1초"], [1, "1초"], [10, "10초"], [60, "1분"], [600, "10분"], [3600, "1시간"], [86400, "1일"]].forEach(function (q) {
        var gx = T(q[0]); ctx.strokeStyle = KC.line; ctx.beginPath(); ctx.moveTo(gx, ay); ctx.lineTo(gx, ay + 5); ctx.stroke();
        K.t(ctx, q[1], gx, ay + 18, { s: 10.5, a: "center", c: KC.mute, w: "600" });
      });
      var o1 = T(one), o2 = T(one * 2);
      K.line(ctx, { x: o1, y: 254 }, { x: o1, y: ay }, KC.blue, 1.5, [3, 3]);
      K.line(ctx, { x: o2, y: ay }, { x: o2, y: 316 }, KC.orange, 1.5, [3, 3]);
      K.glow(ctx, o1, ay, 4, "rgba(127,211,255,.95)", 3.5);
      K.glow(ctx, o2, ay, 4, "rgba(255,179,92,.95)", 3.5);
      K.pill(ctx, "편도 " + fmtTime(one), o1 + 6, 250, { s: 11.5, a: "right", c: KC.blue, box: [0, W] });
      K.pill(ctx, "왕복(명령 → 응답) " + fmtTime(one * 2), o2 - 6, 330, { s: 11.5, c: KC.orange, box: [0, W] });
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
    function roverPic(x, y, crash) {
      ctx.save(); ctx.translate(x, y); if (crash) ctx.rotate(-.28);
      /* 돌리와 바퀴 */
      ctx.strokeStyle = "#9aa3ad"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-15, -6); ctx.lineTo(-6, -13); ctx.lineTo(6, -13); ctx.lineTo(15, -6); ctx.stroke();
      [-15, 0, 15].forEach(function (wx) {
        var wg = ctx.createRadialGradient(wx - 1.5, -6.5, .5, wx, -5, 5.5); wg.addColorStop(0, "#8d949c"); wg.addColorStop(1, "#24282e");
        ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(wx, -5, 5.2, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(wx, -5); ctx.lineTo(wx + Math.cos(wheel) * 4.5, -5 + Math.sin(wheel) * 4.5); ctx.stroke();
      });
      /* 몸통(금속) */
      var bg = ctx.createLinearGradient(0, -24, 0, -13); bg.addColorStop(0, "#f3f5f8"); bg.addColorStop(.5, "#c3cad3"); bg.addColorStop(1, "#7c8693");
      ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(-19, -24, 38, 11, 3); ctx.fill();
      ctx.fillStyle = "#5b6370"; ctx.fillRect(-19, -16, 38, 2);
      /* 돌기둥과 카메라 */
      ctx.strokeStyle = "#d7dce3"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(10, -24); ctx.lineTo(10, -40); ctx.stroke();
      ctx.fillStyle = "#e6e9ee"; ctx.beginPath(); ctx.roundRect(5, -46, 13, 7, 2); ctx.fill();
      ctx.fillStyle = "#1c2230"; ctx.beginPath(); ctx.arc(15, -42.5, 1.8, 0, 6.2832); ctx.fill();
      ctx.restore();
      if (!crash) K.glow(ctx, x + 15 + 2, y - 42.5, 1.2, "rgba(127,211,255,.9)", 3);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var r = run();
      target = r.pos; if (shown === null || REDUCE) shown = target;
      var TH = 190, x0 = 60, x1 = 822, gy = 140;
      function X(m) { return x0 + clamp(m, 0, GOAL) / GOAL * (x1 - x0); }
      /* ── 위: 화성 표면 ── */
      K.stage(ctx, 0, 0, W, TH, "night", { seed: 5 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, TH, 14); ctx.clip();
      var sky = ctx.createLinearGradient(0, 0, 0, 118); sky.addColorStop(0, "#170d1c"); sky.addColorStop(.6, "#4a2522"); sky.addColorStop(1, "#8e4a2c");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, 118);
      ctx.fillStyle = "#5b2a1a"; ctx.beginPath(); ctx.moveTo(0, 118);
      for (var hx = 0; hx <= W; hx += 30) ctx.lineTo(hx, 108 - 10 * Math.sin(hx / 70) - 6 * Math.sin(hx / 23));
      ctx.lineTo(W, 124); ctx.lineTo(0, 124); ctx.fill();
      var gr = ctx.createLinearGradient(0, 116, 0, TH); gr.addColorStop(0, "#9a5230"); gr.addColorStop(1, "#3b190d");
      ctx.fillStyle = gr; ctx.fillRect(0, 116, W, TH - 116);
      var RR = K.rng(19);
      for (var pb = 0; pb < 70; pb++) { ctx.fillStyle = "rgba(40,15,6," + (.2 + RR() * .3) + ")"; ctx.beginPath(); ctx.ellipse(RR() * W, 124 + RR() * (TH - 124), 1 + RR() * 3, .6 + RR(), 0, 0, 6.2832); ctx.fill(); }
      ctx.restore();
      K.pill(ctx, "화성 예제로 분화구 · 로버에서 삼각주 바위까지 900 m", 16, 28, { s: 13, c: KC.orange });
      /* 지구에서 확인한 안전 구간 */
      var sx = X(SAFE);
      var sz = ctx.createLinearGradient(0, gy - 30, 0, gy + 6); sz.addColorStop(0, "rgba(63,211,163,0)"); sz.addColorStop(1, "rgba(63,211,163,.45)");
      ctx.fillStyle = sz; ctx.fillRect(x0 - 20, gy - 30, sx - x0 + 20, 36);
      ctx.strokeStyle = KC.green; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(sx, gy - 34); ctx.lineTo(sx, gy + 6); ctx.stroke(); ctx.setLineDash([]);
      K.pill(ctx, "지구에서 사진으로 확인한 안전 구간 25 m", x0 - 30, 66, { s: 11, c: KC.green });
      /* 바퀴 자국 */
      var rx = X(shown);
      ctx.strokeStyle = "rgba(40,14,4,.55)"; ctx.lineWidth = 2;
      [gy + 2, gy + 6].forEach(function (yy) { ctx.beginPath(); ctx.moveTo(x0 - 15, yy); ctx.lineTo(rx - 15, yy); ctx.stroke(); });
      /* 바위들 */
      ROCK.forEach(function (m, k) { rock(ctx, X(m), gy - 2, 4 + (k % 3) * 1.6, 30 + k, "#d08a60", "#3a160a"); });
      /* 삼각주 바위(퇴적층) */
      var ox = x1 + 22, oy = gy + 4;
      ctx.save(); ctx.beginPath(); ctx.moveTo(ox - 18, oy); ctx.lineTo(ox - 12, oy - 34); ctx.lineTo(ox + 8, oy - 42); ctx.lineTo(ox + 30, oy - 30); ctx.lineTo(ox + 36, oy); ctx.closePath(); ctx.clip();
      ['#c98a5e', '#a8663f', '#d9a274', '#8f5233', '#c07a50', '#7d4428'].forEach(function (c, k) { ctx.fillStyle = c; ctx.fillRect(ox - 20, oy - 44 + k * 7.5, 60, 7.5); });
      ctx.restore();
      K.pill(ctx, "삼각주 바위 · 900 m", W - 14, gy + 36, { s: 11.5, a: "right", c: KC.yellow });
      /* 로버 */
      var crashNow = r.crash && Math.abs(shown - target) < 1;
      roverPic(rx, gy, crashNow);
      if (crashNow) { K.glow(ctx, rx + 22, gy - 8, 5, "rgba(255,107,129,.9)", 4); K.pill(ctx, "충돌! 보지 못한 바위", rx + 34, gy - 50, { s: 11.5, c: KC.red }); }
      K.pill(ctx, "로버 · " + Math.round(shown) + " m", rx, gy + 36, { s: 11.5, a: "center", c: KC.blue, box: [0, W - 190] });

      /* ── 아래: 30솔 진행 그래프 ── */
      var BY = TH + 8;
      K.stage(ctx, 0, BY, W, H - BY, "lab", { seed: 9 });
      K.pill(ctx, "솔마다 쌓인 이동 거리(m)", 16, BY + 26, { s: 13, c: KC.blue });
      K.pill(ctx, auto ? "🤖 자율 항법 켜짐 · 하루 " + Math.round(r.per) + " m" : "🕹️ 자율 항법 꺼짐 · 하루 " + Math.round(r.per) + " m", W - 16, BY + 26, { s: 12, a: "right", c: auto ? KC.green : KC.mute });
      var g = K.chart(ctx, { x: 0, y: BY, w: W, h: H - BY, x0: 0, x1: SOLS, y0: 0, y1: GOAL, xt: 6, yt: 3, pl: 58, pr: 24, pt: 44, pb: 28, xf: function (s) { return Math.round(s) + "솔"; } });
      var col = r.pos >= GOAL ? [KC.green, "rgba(63,211,163,.25)"] : (r.crash ? [KC.red, "rgba(255,107,129,.25)"] : [KC.blue, "rgba(127,211,255,.22)"]);
      var bw = Math.max(3, (g.R - g.L) / SOLS * .7);
      for (var i = 1; i < r.path.length; i++) {
        var bx = g.X(i) - bw / 2, top = g.Y(clamp(r.path[i], 0, GOAL));
        var bgd = ctx.createLinearGradient(0, top, 0, g.B); bgd.addColorStop(0, col[0]); bgd.addColorStop(1, col[1]);
        ctx.fillStyle = bgd; ctx.beginPath(); ctx.roundRect(bx, top, bw, g.B - top, [3, 3, 0, 0]); ctx.fill();
      }
      K.line(ctx, { x: g.L, y: g.Y(GOAL) }, { x: g.R, y: g.Y(GOAL) }, KC.yellow, 1.6, [6, 5]);
      K.pill(ctx, "목표 900 m", g.L + 8, g.Y(GOAL) + 20, { s: 11, c: KC.yellow });
      if (r.sol) K.pill(ctx, r.sol + "솔에 도착", g.X(r.sol), g.Y(GOAL) + 20, { s: 11, a: "center", c: KC.green, box: [g.L + 100, g.R] });
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
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var a = act(y), n = spots(y);
      /* ── 왼쪽: 흑점 수 곡선 ── */
      var LW = 440;
      K.stage(ctx, 0, 0, LW, H, "lab", { seed: 3, title: "흑점 수(개) · 약 11년 주기" });
      var g = K.chart(ctx, { x: 0, y: 0, w: LW, h: H, x0: 0, x1: 11, y0: 0, y1: 200, xt: 11, yt: 4, pl: 50, pr: 22, pt: 58, pb: 42, xl: "주기 진행(년)" });
      var pts = [];
      for (var p = 0; p <= 220; p++) { var yy = p / 220 * 11; pts.push([yy, spots(yy)]); }
      var fill = ctx.createLinearGradient(0, g.T, 0, g.B); fill.addColorStop(0, "rgba(255,179,92,.30)"); fill.addColorStop(1, "rgba(255,179,92,0)");
      ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(g.X(0), g.B);
      pts.forEach(function (q) { ctx.lineTo(g.X(q[0]), g.Y(q[1])); }); ctx.lineTo(g.X(11), g.B); ctx.closePath(); ctx.fill();
      K.line(ctx, { x: g.L, y: g.Y(150) }, { x: g.R, y: g.Y(150) }, KC.red, 1.3, [5, 4], .85);
      K.line(ctx, { x: g.L, y: g.Y(10) }, { x: g.R, y: g.Y(10) }, KC.green, 1.3, [5, 4], .85);
      K.plot(ctx, g, pts, KC.orange);
      K.pill(ctx, "극대기 기준 150개", g.R - 4, g.Y(150) - 7, { s: 10.5, a: "right", c: KC.red });
      K.pill(ctx, "극소기 기준 10개", g.R - 4, g.Y(10) - 8, { s: 10.5, a: "right", c: KC.green });
      var cx = g.X(y), cy = g.Y(n);
      K.line(ctx, { x: cx, y: cy }, { x: cx, y: g.B }, KC.yellow, 1.2, [3, 3]);
      K.line(ctx, { x: g.L, y: cy }, { x: cx, y: cy }, KC.yellow, 1.2, [3, 3]);
      K.glow(ctx, cx, cy, 5, "rgba(255,211,107,.95)", 3.6);

      /* ── 오른쪽: 필터 냀 망원경으로 본 태양 ── */
      var RX = LW + 8, RW = W - RX;
      K.stage(ctx, RX, 0, RW, H, "space", { seed: 31, title: "필터를 단 망원경으로 본 태양" });
      var sx = RX + RW / 2, sy = 168, sr = 106;
      ctx.save(); ctx.beginPath(); ctx.roundRect(RX, 0, RW, H, 14); ctx.clip();
      var co = ctx.createRadialGradient(sx, sy, sr * .9, sx, sy, sr * (1.35 + a * .45));
      co.addColorStop(0, "rgba(255,200,120," + (.35 + a * .3) + ")"); co.addColorStop(1, "rgba(255,170,80,0)");
      ctx.fillStyle = co; ctx.beginPath(); ctx.arc(sx, sy, sr * (1.35 + a * .45), 0, 6.2832); ctx.fill();
      ctx.restore();
      var seed = Math.round(y * 2) * 7919 + 13;
      function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
      /* 홍불(코로나 고리) — 활동이 클 때 */
      var promN = a > 0.55 ? 3 : (a > 0.3 ? 1 : 0);
      for (var f = 0; f < promN; f++) {
        var fa = -2.6 + f * 1.9 + rnd() * .5, hh = sr * (.18 + rnd() * .14);
        var p1 = { x: sx + Math.cos(fa - .09) * sr, y: sy + Math.sin(fa - .09) * sr }, p2 = { x: sx + Math.cos(fa + .09) * sr, y: sy + Math.sin(fa + .09) * sr };
        var pc = { x: sx + Math.cos(fa) * (sr + hh * 2), y: sy + Math.sin(fa) * (sr + hh * 2) };
        ctx.save(); ctx.shadowColor = "rgba(255,90,60,.9)"; ctx.shadowBlur = 10; ctx.strokeStyle = "rgba(255,120,80,.85)"; ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.quadraticCurveTo(pc.x, pc.y, p2.x, p2.y); ctx.stroke(); ctx.restore();
      }
      /* 원판: 가장자리 어두움 */
      var dg = ctx.createRadialGradient(sx - sr * .1, sy - sr * .1, sr * .05, sx, sy, sr);
      dg.addColorStop(0, "#fff4cf"); dg.addColorStop(.55, "#ffcf62"); dg.addColorStop(.85, "#f39a2c"); dg.addColorStop(1, "#b8510f");
      ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 6.2832); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 6.2832); ctx.clip();
      var GR = K.rng(77);
      for (var q = 0; q < 380; q++) { var ga = GR() * 6.2832, gd = Math.sqrt(GR()) * sr; ctx.fillStyle = GR() > .5 ? "rgba(255,255,230,.10)" : "rgba(150,60,0,.10)"; ctx.beginPath(); ctx.arc(sx + Math.cos(ga) * gd, sy + Math.sin(ga) * gd, 1.5 + GR() * 2.2, 0, 6.2832); ctx.fill(); }
      /* 흑점 무리: 주기 초반에는 고위도, 후반에는 적도 가까이(태양 자전을 따라 돈다) */
      var groups = Math.round(a * 9), latB = (28 - 20 * y / 11) * Math.PI / 180;
      for (var g2 = 0; g2 < groups; g2++) {
        var lon = rnd() * 6.2832, lat = (rnd() > .5 ? 1 : -1) * (latB + (rnd() - .5) * .14);
        for (var k = 0; k < 3; k++) {
          var lam = lon + rot + (k - 1) * .07 + (rnd() - .5) * .03, la = lat + (rnd() - .5) * .05, size = 2.6 + rnd() * 4.4;
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
      if (a > 0.85) K.glow(ctx, sx - sr * .25, sy - sr * .2, 3, "rgba(255,255,255,.95)", 6);
      K.pill(ctx, "흑점 수 " + n + "개", sx, sy + sr + 40, { s: 15, a: "center", c: KC.yellow, box: [RX, W] });
      K.pill(ctx, a >= 0.9 ? "극대기 · 플레어와 코로나 질량 방출이 잦다" : (a <= 0.06 ? "극소기 · 태양이 조용하다" : "극대기와 극소기의 중간"), sx, sy + sr + 68, { s: 11.5, a: "center", c: a >= 0.9 ? KC.red : (a <= 0.06 ? KC.green : KC.mute), box: [RX, W] });
      if (groups) K.pill(ctx, "검은 점 = 흑점 (둘레보다 어두움)", RX + RW - 14, 62, { s: 10.5, a: "right", c: KC.mute, box: [RX, W] });
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

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var t = times(), arrH = t.c / 3600;
      /* ── 위: 태양에서 지구까지 세 가지가 달려오는 모습 ── */
      var TH = 236, x0 = 96, x1 = 820, lanesY = [92, 142, 192];
      K.stage(ctx, 0, 0, W, TH, "space", { seed: 13, title: "태양 폭풍 추적 · 폭발 순간(0시간)부터" });
      K.pill(ctx, "폭발 후 " + (clock >= 72 ? "72" : clock.toFixed(1)) + "시간", W - 16, 28, { s: 12.5, a: "right", c: KC.ink });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, TH, 14); ctx.clip();
      K.sun(ctx, 30, 142, 30);
      ctx.restore();
      var lx = x1 - (L1_KM / AU_KM) * (x1 - x0) * 12;
      K.line(ctx, { x: lx, y: 64 }, { x: lx, y: 214 }, KC.green, 1.2, [4, 4], .7);
      ctx.fillStyle = "#c9d2de"; ctx.fillRect(lx - 3, 58, 6, 7);
      ctx.fillStyle = "#3a6fd8"; ctx.fillRect(lx - 14, 59, 9, 5); ctx.fillRect(lx + 5, 59, 9, 5);
      K.pill(ctx, "L1 감시 위성", lx - 18, 60, { s: 10.5, a: "right", c: KC.green });
      /* 지구와 자기권 */
      var ex = 860, ey = 142;
      ctx.strokeStyle = "rgba(127,211,255,.35)"; ctx.lineWidth = 1.4;
      [26, 38, 50].forEach(function (rr) { ctx.beginPath(); ctx.ellipse(ex + 6, ey, rr * .7, rr * 1.4, 0, Math.PI * .55, Math.PI * 1.45); ctx.stroke(); });
      var hitC = clamp((clock * 3600) / t.c, 0, 1) >= 1;
      if (hitC) { var au = ctx.createRadialGradient(ex, ey, 14, ex, ey, 34); au.addColorStop(0, "rgba(63,211,163,.55)"); au.addColorStop(1, "rgba(63,211,163,0)"); ctx.fillStyle = au; ctx.beginPath(); ctx.arc(ex, ey, 34, 0, 6.2832); ctx.fill(); }
      K.earth(ctx, ex, ey, 15);
      K.pill(ctx, "지구", ex, ey + 40, { s: 11, a: "center", c: KC.blue, box: [0, W] });
      K.warn(ctx, 14, TH - 12, "⚠ L1까지의 거리는 12배 과장, 크기는 실제 비율이 아님");
      var LN = [
        { n: "플레어의 X선·전파 · 빛과 같은 속력", t: t.x, c: KC.yellow, k: 0 },
        { n: "고에너지 입자 · 광속의 약 " + Math.round(PART_FRAC * 100) + "%로 보면", t: t.p, c: KC.violet, k: 1 },
        { n: "코로나 질량 방출 · " + vc.toLocaleString() + " km/s", t: t.c, c: KC.orange, k: 2 }
      ];
      LN.forEach(function (ln) {
        var ly = lanesY[ln.k], frac = clamp((clock * 3600) / ln.t, 0, 1), fx = x0 + frac * (x1 - x0);
        K.line(ctx, { x: x0, y: ly }, { x: x1, y: ly }, "rgba(200,210,255,.18)", 1, [2, 4]);
        if (ln.k === 0) {
          ctx.save(); ctx.shadowColor = KC.yellow; ctx.shadowBlur = 8; ctx.strokeStyle = KC.yellow; ctx.lineWidth = 2; ctx.beginPath();
          for (var xx = x0; xx <= fx; xx += 3) { var yy = ly + Math.sin((xx - x0) / 7) * 4; if (xx === x0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }
          ctx.stroke(); ctx.restore();
          K.glow(ctx, fx, ly, 3, "rgba(255,211,107,.95)", 4);
        } else if (ln.k === 1) {
          var PR = K.rng(8);
          for (var q = 0; q < 26; q++) { var u = PR(), qx = x0 + u * (fx - x0), qy = ly + (PR() - .5) * 14; ctx.globalAlpha = .35 + .6 * u; K.glow(ctx, qx, qy, 1.6, "rgba(182,156,255,.95)", 3); }
          ctx.globalAlpha = 1; K.glow(ctx, fx, ly, 3, "rgba(182,156,255,.95)", 4);
        } else {
          var tg = ctx.createLinearGradient(x0, 0, fx, 0); tg.addColorStop(0, "rgba(255,140,60,0)"); tg.addColorStop(1, "rgba(255,140,60,.35)");
          ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(x0, ly - 4); ctx.lineTo(fx, ly - 16); ctx.lineTo(fx, ly + 16); ctx.lineTo(x0, ly + 4); ctx.fill();
          var cg = ctx.createRadialGradient(fx, ly, 2, fx, ly, 22); cg.addColorStop(0, "rgba(255,235,200,.95)"); cg.addColorStop(.35, "rgba(255,150,70,.8)"); cg.addColorStop(1, "rgba(255,90,50,0)");
          ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(fx, ly, 16, 22, 0, 0, 6.2832); ctx.fill();
        }
        K.pill(ctx, ln.n, x0, ly - 14, { s: 11, c: ln.c });
        K.pill(ctx, (frac >= 1 ? "도착 ✓ " : "도착까지 ") + fmtTime(ln.t), x1 - 8, ly + 26, { s: 11, a: "right", c: ln.c });
      });

      /* ── 아래: 경보 시각표 ── */
      var BY = TH + 8, tx0 = 60, tx1 = 860, ty = 356;
      function TX(h) { return tx0 + clamp(h, 0, 72) / 72 * (tx1 - tx0); }
      K.stage(ctx, 0, BY, W, H - BY, "lab", { seed: 6, title: "경보 시각표 · 폭발 후 0~72시간" });
      K.pill(ctx, "L1 감시 위성이 벌어 주는 여유 " + fmtTime(t.l1), W - 16, BY + 28, { s: 11.5, a: "right", c: KC.green });
      var aA = clamp(arrH - 6, 0, 72), aB = clamp(arrH, 0, 72);
      var bandG = ctx.createLinearGradient(0, 310, 0, ty); bandG.addColorStop(0, "rgba(63,211,163,.12)"); bandG.addColorStop(1, "rgba(63,211,163,.42)");
      ctx.fillStyle = bandG; ctx.fillRect(TX(aA), 310, TX(aB) - TX(aA), ty - 310);
      K.pill(ctx, "보호 모드를 켜기 알맞은 6시간", TX(aA) - 6, 300, { s: 10.5, a: "right", c: KC.green, box: [0, W] });
      ctx.strokeStyle = KC.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tx0, ty); ctx.lineTo(tx1, ty); ctx.stroke();
      for (var gh = 0; gh <= 72; gh += 12) {
        var gx = TX(gh); ctx.beginPath(); ctx.moveTo(gx, ty); ctx.lineTo(gx, ty + 5); ctx.stroke();
        K.t(ctx, gh + "시간", gx, ty + 18, { s: 10.5, a: "center", c: KC.mute, w: "600" });
      }
      var cxp = TX(arrH);
      ctx.save(); ctx.shadowColor = KC.red; ctx.shadowBlur = 6; K.line(ctx, { x: cxp, y: 290 }, { x: cxp, y: ty + 6 }, KC.red, 2.2); ctx.restore();
      K.pill(ctx, "폭풍 도착 " + arrH.toFixed(1) + "시간", cxp + 6, 300, { s: 11, c: KC.red, box: [0, W] });
      if (clock < 72) { K.line(ctx, { x: TX(clock), y: 306 }, { x: TX(clock), y: ty }, "#ffffff", 1.5, null, .8); }
      var hxp = TX(hh), inB = (hh <= arrH && hh >= arrH - 6), hc = inB ? KC.green : KC.blue;
      ctx.fillStyle = hc; ctx.beginPath(); ctx.moveTo(hxp, ty - 1); ctx.lineTo(hxp - 7, ty - 14); ctx.lineTo(hxp + 7, ty - 14); ctx.closePath(); ctx.fill();
      K.pill(ctx, "보호 모드 " + hh + "시간", hxp, 336, { s: 11, a: "center", c: hc, box: [0, W] });
      var e = $("b-storm-read");
      if (e) e.innerHTML = "<span class='k'>X선</span><span class='v y'>" + fmtTime(t.x) + "</span>" +
        "<span class='k'>고에너지 입자</span><span class='v b'>" + fmtTime(t.p) + "</span>" +
        "<span class='k'>코로나 질량 방출</span><span class='v r'>" + arrH.toFixed(1) + "시간</span><span class='sub'>1 AU ÷ " + vc.toLocaleString() + " km/s</span>" +
        "<span class='ok " + (inB ? "g" : "r") + "'>" + (inB ? "보호 모드 " + hh + "시간 · 알맞은 시각" : (hh > arrH ? "보호 모드 " + hh + "시간 · 너무 늦습니다" : "보호 모드 " + hh + "시간 · 너무 이릅니다")) + "</span>";
    }
    canvas._redraw = draw;

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
        k++; clock = k / 60 * 72; draw();
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
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var E = energyJ(d), kt = E / KT;
      /* ── 왼쪽: 소행성 ── */
      var LW = 380, cx = 190, cy = 214, r = 8 + 100 * Math.sqrt(d / 1000);
      K.stage(ctx, 0, 0, LW, H, "space", { seed: 41, title: "다가오는 소행성" });
      K.pill(ctx, "점선 = 지름 25 m · 이보다 작으면 대부분 대기에서 부서짐", 16, 58, { s: 10.5, c: KC.green, box: [0, LW] });
      K.warn(ctx, 16, 86, "⚠ 그림 크기는 지름에 비례하지 않음(제곱근 눈금)");
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      var tr = ctx.createLinearGradient(cx + r * 2.6, cy - r * 2.2, cx, cy);
      tr.addColorStop(0, "rgba(255,160,80,0)"); tr.addColorStop(1, "rgba(255,170,90,.45)");
      ctx.fillStyle = tr; ctx.beginPath();
      ctx.moveTo(cx - r * .55, cy - r * .75); ctx.lineTo(cx + r * 2.8, cy - r * 2.4); ctx.lineTo(cx + r * .8, cy + r * .5); ctx.closePath(); ctx.fill();
      ctx.restore();
      rock(ctx, cx, cy, r, 5);
      ctx.strokeStyle = KC.green; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, 8 + 100 * Math.sqrt(25 / 1000), 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
      K.pill(ctx, "지름 " + d + " m · 질량 약 " + tonText(d), cx, H - 18, { s: 13, a: "center", c: KC.ink, box: [0, LW] });

      /* ── 오른쪽: 충돌 에너지 막대 ── */
      var RX = LW + 8, bx0 = RX + 66, bx1 = W - 16, by0 = 74, by1 = H - 34;
      K.stage(ctx, RX, 0, W - RX, H, "lab", { seed: 12, title: "충돌 에너지 (TNT 환산, 10배씩 커지는 눈금)" });
      function yp(k) { return by1 - clamp((log10(k) + 1) / 9, 0, 1) * (by1 - by0); }
      ctx.strokeStyle = KC.grid; ctx.lineWidth = 1;
      [[0.1, "0.1 kt"], [10, "10 kt"], [1000, "1 Mt"], [1e5, "100 Mt"], [1e7, "10 Gt"]].forEach(function (q) {
        var gy = yp(q[0]); ctx.beginPath(); ctx.moveTo(bx0, gy); ctx.lineTo(bx1, gy); ctx.stroke();
        K.t(ctx, q[1], bx0 - 8, gy + 4, { s: 10.5, a: "right", c: KC.mute, w: "600" });
      });
      ctx.strokeStyle = KC.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx0, by0); ctx.lineTo(bx0, by1); ctx.lineTo(bx1, by1); ctx.stroke();
      var cyv = yp(kt), big = kt >= 1e5, barX = bx0 + 34, barW = 110;
      var bg = ctx.createLinearGradient(0, by1, 0, cyv); bg.addColorStop(0, "rgba(255,179,92,.35)"); bg.addColorStop(1, big ? KC.red : KC.orange);
      ctx.save(); ctx.shadowColor = big ? KC.red : KC.orange; ctx.shadowBlur = 14;
      ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(barX, cyv, barW, by1 - cyv, [6, 6, 0, 0]); ctx.fill(); ctx.restore();
      K.glow(ctx, barX + barW / 2, cyv, 4, big ? "rgba(255,107,129,.95)" : "rgba(255,211,107,.95)", 4);
      MARK.forEach(function (m) {
        var my = yp(m.kt);
        K.line(ctx, { x: bx0, y: my }, { x: bx1, y: my }, KC.mute, 1, [5, 4], .8);
        K.pill(ctx, m.n + " " + fmtE(m.kt), bx1 - 4, my - 6, { s: 10.5, a: "right", c: KC.ink });
      });
      K.line(ctx, { x: bx0, y: yp(1e5) }, { x: bx1, y: yp(1e5) }, KC.red, 2);
      K.pill(ctx, "100 Mt · 도시 하나를 날릴 규모", bx1 - 4, yp(1e5) - 6, { s: 10.5, a: "right", c: KC.red });
      K.pill(ctx, fmtE(kt), barX + barW / 2, Math.max(cyv - 12, by0 + 4), { s: 15, a: "center", c: big ? KC.red : KC.yellow });
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
    function bez(p0, p1, p2, p3, k) {
      var m = 1 - k; return { x: m * m * m * p0.x + 3 * m * m * k * p1.x + 3 * m * k * k * p2.x + k * k * k * p3.x, y: m * m * m * p0.y + 3 * m * m * k * p1.y + 3 * m * k * k * p2.y + k * k * k * p3.y };
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var s = drift(t, dv), ok = s >= NEED && dv <= DV_MAX && dv > 0;
      var TH = 236, ex = 470, ey = 132, er = 44, SCALE = R_EARTH / er;
      K.stage(ctx, 0, 0, W, TH, "space", { seed: 23, title: "궤도 편향 계획 · 어긋난 거리 ≈ 3 × 속도 변화 × 남은 시간" });
      K.pill(ctx, "충돌 " + t + "년 전 · 속도 변화 " + dv + " mm/s", W - 16, 58, { s: 12, a: "right", c: KC.ink });
      if (dv > DV_MAX) K.pill(ctx, "⚠ 40 mm/s 초과 · 소행성이 부서질 위험", W - 16, 86, { s: 11.5, a: "right", c: KC.red });
      K.warn(ctx, W - 16, 28, "⚠ 가로 방향 거리는 줄여 그림", "right");
      K.earth(ctx, ex, ey, er);
      var hz = ctx.createRadialGradient(ex, ey, er, ex, ey, er + 10); hz.addColorStop(0, "rgba(127,211,255,.35)"); hz.addColorStop(1, "rgba(127,211,255,0)");
      ctx.fillStyle = hz; ctx.beginPath(); ctx.arc(ex, ey, er + 10, 0, 6.2832); ctx.fill();
      K.pill(ctx, "지구 (반지름 6,371 km)", ex, ey + er + 26, { s: 11, a: "center", c: KC.blue });
      /* 밀지 않았을 때 */
      K.line(ctx, { x: 60, y: ey }, { x: ex - er, y: ey }, KC.red, 2.2, [7, 5], .9);
      K.pill(ctx, "밀지 않았을 때 · 충돌", 190, ey + 26, { s: 11, a: "center", c: KC.red });
      /* 밀었을 때 */
      var offPx = Math.min(330, s / SCALE), clipped = (s / SCALE) > 330, ny = Math.max(76, ey - offPx);
      var col = ok ? KC.green : KC.orange;
      var P0 = { x: 60, y: ey }, P1 = { x: 240, y: ey }, P2 = { x: 300, y: ny }, P3 = { x: ex + 120, y: ny };
      ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 8; ctx.strokeStyle = col; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(P0.x, P0.y); ctx.bezierCurveTo(P1.x, P1.y, P2.x, P2.y, P3.x, P3.y); ctx.stroke(); ctx.restore();
      if (offPx > 14) {
        ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(ex + 70, ey); ctx.lineTo(ex + 70, ny); ctx.stroke(); ctx.setLineDash([]);
      }
      /* 충돌체가 민 자리 */
      K.glow(ctx, 60, ey, 4, "rgba(255,236,190,.95)", 4.5);
      if (dv > 0) K.arrow(ctx, { x: 60, y: ey + 30 }, { x: 60, y: ey + 6 }, KC.yellow, 2);
      K.pill(ctx, "충돌체로 밀기", 24, ey + 50, { s: 11, c: KC.yellow });
      K.pill(ctx, "밀었을 때 · " + Math.round(s).toLocaleString() + " km 어긋남" + (clipped ? " (화면 밖)" : ""), 62, ny - 12, { s: 11.5, c: col });
      /* 소행성 */
      var ap = bez(P0, P1, P2, P3, u);
      rock(ctx, ap.x, ap.y, 7, 5);

      /* ── 아래: 필요량과 비교 ── */
      var BY = TH + 8, bx0 = 70, bx1 = 830, by = 330;
      K.stage(ctx, 0, BY, W, H - BY, "lab", { seed: 2, title: "어긋난 거리 (km, 10배씩 커지는 눈금)" });
      function xpos(km) { return bx0 + clamp((log10(Math.max(km, 10)) - 1) / 5, 0, 1) * (bx1 - bx0); }
      ctx.strokeStyle = KC.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx0, by); ctx.lineTo(bx1, by); ctx.stroke();
      [10, 100, 1000, 10000, 100000, 1000000].forEach(function (g) {
        var gx = xpos(g); ctx.beginPath(); ctx.moveTo(gx, by); ctx.lineTo(gx, by + 5); ctx.stroke();
        K.t(ctx, g >= 10000 ? (g / 10000) + "만" : g.toLocaleString(), gx, by + 18, { s: 10.5, a: "center", c: KC.mute, w: "600" });
      });
      var sxp = xpos(s), bc = s >= NEED ? KC.green : KC.red;
      var bg = ctx.createLinearGradient(bx0, 0, Math.max(bx0 + 2, sxp), 0); bg.addColorStop(0, "rgba(255,255,255,.08)"); bg.addColorStop(1, bc);
      ctx.save(); ctx.shadowColor = bc; ctx.shadowBlur = 10; ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(bx0, by - 24, Math.max(3, sxp - bx0), 18, 6); ctx.fill(); ctx.restore();
      var nx = xpos(NEED);
      K.line(ctx, { x: nx, y: by - 52 }, { x: nx, y: by + 6 }, KC.yellow, 2, [5, 4]);
      K.pill(ctx, "필요 12,000 km", nx + 6, by - 38, { s: 11, c: KC.yellow, box: [0, W] });
      K.pill(ctx, Math.round(s).toLocaleString() + " km", Math.min(sxp + 8, 770), by - 9, { s: 11.5, c: bc });
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
