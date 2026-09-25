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
function log10(x) { return Math.log(x) / Math.LN10; }   /* 구형 기기에는 Math.log10 이 없다 */
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
        { t: "🛰️ 뉴허라이즌스 — 명왕성 곁을 빠르게 지나가며 하트 모양 얼음 평원을 찍었다", a: "fly", why: "속력이 너무 빨라 궤도에 붙잡히지 못하고 스쳐 지나갔습니다." },
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
    function dist(i) { return 30000 * Math.pow(10, 6 * i / 400); }   // 3만 km ~ 300억 km, 로그 눈금

    function draw() {
      paper(ctx, W, H);
      var d = dist(idx), one = d / C_KMS;
      text(ctx, "전파 신호 지연 시간 계산기 — 전파는 빛과 같은 속력 " + Math.round(C_KMS).toLocaleString() + " km/s 로 달립니다", 40, 28, { s: 13, w: "800" });

      /* 왼쪽 : 대표 천체 표 */
      text(ctx, "목표", 46, 60, { s: 11, w: "800", c: v("--mist") });
      text(ctx, "거리", 350, 60, { s: 11, w: "800", c: v("--mist"), a: "right" });
      text(ctx, "편도 지연", 520, 60, { s: 11, w: "800", c: v("--mist"), a: "right" });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(40, 68); ctx.lineTo(520, 68); ctx.stroke();
      REF.forEach(function (r, k) {
        var yy = 90 + k * 25;
        var near = Math.abs(Math.log(r.d / d)) < 0.12;
        if (near) { ctx.fillStyle = v("--brand-100"); ctx.fillRect(40, yy - 15, 480, 22); }
        text(ctx, r.n, 46, yy, { s: 12, w: near ? "800" : "500", c: near ? v("--brand-700") : v("--ink") });
        text(ctx, fmtKm(r.d), 350, yy, { s: 12, a: "right", c: v("--mist") });
        text(ctx, fmtTime(r.d / C_KMS), 520, yy, { s: 12, w: "800", a: "right", c: near ? v("--brand-700") : v("--ink") });
      });

      /* 오른쪽 : 현재 값 */
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(570, 52, 300, 190, 16); ctx.fill();
      text(ctx, "지금 고른 거리", 720, 78, { s: 11.5, c: v("--mist"), a: "center" });
      text(ctx, fmtKm(d), 720, 106, { s: 20, w: "900", a: "center", c: v("--ink") });
      text(ctx, fmtAU(d), 720, 128, { s: 12.5, a: "center", c: v("--mist") });
      text(ctx, "편도 지연", 600, 162, { s: 12, c: v("--mist") });
      text(ctx, fmtTime(one), 860, 162, { s: 15, w: "900", a: "right", c: v("--teal-700") });
      text(ctx, "왕복 (명령 → 응답)", 600, 196, { s: 12, c: v("--mist") });
      text(ctx, fmtTime(one * 2), 860, 196, { s: 17, w: "900", a: "right", c: v("--coral-700") });
      text(ctx, one < 2 ? "실시간 조종이 가능한 수준" : (one < 300 ? "실시간 조종은 불편, 계획 명령이 필요" : "실시간 조종 불가능, 자율 기능이 필수"),
        720, 226, { s: 11.5, a: "center", c: v("--mist") });

      /* 아래 : 로그 눈금 자 */
      var rx0 = 50, rx1 = 850, ry = 290;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(rx0, ry); ctx.lineTo(rx1, ry); ctx.stroke();
      REF.forEach(function (r) {
        var t = log10(r.d / 30000) / 6;
        if (t < 0 || t > 1) return;
        var x = rx0 + t * (rx1 - rx0);
        ctx.strokeStyle = v("--mist"); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x, ry - 6); ctx.lineTo(x, ry + 6); ctx.stroke();
      });
      var mx = rx0 + (idx / 400) * (rx1 - rx0);
      ctx.fillStyle = v("--brand");
      ctx.beginPath(); ctx.arc(mx, ry, 8, 0, Math.PI * 2); ctx.fill();
      text(ctx, "가까움", rx0, ry + 26, { s: 11, c: v("--mist") });
      text(ctx, "멂 (로그 눈금)", rx1, ry + 26, { s: 11, c: v("--mist"), a: "right" });
    }
    canvas._redraw = draw;

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
      $("a-delay-info").innerHTML = "거리 <b>" + fmtKm(d) + "</b> (" + fmtAU(d) + ") 에서는 편도 지연이 <b>" + fmtTime(one) + "</b>, 왕복은 <b>" + fmtTime(one * 2) + "</b> 입니다. " +
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

    function draw() {
      paper(ctx, W, H);
      var r = run();
      text(ctx, "화성 예제로 분화구 — 로버에서 삼각주 바위까지 900 m", 40, 28, { s: 13, w: "800" });

      /* 지형 */
      var x0 = 55, x1 = 845, gy = 120;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke();
      ctx.fillStyle = v("--coral-100");
      ROCK.forEach(function (m) {
        var xx = x0 + m / GOAL * (x1 - x0);
        ctx.beginPath(); ctx.arc(xx, gy - 5, 5, 0, Math.PI * 2); ctx.fill();
      });
      /* 지구에서 확인할 수 있는 범위 */
      var sx = x0 + Math.min(SAFE, GOAL) / GOAL * (x1 - x0);
      ctx.fillStyle = v("--teal-100"); ctx.globalAlpha = .6; ctx.fillRect(x0, gy - 32, sx - x0, 30); ctx.globalAlpha = 1;
      text(ctx, "지구에서 사진으로 확인 가능한 25 m", x0 + 4, gy - 40, { s: 10.5, w: "800", c: v("--teal-700") });
      /* 목표 */
      text(ctx, "🪨", x1 + 28, gy - 12, { s: 20, a: "center" });   /* 로버가 닿아도 바위가 가려지지 않게 살짝 옆에 */
      text(ctx, "삼각주 바위 900 m", x1, gy + 22, { s: 11, w: "800", a: "right", c: v("--ink") });
      /* 로버 */
      var rx = x0 + r.pos / GOAL * (x1 - x0);
      text(ctx, "🤖", rx, gy - 10, { s: 20, a: "center" });
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x0, gy + 8); ctx.lineTo(rx, gy + 8); ctx.stroke();
      text(ctx, Math.round(r.pos) + " m", x0 + 4, gy + 40, { s: 12, w: "800", c: v("--brand-700") });

      /* 30솔 진행 그래프 */
      var gx0 = 55, gx1 = 845, gy0 = 175, gy1 = 305;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx0, gy1); ctx.lineTo(gx1, gy1); ctx.stroke();
      ctx.strokeStyle = v("--amber"); ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "목표 900 m", gx1 - 4, gy0 - 8, { s: 11, w: "800", a: "right", c: v("--amber-700") });
      for (var s2 = 0; s2 <= SOLS; s2 += 10) {
        var tx = gx0 + s2 / SOLS * (gx1 - gx0);
        text(ctx, s2 + "솔", tx, gy1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      }
      ctx.fillStyle = v(r.pos >= GOAL ? "--teal" : (r.crash ? "--rose" : "--brand"));
      for (var i = 1; i < r.path.length; i++) {
        var bx = gx0 + (i - 0.9) / SOLS * (gx1 - gx0), bw = Math.max(3, (gx1 - gx0) / SOLS * 0.75);
        var bh = clamp(r.path[i] / GOAL, 0, 1) * (gy1 - gy0);
        ctx.fillRect(bx, gy1 - bh, bw, bh);
      }
      text(ctx, "솔마다 쌓인 이동 거리", gx0 + 6, gy0 + 16, { s: 11.5, w: "800", c: v("--mist") });
      text(ctx, auto ? "🤖 자율 항법 켜짐 — 하루 " + Math.round(r.per) + " m" : "🕹️ 자율 항법 꺼짐 — 하루 " + Math.round(r.per) + " m",
        gx1 - 4, gy0 + 16, { s: 12, w: "800", a: "right", c: auto ? v("--teal-700") : v("--mist") });
      return r;
    }
    canvas._redraw = draw;

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
        : "사실은 ㉡과 ㉢이 <b>둘 다</b> 정답입니다. 명령은 11분 동안 허공을 달리고, 그 사이 로버를 지키는 것은 오직 로버 자신의 판단뿐입니다. 그래서 자율 항법이 필요합니다.") +
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

    function draw() {
      paper(ctx, W, H);
      var a = act(y), n = spots(y);
      text(ctx, "태양 관측 기록 — 흑점 수와 태양 활동 주기(약 11년)", 40, 28, { s: 13, w: "800" });

      /* 왼쪽 : 흑점 수 곡선 */
      var x0 = 70, x1 = 470, y0 = 60, y1 = 285;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      [0, 50, 100, 150].forEach(function (g) {
        var gy = y1 - g / 170 * (y1 - y0);
        text(ctx, String(g), x0 - 8, gy + 4, { s: 10.5, c: v("--mist"), a: "right" });
        ctx.strokeStyle = v("--line"); ctx.globalAlpha = .5;
        ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke(); ctx.globalAlpha = 1;
      });
      ctx.strokeStyle = v("--coral"); ctx.lineWidth = 2.5; ctx.beginPath();
      for (var p = 0; p <= 220; p++) {
        var yy = p / 220 * 11;
        var xx = x0 + p / 220 * (x1 - x0), yv = y1 - spots(yy) / 170 * (y1 - y0);
        if (p === 0) ctx.moveTo(xx, yv); else ctx.lineTo(xx, yv);
      }
      ctx.stroke();
      var cx = x0 + y / 11 * (x1 - x0), cy = y1 - n / 170 * (y1 - y0);
      ctx.fillStyle = v("--brand"); ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
      text(ctx, "흑점 수", x0 - 8, y0 - 12, { s: 11, w: "800", c: v("--mist"), a: "right" });
      text(ctx, "주기 진행 " + y.toFixed(1) + "년", (x0 + x1) / 2, y1 + 22, { s: 11.5, w: "800", a: "center", c: v("--mist") });
      text(ctx, "0년", x0, y1 + 40, { s: 10.5, c: v("--mist"), a: "center" });
      text(ctx, "11년", x1, y1 + 40, { s: 10.5, c: v("--mist"), a: "center" });

      /* 오른쪽 : 태양 원판 */
      var sx = 665, sy = 165, sr = 92;
      ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
      var seed = Math.round(y * 2) * 7919 + 13;
      function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
      var groups = Math.round(a * 9);
      for (var g2 = 0; g2 < groups; g2++) {
        var ang = rnd() * Math.PI * 2, rr = rnd() * sr * 0.72;
        var bx = sx + Math.cos(ang) * rr, by = sy + Math.sin(ang) * rr * 0.75;
        for (var k = 0; k < 3; k++) {
          ctx.fillStyle = v("--abyss");
          ctx.beginPath(); ctx.arc(bx + (rnd() - 0.5) * 22, by + (rnd() - 0.5) * 14, 2.5 + rnd() * 4, 0, Math.PI * 2); ctx.fill();
        }
      }
      if (a > 0.55) {
        ctx.strokeStyle = v("--rose"); ctx.lineWidth = 3; ctx.globalAlpha = .8;
        for (var f = 0; f < 3; f++) {
          var fa = rnd() * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(sx + Math.cos(fa) * sr, sy + Math.sin(fa) * sr);
          ctx.lineTo(sx + Math.cos(fa) * (sr + 26), sy + Math.sin(fa) * (sr + 26));
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      text(ctx, "흑점 수 " + n + "개", sx, sy + sr + 40, { s: 16, w: "900", a: "center", c: v("--ink") });
      text(ctx, a >= 0.9 ? "극대기 — 플레어와 코로나 질량 방출이 잦다" : (a <= 0.06 ? "극소기 — 태양이 조용하다" : "극대기와 극소기의 중간"),
        sx, sy + sr + 62, { s: 11.5, a: "center", c: v("--mist") });
    }
    canvas._redraw = draw;

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
      paper(ctx, W, H);
      var t = times(), arrH = t.c / 3600;
      text(ctx, "태양 폭풍 추적 화면 — 폭발 순간(0시간)부터", 40, 28, { s: 13, w: "800" });

      var x0 = 90, x1 = 790;
      text(ctx, "☀️", 50, 62, { s: 24, a: "center" });
      text(ctx, "태양", 50, 88, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, "🌍", 830, 62, { s: 22, a: "center" });
      text(ctx, "지구", 830, 88, { s: 10.5, a: "center", c: v("--mist") });
      var lx = x1 - (L1_KM / AU_KM) * (x1 - x0) * 12;    // L1 은 보기 좋게 과장해 표시
      ctx.strokeStyle = v("--teal"); ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(lx, 46); ctx.lineTo(lx, 250); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "L1 감시 위성", lx, 40, { s: 10.5, w: "800", a: "center", c: v("--teal-700") });

      var lanes = [
        { n: "플레어의 X선·전파", t: t.x, c: "--amber", d: "빛과 같은 속력" },
        { n: "고에너지 입자", t: t.p, c: "--violet", d: "광속의 약 " + Math.round(PART_FRAC * 100) + "%로 보면" },
        { n: "코로나 질량 방출", t: t.c, c: "--coral", d: vc.toLocaleString() + " km/s" }
      ];
      lanes.forEach(function (ln, k) {
        var ly = 115 + k * 58;
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x0, ly); ctx.lineTo(x1, ly); ctx.stroke();
        text(ctx, ln.n, x0, ly - 22, { s: 12, w: "800", c: v(ln.c) });
        text(ctx, ln.d, x0 + 150, ly - 22, { s: 10.5, c: v("--mist") });
        text(ctx, "도착 " + fmtTime(ln.t), x1 + 4, ly - 22, { s: 12, w: "800", a: "right", c: v(ln.c) });
        var frac = clamp((clock * 3600) / ln.t, 0, 1);
        ctx.strokeStyle = v(ln.c); ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x0, ly); ctx.lineTo(x0 + frac * (x1 - x0), ly); ctx.stroke();
        ctx.fillStyle = v(ln.c);
        ctx.beginPath(); ctx.arc(x0 + frac * (x1 - x0), ly, 6, 0, Math.PI * 2); ctx.fill();
        if (frac >= 1) text(ctx, "도착", x1 + 4, ly + 16, { s: 10.5, w: "800", a: "right", c: v(ln.c) });
      });

      /* 시간 축 0~72시간 */
      var tx0 = 90, tx1 = 790, ty = 300;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(tx0, ty); ctx.lineTo(tx1, ty); ctx.stroke();
      for (var g = 0; g <= 72; g += 12) {
        var gx = tx0 + g / 72 * (tx1 - tx0);
        ctx.strokeStyle = v("--line"); ctx.beginPath(); ctx.moveTo(gx, ty); ctx.lineTo(gx, ty + 6); ctx.stroke();
        text(ctx, g + "h", gx, ty + 22, { s: 10.5, c: v("--mist"), a: "center" });
      }
      /* 안전한 경보 구간 */
      var aA = clamp(arrH - 6, 0, 72), aB = clamp(arrH, 0, 72);
      ctx.fillStyle = v("--teal-100");
      ctx.fillRect(tx0 + aA / 72 * (tx1 - tx0), ty - 24, (aB - aA) / 72 * (tx1 - tx0), 24);
      text(ctx, "보호 모드를 켜기 알맞은 구간", tx0 + (aA + aB) / 2 / 72 * (tx1 - tx0), ty - 30, { s: 10.5, w: "800", a: "center", c: v("--teal-700") });
      /* CME 도착 */
      var cxp = tx0 + clamp(arrH, 0, 72) / 72 * (tx1 - tx0);
      ctx.strokeStyle = v("--coral"); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cxp, ty - 30); ctx.lineTo(cxp, ty + 8); ctx.stroke();
      text(ctx, "폭풍 도착 " + arrH.toFixed(1) + "h", Math.min(cxp + 6, 780), ty + 40, { s: 11, w: "800", c: v("--coral-700") });
      /* 내가 고른 시각 */
      var hxp = tx0 + hh / 72 * (tx1 - tx0);
      ctx.fillStyle = v("--brand");
      ctx.beginPath(); ctx.moveTo(hxp, ty - 2); ctx.lineTo(hxp - 7, ty - 16); ctx.lineTo(hxp + 7, ty - 16); ctx.closePath(); ctx.fill();
      text(ctx, "보호 모드 " + hh + "h", Math.max(hxp - 6, 96), ty + 58, { s: 11, w: "800", a: "right", c: v("--brand-700") });
      text(ctx, "L1 감시 위성이 벌어 주는 여유 시간 " + fmtTime(t.l1), 860, 372, { s: 11.5, w: "800", a: "right", c: v("--teal-700") });
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
      (function step() {                                   // rAF 는 가려진 탭에서 멈추므로 setTimeout 을 쓴다
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
      { id: "c", label: "코로나 질량 방출", sub: "1 ~ 3일 · 지자기 폭풍" },
      { id: "w", label: "태양풍 강화", sub: "이어지는 입자의 흐름" }
    ],
    items: [
      { t: "X선이 급증해 대낮 쪽 전리층이 교란되어 단파 무선 통신이 갑자기 두절되는 델린저 현상이 나타났다", a: "x", why: "X선은 빛과 같은 속력으로 와서 낮 반구의 전리층을 순식간에 교란합니다.", hint: "‘갑자기’, 그리고 ‘대낮 쪽에서만’ 일어났다는 점을 보세요." },
      { t: "관측 위성의 X선 검출기가 폭발 8분 20초 만에 눈금 꼭대기까지 튀어 올라 한동안 아무것도 구분하지 못했다", a: "x", why: "8분 20초는 1 AU를 빛의 속력으로 건너오는 시간입니다." },
      { t: "고에너지 입자가 인공위성의 전자 장비를 손상시키고 GPS 신호를 교란해, 내비게이션의 위치 오차가 커지고 위성 고장 위험이 높아졌다", a: "p", why: "빠른 입자가 반도체를 직접 때려 기억 장치의 값을 뒤집기도 합니다." },
      { t: "극지방 항로를 날던 여객기 승무원의 피폭량이 평소의 몇 배로 올라가, 항공사가 항로를 낮은 위도로 돌렸다", a: "p", why: "고에너지 양성자는 자기력선이 열려 있는 극지방으로 쏟아져 들어옵니다.", hint: "지구 자기장이 막아 주지 못하는 곳이 어디일까요?" },
      { t: "고에너지 양성자가 극지방 상공의 전리층을 때려, 극지방을 지나는 단파 통신이 며칠 동안 끊겼다", a: "p", why: "극관 흡수라고 부르는 현상으로, 입자가 계속 쏟아지는 동안 이어집니다." },
      { t: "많은 양의 플라스마가 지구 자기장을 강하게 흔들어 지자기 폭풍을 일으키고, 송전망에 유도 전류가 흘러 대규모 정전 사고로 이어졌다", a: "c", why: "1989년 퀘벡 정전이 바로 이것입니다. 변압기에 흐른 유도 전류가 원인이었습니다." },
      { t: "지자기 폭풍으로 고층 대기가 부풀어 올라, 낮은 궤도를 돌던 인공위성들이 공기 저항을 받아 고도가 조금씩 낮아졌다", a: "c", why: "대기가 부풀면 위성이 받는 저항이 커집니다. 궤도 수명이 줄어듭니다.", hint: "하루 넘게 걸려 도착한 플라스마 덩어리가 자기권 전체를 흔든 결과입니다." },
      { t: "평소보다 강한 태양풍 입자가 지구 자기장을 따라 극지방으로 흘러들며, 오로라가 관측되는 지역이 평소보다 낮은 위도까지 넓어졌다", a: "w", why: "오로라는 태양에서 온 입자가 고층 대기의 기체와 부딪쳐 내는 빛입니다." }
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
    var K = 0.5 * RHO * (Math.PI / 6) * V * V;      // E = K · d³
    var d = 60, got = window.sthState("c2") || { a: false, b: false };
    var MARK = [
      { n: "히로시마 원자 폭탄", kt: 15 },
      { n: "2013 첼랴빈스크", kt: 500 },
      { n: "1908 퉁구스카(추정)", kt: 10000 }
    ];
    function energyJ(dd) { return K * dd * dd * dd; }
    function fmtE(kt) {
      if (kt < 1000) return kt.toFixed(0) + " kt";
      if (kt < 1e6) return (kt / 1000).toFixed(kt < 1e4 ? 1 : 0) + " Mt";
      return (kt / 1e6).toFixed(1) + " Gt";
    }

    function draw() {
      paper(ctx, W, H);
      var E = energyJ(d), kt = E / KT;
      text(ctx, "충돌 에너지 계산 — 밀도 3,000 kg/m³, 충돌 속도 19 km/s 로 고정", 40, 28, { s: 13, w: "800" });

      /* 왼쪽 : 크기 비교 */
      text(ctx, "점선 = 지름 25 m. 이보다 작으면 대부분 대기에서 부서진다", 40, 56, { s: 10.5, w: "800", c: v("--teal-700") });
      var cx = 175, cy = 185, r = 8 + 100 * Math.sqrt(d / 1000);
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = v("--abyss"); ctx.globalAlpha = .25;
      ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.25, r * 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + r * 0.35, cy + r * 0.3, r * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      /* 25 m 기준 원 */
      var r25 = 8 + 100 * Math.sqrt(25 / 1000);
      ctx.strokeStyle = v("--teal"); ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, r25, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "지름 " + d + " m", cx, 312, { s: 16, w: "900", a: "center" });
      var ton = RHO * (Math.PI / 6) * d * d * d / 1000;
      var tonTxt = ton < 1e4 ? Math.round(ton).toLocaleString() + " 톤"
        : (ton < 1e8 ? (ton / 1e4 < 100 ? (ton / 1e4).toFixed(1) : Math.round(ton / 1e4).toLocaleString()) + "만 톤"
          : (ton / 1e8).toFixed(1) + "억 톤");
      text(ctx, "질량 약 " + tonTxt, cx, 331, { s: 11.5, a: "center", c: v("--mist") });

      /* 오른쪽 : 로그 눈금 에너지 막대 */
      var bx0 = 380, bx1 = 830, by0 = 90, by1 = 285;
      function ypos(k) { return by1 - clamp((log10(k) + 1) / 9, 0, 1) * (by1 - by0); }   // 0.1 kt ~ 1e8 kt
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(bx0, by0); ctx.lineTo(bx0, by1); ctx.lineTo(bx1, by1); ctx.stroke();
      MARK.forEach(function (m) {
        var my = ypos(m.kt);
        ctx.strokeStyle = v("--mist"); ctx.globalAlpha = .7; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(bx0, my); ctx.lineTo(bx1, my); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
        text(ctx, m.n + " " + fmtE(m.kt), bx1 - 4, my - 6, { s: 10.5, w: "800", a: "right", c: v("--mist") });
      });
      var cyv = ypos(kt);
      ctx.fillStyle = v(kt >= 1e5 ? "--rose" : "--amber");
      ctx.fillRect(bx0 + 40, cyv, 120, by1 - cyv);
      text(ctx, fmtE(kt), bx0 + 100, cyv - 10, { s: 17, w: "900", a: "center", c: v(kt >= 1e5 ? "--rose-700" : "--amber-700") });
      text(ctx, "충돌 에너지 (TNT 환산, 로그 눈금)", bx0, by0 - 20, { s: 11.5, w: "800", c: v("--mist") });
      text(ctx, "100 Mt", bx0 + 170, ypos(1e5) + 14, { s: 10.5, w: "800", c: v("--rose-700") });
      ctx.strokeStyle = v("--rose"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx0, ypos(1e5)); ctx.lineTo(bx1, ypos(1e5)); ctx.stroke();
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
      $("c-energy-info").innerHTML = "지름 <b>" + d + " m</b> 인 암석질 소행성이 초속 19 km로 부딪치면 충돌 에너지는 <b>" + fmtE(kt) + "</b> (TNT 환산) 입니다. " +
        (d <= 25 ? "이 정도 크기는 대부분 대기를 뚫지 못하고 <b>공중에서 터집니다.</b> 크레이터는 남지 않지만, 2013년 첼랴빈스크처럼 충격파만으로도 큰 피해가 납니다."
          : (kt < 1e5 ? "대기를 뚫고 지표에 닿아 크레이터를 만들 수 있는 크기입니다. 떨어지는 곳이 도시라면 재난이 됩니다."
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

    function draw() {
      paper(ctx, W, H);
      var s = drift(t, dv);
      text(ctx, "궤도 편향 계획 — 어긋난 거리 ≈ 3 × 속도 변화 × 남은 시간", 40, 28, { s: 13, w: "800" });

      /* 위 : 지구와 소행성 경로 */
      var ex = 430, ey = 140, er = 44;                         // 지구 반지름 6,371 km → 44 px
      var SCALE = R_EARTH / er;                                // km per px
      ctx.fillStyle = v("--brand"); ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill();
      text(ctx, "🌍", ex, ey + 9, { s: 26, a: "center" });
      text(ctx, "지구 (반지름 6,371 km)", ex, ey + er + 20, { s: 10.5, a: "center", c: v("--mist") });

      /* 밀지 않았을 때의 경로 : 지구 정면 */
      ctx.strokeStyle = v("--rose"); ctx.lineWidth = 2.5; ctx.setLineDash([7, 5]);
      ctx.beginPath(); ctx.moveTo(60, ey); ctx.lineTo(ex - er, ey); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "밀지 않았을 때 — 충돌", 62, ey + 18, { s: 11, w: "800", c: v("--rose-700") });

      /* 밀었을 때 */
      var offPx = Math.min(330, s / SCALE);
      var clipped = (s / SCALE) > 330;
      var ny = ey - offPx;
      if (ny < 64) ny = 64;
      ctx.strokeStyle = v(s >= NEED && dv <= DV_MAX && dv > 0 ? "--teal" : "--amber"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(60, ey);
      ctx.bezierCurveTo(240, ey, 300, ny, ex + 120, ny); ctx.stroke();
      ctx.fillStyle = v(s >= NEED && dv <= DV_MAX && dv > 0 ? "--teal" : "--amber");
      text(ctx, "☄️", ex + 130, ny + 6, { s: 18 });
      text(ctx, "밀었을 때 — " + Math.round(s).toLocaleString() + " km 어긋남" + (clipped ? " (화면 밖)" : ""),
        62, ny - 12, { s: 11.5, w: "800", c: v(s >= NEED && dv <= DV_MAX && dv > 0 ? "--teal-700" : "--amber-700") });

      /* 아래 : 필요량과 비교 막대 (로그 눈금) */
      var bx0 = 70, bx1 = 830, by = 270;
      function xpos(km) { return bx0 + clamp((log10(Math.max(km, 10)) - 1) / 5, 0, 1) * (bx1 - bx0); }   // 10 km ~ 1,000,000 km
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx0, by); ctx.lineTo(bx1, by); ctx.stroke();
      [10, 100, 1000, 10000, 100000, 1000000].forEach(function (g) {
        var gx = xpos(g);
        ctx.strokeStyle = v("--line"); ctx.beginPath(); ctx.moveTo(gx, by); ctx.lineTo(gx, by + 6); ctx.stroke();
        text(ctx, g >= 10000 ? (g / 10000) + "만" : g.toLocaleString(), gx, by + 22, { s: 10, c: v("--mist"), a: "center" });
      });
      text(ctx, "어긋난 거리 (km, 로그 눈금)", bx0, by + 46, { s: 11, c: v("--mist") });
      var nx = xpos(NEED);
      ctx.strokeStyle = v("--amber"); ctx.lineWidth = 2.5; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(nx, by - 52); ctx.lineTo(nx, by + 6); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "필요 12,000 km", nx + 6, by - 40, { s: 11, w: "800", c: v("--amber-700") });
      var sxp = xpos(s);
      ctx.fillStyle = v(s >= NEED ? "--teal" : "--rose");
      ctx.fillRect(bx0, by - 22, Math.max(2, sxp - bx0), 18);
      text(ctx, Math.round(s).toLocaleString() + " km", Math.min(sxp + 6, 760), by - 8, { s: 11.5, w: "800", c: v(s >= NEED ? "--teal-700" : "--rose-700") });
      text(ctx, "충돌 " + t + "년 전 · 속도 변화 " + dv + " mm/s", 860, 60, { s: 12, w: "800", a: "right", c: v("--ink") });
      if (dv > DV_MAX) text(ctx, "⚠️ 40 mm/s 초과 — 소행성이 부서질 위험", 860, 82, { s: 11.5, w: "800", a: "right", c: v("--rose-700") });
    }
    canvas._redraw = draw;

    function update() {
      var s = drift(t, dv);
      $("c-t-val").textContent = t + "년 전";
      $("c-dv-val").textContent = dv + " mm/s";
      var okS = s >= NEED, okV = (dv > 0 && dv <= DV_MAX);
      $("c-dart-info").innerHTML =
        "충돌 <b>" + t + "년 전</b>에 <b>" + dv + " mm/s</b>(시속 약 " + (dv * 3.6).toFixed(1) + " m)만큼 밀어 주면, 소행성은 남은 " + t + "년 동안 조금씩 어긋나 충돌 시점에 <b>" + Math.round(s).toLocaleString() + " km</b> 떨어진 곳을 지나갑니다.<br>" +
        (okS && okV ? "✅ <b>작전 성공.</b> 지구 반지름(6,371 km)의 두 배 가까이 비껴갑니다. 필요한 속도 변화는 걸어가는 속력의 <b>수만 분의 1</b>에 지나지 않습니다."
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
      ? "완료 · 충돌 " + best.t + "년 전 " + best.dv + " mm/s 로 밀어 " + best.s.toLocaleString() + " km 빗나감"
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
    { key: "r3", label: "③ 빗나가게 하라" }
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
    { key: "r3", label: "③ 빗나가게 하라" }
  ],
  line: { id: "all", label: "세 기록을 꿰는 한 문장" }
});

})();
