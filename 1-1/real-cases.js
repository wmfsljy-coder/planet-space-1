/* 행성우주과학1 Ⅰ-1 우주 탐사와 태양 활동 — 실제 자료
   r1 태양 활동은 몇 년마다 되풀이될까 — 270여 년의 흑점 수
   r2 지금 태양은 극대기를 지났을까 — 25주기의 봉우리
   자료: data/sunspots.js (NOAA SWPC, 흑점 수는 SILSO 국제 흑점 수 v2) */
(function () {
"use strict";
var S = (window.REAL_SSN || { rows: [] }).rows.filter(function (r) { return r[2] === 12; });   /* 열두 달이 다 있는 해만 */
function val(y) { for (var i = 0; i < S.length; i++) if (S[i][0] === y) return S[i][1]; return null; }
var PK = []; S.forEach(function (r) { if (r[0] < 1755 || r[0] > S[S.length - 1][0] - 2) return; var ok = true; for (var k = r[0] - 4; k <= r[0] + 4; k++) { var v = val(k); if (v != null && v > r[1]) ok = false; } if (ok) PK.push(r[0]); });
var P1900 = PK.filter(function (y) { return y >= 1900; }), MEAN = P1900.length > 1 ? (P1900[P1900.length - 1] - P1900[0]) / (P1900.length - 1) : 11;
var C25 = S.filter(function (r) { return r[0] >= 2020; }).reduce(function (b, r) { return r[1] > b[1] ? r : b; }, [2024, 0]);
var C24 = S.filter(function (r) { return r[0] >= 2009 && r[0] <= 2018; }).reduce(function (b, r) { return r[1] > b[1] ? r : b; }, [2014, 0]);
var SRC = "<small>출처: 미국 해양대기청(NOAA) 우주기상예보센터(SWPC) 관측 태양 주기 지수 — 흑점 수는 벨기에 왕립 천문대 SILSO 의 국제 흑점 수(버전 2)를 열두 달 모두 있는 해만 연평균. 사본은 data/sunspots.js.</small>";

function chart(H, ctx, W, CH, from, to, mark) {
  H.paper(ctx, W, CH);
  var x0 = 60, x1 = 640, y0 = 24, y1 = CH - 36;
  function X(y) { return x0 + (y - from) / (to - from) * (x1 - x0); }
  function Y(v) { return y1 - v / 300 * (y1 - y0); }
  H.axes(ctx, x0, y0, x1, y1);
  [0, 100, 200, 300].forEach(function (v) { H.text(ctx, v, x0 - 6, Y(v) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
  for (var y = Math.ceil(from / 25) * 25; y <= to; y += (to - from > 100 ? 50 : 10)) H.text(ctx, y, X(y), y1 + 15, { s: 10, a: "center", c: H.v("--mist") });
  H.text(ctx, "연평균 흑점 수", x0 + 6, y0 - 8, { s: 11, w: "700", c: H.v("--mist") });
  var bw = Math.max(1.5, (x1 - x0) / (to - from) - 1);
  S.forEach(function (r) { if (r[0] < from || r[0] > to) return; H.box(ctx, X(r[0]) - bw / 2, Y(r[1]), bw, y1 - Y(r[1]), r[0] === mark ? H.v("--amber-700") : H.v("--brand"), 0.85); });
  return { X: X, Y: Y };
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료로 태양 활동 주기와 우주 기상 감시의 필요성을 설명해 보세요.",
  cases: [
  {
    id: "r1", tag: "실제 자료 · 태양 활동 주기", title: "태양 활동은 몇 년마다 되풀이될까", short: "흑점 주기",
    who: "☀️", name: "태양 관측소",
    say: "“1749년부터 사람들이 태양의 흑점을 세어 왔어요. 흑점이 많을수록 태양 활동(플레어, 코로나 질량 방출)이 활발합니다. 아래는 해마다 평균한 <b>실제 흑점 수</b>입니다. 1900년 이후의 봉우리(극대기)를 세어, 태양 활동이 <b>평균 몇 년마다</b> 되풀이되는지 구해 주세요.”",
    predict: {
      q: "흑점 수는 시간에 따라 어떻게 변할까요?",
      options: ["㉠ 해마다 비슷하다", "㉡ 늘었다 줄었다를 약 11년마다 되풀이한다", "㉢ 100년에 한 번 크게 늘어난다"],
      answer: 1
    },
    task: "1900년 이후 극대기 간격의 평균을 슬라이더로 맞추세요(± 0.5 년).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, g = 5, view = "m";
      function draw() {
        var from = view === "m" ? 1895 : 1749, to = S[S.length - 1][0];
        var p = chart(H, ctx, W, cv.H, from, to, null);
        if (view === "m") for (var y = P1900[0], k = 0; y <= to; y += g, k++) H.dash(ctx, p.X(y), 24, p.X(y), cv.H - 36, H.v("--amber-700"), 1.2);
        H.rows(ctx, 680, 60, [["내 답 (평균 간격)", g.toFixed(1) + " 년", null, true], ["노란 점선", P1900[0] + "년부터 그 간격마다"]], 60);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "보기", value: "m", options: [{ v: "m", t: "1895년 이후" }, { v: "all", t: "1749년부터 전체" }], onPick: function (x) { view = x; draw(); } });
      api.slider({ label: "극대기 사이 평균 간격", min: 5, max: 20, step: 0.1, value: 5, fmt: function (x) { return x.toFixed(1) + " 년"; }, onInput: function (x) { g = x; api.changed(); draw(); } });
      api.info("노란 점선이 봉우리들에 차례로 겹치게 해 보세요. " + SRC
        + "<div data-link='{\"id\":\"swpc-cycle\",\"title\":\"NOAA 우주기상예보센터 — 태양 주기 진행\",\"src\":\"미국 해양대기청\",\"url\":\"https://www.swpc.noaa.gov/products/solar-cycle-progression\",\"ask\":\"그래프에서 이번 25주기의 흑점 수가 지금 늘고 있는지 줄고 있는지, 가장 최근 달의 흑점 수가 몇인지 적어 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(g - MEAN) <= 0.5) return { ok: true, msg: "1900년 이후 극대기 " + P1900.join(", ") + " → 평균 약 " + MEAN.toFixed(1) + " 년마다." };
          return { ok: false, msg: g.toFixed(1) + " 년 간격은 봉우리와 " + (g < MEAN ? "너무 촘촘합니다" : "너무 성깁니다") + "." };
        }
      };
    },
    hints: ["1900년 이후 봉우리는 " + P1900.length + "개입니다.", "(" + P1900[P1900.length - 1] + " − " + P1900[0] + ") ÷ " + (P1900.length - 1) + " = ?"],
    solution: "약 <b>" + MEAN.toFixed(1) + " 년</b> (극대기 " + P1900.join(" · ") + ").",
    why: "태양의 자기장은 약 11년마다 꼬였다 풀리며 남북이 뒤집히는데, 자기장이 가장 엉킨 때가 흑점이 가장 많은 극대기입니다. 주기는 9 ~ 14년으로 조금씩 다르고, 봉우리의 높이도 주기마다 다릅니다. 1645 ~ 1715년에는 흑점이 거의 없던 ‘마운더 극소기’도 있었어요.<br>"
      + "극대기 무렵에는 큰 플레어와 코로나 질량 방출이 잦아, 인공위성 고장·GPS 오차·전력망 사고·통신 장애가 생길 수 있습니다. 그래서 각 나라가 태양을 쉬지 않고 감시하는 우주 기상 예보를 운영합니다."
  },
  {
    id: "r2", tag: "실제 자료 · 25주기", title: "이번 태양 주기의 극대기는 언제였나", short: "25주기 극대",
    who: "🛰️", name: "우주 기상 예보관",
    say: "“지금의 태양 활동은 1755년부터 센 지 <b>25번째 주기</b>예요. 2019년 말 극소기에서 시작했습니다. 최근 자료로 이번 주기에 흑점이 <b>가장 많았던 해</b>를 찾고, 앞 주기(24주기)의 봉우리와 견주어 보세요.”",
    predict: {
      q: "25주기의 극대기는 24주기보다 어땠을까요?",
      options: ["㉠ 흑점이 훨씬 적었다", "㉡ 24주기보다 흑점이 많았다", "㉢ 아직 극대기가 오지 않았다"],
      answer: 1
    },
    task: "연도를 옮겨 25주기(2020년 이후)에서 흑점이 가장 많았던 해를 고르세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, y = 2020;
      function draw() {
        chart(H, ctx, W, cv.H, 1996, S[S.length - 1][0], y);
        H.rows(ctx, 680, 50, [["고른 해", y + "년", "--amber-700"], ["연평균 흑점 수", (val(y) == null ? "-" : val(y).toFixed(1)), null, true], ["24주기 봉우리", C24[0] + "년 " + C24[1].toFixed(0)]], 60);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "연도", min: 2020, max: S[S.length - 1][0], step: 1, value: 2020, fmt: function (x) { return x + "년"; }, onInput: function (x) { y = x; api.changed(); draw(); } });
      api.info("가장 최근 해는 열두 달이 다 모인 해까지만 넣었습니다. " + SRC
        + "<div data-link='{\"id\":\"kasa-sw\",\"title\":\"우주항공청 우주환경센터 (교과서 연결 자료)\",\"src\":\"우주항공청 · 비상교육 행성우주과학 18쪽\",\"url\":\"https://spaceweather.kasa.go.kr/\",\"ask\":\"첫 화면의 ‘경보 등급’에서 지금의 R(태양 X선)·S(태양 입자)·G(지자기 폭풍) 단계를 적고, 최근 경보 알림 하나가 무엇이었는지 적어 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (y === C25[0]) return { ok: true, msg: C25[0] + "년 연평균 " + C25[1].toFixed(0) + " — 24주기 봉우리(" + C24[0] + "년 " + C24[1].toFixed(0) + ")보다 높았습니다. 그해 5월에는 강한 지자기 폭풍으로 우리나라 하늘에서도 오로라가 찍혔어요." };
          return { ok: false, msg: y + "년은 " + (val(y) == null ? "자료가 없습니다" : val(y).toFixed(0) + " 입니다") + ". 더 높은 해가 있어요." };
        }
      };
    },
    hints: ["가장 높은 노란·파란 막대를 찾으세요.", "2023 ~ 2025년 사이입니다."],
    solution: "<b>" + C25[0] + "년</b> (연평균 약 " + C25[1].toFixed(0) + ").",
    why: "주기의 봉우리 높이는 미리 정확히 알기 어려워, 과학자들은 태양 자기장 관측으로 예측하고 실제 자료로 확인합니다. 25주기는 처음 예보보다 활발했고, 극대기 무렵인 2024년 5월에는 20년 만의 가장 강한 지자기 폭풍이 일어나 낮은 위도에서도 오로라가 보였습니다.<br>"
      + "극대기가 지나도 몇 년 동안은 큰 폭발이 일어날 수 있어 감시는 계속됩니다. ※ 극대기의 정확한 달은 열세 달 이동 평균으로 정하므로, 연평균으로 고른 해와 조금 다를 수 있습니다."
  }
  ]
});
})();
