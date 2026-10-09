/* 행성우주과학 Ⅰ-2 태양계 천체와 외계 행성 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 케플러 제3법칙으로 질량 재기 */
  {
    id: "c1", tag: "조화 법칙 · 중력", title: "이오로 목성의 무게 달기", short: "목성 질량",
    who: "🪐", name: "갈릴레이 위성 관측반",
    say: "“목성의 위성 <b>이오</b>는 목성 중심에서 <b>42만 2천 km</b> 떨어져 <b>1.77일</b>마다 한 바퀴 돌아요. 달은 지구에서 38만 4천 km 떨어져 27.3일에 한 바퀴 돌고요. 이 두 자료만으로 목성이 지구의 몇 배 무거운지 알아낼 수 있을까요?”",
    predict: {
      q: "같은 거리에서 위성이 더 빨리(짧은 주기로) 돈다면, 중심 천체의 질량은?",
      options: ["㉠ 더 크다 — 더 센 중력이 위성을 붙잡아야 하므로", "㉡ 더 작다", "㉢ 공전 주기와 질량은 관계없다"],
      answer: 0
    },
    task: "목성의 질량을 조절해 <b>이오의 계산 주기가 관측 주기(1.77일)</b>와 같아지게 하세요(± 1%).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(300), ctx = cv.ctx, W = cv.W;
      var M = 100, A_IO = 4.22e5, A_MOON = 3.844e5, T_MOON = 27.32, T_OBS = 1.769, ang = 0;
      var run = api.ticker();
      function tIo(m) { return T_MOON * Math.pow(A_IO / A_MOON, 1.5) / Math.sqrt(m); }
      var TRUE_M = Math.pow(T_MOON * Math.pow(A_IO / A_MOON, 1.5) / T_OBS, 2);
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "T² ∝ a³ ÷ M — 같은 법칙으로 달과 이오를 비교", 40, 26, { s: 13.5, w: "900" });
        [[180, "지구와 달", "--brand", T_MOON, 60], [480, "목성과 이오", "--amber", tIo(M), 66]].forEach(function (s, i) {
          var cx = s[0], cy = 160, r = s[4];
          ctx.strokeStyle = H.v("--line"); ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
          H.dot(ctx, cx, cy, i ? 24 : 12, H.v(s[2]));
          var a = ang * 2 * Math.PI / s[3];
          H.dot(ctx, cx + r * Math.cos(a), cy - r * Math.sin(a), 5, H.v("--mist"));
          H.text(ctx, s[1], cx, 260, { s: 12, w: "800", a: "center" });
          H.text(ctx, "주기 " + s[3].toFixed(2) + " 일", cx, 280, { s: 12, w: "900", a: "center", c: H.v(s[2] + "-700") });
        });
        var t = tIo(M);
        H.rows(ctx, 650, 70, [
          ["목성 질량 (지구 = 1)", M + " 배"],
          ["계산한 이오의 주기", t.toFixed(3) + " 일", Math.abs(t - T_OBS) / T_OBS <= 0.01 ? "--green-700" : "--rose-700", true],
          ["관측한 이오의 주기", T_OBS + " 일"]
        ], 60);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "목성의 질량 (지구의 몇 배)", min: 10, max: 600, step: 1, value: 100, fmt: function (x) { return x + " 배"; }, onInput: function (x) { M = x; draw(); } });
      api.button("▶ 10일 동안 돌려 보기", function () { run(80, 40, function (k) { ang = k * 10; draw(); }); });
      api.info("케플러 제3법칙을 뉴턴이 고친 식: T² = 4π²a³ ÷ (GM). 중심 질량이 크면 같은 거리에서도 더 빨리 돕니다.");
      draw();
      return {
        judge: function () {
          var t = tIo(M);
          if (Math.abs(t - T_OBS) / T_OBS <= 0.01) return { ok: true, msg: "목성 질량 ≈ 지구의 " + M + " 배 — 실제 값(약 318배)입니다. 위성 하나만 있으면 천체의 무게를 달 수 있어요." };
          return { ok: false, msg: "계산한 주기 " + t.toFixed(3) + " 일 — 관측(1.77일)보다 " + (t > T_OBS ? "깁니다. 질량을 늘리세요." : "짧습니다. 질량을 줄이세요.") };
        }
      };
    },
    hints: [
      "이오는 달과 거리는 비슷한데 주기가 15배 이상 짧습니다. 목성이 훨씬 무거워야 해요.",
      "M ∝ a³ / T². (422/384)³ × (27.32 / 1.769)² ≈ ?"
    ],
    solution: "지구의 약 <b>316배</b>(310 ~ 321배). 실제 목성 질량은 지구의 약 318배입니다.",
    why: "케플러의 조화 법칙(T² ∝ a³)은 뉴턴의 만유인력으로 설명되며, 그 비례 상수에 <b>중심 천체의 질량</b>이 들어 있습니다. 그래서 위성의 궤도 반지름과 주기만 재면 행성의 질량을 달 수 있어요.<br>" +
      "같은 방법으로 태양의 질량(행성의 궤도), 쌍성의 질량, 은하 중심 블랙홀의 질량까지 잽니다. 태양계를 지배하는 힘이 태양의 중력이라는 것도 이 법칙이 알려 주지요."
  },

  /* ------------------------------------------------------------------ 2. 공명과 커크우드 간극 */
  {
    id: "c2", tag: "조화 법칙 · 소행성대", title: "소행성대의 빈틈", short: "커크우드 간극",
    who: "🔭", name: "소행성 분포 연구실",
    say: "“소행성대에서 궤도 긴반지름별로 소행성 수를 세어 보면, 몇몇 곳에 소행성이 거의 없는 <b>빈틈(커크우드 간극)</b>이 있어요. 목성의 공전 주기(11.86년)와 소행성의 주기가 간단한 정수비가 되는 곳에서 목성이 되풀이해 잡아당겨 궤도를 흩뜨린다고 합니다. 빈틈의 위치를 예측해 보세요. 목성의 궤도 긴반지름은 5.20 AU 입니다.”",
    predict: {
      q: "목성보다 태양에 가까운 소행성의 공전 주기는 목성과 비교해?",
      options: ["㉠ 더 길다", "㉡ 더 짧다 — 조화 법칙에 따라 가까울수록 빨리 돈다", "㉢ 같다"],
      answer: 1
    },
    task: "공명 비율을 고르고 긴반지름을 정해 <b>그 비율의 빈틈 위치</b>를 맞추세요(± 0.02 AU).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(340), ctx = cv.ctx, W = cv.W;
      var RES = { r31: { t: "3 : 1", k: 3 }, r52: { t: "5 : 2", k: 2.5 }, r21: { t: "2 : 1", k: 2 } };
      var res = "r31", a = 2.2, AJ = 5.2, TJ = 11.86;
      function T(x) { return Math.pow(x, 1.5); }
      function gap(k) { return AJ * Math.pow(1 / k, 2 / 3); }
      var gx0 = 70, gx1 = 830, gy0 = 50, gy1 = 250;
      function GX(x) { return gx0 + (x - 2.0) / 1.5 * (gx1 - gx0); }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "궤도 긴반지름에 따른 소행성 수 (가상 자료)", 40, 26, { s: 13.5, w: "900" });
        H.axes(ctx, gx0, gy0, gx1, gy1);
        for (var x = 2.0; x < 3.5; x += 0.01) {
          var n = 60 + 50 * Math.sin((x - 2) * 3.1) * 0.6 + 30 * Math.cos(x * 17) * 0.3;
          Object.keys(RES).forEach(function (r) { var g = gap(RES[r].k); n *= 1 - Math.exp(-Math.pow((x - g) / 0.018, 2)); });
          H.box(ctx, GX(x), gy1 - n, GX(x + 0.01) - GX(x) + 0.5, n, H.v("--teal"), 0.7);
        }
        [2.0, 2.5, 3.0, 3.5].forEach(function (x) { H.text(ctx, x.toFixed(1) + " AU", GX(x), gy1 + 16, { s: 10, a: "center", c: H.v("--mist") }); });
        H.line(ctx, [[GX(a), gy0], [GX(a), gy1]], H.v("--rose"), 2.5);
        H.text(ctx, "내 예측 " + a.toFixed(2) + " AU", GX(a), gy0 - 6, { s: 11, w: "800", a: "center", c: H.v("--rose-700") });
        var ratio = TJ / T(a);
        H.rows(ctx, 70, 292, [["이 거리의 소행성 주기", T(a).toFixed(2) + " 년"]], 40);
        H.rows(ctx, 360, 292, [["목성 주기 ÷ 소행성 주기", ratio.toFixed(2) + " (목표 " + RES[res].t + " = " + RES[res].k + ")", Math.abs(a - gap(RES[res].k)) <= 0.02 ? "--green-700" : null]], 40);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "공명 비율 (소행성 : 목성의 공전 횟수)", value: "r31", options: [{ v: "r31", t: "3 : 1" }, { v: "r52", t: "5 : 2" }, { v: "r21", t: "2 : 1" }], onPick: function (x) { res = x; draw(); } });
      api.slider({ label: "궤도 긴반지름", min: 2.0, max: 3.5, step: 0.01, value: 2.2, fmt: function (x) { return x.toFixed(2) + " AU"; }, onInput: function (x) { a = x; draw(); } });
      api.info("조화 법칙: 태양 둘레를 도는 천체는 T(년)² = a(AU)³. 목성이 1바퀴 돌 때 소행성이 3바퀴 돌면 3 : 1 공명입니다.");
      draw();
      return {
        judge: function () {
          var g = gap(RES[res].k);
          if (Math.abs(a - g) <= 0.02) return { ok: true, msg: RES[res].t + " 공명 — " + a.toFixed(2) + " AU 에서 주기 " + T(a).toFixed(2) + " 년. 그래프의 빈틈과 딱 맞습니다." };
          return { ok: false, msg: a.toFixed(2) + " AU 에서 주기 비 " + (TJ / T(a)).toFixed(2) + " — " + RES[res].t + " 공명 위치가 아닙니다." };
        }
      };
    },
    hints: [
      "3 : 1 공명이면 소행성 주기 = 11.86 ÷ 3 ≈ 3.95년. T² = a³ 에서 a 는?",
      "a = 5.2 × (1/3)^(2/3). 계산기가 없으면 슬라이더를 움직이며 ‘주기 비’가 3.00 이 되는 곳을 찾으세요."
    ],
    solution: "3 : 1 → <b>2.50 AU</b>, 5 : 2 → <b>2.82 AU</b>, 2 : 1 → <b>3.28 AU</b> (공명 비율 하나를 골라 맞추면 됩니다).",
    why: "조화 법칙으로 공전 주기를 거리로 바꿀 수 있습니다. 목성과 주기가 간단한 정수비인 곳에서는 같은 자리에서 목성의 중력을 되풀이해 받아, 작은 힘이 쌓여 궤도가 흐트러지고 소행성이 빠져나가요(궤도 공명).<br>" +
      "토성 고리의 틈(카시니 간극)도 위성 미마스와의 공명으로 생겼습니다. 태양계 소천체의 분포에는 행성의 <b>중력이 남긴 지문</b>이 찍혀 있는 셈이지요. ※ 그래프의 소행성 수는 수업용 가상 자료입니다."
  },

  /* ------------------------------------------------------------------ 3. 식 현상(통과)법의 확률 */
  {
    id: "c3", tag: "외계 행성 탐사 · 통과법", title: "지구 닮은 행성 찾기 작전", short: "통과 확률",
    who: "🌍", name: "외계 행성 탐사 위성팀",
    say: "“새 우주 망원경으로 <b>식 현상(통과)법</b>을 써서, 태양 같은 별 둘레의 지구 닮은 행성(1 AU)을 <b>5개 이상</b> 찾고 싶어요. 태양형 별의 절반쯤에 지구 닮은 행성이 있다고 봅니다. 그런데 행성 궤도가 우리 시선과 나란해야만 통과가 보이죠. 적어도 몇 개의 별을 지켜봐야 할까요?”",
    predict: {
      q: "지구 닮은 행성이 있는 태양형 별을 무작위로 골랐을 때, 우리 쪽에서 그 행성의 통과가 보일 확률은 대략?",
      options: ["㉠ 약 50%", "㉡ 약 5%", "㉢ 약 0.5% (별의 반지름 ÷ 궤도 반지름)"],
      answer: 2
    },
    task: "별의 종류와 지켜볼 별의 수를 정해, <b>태양형 별에서 5개 이상</b> 찾을 수 있는 <b>가장 적은</b> 별의 수를 찾으세요(2300개 이하).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(300), ctx = cv.ctx, W = cv.W;
      var ST = { sun: { t: "태양형 별 (반지름 1 R☉, 생명 가능 지대 1 AU)", R: 1, a: 1 }, red: { t: "적색 왜성 (반지름 0.3 R☉, 생명 가능 지대 0.1 AU)", R: 0.3, a: 0.1 } };
      var st = "red", lg = 3;
      function prob() { return ST[st].R * 6.96e5 / (ST[st].a * 1.496e8); }
      function N() { return Math.round(Math.pow(10, lg)); }
      function found() { return N() * 0.5 * prob(); }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "궤도면이 시선과 나란할 때만 별빛이 살짝 어두워진다", 40, 26, { s: 13.5, w: "900" });
        var cx = 200, cy = 150;
        H.dot(ctx, cx, cy, 30 * ST[st].R + 6, "#ffd36a");
        ctx.strokeStyle = H.v("--line"); ctx.beginPath(); ctx.ellipse(cx, cy, 130, 14, 0, 0, Math.PI * 2); ctx.stroke();
        H.dot(ctx, cx + 40, cy + 12, 4, H.v("--brand"));
        H.text(ctx, "👁 우리 시선", cx, cy + 80, { s: 11, a: "center", c: H.v("--mist") });
        var p = prob(), f = found();
        H.rows(ctx, 400, 60, [
          ["별의 종류", ST[st].t],
          ["통과가 보일 확률 (R★ ÷ a)", (p * 100).toFixed(2) + " %"],
          ["지켜볼 별", N().toLocaleString() + " 개"],
          ["찾을 것으로 기대되는 수", f.toFixed(1) + " 개", f >= 5 && st === "sun" ? "--green-700" : "--rose-700", true]
        ], 52);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "별의 종류", value: "red", options: [{ v: "sun", t: "태양형 별" }, { v: "red", t: "적색 왜성" }], onPick: function (x) { st = x; draw(); } });
      api.slider({ label: "지켜볼 별의 수 (눈금 한 칸 = 10배)", min: 2, max: 5, step: 0.01, value: 3, fmt: function (x) { return Math.round(Math.pow(10, x)).toLocaleString() + " 개"; }, onInput: function (x) { lg = x; draw(); } });
      api.info("기대되는 수 = 별의 수 × (지구 닮은 행성이 있을 확률 0.5) × (통과가 보일 확률).");
      draw();
      return {
        judge: function () {
          if (st !== "sun") return { ok: false, msg: "적색 왜성은 통과 확률이 높지만, 이번 작전의 목표는 태양형 별의 지구 닮은 행성입니다." };
          var f = found();
          if (f < 5) return { ok: false, msg: N().toLocaleString() + " 개 — 기대 수 " + f.toFixed(1) + " 개로 모자랍니다." };
          if (N() > 2300) return { ok: false, msg: "충분하지만 " + N().toLocaleString() + " 개는 필요 이상입니다. 가장 적은 수를 찾으세요." };
          return { ok: true, msg: "약 " + N().toLocaleString() + " 개의 별 → 기대 " + f.toFixed(1) + " 개. 통과 확률이 약 0.47% 뿐이라 많은 별을 오래 지켜봐야 합니다." };
        }
      };
    },
    hints: [
      "태양 반지름 ÷ 1 AU = 6.96 × 10⁵ ÷ 1.496 × 10⁸ ≈ 0.0047.",
      "N × 0.5 × 0.0047 ≥ 5 → N ≥ ?"
    ],
    solution: "<b>태양형 별</b>, 약 <b>2150 ~ 2300 개</b>.",
    why: "식 현상(통과)법은 행성이 별 앞을 지날 때 별빛이 조금 어두워지는 것을 잽니다. 궤도면이 시선과 거의 나란해야 하므로, 통과가 보일 확률은 대략 <b>별의 반지름 ÷ 궤도 반지름</b>으로 아주 작아요. 그래서 케플러 망원경은 15만 개가 넘는 별을 몇 년 동안 동시에 지켜봤습니다.<br>" +
      "적색 왜성은 작고 어두워 생명 가능 지대가 가까우므로 통과 확률이 높고 찾기 쉽습니다. 발견된 외계 행성에 가까운 궤도의 행성이 많은 것도 이런 <b>관측 방법의 치우침</b> 때문이에요."
  }
  ]
});
})();
