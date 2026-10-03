/* 행성우주과학1 Ⅰ-2 태양계 천체와 외계 행성 — 실제 자료
   r1 외계 행성은 주로 어떤 방법으로 찾았나 — 확인된 외계 행성 전체의 발견 방법
   r2 통과 방법이 찾기 쉬운 행성은? — 공전 주기 분포로 본 관측 치우침
   자료: data/exoplanets.js (NASA Exoplanet Archive) */
(function () {
"use strict";
var X_ = window.REAL_EXO || { total: 0, methods: [], byYear: [], transitPeriods: [] };
var KO = { "Transit": "통과(식)", "Radial Velocity": "시선 속도(별의 흔들림)", "Microlensing": "미세 중력 렌즈", "Imaging": "직접 촬영", "Transit Timing Variations": "통과 시각 변화", "Eclipse Timing Variations": "식 시각 변화", "Orbital Brightness Modulation": "공전 밝기 변화", "Pulsar Timing": "펄서 시각", "Astrometry": "위치 측정", "Pulsation Timing Variations": "맥동 시각 변화", "Disk Kinematics": "원반 운동" };
var TR = (X_.methods.filter(function (m) { return m[0] === "Transit"; })[0] || ["Transit", 0])[1], SHARE = X_.total ? TR / X_.total * 100 : 0;
var PER = X_.transitPeriods, SHORT = PER.filter(function (p) { return p < 100; }).length / (PER.length || 1) * 100;
var SRC = "<small>출처: NASA 외계 행성 자료실(NASA Exoplanet Archive, IPAC/Caltech), 확인된 외계 행성 " + X_.total.toLocaleString() + "개(Planetary Systems 표, 받은 날 2026-10-03). 사본은 data/exoplanets.js.</small>";

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료로 외계 행성 탐사 방법과 그 한계를 설명해 보세요.",
  cases: [
  {
    id: "r1", tag: "실제 자료 · 외계 행성 탐사", title: "외계 행성은 주로 어떤 방법으로 찾았나", short: "발견 방법",
    who: "🪐", name: "외계 행성 연구실",
    say: "“지금까지 확인된 외계 행성은 <b>" + X_.total.toLocaleString() + "개</b>예요(NASA 자료실). 행성이 별 앞을 지날 때 별빛이 조금 어두워지는 것을 재는 <b>통과 방법</b>, 행성에 끌려 별이 흔들리는 것을 재는 <b>시선 속도 방법</b> 등이 있습니다. 전체 가운데 <b>통과 방법으로 찾은 행성이 몇 %</b>인지 구해 주세요.”",
    predict: {
      q: "가장 많은 외계 행성을 찾아낸 방법은?",
      options: ["㉠ 망원경으로 행성을 직접 찍는 방법", "㉡ 별빛이 행성에 가려 살짝 어두워지는 것을 재는 통과 방법", "㉢ 별이 흔들리는 것을 재는 시선 속도 방법"],
      answer: 1
    },
    task: "막대를 읽고 통과 방법의 비율을 슬라이더로 맞추세요(± 3 %).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(270), ctx = cv.ctx, W = cv.W, g = 20;
      function draw() {
        H.paper(ctx, W, cv.H);
        var x0 = 230, x1 = 590, y = 30, top = X_.methods.slice(0, 6), mx = top.length ? top[0][1] : 1;
        top.forEach(function (m, i) {
          var yy = y + i * 36, w = m[1] / mx * (x1 - x0);
          H.text(ctx, KO[m[0]] || m[0], x0 - 10, yy + 17, { s: 12, w: "800", a: "right" });
          H.box(ctx, x0, yy, Math.max(2, w), 24, i === 0 ? H.v("--amber-700") : H.v("--brand"), 0.85);
          H.text(ctx, m[1].toLocaleString() + " 개", x0 + w + 8, yy + 17, { s: 11.5, w: "800", c: H.v("--mist") });
        });
        H.rows(ctx, 730, 60, [["전체", X_.total.toLocaleString() + " 개"], ["내 답 (통과 방법)", g + " %", null, true]], 60);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "통과 방법의 비율", min: 0, max: 100, step: 1, value: 20, fmt: function (x) { return x + " %"; }, onInput: function (x) { g = x; api.changed(); draw(); } });
      api.info("비율(%) = 통과 방법 개수 ÷ 전체 × 100. " + SRC
        + "<div data-link='{\"id\":\"exo-count\",\"title\":\"NASA 외계 행성 자료실 — 발견 수\",\"src\":\"NASA / IPAC\",\"url\":\"https://exoplanetarchive.ipac.caltech.edu/\",\"ask\":\"첫 화면에 나오는 지금의 확인된 외계 행성 수(Confirmed Planets)를 적고, 이 사례의 숫자보다 몇 개 늘었는지 적어 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(g - SHARE) <= 3) return { ok: true, msg: TR.toLocaleString() + " ÷ " + X_.total.toLocaleString() + " ≈ " + SHARE.toFixed(0) + "% — 대부분 통과 방법(케플러·TESS 우주 망원경)으로 찾았습니다." };
          return { ok: false, msg: g + "% 는 " + (g < SHARE ? "적습니다" : "많습니다") + ". 통과 방법 개수를 전체로 나누세요." };
        }
      };
    },
    hints: ["가장 긴 막대가 통과 방법입니다(약 " + Math.round(TR / 100) * 100 + "개).", Math.round(TR / 100) * 100 + " ÷ " + Math.round(X_.total / 100) * 100 + " ≈ ?"],
    solution: "약 <b>" + SHARE.toFixed(0) + "%</b> (" + TR.toLocaleString() + " / " + X_.total.toLocaleString() + ").",
    why: "통과 방법은 별빛의 밝기만 정밀하게 재면 되어, 수십만 개의 별을 한꺼번에 지켜보는 우주 망원경(케플러 2009 ~ 2018, TESS 2018 ~ )으로 행성을 무더기로 찾을 수 있었습니다. 어두워지는 정도로 행성의 크기를, 어두워지는 간격으로 공전 주기를 알 수 있어요. 시선 속도 방법은 행성의 질량을 알려 주어, 두 방법을 함께 쓰면 행성의 밀도까지 구할 수 있습니다.<br>"
      + "직접 촬영은 별빛이 행성보다 수억 배 밝아 매우 어렵지만, 별에서 멀리 떨어진 큰 행성은 찍을 수 있습니다."
  },
  {
    id: "r2", tag: "실제 자료 · 관측의 치우침", title: "통과 방법이 찾기 쉬운 행성은?", short: "관측 치우침",
    who: "📊", name: "자료 분석 동아리",
    say: "“통과 방법으로 찾은 행성 " + PER.length.toLocaleString() + "개의 <b>공전 주기</b>를 모았어요. 지구는 365일 주기인데, 이 행성들 가운데 공전 주기가 <b>100일보다 짧은 행성이 몇 %</b>일까요? 그 까닭도 생각해 보세요.”",
    predict: {
      q: "통과 방법으로 찾은 행성들은 어떤 행성이 많을까요?",
      options: ["㉠ 별에서 멀어 공전 주기가 긴 행성", "㉡ 별에 가까워 공전 주기가 짧은 행성", "㉢ 주기가 고르게 섞여 있다"],
      answer: 1
    },
    task: "막대(공전 주기별 개수)를 보고 100일보다 짧은 행성의 비율을 슬라이더로 맞추세요(± 3 %).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, g = 50;
      var BIN = [[0, 1], [1, 3], [3, 10], [10, 30], [30, 100], [100, 300], [300, 1000], [1000, 1e9]], NM = ["1일↓", "1 ~ 3", "3 ~ 10", "10 ~ 30", "30 ~ 100", "100 ~ 300", "300 ~ 1000", "1000↑"];
      var CNT = BIN.map(function (b) { return PER.filter(function (p) { return p >= b[0] && p < b[1]; }).length; }), MX = Math.max.apply(null, CNT);
      function draw() {
        H.paper(ctx, W, cv.H);
        var x0 = 60, x1 = 640, y0 = 30, y1 = cv.H - 46, bw = (x1 - x0) / BIN.length;
        H.axes(ctx, x0, y0, x1, y1);
        CNT.forEach(function (c, i) {
          var h = c / MX * (y1 - y0), x = x0 + i * bw + 6;
          H.box(ctx, x, y1 - h, bw - 12, h, BIN[i][1] <= 100 ? H.v("--brand") : H.v("--coral-700"), 0.85);
          H.text(ctx, c.toLocaleString(), x + (bw - 12) / 2, y1 - h - 5, { s: 10.5, w: "800", a: "center", c: H.v("--mist") });
          H.text(ctx, NM[i], x + (bw - 12) / 2, y1 + 15, { s: 10, a: "center", c: H.v("--mist") });
        });
        H.text(ctx, "공전 주기 (일)", (x0 + x1) / 2, y1 + 32, { s: 10.5, w: "700", a: "center", c: H.v("--mist") });
        H.rows(ctx, 680, 60, [["통과 방법 행성", PER.length.toLocaleString() + " 개"], ["내 답 (100일보다 짧음)", g + " %", null, true]], 60);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "100일보다 짧은 행성의 비율", min: 0, max: 100, step: 1, value: 50, fmt: function (x) { return x + " %"; }, onInput: function (x) { g = x; api.changed(); draw(); } });
      api.info("파란 막대(100일보다 짧음)를 모두 더해 전체로 나누세요. " + SRC);
      draw();
      return {
        judge: function () {
          if (Math.abs(g - SHORT) <= 3) return { ok: true, msg: "약 " + SHORT.toFixed(0) + "% 가 100일보다 짧습니다. 지구 같은 1년 주기 행성은 아주 드물게 찾혔어요." };
          return { ok: false, msg: g + "% 는 " + (g < SHORT ? "적습니다" : "많습니다") + ". 파란 막대들의 합을 구해 보세요." };
        }
      };
    },
    hints: ["빨간 막대(100일보다 긺)는 아주 작습니다.", "파란 막대가 전체의 대부분입니다 — 90% 넘게."],
    solution: "약 <b>" + SHORT.toFixed(0) + "%</b>.",
    why: "통과 방법은 행성이 별 앞을 <b>여러 번</b> 지나가야 확인되므로, 몇 년 동안 관측해도 공전 주기가 긴 행성은 한두 번밖에 지나가지 않아 놓치기 쉽습니다. 또 별에 가까운 행성일수록 우리 쪽에서 볼 때 별 앞을 지나갈 확률도 높아요. 그래서 찾은 행성의 대부분이 별에 바싹 붙은 짧은 주기 행성입니다.<br>"
      + "이렇게 관측 방법 때문에 자료가 한쪽으로 치우치는 것을 <b>선택 효과(관측 치우침)</b>라고 합니다. ‘우주에는 뜨거운 행성이 많다’가 아니라 ‘우리가 그런 행성을 찾기 쉽다’는 뜻이에요. 지구 닮은 행성을 찾으려면 더 오래, 더 정밀하게 관측해야 합니다."
  }
  ]
});
})();
