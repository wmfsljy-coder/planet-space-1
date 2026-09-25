/* 행성우주과학 Ⅰ-2 태양계 천체와 외계 행성 — 소단원별 이야기 세 편
   01 8분의 오차 / 02 명왕성의 자격 심사 / 03 별이 흔들렸다
   공용 부품: ../assets/theme.js (sthUnit·sthGate·sthWork), ../assets/story.js (sthStory·sthSort·sthOrder·sthPick) */
(function () {
"use strict";

window.sthUnit("psp-1-2");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
var D2R = Math.PI / 180, R2D = 180 / Math.PI;
function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
function paper(ctx, W, H) { ctx.clearRect(0, 0, W, H); ctx.fillStyle = v("--panel"); ctx.fillRect(0, 0, W, H); }
function text(ctx, s, x, y, o) {
  o = o || {};
  ctx.font = (o.w || "500") + " " + (o.s || 12) + "px " + FONT;
  ctx.fillStyle = o.c || v("--ink"); ctx.textAlign = o.a || "left";
  ctx.fillText(s, x, y);
}
function dot(ctx, x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function ring(ctx, x, y, r, col, w) { ctx.strokeStyle = col; ctx.lineWidth = w || 2; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); }
function line(ctx, x1, y1, x2, y2, col, w, dash) {
  ctx.save(); if (dash) ctx.setLineDash(dash);
  ctx.strokeStyle = col; ctx.lineWidth = w || 2;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
function bar(ctx, x, y, w, h, col, r) { ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x, y, Math.max(1, w), h, r == null ? 5 : r); ctx.fill(); }

/* 케플러 방정식 도우미 (이야기 ①·②에서 함께 쓴다) */
function eccFromTrue(e, th) { return 2 * Math.atan2(Math.sqrt(1 - e) * Math.sin(th / 2), Math.sqrt(1 + e) * Math.cos(th / 2)); }
function trueFromEcc(e, E) { return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2)); }
function solveKepler(e, M) {
  var E = M, i;
  for (i = 0; i < 40; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}

/* =========================================================================
   이야기 ① 8분의 오차 — 케플러 세 법칙
   화성: 긴반지름 1.524 AU, 이심률 0.0934, 공전 주기 687일
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });

  var MA = 1.524, ME = 0.0934, MP = 687;

  window.sthGate({
    gate: "g1", key: "p1", title: "조사관의 첫 추리",
    question: "원 궤도로 계산한 화성의 자리가 하늘에서 8분(각)이나 어긋납니다. 무엇이 문제일까요?",
    options: [
      "㉠ 티코의 관측이 그만큼 틀렸다",
      "㉡ 화성의 궤도가 원이 아니다",
      "㉢ 화성은 태양이 아니라 지구를 돌고 있다"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* ---------------- 장면 2 — 이심률 맞추기 (제1법칙) ---------------- */
  (function () {
    var canvas = $("a-orbit"); if (!canvas) return;
    var ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var THS = [0, 45, 90, 135, 180, 225, 270, 315];
    function rad(e, th) { return MA * (1 - e * e) / (1 + e * Math.cos(th * D2R)); }
    var OBS = THS.map(function (t) { return rad(ME, t); });
    var e = 0, okE = window.sthState("kepE") || 0;

    function maxGap(ee) {
      var m = 0;
      for (var i = 0; i < THS.length; i++) m = Math.max(m, Math.abs(rad(ee, THS[i]) - OBS[i]));
      return m;
    }

    function draw() {
      paper(ctx, W, H);
      var cx = 250, cy = 215, SC = 105;
      /* 눈금 원 */
      [0.5, 1, 1.5, 2].forEach(function (rr) {
        ring(ctx, cx, cy, rr * SC, v("--line"), 1);
        text(ctx, rr + " AU", cx + rr * SC - 4, cy + 13, { s: 9.5, c: v("--mist"), a: "right" });
      });
      /* 모형 곡선 */
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 3; ctx.beginPath();
      for (var t = 0; t <= 360; t += 2) {
        var r = rad(e, t) * SC, x = cx + r * Math.cos(t * D2R), y = cy - r * Math.sin(t * D2R);
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.stroke();
      /* 관측점 */
      THS.forEach(function (t, i) {
        var r = OBS[i] * SC, x = cx + r * Math.cos(t * D2R), y = cy - r * Math.sin(t * D2R);
        ctx.strokeStyle = v("--coral"); ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6); ctx.moveTo(x + 6, y - 6); ctx.lineTo(x - 6, y + 6); ctx.stroke();
      });
      /* 태양(초점) */
      dot(ctx, cx, cy, 11, v("--amber"));
      text(ctx, "☀ 태양 (초점)", cx + 16, cy - 14, { s: 11.5, w: "800", c: v("--amber-700") });
      text(ctx, "✕ 티코의 관측 8개", 24, 30, { s: 12, w: "800", c: v("--coral-700") });
      text(ctx, "— 내가 계산한 궤도", 24, 50, { s: 12, w: "800", c: v("--brand-700") });

      /* 오른쪽 — 관측점별 차이 표 */
      var x0 = 470, y0 = 46;
      text(ctx, "방향", x0, y0, { s: 11, w: "800", c: v("--mist") });
      text(ctx, "관측 거리", x0 + 120, y0, { s: 11, w: "800", c: v("--mist"), a: "right" });
      text(ctx, "계산 거리", x0 + 240, y0, { s: 11, w: "800", c: v("--mist"), a: "right" });
      text(ctx, "차이(AU)", x0 + 380, y0, { s: 11, w: "800", c: v("--mist"), a: "right" });
      var g = maxGap(e);
      THS.forEach(function (t, i) {
        var yy = y0 + 26 + i * 25, rm = rad(e, t), d = Math.abs(rm - OBS[i]);
        text(ctx, t + "°", x0, yy, { s: 12 });
        text(ctx, OBS[i].toFixed(3), x0 + 120, yy, { s: 12, a: "right", c: v("--coral-700") });
        text(ctx, rm.toFixed(3), x0 + 240, yy, { s: 12, a: "right", c: v("--brand-700") });
        bar(ctx, x0 + 262, yy - 9, clamp(d / 0.15, 0, 1) * 60, 11, d <= 0.010 ? v("--green") : v("--rose"), 4);
        text(ctx, d.toFixed(3), x0 + 380, yy, { s: 12, a: "right", w: "800", c: d <= 0.010 ? v("--green-700") : v("--rose-700") });
      });
      text(ctx, "최대 어긋남 " + g.toFixed(3) + " AU " + (g <= 0.010 ? "✅ 합격 (기준 0.010)" : "(기준 0.010 이하)"),
        x0, y0 + 26 + 8 * 25 + 16, { s: 13.5, w: "900", c: g <= 0.010 ? v("--green-700") : v("--rose-700") });

      $("a-orbit-info").innerHTML = "이심률 <b>e = " + e.toFixed(3) + "</b> · 근일점 거리 " + (MA * (1 - e)).toFixed(3) +
        " AU · 원일점 거리 " + (MA * (1 + e)).toFixed(3) + " AU · 최대 어긋남 <b>" + g.toFixed(3) + " AU</b><br>" +
        (e === 0 ? "지금은 <b>완전한 원</b>입니다. 태양에서 어느 쪽이든 거리가 1.524 AU로 같으니, 1.38 AU와 1.67 AU를 동시에 설명할 수 없습니다."
          : (g <= 0.010 ? "🎉 여덟 관측점이 모두 곡선 위에 올라왔습니다. 화성의 실제 이심률은 <b>0.0934</b>입니다."
            : (e < ME ? "아직 원에 가깝습니다. 이심률을 더 키워 보세요." : "이번에는 너무 찌그러졌습니다. 이심률을 조금 줄여 보세요.")));
    }
    canvas._redraw = draw;

    function check() {
      if (okE) {
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>이심률 <b>" + (okE).toFixed(3) +
          "</b> 로 여덟 관측점을 모두 맞췄습니다. 행성의 궤도는 태양을 한 초점으로 하는 <b>타원</b>입니다 — 케플러 제1법칙.");
        ep.clear(1);
      }
    }
    $("a-ecc").addEventListener("input", function (ev) {
      e = Math.round(+ev.target.value * 1000) / 1000;
      $("a-ecc-val").textContent = e.toFixed(3);
      draw();
      if (!okE && maxGap(e) <= 0.010) { okE = e; window.sthState("kepE", e); check(); }
    });
    draw(); check();
  })();

  /* ---------------- 장면 3 — 면적 속도 일정 (제2법칙) ---------------- */
  (function () {
    var canvas = $("a-area"); if (!canvas) return;
    var ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var DT = 60, N = 300;
    var start = 0, got = window.sthState("kepArea") || { near: null, far: null };
    var shown = 0, path = null, busy = false;

    function rAt(th) { return MA * (1 - ME * ME) / (1 + ME * Math.cos(th)); }

    function sweep(th0deg) {
      var th0 = th0deg * D2R, E0 = eccFromTrue(ME, th0), M0 = E0 - ME * Math.sin(E0);
      var pts = [{ th: th0, r: rAt(th0) }], area = 0, total = 0, arc = 0, thPrev = th0, rPrev = rAt(th0), i;
      for (i = 1; i <= N; i++) {
        var M = M0 + 2 * Math.PI * (DT * i / N) / MP;
        var E = solveKepler(ME, M), th = trueFromEcc(ME, E), r = rAt(th);
        var dth = th - thPrev;
        while (dth < -Math.PI) dth += 2 * Math.PI;
        while (dth > Math.PI) dth -= 2 * Math.PI;
        var rm = (r + rPrev) / 2;
        area += 0.5 * rm * rm * dth; total += dth;
        arc += Math.sqrt(Math.pow(r * Math.cos(th) - rPrev * Math.cos(thPrev), 2) + Math.pow(r * Math.sin(th) - rPrev * Math.sin(thPrev), 2));
        pts.push({ th: th, r: r });
        thPrev = th; rPrev = r;
      }
      return { pts: pts, area: area, deg: total * R2D, arc: arc, from: th0deg };
    }

    function draw() {
      paper(ctx, W, H);
      var cx = 265, cy = 195, SC = 95;
      ring(ctx, cx, cy, 1 * SC, v("--line"), 1);
      /* 궤도 */
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2.5; ctx.beginPath();
      for (var t = 0; t <= 360; t += 2) {
        var r = rAt(t * D2R) * SC, x = cx + r * Math.cos(t * D2R), y = cy - r * Math.sin(t * D2R);
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.stroke();
      /* 쓸고 간 부채꼴 */
      var p = path || sweep(start), upto = path ? shown : 0;
      if (upto > 0) {
        ctx.save(); ctx.beginPath(); ctx.moveTo(cx, cy);
        for (var i = 0; i <= upto; i++) {
          var q = p.pts[i];
          ctx.lineTo(cx + q.r * SC * Math.cos(q.th), cy - q.r * SC * Math.sin(q.th));
        }
        ctx.closePath();
        ctx.fillStyle = v("--teal"); ctx.globalAlpha = .45; ctx.fill();
        ctx.globalAlpha = 1; ctx.strokeStyle = v("--teal-700"); ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();
      }
      dot(ctx, cx, cy, 11, v("--amber"));
      text(ctx, "☀", cx - 6, cy + 5, { s: 12, w: "900", c: v("--on-accent") });
      /* 근일점·원일점 표시 */
      line(ctx, cx, cy, cx + rAt(0) * SC, cy, v("--mist"), 1, [4, 4]);
      text(ctx, "근일점", cx + rAt(0) * SC + 6, cy + 4, { s: 10.5, c: v("--mist") });
      text(ctx, "원일점", cx - rAt(Math.PI) * SC - 6, cy + 4, { s: 10.5, c: v("--mist"), a: "right" });
      /* 현재 행성 */
      var cur = p.pts[upto];
      dot(ctx, cx + cur.r * SC * Math.cos(cur.th), cy - cur.r * SC * Math.sin(cur.th), 7, v("--coral"));
      text(ctx, "🔴 화성", 24, 28, { s: 12, w: "800", c: v("--coral-700") });
      text(ctx, "60일 동안 쓸고 간 넓이", 24, 372, { s: 11.5, w: "800", c: v("--teal-700") });

      /* 오른쪽 패널 */
      var x0 = 480;
      text(ctx, "측정 기록", x0, 40, { s: 14, w: "900" });
      function row(y, label, rec, col) {
        bar(ctx, x0, y - 22, 390, 78, v("--card-2"), 12);
        text(ctx, label, x0 + 14, y, { s: 12.5, w: "800", c: v(col) });
        if (!rec) { text(ctx, "아직 재지 않았습니다", x0 + 14, y + 24, { s: 12, c: v("--mist") }); return; }
        text(ctx, "쓸고 간 넓이 " + rec.area.toFixed(3) + " AU²", x0 + 14, y + 24, { s: 13, w: "900" });
        text(ctx, "돈 각도 " + rec.deg.toFixed(1) + "°  ·  이동 거리 " + rec.arc.toFixed(3) + " AU", x0 + 14, y + 46, { s: 11.5, c: v("--mist") });
      }
      row(76, "① 근일점 부근에서 출발", got.near, "--coral-700");
      row(186, "② 원일점 부근에서 출발", got.far, "--brand-700");
      if (got.near && got.far) {
        bar(ctx, x0, 250, 390, 96, v("--teal-100"), 14);
        text(ctx, "넓이는 " + got.near.area.toFixed(3) + " AU² = " + got.far.area.toFixed(3) + " AU² — 같다", x0 + 14, 276, { s: 13, w: "900", c: v("--teal-700") });
        text(ctx, "그런데 돈 각도는 " + got.near.deg.toFixed(1) + "° 대 " + got.far.deg.toFixed(1) + "°,", x0 + 14, 300, { s: 12, c: v("--teal-700") });
        text(ctx, "이동 거리는 " + got.near.arc.toFixed(3) + " AU 대 " + got.far.arc.toFixed(3) + " AU.", x0 + 14, 320, { s: 12, c: v("--teal-700") });
        text(ctx, "가까울수록 빠르게 움직인다.", x0 + 14, 340, { s: 12, w: "800", c: v("--teal-700") });
      }
    }
    canvas._redraw = draw;

    function say(rec) {
      if (!rec) { $("a-area-info").innerHTML = "출발 자리를 정하고 버튼을 누르세요. 여러 번 잴 수 있습니다."; return; }
      var where = (rec.from <= 30 || rec.from >= 330) ? "근일점 부근" : (rec.from >= 150 && rec.from <= 210 ? "원일점 부근" : "중간 자리");
      $("a-area-info").innerHTML = "<b>" + rec.from + "°(" + where + ")에서 60일</b> → 쓸고 간 넓이 <b>" + rec.area.toFixed(3) +
        " AU²</b>, 돈 각도 " + rec.deg.toFixed(1) + "°, 이동 거리 " + rec.arc.toFixed(3) + " AU (평균 속도 " +
        (rec.arc * 1.496e8 / (DT * 86400)).toFixed(1) + " km/s)<br>" +
        (where === "중간 자리" ? "근일점 부근(0°~30°, 330°~350°)과 원일점 부근(150°~210°)에서도 재어 미션을 끝내세요." :
          (got.near && got.far ? "두 기록을 오른쪽에서 비교해 보세요." : "이제 반대쪽에서도 재어 보세요."));
    }
    function check() {
      if (got.near) done("m1-3a");
      if (got.far) done("m1-3b");
      if (got.near && got.far) {
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>출발 자리가 달라도 60일 동안 쓸고 간 넓이는 <b>" +
          got.near.area.toFixed(3) + " AU²</b>로 같았습니다. 대신 근일점 쪽에서 더 많이 돌고 더 멀리 갔지요. 이것이 <b>면적 속도 일정 법칙</b>(제2법칙)입니다.");
        ep.clear(2);
      }
    }
    $("a-start").addEventListener("input", function (ev) {
      start = +ev.target.value; $("a-start-val").textContent = start + "°";
      if (busy) return;                       // 애니메이션 중에는 그림만 그대로 둔다
      path = null; shown = 0; draw();
    });
    $("a-sweep").addEventListener("click", function () {
      if (busy) return;
      busy = true; $("a-sweep").disabled = true;
      path = sweep(start); shown = 0;
      (function step() {
        shown = Math.min(N, shown + 16);
        draw();
        if (shown < N) window.setTimeout(step, 18);
        else {
          busy = false; $("a-sweep").disabled = false;
          var rec = { area: path.area, deg: path.deg, arc: path.arc, from: path.from };
          if (rec.from <= 30 || rec.from >= 330) got.near = rec;
          else if (rec.from >= 150 && rec.from <= 210) got.far = rec;
          window.sthState("kepArea", got);
          draw(); say(rec); check();
        }
      })();
    });
    draw(); check();
    if (got.near || got.far) say(got.far || got.near);
  })();

  /* ---------------- 장면 4 — 조화 법칙 ---------------- */
  (function () {
    var canvas = $("a-law3"); if (!canvas) return;
    var ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var BODIES = [
      { n: "수성", a: 0.387, p: 0.241 }, { n: "금성", a: 0.723, p: 0.615 },
      { n: "지구", a: 1.000, p: 1.000 }, { n: "화성", a: 1.524, p: 1.881 },
      { n: "목성", a: 5.203, p: 11.862 }, { n: "토성", a: 9.537, p: 29.457 },
      { n: "천왕성", a: 19.191, p: 84.011 }, { n: "해왕성", a: 30.07, p: 164.79 },
      { n: "명왕성", a: 39.48, p: 248.0 }
    ];
    var n = 1, okN = !!window.sthState("kepN");

    function worst(nn) {
      var m = 0;
      BODIES.forEach(function (b) { m = Math.max(m, Math.abs(Math.pow(b.a, nn) / b.p - 1) * 100); });
      return m;
    }
    function draw() {
      paper(ctx, W, H);
      var x0 = 90, x1 = 630, y0 = 44, y1 = 336;
      var lxA = -0.55, lxB = 1.75, lyA = -0.85, lyB = 2.65;
      function px(la) { return x0 + (la - lxA) / (lxB - lxA) * (x1 - x0); }
      function py(lp) { return y1 - (lp - lyA) / (lyB - lyA) * (y1 - y0); }
      /* 눈금 */
      [-0.5, 0, 0.5, 1, 1.5].forEach(function (la) {
        line(ctx, px(la), y0, px(la), y1, v("--line"), 1, [3, 4]);
        text(ctx, Math.pow(10, la) < 1 ? Math.pow(10, la).toFixed(1) : String(Math.round(Math.pow(10, la))), px(la), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      });
      [-0.5, 0, 0.5, 1, 1.5, 2, 2.5].forEach(function (lp) {
        line(ctx, x0, py(lp), x1, py(lp), v("--line"), 1, [3, 4]);
        text(ctx, Math.pow(10, lp) < 1 ? Math.pow(10, lp).toFixed(1) : String(Math.round(Math.pow(10, lp))), x0 - 8, py(lp) + 4, { s: 10.5, c: v("--mist"), a: "right" });
      });
      line(ctx, x0, y0, x0, y1, v("--mist"), 1.5);
      line(ctx, x0, y1, x1, y1, v("--mist"), 1.5);
      text(ctx, "긴반지름 a (AU) — 로그 눈금", (x0 + x1) / 2, y1 + 38, { s: 11.5, w: "800", c: v("--mist"), a: "center" });
      ctx.save(); ctx.translate(26, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2);
      text(ctx, "공전 주기 P (년) — 로그 눈금", 0, 0, { s: 11.5, w: "800", c: v("--mist"), a: "center" });
      ctx.restore();
      /* 직선 P = a^n (그림 상자 안으로만 그린다) */
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(px(lxA), py(n * lxA)); ctx.lineTo(px(lxB), py(n * lxB)); ctx.stroke();
      ctx.restore();
      text(ctx, "P = a^" + n.toFixed(2), x1 - 6, clamp(py(n * lxB) + (n > 1.55 ? 24 : -10), y0 + 16, y1 - 8), { s: 12.5, w: "900", c: v("--brand-700"), a: "right" });
      /* 점 */
      BODIES.forEach(function (b) {
        var x = px(Math.log(b.a) / Math.LN10), y = py(Math.log(b.p) / Math.LN10);
        dot(ctx, x, y, 6, v("--coral"));
        text(ctx, b.n, x + 9, y + 4, { s: 10.5, c: v("--coral-700"), w: "800" });
      });
      /* 오른쪽 — 오차 */
      var bx = 655;
      text(ctx, "주기 예측 오차", bx, 40, { s: 12.5, w: "900" });
      BODIES.forEach(function (b, i) {
        var pr = Math.pow(b.a, n), er = (pr / b.p - 1) * 100, yy = 68 + i * 30;
        text(ctx, b.n, bx, yy, { s: 11.5 });
        var mid = bx + 100, wd = clamp(Math.abs(er) / 60, 0, 1) * 48;
        line(ctx, mid, yy - 12, mid, yy + 4, v("--line"), 1);
        bar(ctx, er >= 0 ? mid : mid - wd, yy - 10, wd, 11, Math.abs(er) <= 5 ? v("--green") : v("--rose"), 3);
        text(ctx, (er >= 0 ? "+" : "") + er.toFixed(1) + "%", bx + 218, yy, { s: 11.5, a: "right", w: "800", c: Math.abs(er) <= 5 ? v("--green-700") : v("--rose-700") });
      });
      var wv = worst(n);
      text(ctx, wv <= 5 ? "✅ 모두 5% 이내" : "최대 오차 " + wv.toFixed(1) + "%", bx, 68 + 9 * 30 + 6, { s: 13, w: "900", c: wv <= 5 ? v("--green-700") : v("--rose-700") });

      $("a-law3-info").innerHTML = "지수 <b>n = " + n.toFixed(2) + "</b> — 최대 오차 <b>" + wv.toFixed(1) + "%</b>. " +
        (wv <= 5 ? "🎉 아홉 천체가 한 직선 위에 놓였습니다. n = 1.5 는 곧 <b>P = a<sup>1.5</sup>, 즉 P² = a³</b> 입니다. a³/P² 값이 태양계의 모든 천체에서 <b>1 (AU³/년²)</b> 로 같습니다."
          : "아직 직선이 점들을 비껴갑니다. 기울기(n)를 바꿔 보세요. 바깥쪽 행성일수록 어긋남이 크게 보입니다.");
    }
    canvas._redraw = draw;
    function check() { if (okN) { done("m1-4a"); all(); } }
    $("a-n").addEventListener("input", function (ev) {
      n = Math.round(+ev.target.value * 100) / 100; $("a-n-val").textContent = n.toFixed(2); draw();
      if (!okN && worst(n) <= 5) { okN = true; window.sthState("kepN", 1); check(); }
    });
    draw(); check();
  })();

  /* 핼리 혜성 계산기 */
  (function () {
    var canvas = $("a-halley"); if (!canvas) return;
    var ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var HE = 0.967;
    var a = 1, okH = window.sthState("kepHa") || 0;
    var MARK = [{ n: "지구", r: 1.00 }, { n: "화성", r: 1.524 }, { n: "목성", r: 5.203 }, { n: "토성", r: 9.537 }, { n: "해왕성", r: 30.07 }];

    function px(r) { var x0 = 80, x1 = 850; return x0 + (Math.log(clamp(r, 0.1, 100)) / Math.LN10 + 1) / 3 * (x1 - x0); }
    function draw() {
      paper(ctx, W, H);
      var P = Math.pow(a, 1.5), q = a * (1 - HE), Q = a * (1 + HE);
      line(ctx, 80, 190, 850, 190, v("--mist"), 1.5);
      [0.1, 1, 10, 100].forEach(function (r) {
        line(ctx, px(r), 70, px(r), 195, v("--line"), 1, [3, 4]);
        text(ctx, r + " AU", px(r), 212, { s: 10.5, c: v("--mist"), a: "center" });
      });
      dot(ctx, px(0.1), 190, 9, v("--amber"));
      text(ctx, "☀ 태양 쪽", px(0.1), 168, { s: 10.5, c: v("--amber-700"), a: "center" });
      MARK.forEach(function (m, i) {
        dot(ctx, px(m.r), 190, 5, v("--cold"));
        text(ctx, m.n, px(m.r), 190 - (i % 2 ? 12 : 26), { s: 10.5, c: v("--mist"), a: "center" });
      });
      /* 핼리 궤도 구간 */
      bar(ctx, px(q), 108, Math.max(4, px(Q) - px(q)), 20, v("--violet"), 10);
      text(ctx, "☄️ 핼리 혜성이 오가는 구간", clamp(px(q), 70, 640), 98, { s: 11.5, w: "800", c: v("--violet-700") });
      text(ctx, "근일점 " + q.toFixed(2) + " AU", clamp(px(q), 60, 830), 144, { s: 10.5, c: v("--violet-700"), a: "center" });
      text(ctx, "원일점 " + Q.toFixed(1) + " AU", clamp(px(Q), 60, 830), 144, { s: 10.5, c: v("--violet-700"), a: "center" });
      /* 주기 표시 */
      bar(ctx, 80, 232, 360, 52, v("--card-2"), 14);
      text(ctx, "긴반지름 a = " + a.toFixed(1) + " AU", 96, 254, { s: 12.5, w: "800" });
      text(ctx, "→ 공전 주기 P = a^1.5 = " + P.toFixed(1) + " 년", 96, 274, { s: 13.5, w: "900", c: v("--brand-700") });
      bar(ctx, 460, 232, 390, 52, Math.abs(P - 76) <= 1 ? v("--green-100") : v("--card-2"), 14);
      text(ctx, "관측된 주기 76년", 476, 254, { s: 12.5, w: "800" });
      text(ctx, Math.abs(P - 76) <= 1 ? "✅ 맞았습니다 (차이 " + Math.abs(P - 76).toFixed(1) + "년)" : "차이 " + (P - 76).toFixed(1) + "년",
        476, 274, { s: 13.5, w: "900", c: Math.abs(P - 76) <= 1 ? v("--green-700") : v("--rose-700") });

      $("a-halley-info").innerHTML = "긴반지름 <b>" + a.toFixed(1) + " AU</b> → 조화 법칙으로 계산한 주기 <b>" + P.toFixed(1) + "년</b>" +
        " (근일점 " + q.toFixed(2) + " AU, 원일점 " + Q.toFixed(1) + " AU, 이심률 0.967로 계산)<br>" +
        (Math.abs(P - 76) <= 1 ? "🎉 핼리 혜성의 긴반지름은 약 <b>17.8 AU</b>입니다. 태양에 금성보다 가까이 다가왔다가 <b>해왕성 바깥까지</b> 나갔다 오는 셈이지요. 혜성도 행성과 <b>같은 법칙</b>을 따릅니다."
          : (P < 76 ? "아직 주기가 짧습니다. 더 멀리 나가는 궤도로 키워 보세요." : "주기가 너무 깁니다. 궤도를 줄여 보세요."));
    }
    canvas._redraw = draw;
    function check() { if (okH) { done("m1-4b"); all(); } }
    $("a-ha").addEventListener("input", function (ev) {
      a = Math.round(+ev.target.value * 10) / 10; $("a-ha-val").textContent = a.toFixed(1); draw();
      if (!okH && Math.abs(Math.pow(a, 1.5) - 76) <= 1) { okH = a; window.sthState("kepHa", a); check(); }
    });
    draw(); check();
  })();

  var okQ = !!window.sthState("kepQ");
  window.sthPick({
    mount: "a-q1",
    q: "수성부터 명왕성, 그리고 핼리 혜성까지 a³/P² 이 모두 같은 값이 나옵니다. 이것은 무엇을 뜻할까요?",
    options: [
      "천체들이 서로 약속이나 한 듯 같은 속도로 움직인다는 뜻이다",
      "이 천체들이 모두 <b>태양이라는 하나의 중심 천체의 중력</b>에 매여 있고, 그 공통의 값은 태양의 질량으로 정해진다",
      "태양계의 모든 천체는 질량이 같다는 뜻이다",
      "우연히 맞아떨어진 것이라 다른 항성계에서는 성립하지 않는다"
    ],
    answer: 1,
    why: [
      "속도는 천체마다 다릅니다. 수성은 초속 47 km, 해왕성은 초속 5.4 km로 움직입니다.",
      "뉴턴이 보인 대로 a³/P² = GM/4π² 입니다. 여기서 M은 태양의 질량이므로, 이 값이 모두 같다는 것은 <b>같은 태양의 중력</b>이 이들을 붙잡고 있다는 뜻입니다. 실제로 이 관계를 거꾸로 쓰면 태양의 질량을 구할 수 있습니다.",
      "질량은 전혀 다릅니다. 목성은 수성의 6천 배가 넘습니다.",
      "다른 항성계에서도 성립합니다. 다만 그 상수는 그 별의 질량으로 정해지므로 값이 달라집니다."
    ],
    onDone: function () { okQ = true; window.sthState("kepQ", 1); done("m1-4c"); all(); }
  });
  if (okQ) done("m1-4c");

  function all() {
    if (window.sthState("kepN") && window.sthState("kepHa") && window.sthState("kepQ")) {
      window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>n = 1.5, 곧 <b>P² = a³</b>. 핼리 혜성의 긴반지름은 약 <b>" +
        (window.sthState("kepHa") || 17.8).toFixed(1) + " AU</b>. 같은 식 하나가 수성부터 혜성까지를 한 줄에 꿰었습니다.");
      ep.clear(3);
    }
  }
  all();

  /* ---------------- 장면 5 — 결말 ---------------- */
  function renderVs() {
    var p = window.sthState("p1") || "";
    $("a-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") +
      (p.indexOf("㉡") === 0 ? " — 정확했습니다. 8분은 관측의 잘못이 아니라 <b>모형의 잘못</b>이었습니다."
        : " — 8분은 관측의 잘못이 아니었습니다. 궤도가 원이 아니었던 것이지요.") +
      "<br><b>내가 찾은 값</b> 화성 이심률 " + ((window.sthState("kepE") || 0).toFixed(3)) +
      " · 지수 n = " + (window.sthState("kepN") ? "1.50" : "-") +
      " · 핼리 혜성 긴반지름 " + (window.sthState("kepHa") ? window.sthState("kepHa").toFixed(1) + " AU" : "-");
  }
  function finish() {
    window.sthState("r1", "해결 · 화성 이심률 " + ((window.sthState("kepE") || 0).toFixed(3)) +
      " · P²=a³ 확인 · 핼리 긴반지름 " + (window.sthState("kepHa") || 17.8).toFixed(1) + " AU");
  }
  function enter() { renderVs(); ep.clear(4); }
  ep.onShow(function (i) { if (i === 4) enter(); });
  if (ep.at() === 4) enter(); else renderVs();

  window.sthWork({
    mount: "wk1", unitLabel: "[행성우주과학 Ⅰ-2] 이야기 ① 8분의 오차",
    items: [
      { id: "w1", label: "케플러 제3법칙 확인", hint: "행성 하나를 골라 공전 주기와 궤도 긴반지름을 넣어 T²과 a³이 비례하는지 계산으로 확인하고, 결과를 쓰세요." },
      { id: "e1b", label: "8분을 버리지 않은 까닭", hint: "티코의 관측 정밀도(2분)와 남은 어긋남(8분)을 견주어, 케플러가 왜 그 8분을 오차로 넘기지 않았는지 두세 문장으로 쓰세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ② 명왕성의 자격 심사 — 행성과 소천체
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });

  window.sthGate({
    gate: "g2", key: "p2", title: "심사 위원의 첫 판단",
    question: "명왕성은 2006년에 행성 자리에서 내려왔습니다. 가장 큰 까닭은 무엇이었을까요?",
    options: [
      "㉠ 다른 행성보다 너무 작아서",
      "㉡ 자기 궤도 주변의 다른 천체들을 치우지 못해서",
      "㉢ 태양이 아니라 카이퍼대를 돌고 있어서"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* ---------------- 장면 2 — IAU 심사대 ---------------- */
  (function () {
    var canvas = $("b-iau"); if (!canvas) return;
    var ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    /* c1: 태양을 직접 도는가 · c2: 자기 중력으로 둥근가(정역학 평형) · c3: 궤도 주변을 치웠는가 */
    var OBJ = [
      { n: "달", d: 3475, c1: false, c2: true, mu: null, kind: "위성", note: "지구를 도는 위성입니다. 조건 ①부터 만족하지 못하므로 행성 후보가 아닙니다." },
      { n: "이토카와", d: 0.33, c1: true, c2: false, mu: null, kind: "소천체", note: "길이 535 m의 땅콩 모양 소행성입니다. 중력이 너무 약해 둥글어지지 못했습니다. 2005년 하야부사가 표본을 가져왔습니다." },
      { n: "베스타", d: 525, c1: true, c2: false, mu: null, kind: "소천체", note: "소행성대에서 둘째로 무겁고 거의 둥글지만, 큰 충돌 자국 때문에 정역학 평형 모양은 아니라고 봅니다. 2011년 돈(Dawn) 탐사선이 찾아갔습니다." },
      { n: "세레스", d: 939, c1: true, c2: true, mu: 0.33, kind: "왜소행성", note: "소행성대에서 가장 큰 천체이자 소행성대의 유일한 왜소행성입니다. 1801년 발견 당시에는 한동안 행성으로 불렸습니다." },
      { n: "하우메아", d: 1560, c1: true, c2: true, mu: null, kind: "왜소행성", note: "4시간에 한 바퀴 도는 빠른 자전 때문에 럭비공처럼 길쭉하지만, 자기 중력과 원심력이 균형을 이룬 모양입니다. 카이퍼대에 있습니다." },
      { n: "명왕성", d: 2377, c1: true, c2: true, mu: 0.077, kind: "왜소행성", note: "카이퍼대에서 가장 잘 알려진 천체입니다. 2015년 뉴호라이즌스가 지나가며 질소 얼음 평원을 찍었습니다." },
      { n: "에리스", d: 2326, c1: true, c2: true, mu: 0.10, kind: "왜소행성", note: "지름은 명왕성과 비슷하지만 질량은 약 27% 더 큽니다. 2005년 발견되어 ‘행성이란 무엇인가’ 논쟁에 불을 붙였습니다." },
      { n: "수성", d: 4879, c1: true, c2: true, mu: 91000, kind: "행성", note: "행성 가운데 가장 작지만, 자기 궤도 영역에서는 압도적인 주인입니다." },
      { n: "지구", d: 12742, c1: true, c2: true, mu: 1700000, kind: "행성", note: "궤도 영역의 다른 천체를 모두 합해도 지구 질량의 100만 분의 1도 되지 않습니다." },
      { n: "목성", d: 139820, c1: true, c2: true, mu: 630000, kind: "행성", note: "트로이군 소행성 수만 개를 궤도에 데리고 다니지만, 질량이 워낙 커서 μ는 여전히 수십만입니다." }
    ];
    var idx = 0, got = window.sthState("iau") || { p: false, dw: false, sb: false };

    function draw() {
      paper(ctx, W, H);
      var o = OBJ[idx];
      /* 천체 그림 */
      var cx = 130, cy = 130, r = clamp(18 + 16 * Math.log(o.d / 0.3) / Math.LN10, 14, 88);
      dot(ctx, cx, cy, r, o.kind === "행성" ? v("--cold") : (o.kind === "왜소행성" ? v("--teal") : v("--mist")));
      ring(ctx, cx, cy, r, v("--line"), 2);
      text(ctx, o.n, cx, cy + r + 26, { s: 16, w: "900", a: "center" });
      text(ctx, "지름 " + (o.d >= 1 ? Math.round(o.d).toLocaleString() + " km" : Math.round(o.d * 1000) + " m"), cx, cy + r + 46, { s: 11.5, c: v("--mist"), a: "center" });

      /* 세 조건 */
      var x0 = 280, labels = [
        ["① 태양을 직접 도는가", o.c1, o.c1 ? "태양을 직접 돈다" : "다른 천체의 위성이다"],
        ["② 자기 중력으로 둥근가", o.c1 && o.c2, o.c2 ? "정역학 평형을 이룬 둥근 모양" : "중력이 약해 둥글어지지 못함"],
        ["③ 궤도 주변을 치웠는가", o.c1 && o.c2 && o.mu != null && o.mu > 1, o.mu != null ? "μ = " + (o.mu >= 1000 ? o.mu.toLocaleString() : o.mu) : "μ가 1보다 훨씬 작다"]
      ];
      labels.forEach(function (L, i) {
        var yy = 44 + i * 62;
        bar(ctx, x0, yy, 580, 50, v("--card-2"), 14);
        var okc = L[1];
        dot(ctx, x0 + 26, yy + 25, 13, okc ? v("--green") : v("--rose"));
        text(ctx, okc ? "✓" : "✕", x0 + 26, yy + 30, { s: 15, w: "900", a: "center", c: v("--on-accent") });
        text(ctx, L[0], x0 + 50, yy + 22, { s: 13, w: "800" });
        text(ctx, L[2], x0 + 50, yy + 40, { s: 11.5, c: v("--mist") });
      });

      /* μ 로그 막대 */
      var bx0 = 60, bx1 = 850, by = 330;
      text(ctx, "궤도 정리 지수 μ (자기 질량 ÷ 같은 궤도 영역의 다른 천체 질량 합) — 로그 눈금", bx0, by - 44, { s: 11.5, w: "800", c: v("--mist") });
      line(ctx, bx0, by + 30, bx1, by + 30, v("--line"), 1.5);
      function mx(m) { return bx0 + (Math.log(clamp(m, 0.01, 1e7)) / Math.LN10 + 2) / 9 * (bx1 - bx0); }
      [0.01, 0.1, 1, 100, 10000, 1000000].forEach(function (m) {
        line(ctx, mx(m), by - 6, mx(m), by + 30, v("--line"), 1, [3, 4]);
        text(ctx, m >= 1 ? m.toLocaleString() : String(m), mx(m), by + 46, { s: 10, c: v("--mist"), a: "center" });
      });
      line(ctx, mx(1), by - 14, mx(1), by + 34, v("--amber"), 2.5);
      text(ctx, "기준 μ = 1", mx(1), by - 20, { s: 10.5, w: "800", c: v("--amber-700"), a: "center" });
      OBJ.forEach(function (b) {
        if (b.mu == null) return;
        var x = mx(b.mu), on = b === o;
        dot(ctx, x, by + 12, on ? 8 : 5, b.mu > 1 ? v("--cold") : v("--teal"));
        if (on) { text(ctx, b.n, x, by - 2, { s: 11.5, w: "900", a: "center", c: v("--brand-700") }); }
      });
      text(ctx, "μ가 알려진 천체만 찍었습니다. 왼쪽은 왜소행성, 오른쪽은 행성입니다.", bx1, by + 66, { s: 10.5, c: v("--mist"), a: "right" });

      var judge = o.kind === "행성" ? "행성" : (o.kind === "왜소행성" ? "왜소행성" : (o.kind === "위성" ? "위성 (행성 후보 아님)" : "태양계 소천체"));
      $("b-iau-info").innerHTML = "<b>" + o.n + " → " + judge + "</b> · " + o.note +
        (o.mu != null ? "<br>μ = " + (o.mu >= 1000 ? o.mu.toLocaleString() : o.mu) + " 이므로, 궤도 영역에 남은 다른 천체들의 질량 합은 자기 질량의 <b>" +
          (o.mu > 1 ? "1/" + Math.round(o.mu).toLocaleString() : Math.round(1 / o.mu) + "배") + "</b> 입니다." : "");
    }
    canvas._redraw = draw;

    function mark() {
      var o = OBJ[idx], ch = false;
      if (!got.p && o.kind === "행성") { got.p = true; ch = true; }
      if (!got.dw && o.kind === "왜소행성") { got.dw = true; ch = true; }
      if (!got.sb && o.kind === "소천체") { got.sb = true; ch = true; }
      if (ch) window.sthState("iau", got);
      check();
    }
    function check() {
      if (got.p) done("m2-2a");
      if (got.dw) done("m2-2b");
      if (got.sb) done("m2-2c");
      if (got.p && got.dw && got.sb) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>같은 세 조건을 대는 것만으로 <b>행성 · 왜소행성 · 태양계 소천체</b>가 갈립니다. 명왕성이 걸린 것은 ③번이었습니다.");
        ep.clear(1);
      }
    }
    $("b-obj").addEventListener("input", function (ev) {
      idx = +ev.target.value; $("b-obj-val").textContent = OBJ[idx].n; draw(); mark();
    });
    $("b-obj-val").textContent = OBJ[idx].n;
    draw(); check();
  })();

  /* ---------------- 장면 3 — 밀도·표면 중력 + 관측 기록 ---------------- */
  (function () {
    var canvas = $("b-dens"); if (!canvas) return;
    var ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var G = 6.674e-11;
    /* r: 평균 반지름(km), m: 질량(10²¹ kg) */
    var B = [
      { n: "수성", r: 2439.7, m: 330.1, g: "지구형", c: "--mist" },
      { n: "금성", r: 6051.8, m: 4867, g: "지구형", c: "--coral" },
      { n: "지구", r: 6371.0, m: 5972, g: "지구형", c: "--cold" },
      { n: "화성", r: 3389.5, m: 641.7, g: "지구형", c: "--coral" },
      { n: "목성", r: 69911, m: 1898000, g: "목성형", c: "--amber" },
      { n: "토성", r: 58232, m: 568300, g: "목성형", c: "--amber" },
      { n: "천왕성", r: 25362, m: 86810, g: "목성형", c: "--teal" },
      { n: "해왕성", r: 24622, m: 102400, g: "목성형", c: "--cold" },
      { n: "명왕성", r: 1188.3, m: 13.03, g: "왜소행성", c: "--violet" },
      { n: "세레스", r: 469.7, m: 0.938, g: "왜소행성", c: "--violet" },
      { n: "류구", r: 0.448, m: 4.5e-10, g: "소행성", c: "--mist" },
      { n: "베누", r: 0.2447, m: 7.33e-11, g: "소행성", c: "--mist" }
    ];
    function dens(p) { var rM = p.r * 1000; return p.m * 1e21 / (4 / 3 * Math.PI * rM * rM * rM) / 1000; }
    function grav(p) { var rM = p.r * 1000; return G * p.m * 1e21 / (rM * rM); }
    var EG = grav(B[2]);
    var idx = 0, cut = 0.5, okCut = !!window.sthState("cut");

    function splitOK(c) {
      var hi = [], i;
      for (i = 0; i < 8; i++) if (dens(B[i]) >= c) hi.push(B[i].g);
      if (hi.length !== 4) return false;
      for (i = 0; i < 4; i++) if (hi[i] !== "지구형") return false;
      return true;
    }

    function draw() {
      paper(ctx, W, H);
      var p = B[idx], d = dens(p), gg = grav(p);
      /* 왼쪽 — 고른 천체 (반지름 제곱근 눈금) */
      var cx = 165, cy = 150, KS = 96 / Math.sqrt(B[4].r);
      var rp = Math.max(9, Math.sqrt(p.r) * KS);
      dot(ctx, cx, cy, rp, v(p.c));
      ring(ctx, cx, cy, rp, v("--line"), 2);
      var re = Math.max(9, Math.sqrt(B[2].r) * KS);
      ctx.save(); ctx.setLineDash([4, 4]); ring(ctx, cx, cy, re, v("--mist"), 1.5); ctx.restore();
      var base = cy + Math.max(rp, re);
      text(ctx, p.n, cx, base + 26, { s: 17, w: "900", a: "center" });
      text(ctx, "점선 = 지구 크기", cx, base + 44, { s: 10, c: v("--mist"), a: "center" });
      text(ctx, "반지름 " + (p.r >= 1 ? p.r.toLocaleString() + " km" : Math.round(p.r * 1000) + " m"), cx, base + 64, { s: 11.5, c: v("--mist"), a: "center" });
      text(ctx, "(원의 크기는 제곱근 눈금)", cx, base + 82, { s: 10, c: v("--mist"), a: "center" });

      /* 오른쪽 — 밀도 막대 */
      var x0 = 400, x1 = 840, y0 = 40, rowH = 28;
      text(ctx, "평균 밀도 (g/cm³)", x0, y0 - 28, { s: 12, w: "900" });
      function bx(dd) { return x0 + clamp(dd / 6, 0, 1) * (x1 - x0); }
      [0, 1, 2, 3, 4, 5, 6].forEach(function (t) {
        line(ctx, bx(t), y0, bx(t), y0 + 12 * rowH, v("--line"), 1, [3, 4]);
        text(ctx, String(t), bx(t), y0 + 12 * rowH + 16, { s: 10, c: v("--mist"), a: "center" });
      });
      B.forEach(function (b, i) {
        var yy = y0 + i * rowH + 4, dd = dens(b), on = i === idx;
        text(ctx, b.n, x0 - 10, yy + 14, { s: 11.5, a: "right", w: on ? "900" : "500", c: on ? v("--brand-700") : v("--ink") });
        bar(ctx, x0, yy, bx(dd) - x0, 18, i < 8 ? (dd >= cut ? v("--coral") : v("--cold")) : v("--mist"), 5);
        text(ctx, dd.toFixed(2), bx(dd) + 8, yy + 14, { s: 11, c: v("--mist") });
        if (on) ring(ctx, x0 - 26, yy + 9, 5, v("--brand"), 2.5);
      });
      line(ctx, bx(cut), y0 - 4, bx(cut), y0 + 12 * rowH, v("--amber"), 3);
      text(ctx, "기준 " + cut.toFixed(1), bx(cut), y0 - 10, { s: 11, w: "900", c: v("--amber-700"), a: "center" });
      text(ctx, "위 8줄만 행성입니다. 아래 4줄은 왜소행성·소행성.", x1, y0 + 12 * rowH + 34, { s: 10.5, c: v("--mist"), a: "right" });

      $("b-d1").textContent = d.toFixed(2) + " g/cm³";
      $("b-d2").textContent = (gg / EG) < 0.01 ? (gg / EG).toExponential(1) + "배" : (gg / EG).toFixed(2) + "배";
      $("b-d3").textContent = p.g;

      var n4 = 0, i;
      for (i = 0; i < 8; i++) if (dens(B[i]) >= cut) n4++;
      $("b-dens-info").innerHTML = "<b>" + p.n + "</b> — 밀도 = 질량 ÷ (4/3·π·r³) = <b>" + d.toFixed(2) + " g/cm³</b>, 표면 중력 = G·질량 ÷ 반지름² = <b>" +
        gg.toExponential(2) + " m/s²</b> (지구의 " + ((gg / EG) < 0.01 ? (gg / EG).toExponential(1) : (gg / EG).toFixed(2)) + "배)<br>" +
        (d >= 3 ? "밀도가 3 g/cm³을 넘습니다 — 암석과 금속이 주를 이루는 단단한 천체입니다." :
          (d >= 1.5 ? "밀도가 얼음과 암석 사이입니다 — 얼음이 많이 섞인 천체로 볼 수 있습니다." :
            "밀도가 물(1.00)에 가깝거나 더 낮습니다 — 기체와 얼음이 주를 이루거나, 속에 빈틈이 많다는 뜻입니다.")) +
        "<br>기준선 " + cut.toFixed(1) + " g/cm³ 위쪽에 행성 <b>" + n4 + "개</b>가 있습니다. " +
        (splitOK(cut) ? "✅ 지구형 4개와 목성형 4개가 정확히 갈렸습니다." : "지구형 4개만 위에 남도록 기준선을 옮겨 보세요.");
    }
    canvas._redraw = draw;
    function check() {
      if (okCut) done("m2-3a");
      both();
    }
    $("b-body").addEventListener("input", function (ev) { idx = +ev.target.value; $("b-body-val").textContent = B[idx].n; draw(); });
    $("b-cut").addEventListener("input", function (ev) {
      cut = Math.round(+ev.target.value * 10) / 10; $("b-cut-val").textContent = cut.toFixed(1); draw();
      if (!okCut && splitOK(cut)) { okCut = true; window.sthState("cut", 1); check(); }
    });
    $("b-body-val").textContent = B[idx].n;
    draw(); check();
  })();

  var okSort1 = !!window.sthState("obs4");
  window.sthSort({
    mount: "b-sort1",
    buckets: [
      { id: "me", label: "수성", sub: "지구형 · 태양에서 가장 가깝다" },
      { id: "ma", label: "화성", sub: "지구형 · 붉은 사막" },
      { id: "ju", label: "목성", sub: "목성형 · 가장 크다" },
      { id: "sa", label: "토성", sub: "목성형 · 고리" }
    ],
    items: [
      { t: "대기가 거의 없어 표면이 크레이터로 뒤덮여 달과 비슷하다. 낮과 밤의 온도 차가 600℃에 이른다.", a: "me", why: "대기가 붙잡히지 못할 만큼 작고 태양에 가까운 수성입니다.", hint: "대기가 거의 없다는 점에 주목하세요." },
      { t: "붉은 사막 같은 표면과 극지방의 하얀 극관이 보이고, 태양계에서 가장 큰 화산과 거대한 협곡이 있다.", a: "ma", why: "극관과 올림푸스산이 있는 화성입니다." },
      { t: "대적점이라는 거대한 소용돌이가 수백 년째 돌고 있고, 위성이 90개가 넘는다.", a: "ju", why: "대적점은 목성의 표지입니다." },
      { t: "평균 밀도가 0.69 g/cm³로 물보다 작고, 두꺼운 대기를 가진 위성 타이탄을 거느린다.", a: "sa", why: "여덟 행성 가운데 밀도가 가장 작은 토성입니다.", hint: "위 막대그래프에서 밀도가 가장 작은 행성을 찾아보세요." }
    ],
    onDone: function () { okSort1 = true; window.sthState("obs4", 1); done("m2-3b"); both(); }
  });
  if (okSort1) done("m2-3b");

  function both() {
    if (window.sthState("cut") && window.sthState("obs4")) {
      window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>밀도 <b>1.6과 3.9 사이</b>에 선을 그으면 지구형 4개와 목성형 4개가 갈립니다. 겉모습이 아니라 <b>밀도</b>가 천체의 속을 알려 줍니다.");
      ep.clear(2);
    }
  }
  both();

  /* ---------------- 장면 4 — 공극률 + 혜성 꼬리 ---------------- */
  (function () {
    var canvas = $("b-rubble"); if (!canvas) return;
    var ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var GRAIN = 2.7, TARGET = 1.19;
    var f = 0, okF = window.sthState("por") || 0;
    var SEEDS = [];
    (function () {
      var s = 12345;
      for (var i = 0; i < 260; i++) {
        s = (s * 1103515245 + 12345) % 2147483648;
        var u = s / 2147483648;
        s = (s * 1103515245 + 12345) % 2147483648;
        var w = s / 2147483648;
        s = (s * 1103515245 + 12345) % 2147483648;
        SEEDS.push({ a: u * Math.PI * 2, q: Math.sqrt(w), r: 4 + (s / 2147483648) * 9 });
      }
    })();

    function draw() {
      paper(ctx, W, H);
      var d = GRAIN * (1 - f / 100);
      /* 단면 */
      var cx = 150, cy = 150, R = 118;
      ring(ctx, cx, cy, R, v("--line"), 2);
      var keep = Math.round(SEEDS.length * (1 - f / 100));
      SEEDS.forEach(function (p, i) {
        if (i >= keep) return;
        var x = cx + p.q * (R - 14) * Math.cos(p.a), y = cy + p.q * (R - 14) * Math.sin(p.a);
        dot(ctx, x, y, p.r, v("--mist"));
        ring(ctx, x, y, p.r, v("--line"), 1);
      });
      text(ctx, "류구의 단면 (모형)", cx, 24, { s: 12.5, w: "900", a: "center" });
      text(ctx, "빈틈 " + f + "%", cx, cy + R + 26, { s: 12, w: "800", a: "center", c: v("--brand-700") });

      /* 밀도 막대 */
      var x0 = 340, x1 = 860;
      function bx(dd) { return x0 + clamp(dd / 3, 0, 1) * (x1 - x0); }
      text(ctx, "평균 밀도 (g/cm³)", x0, 44, { s: 12.5, w: "900" });
      [0, 1, 2, 3].forEach(function (t) { line(ctx, bx(t), 54, bx(t), 210, v("--line"), 1, [3, 4]); text(ctx, String(t), bx(t), 228, { s: 10.5, c: v("--mist"), a: "center" }); });
      text(ctx, "돌 알갱이 자체", x0 - 10, 80, { s: 11.5, a: "right" });
      bar(ctx, x0, 64, bx(GRAIN) - x0, 22, v("--coral"), 6);
      text(ctx, GRAIN.toFixed(2), bx(GRAIN) + 8, 80, { s: 11.5, c: v("--mist") });
      text(ctx, "내 모형", x0 - 10, 126, { s: 11.5, a: "right", w: "900", c: v("--brand-700") });
      bar(ctx, x0, 110, bx(d) - x0, 22, v("--brand"), 6);
      text(ctx, d.toFixed(2), bx(d) + 8, 126, { s: 11.5, c: v("--mist") });
      text(ctx, "탐사선이 잰 값", x0 - 10, 172, { s: 11.5, a: "right" });
      bar(ctx, x0, 156, bx(TARGET) - x0, 22, v("--teal"), 6);
      text(ctx, TARGET.toFixed(2), bx(TARGET) + 8, 172, { s: 11.5, c: v("--mist") });
      line(ctx, bx(TARGET), 54, bx(TARGET), 210, v("--teal-700"), 2.5);

      var ok = Math.abs(d - TARGET) <= 0.03;
      text(ctx, ok ? "✅ 맞췄습니다 (차이 " + Math.abs(d - TARGET).toFixed(3) + ")" : "차이 " + (d - TARGET).toFixed(2) + " g/cm³",
        x0, 264, { s: 13.5, w: "900", c: ok ? v("--green-700") : v("--rose-700") });

      $("b-por-info").innerHTML = "빈틈 비율 <b>" + f + "%</b> → 평균 밀도 = 2.7 × (1 − " + (f / 100).toFixed(2) + ") = <b>" + d.toFixed(2) + " g/cm³</b><br>" +
        (ok ? "🎉 류구의 속은 <b>절반 넘게 비어 있습니다.</b> 통째로 된 바윗덩이가 아니라, 부서진 돌덩이들이 약한 중력으로 헐겁게 모인 <b>돌무더기(rubble pile)</b>인 것이죠. 하야부사2가 표면에 총알을 쏘았을 때 예상보다 훨씬 많은 물질이 튀어 오른 것도 이 때문입니다."
          : (d > TARGET ? "아직 밀도가 너무 큽니다. 빈틈을 더 늘려 보세요." : "빈틈이 너무 많습니다. 조금 줄여 보세요."));
    }
    canvas._redraw = draw;
    function check() { if (okF) { done("m2-4a"); two(); } }
    $("b-por").addEventListener("input", function (ev) {
      f = +ev.target.value; $("b-por-val").textContent = f + "%"; draw();
      if (!okF && Math.abs(GRAIN * (1 - f / 100) - TARGET) <= 0.03) { okF = f; window.sthState("por", f); check(); }
    });
    draw(); check();
  })();

  (function () {
    var canvas = $("b-comet"); if (!canvas) return;
    var ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var HA = 17.8, HE = 0.967;
    var th = 0, okT = !!window.sthState("tail");
    function rAt(t) { return HA * (1 - HE * HE) / (1 + HE * Math.cos(t)); }

    function draw() {
      paper(ctx, W, H);
      var t = th * D2R, r = rAt(t);
      /* ---- 위: 궤도 지도 ---- */
      var SC = 15, cx = 450, cy = 84, c = HA * HE * SC;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.beginPath();
      ctx.ellipse(cx, cy, HA * SC, HA * Math.sqrt(1 - HE * HE) * SC, 0, 0, Math.PI * 2); ctx.stroke();
      var sx = cx + c, sy = cy;
      [{ n: "목성 궤도", r: 5.203 }, { n: "해왕성 궤도", r: 30.07 }].forEach(function (m, i) {
        var mxp = sx - m.r * SC;
        line(ctx, mxp, sy - 9, mxp, sy + 9, v("--cold"), 2);
        text(ctx, m.n, mxp, sy + (i ? -16 : 26), { s: 10, c: v("--mist"), a: "center" });
      });
      dot(ctx, sx, sy, 8, v("--amber"));
      text(ctx, "☀ 태양", sx - 10, sy - 14, { s: 10.5, w: "800", c: v("--amber-700"), a: "right" });
      text(ctx, "핼리 혜성 궤도 (긴반지름 17.8 AU)", 24, 22, { s: 10.5, c: v("--mist") });
      text(ctx, "세로 막대 = 목성·해왕성까지의 거리", 24, 40, { s: 10.5, c: v("--mist") });
      var mpx = sx + r * SC * Math.cos(t), mpy = sy - r * SC * Math.sin(t);
      dot(ctx, mpx, mpy, 6, v("--violet"));

      /* ---- 아래: 확대 그림 ---- */
      var zx = 330, zy = 275;
      bar(ctx, 20, 162, 860, 230, v("--card-2"), 16);
      text(ctx, "확대해 본 혜성 — 꼬리는 태양의 반대쪽으로 밀려난다", 38, 186, { s: 12, w: "800", c: v("--mist") });
      /* 혜성 → 태양 단위 벡터 (화면 좌표: 아래가 y+) */
      var ux = -Math.cos(t), uy = Math.sin(t);
      /* 속도 방향: 타원 위에서 (−sinθ, e+cosθ) — 화면 좌표로 뒤집는다 */
      var vmx = -Math.sin(t), vmy = HE + Math.cos(t);
      var vn = Math.sqrt(vmx * vmx + vmy * vmy);
      var vsx = vmx / vn, vsy = -vmy / vn;
      /* 태양 */
      dot(ctx, zx + ux * 95, zy + uy * 95, 13, v("--amber"));
      text(ctx, "☀", zx + ux * 95, zy + uy * 95 + 5, { s: 14, a: "center", w: "900", c: v("--on-accent") });
      line(ctx, zx, zy, zx + ux * 80, zy + uy * 80, v("--amber"), 1.5, [4, 4]);
      /* 꼬리 (태양 반대쪽) */
      var tl = clamp(60 / (r * r) + 34, 0, 86), vis = r <= 2.6;
      if (vis) {
        ctx.save(); ctx.globalAlpha = .65; ctx.lineCap = "round";
        ctx.strokeStyle = v("--cold"); ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(zx, zy); ctx.lineTo(zx - ux * tl, zy - uy * tl); ctx.stroke();
        /* 먼지 꼬리: 태양 반대쪽에서 진행 방향 반대로 조금 휜다 */
        var dxx = -ux * 0.87 - vsx * 0.5, dyy = -uy * 0.87 - vsy * 0.5, dn = Math.sqrt(dxx * dxx + dyy * dyy);
        ctx.strokeStyle = v("--amber"); ctx.lineWidth = 11;
        ctx.beginPath(); ctx.moveTo(zx, zy); ctx.lineTo(zx + dxx / dn * tl * 0.8, zy + dyy / dn * tl * 0.8); ctx.stroke();
        ctx.restore();
        text(ctx, "꼬리", zx - ux * (tl + 16), zy - uy * (tl + 16), { s: 10.5, w: "800", c: v("--cold"), a: "center" });
      }
      dot(ctx, zx, zy, 9, v("--violet"));
      /* 속도 화살표 */
      ctx.strokeStyle = v("--green"); ctx.fillStyle = v("--green"); ctx.lineWidth = 3.5;
      window.drawArrow(ctx, zx, zy, zx + vsx * 62, zy + vsy * 62, 13);
      text(ctx, "진행 방향", zx + vsx * 76, zy + vsy * 76 + 4, { s: 11, w: "900", c: v("--green-700"), a: "center" });

      var fwd = (-ux) * vsx + (-uy) * vsy;   // 꼬리 방향 · 진행 방향
      var judge = !vis ? "태양에서 멀어 꼬리가 거의 없다" : (fwd > 0.15 ? "꼬리가 진행 방향 ‘앞쪽’" : (fwd < -0.15 ? "꼬리가 진행 방향 ‘뒤쪽’" : "꼬리가 진행 방향과 거의 직각"));
      bar(ctx, 608, 202, 256, 150, v("--panel"), 14);
      text(ctx, "자리 " + th + "°", 624, 230, { s: 12, w: "800", c: v("--mist") });
      text(ctx, "태양까지 " + r.toFixed(2) + " AU", 624, 256, { s: 13, w: "900" });
      text(ctx, th > 0 && th < 180 ? "태양에서 멀어지는 중" : (th > 180 ? "태양으로 다가가는 중" : "근일점"), 624, 282, { s: 11.5, c: v("--mist") });
      text(ctx, judge, 624, 316, { s: 12, w: "900", c: (vis && fwd > 0.15) ? v("--green-700") : v("--ink") });

      $("b-comet-info").innerHTML = "<b>자리 " + th + "° · 태양까지 " + r.toFixed(2) + " AU</b> — " + judge + "<br>" +
        (!vis ? "꼬리는 태양에 가까워져 얼음이 승화할 때에만 생깁니다. 대략 3 AU 안쪽으로 들어와야 보입니다."
          : (fwd > 0.15 ? "🎉 태양에서 <b>멀어지는 동안</b>에는 꼬리가 앞장서서 갑니다. 꼬리가 진행 방향과 상관없이 <b>태양의 반대쪽</b>으로 밀려나기 때문입니다. 이온 꼬리는 태양풍에 밀려 곧게, 먼지 꼬리는 무거워 궤도를 따라 조금 휩니다."
            : "지금은 태양으로 다가가는 중이라 꼬리가 뒤로 처져 있습니다. 근일점을 지나 <b>멀어지는 쪽</b>으로 옮겨 보세요."));

      if (!okT && vis && fwd > 0.15) { okT = true; window.sthState("tail", 1); check(); }
    }
    canvas._redraw = draw;
    function check() { if (okT) { done("m2-4b"); two(); } }
    $("b-pos").addEventListener("input", function (ev) { th = +ev.target.value; $("b-pos-val").textContent = th + "°"; draw(); });
    draw(); check();
  })();

  function two() {
    if (window.sthState("por") && window.sthState("tail")) {
      window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>류구는 속이 <b>절반 넘게 빈 돌무더기</b>였고, 혜성의 꼬리는 진행 방향이 아니라 <b>태양의 반대쪽</b>을 향합니다. 탐사 자료는 겉으로 보이지 않는 것을 알려 줍니다.");
      ep.clear(3);
    }
  }
  two();

  /* ---------------- 장면 5 — 결말 ---------------- */
  var SORT2 = {
    mount: "b-sort2",
    buckets: [
      { id: "as", label: "소행성", sub: "암석·금속, 주로 화성과 목성 사이" },
      { id: "co", label: "혜성", sub: "얼음과 먼지, 꼬리가 생긴다" },
      { id: "dw", label: "왜소행성", sub: "둥글지만 궤도를 치우지 못했다" }
    ],
    items: [
      { t: "화성과 목성 사이 소행성대에 수십만 개가 모여 있는 암석·금속 천체", a: "as", why: "소행성대의 소행성입니다." },
      { t: "하야부사2가 표본을 가져온 지름 900 m의 검은 암석 천체 류구", a: "as", why: "지구 가까이 오는 궤도를 도는 소행성입니다.", hint: "얼음이 아니라 암석으로 이루어져 있습니다." },
      { t: "탐사선 돈(Dawn)이 조사한 결과 내부가 핵·맨틀·지각으로 나뉘어 있던 베스타", a: "as", why: "소행성대에서 둘째로 무거운 소행성입니다." },
      { t: "태양에 가까워지면 얼음이 승화해 코마와 꼬리가 생긴다", a: "co", why: "혜성의 가장 뚜렷한 특징입니다." },
      { t: "긴 타원 궤도를 76년에 한 바퀴 돌며, 카이퍼대와 오르트 구름이 고향이다", a: "co", why: "핼리 혜성처럼 긴 타원 궤도를 도는 혜성입니다." },
      { t: "지나간 자리에 먼지를 흘려 두어, 지구가 그 길을 지날 때 유성우가 내린다", a: "co", why: "유성우의 먼지는 대부분 혜성이 남긴 것입니다.", hint: "먼지를 흘리는 천체는 무엇일까요?" },
      { t: "소행성대에서 가장 큰 천체이지만 μ가 0.33이어서 행성이 되지 못한 세레스", a: "dw", why: "소행성대의 유일한 왜소행성입니다." },
      { t: "2015년 뉴호라이즌스가 찾아간, 카이퍼대의 질소 얼음 평원을 가진 천체", a: "dw", why: "명왕성입니다.", hint: "2006년에 자리가 바뀐 그 천체입니다." },
      { t: "명왕성보다 약 27% 무거워 행성 정의 논쟁에 불을 붙인 에리스", a: "dw", why: "에리스도 왜소행성으로 분류되었습니다." }
    ]
  };
  function reveal() {
    $("b-end-wrap").hidden = false;
    var p = window.sthState("p2") || "";
    $("b-vs").innerHTML = "<b>나의 첫 판단</b> " + (p || "기록 없음") +
      (p.indexOf("㉡") === 0 ? " — 정확했습니다. 걸린 것은 세 번째 조건이었습니다."
        : " — 크기도 궤도의 중심도 아니었습니다. 걸린 것은 <b>③ 궤도 주변을 치웠는가</b> 였습니다.") +
      "<br><b>내가 잰 값</b> 지구형·목성형을 가른 밀도 기준선 · 류구의 빈틈 " + (window.sthState("por") || "-") + "%";
  }
  function finish() { window.sthState("r2", "해결 · IAU 세 조건으로 판정, 류구 빈틈 " + (window.sthState("por") || "-") + "% 인 돌무더기"); }
  if (ep.cleared(4)) {
    var html = "<div class='sort'><div class='buckets'>";
    SORT2.buckets.forEach(function (b) {
      html += "<div class='bucket'><span class='b-name'>" + b.label + "</span><span class='b-sub'>" + b.sub + "</span>";
      SORT2.items.forEach(function (it) { if (it.a === b.id) html += "<span class='in'>" + it.t + "</span>"; });
      html += "</div>";
    });
    html += "</div><div class='msg'>🎉 분류를 모두 마쳤습니다.</div></div>";
    $("b-sort2").innerHTML = html;
    reveal();
  } else {
    SORT2.onDone = function () { reveal(); ep.clear(4); };
    window.sthSort(SORT2);
  }

  window.sthWork({
    mount: "wk2", unitLabel: "[행성우주과학 Ⅰ-2] 이야기 ② 명왕성의 자격 심사",
    items: [
      { id: "e2a", label: "명왕성에게 보내는 심사 결과서", hint: "IAU 세 조건 가운데 명왕성이 만족한 것과 만족하지 못한 것을 나누어 쓰고, ‘작아서 내려온 것이 아니다’라는 점이 드러나게 쓰세요." },
      { id: "e2b", label: "탐사 자료에서 읽어 낸 것", hint: "평균 밀도 하나로 무엇까지 추론할 수 있었는지, 류구(1.19 g/cm³)와 토성(0.69 g/cm³)을 예로 들어 쓰세요. 두 천체의 밀도가 낮은 까닭은 서로 다릅니다." }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 별이 흔들렸다 — 외계 행성계 탐사와 생명 가능 지대
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });

  window.sthGate({
    gate: "g3", key: "p3", title: "조사관의 첫 추리",
    question: "페가수스자리 51의 시선 속도가 4일 남짓 주기로 ±56 m/s 오르내립니다. 무엇이 별을 흔들고 있을까요?",
    options: [
      "㉠ 별이 스스로 부풀었다 줄었다 하고 있다",
      "㉡ 보이지 않는 행성과 서로 끌어당기며 공통 질량 중심을 돌고 있다",
      "㉢ 별이 빠르게 자전하기 때문이다"
    ],
    onPick: function () { ep.clear(0); }
  });

  /* ---------------- 장면 2 — 시선 속도법 ---------------- */
  (function () {
    var canvas = $("c-rv"); if (!canvas) return;
    var ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var MSTAR = 1.11, MJ = 9.5458e-4, OBS_K = 56, OBS_P = 4.231;
    var P = 10, Mp = 1;
    var got = window.sthState("rv") || { p: false, k: false };
    /* 관측점: 실제 자료를 흉내 낸 고정 배열 (시각(일), 잔차 m/s) */
    var NOISE = [3.1, -2.4, 1.6, 4.2, -3.5, 2.0, -1.2, 3.8, -4.0, 1.1, 2.7, -2.9, 0.6, -3.2, 2.2, 3.4, -1.8, -0.7, 4.1, -2.1, 1.4, -3.9, 2.6, 0.9];
    var OBS = NOISE.map(function (nz, i) {
      var t = 0.5 + i * 0.5;
      return { t: t, v: OBS_K * Math.sin(2 * Math.PI * t / OBS_P) + nz };
    });
    function amp(p, m) { return 28.4329 * m * Math.pow(MSTAR + m * MJ, -2 / 3) * Math.pow(p / 365.25, -1 / 3); }

    function draw() {
      paper(ctx, W, H);
      var x0 = 80, x1 = 860, y0 = 56, y1 = 340, TMAX = 12.5, VMAX = 130;
      function px(t) { return x0 + t / TMAX * (x1 - x0); }
      function py(vv) { return (y0 + y1) / 2 - vv / VMAX * (y1 - y0) / 2; }
      [-100, -50, 0, 50, 100].forEach(function (vv) {
        line(ctx, x0, py(vv), x1, py(vv), v("--line"), vv === 0 ? 1.5 : 1, vv === 0 ? null : [3, 4]);
        text(ctx, vv + "", x0 - 8, py(vv) + 4, { s: 10.5, c: v("--mist"), a: "right" });
      });
      for (var d = 0; d <= 12; d += 2) { line(ctx, px(d), y0, px(d), y1, v("--line"), 1, [3, 4]); text(ctx, d + "일", px(d), y1 + 20, { s: 10.5, c: v("--mist"), a: "center" }); }
      text(ctx, "별의 시선 속도 (m/s) — 가까워지면 −, 멀어지면 +", x0, y0 - 16, { s: 12.5, w: "800" });
      /* 관측 진폭 띠 */
      ctx.save(); ctx.globalAlpha = .16; ctx.fillStyle = v("--coral");
      ctx.fillRect(x0, py(OBS_K), x1 - x0, py(-OBS_K) - py(OBS_K)); ctx.restore();
      line(ctx, x0, py(OBS_K), x1, py(OBS_K), v("--coral"), 1.5, [6, 4]);
      line(ctx, x0, py(-OBS_K), x1, py(-OBS_K), v("--coral"), 1.5, [6, 4]);
      text(ctx, "관측 진폭 ±56 m/s", x1 - 4, py(OBS_K) - 8, { s: 10.5, w: "800", c: v("--coral-700"), a: "right" });
      /* 모형 곡선 */
      var K = amp(P, Mp);
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 3; ctx.beginPath();
      for (var t = 0; t <= TMAX; t += 0.02) {
        var yv = py(clamp(K * Math.sin(2 * Math.PI * t / P), -VMAX, VMAX));
        if (t === 0) ctx.moveTo(px(t), yv); else ctx.lineTo(px(t), yv);
      }
      ctx.stroke();
      /* 관측점 */
      OBS.forEach(function (o) { dot(ctx, px(o.t), py(clamp(o.v, -VMAX, VMAX)), 4.5, v("--coral")); });
      text(ctx, "● 관측 자료", x0 + 8, y0 + 4, { s: 11.5, w: "800", c: v("--coral-700") });
      text(ctx, "— 내 모형", x0 + 110, y0 + 4, { s: 11.5, w: "800", c: v("--brand-700") });
      /* 주기 화살표 */
      var pe = Math.min(P, TMAX);
      ctx.strokeStyle = v("--teal"); ctx.fillStyle = v("--teal"); ctx.lineWidth = 2;
      window.drawArrow(ctx, px(0), y1 - 12, px(pe), y1 - 12, 10);
      text(ctx, "내 모형의 주기 " + P.toFixed(2) + "일", px(pe / 2), y1 - 20, { s: 11, w: "800", c: v("--teal-700"), a: "center" });

      var a = Math.pow(MSTAR * Math.pow(P / 365.25, 2), 1 / 3);
      var okP = Math.abs(P - 4.23) <= 0.1, okK = Math.abs(K - OBS_K) <= 1.5;
      $("c-rv-info").innerHTML = "공전 주기 <b>" + P.toFixed(2) + "일</b>, 행성 질량 <b>" + Mp.toFixed(2) + " 목성질량</b> → 계산한 시선 속도 진폭 <b>" +
        K.toFixed(1) + " m/s</b> (관측값 56) · 조화 법칙으로 구한 궤도 반지름 <b>" + a.toFixed(4) + " AU</b><br>" +
        (!okP ? "먼저 <b>주기</b>부터 맞추세요. 곡선이 되풀이되는 간격을 관측점의 오르내림에 겹쳐 보면 됩니다."
          : (!okK ? "주기는 맞았습니다. 이제 <b>질량</b>을 바꿔 곡선의 높이를 ±56 m/s 띠에 맞추세요. " + (K > OBS_K ? "지금은 너무 높습니다." : "지금은 너무 낮습니다.")
            : "🎉 관측을 재현했습니다. 목성의 절반쯤 되는 행성이 <b>수성(0.39 AU)의 7분의 1</b>밖에 안 되는 거리를 4일 만에 한 바퀴 돌고 있습니다. 이런 행성을 <b>뜨거운 목성</b>이라 부릅니다. 당시 이론으로는 거대 기체 행성이 별 가까이에서 만들어질 수 없다고 보았기 때문에, 이 발견은 행성계 형성 이론을 다시 쓰게 했습니다."));

      var ch = false;
      if (!got.p && okP) { got.p = true; ch = true; }
      if (!got.k && okK) { got.k = true; ch = true; }
      /* 기록으로 남기는 질량은 주기까지 맞은 값만 */
      if (okP && okK && window.sthState("rvMp") !== Mp) window.sthState("rvMp", Mp);
      if (ch) { window.sthState("rv", got); check(); }
    }
    canvas._redraw = draw;
    function check() {
      if (got.p) done("m3-2a");
      if (got.k) done("m3-2b");
      if (got.p && got.k) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>주기 <b>4.2일</b>, 질량 <b>" +
          (window.sthState("rvMp") || 0.48).toFixed(2) + " 목성질량</b>. 별의 흔들림만 보고 보이지 않는 행성의 질량과 궤도를 알아냈습니다.");
        ep.clear(1);
      }
    }
    $("c-p").addEventListener("input", function (ev) { P = Math.round(+ev.target.value * 100) / 100; $("c-p-val").textContent = P.toFixed(2); draw(); });
    $("c-mp").addEventListener("input", function (ev) { Mp = Math.round(+ev.target.value * 100) / 100; $("c-mp-val").textContent = Mp.toFixed(2); draw(); });
    draw(); check();
  })();

  /* ---------------- 장면 3 — 식 현상(통과)법 ---------------- */
  (function () {
    var canvas = $("c-tr"); if (!canvas) return;
    var ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var RSUN = 695700, RE = 6371, RJ = 71492, MJKG = 1.898e27;
    var RSTAR = 1.20 * RSUN, OBS_D = 1.40, MP_J = 0.69;
    var rp = 1, phase = null, busy = false, okR = window.sthState("trR") || 0;

    function depth(rr) { var x = rr * RE / RSTAR; return x * x * 100; }

    function draw() {
      paper(ctx, W, H);
      var d = depth(rp);
      /* 별과 행성 */
      var cx = 300, cy = 108, R = 76;
      dot(ctx, cx, cy, R, v("--amber"));
      ring(ctx, cx, cy, R, v("--line"), 2);
      text(ctx, "HD 209458 (반지름 태양의 1.20배)", cx, cy + R + 24, { s: 11.5, c: v("--mist"), a: "center" });
      var prr = Math.max(2, R * (rp * RE / RSTAR));
      var ph = phase == null ? 0 : phase;
      var pxx = cx + ph * R;
      dot(ctx, pxx, cy, prr, v("--panel"));
      ring(ctx, pxx, cy, prr, v("--ink"), 1.5);
      text(ctx, "행성", pxx, cy - prr - 12, { s: 10.5, w: "800", a: "center", c: v("--mist") });
      text(ctx, "가려진 면적 비율 = (행성 반지름 ÷ 별 반지름)² = " + d.toFixed(3) + "%", 24, 30, { s: 12.5, w: "800" });

      /* 광도 곡선 */
      var x0 = 90, x1 = 860, y0 = 250, y1 = 386;
      function py(f) { return clamp(y1 - (f - (100 - 2.2)) / 2.6 * (y1 - y0), y0, y1); }
      [100, 99.5, 99, 98.5, 98].forEach(function (f) {
        line(ctx, x0, py(f), x1, py(f), v("--line"), 1, [3, 4]);
        text(ctx, f.toFixed(1) + "%", x0 - 8, py(f) + 4, { s: 10, c: v("--mist"), a: "right" });
      });
      text(ctx, "별의 밝기", x0, y0 - 14, { s: 12, w: "800" });
      /* 관측 깊이 기준선 */
      line(ctx, x0, py(100 - OBS_D), x1, py(100 - OBS_D), v("--coral"), 2, [6, 4]);
      text(ctx, "관측된 깊이 1.40%", x1 - 4, py(100 - OBS_D) + 16, { s: 10.5, w: "800", c: v("--coral-700"), a: "right" });
      /* 모형 곡선 */
      function bright(u) {              // u: −1.6 ~ 1.6 (0이 한가운데)
        var k = rp * RE / RSTAR, edge = 1 + k, inn = 1 - k;
        var au = Math.abs(u);
        if (au >= edge) return 100;
        if (au <= inn) return 100 - d;
        return 100 - d * (edge - au) / Math.max(1e-6, edge - inn);
      }
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 3; ctx.beginPath();
      for (var u = -1.6; u <= 1.6; u += 0.004) {
        var xx = x0 + (u + 1.6) / 3.2 * (x1 - x0);
        if (u === -1.6) ctx.moveTo(xx, py(bright(u))); else ctx.lineTo(xx, py(bright(u)));
      }
      ctx.stroke();
      if (phase != null) {
        var mx = x0 + (ph + 1.6) / 3.2 * (x1 - x0);
        line(ctx, mx, y0, mx, y1, v("--teal"), 2);
        dot(ctx, mx, py(bright(ph)), 5, v("--teal"));
      }
      text(ctx, "행성이 별 앞을 가로지르는 동안의 밝기 (가로축: 별 반지름 단위)", x1 - 4, y0 - 14, { s: 10.5, c: v("--mist"), a: "right" });

      var ok = Math.abs(d - OBS_D) <= 0.06;
      $("c-tr-info").innerHTML = "행성 반지름 <b>" + rp.toFixed(1) + " 지구 반지름</b> (= " + (rp * RE).toLocaleString() + " km = 목성의 " +
        (rp * RE / RJ).toFixed(2) + "배) → 밝기 감소 깊이 <b>" + d.toFixed(3) + "%</b> (관측값 1.40%)<br>" +
        (ok ? "🎉 맞췄습니다. 시선 속도법으로 잰 이 행성의 질량은 <b>0.69 목성질량</b>입니다. 질량과 반지름을 함께 쓰면 평균 밀도가 <b>" +
          (MP_J * MJKG / (4 / 3 * Math.PI * Math.pow(rp * RE * 1000, 3)) / 1000).toFixed(2) +
          " g/cm³</b> — <b>물보다도 가볍습니다.</b> 별에 바싹 붙어 뜨겁게 달궈진 채 부풀어 오른 기체 행성이라는 뜻이지요."
          : (d < OBS_D ? "아직 너무 작습니다. 밝기가 더 많이 줄어들도록 행성을 키워 보세요." : "너무 큽니다. 밝기가 관측보다 많이 줄어들었습니다."));

      if (!okR && ok) { okR = rp; window.sthState("trR", rp); check(); }
    }
    canvas._redraw = draw;
    function check() { if (okR) { done("m3-3a"); two(); } }
    $("c-rp").addEventListener("input", function (ev) {
      rp = Math.round(+ev.target.value * 10) / 10; $("c-rp-val").textContent = rp.toFixed(1); draw();
    });
    $("c-tr-run").addEventListener("click", function () {
      if (busy) return;
      busy = true; $("c-tr-run").disabled = true; phase = -1.6;
      (function step() {
        phase = Math.min(1.6, phase + 0.09);
        draw();
        if (phase < 1.6) window.setTimeout(step, 18);
        else { busy = false; $("c-tr-run").disabled = false; $("c-tr-run").textContent = "↻ 다시 관측하기"; phase = null; draw(); }
      })();
    });
    draw(); check();
  })();

  var okQ1 = !!window.sthState("trQ");
  window.sthPick({
    mount: "c-q1",
    q: "시선 속도법은 행성의 질량을, 식 현상(통과)법은 행성의 반지름을 알려 줍니다. 한 행성에 두 방법을 모두 쓰면 무엇을 더 알 수 있을까요?",
    options: [
      "행성의 <b>평균 밀도</b> — 기체 행성인지 암석 행성인지 가릴 수 있다",
      "행성의 표면 온도를 정확히 알 수 있다",
      "행성에 생명체가 있는지 알 수 있다",
      "행성의 자전 주기를 알 수 있다"
    ],
    answer: 0,
    why: [
      "밀도 = 질량 ÷ 부피이고 부피는 반지름으로 구하므로, 두 방법을 합치면 평균 밀도가 나옵니다. HD 209458 b 처럼 밀도가 0.3 g/cm³ 대면 기체 행성, 5 g/cm³ 대면 암석 행성입니다.",
      "표면 온도는 별의 광도와 거리로 <b>추정</b>할 뿐이고, 대기가 있으면 크게 달라집니다.",
      "생명체 여부는 질량과 반지름만으로는 알 수 없습니다. 대기 성분 같은 다른 관측이 필요합니다.",
      "자전 주기는 이 두 방법으로 구할 수 없습니다."
    ],
    onDone: function () { okQ1 = true; window.sthState("trQ", 1); done("m3-3b"); two(); }
  });
  if (okQ1) done("m3-3b");

  function two() {
    if (window.sthState("trR") && window.sthState("trQ")) {
      window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>반지름 <b>지구의 " +
        (window.sthState("trR") || 15.5).toFixed(1) + "배</b>. 질량(시선 속도법)과 반지름(통과법)을 합치면 <b>평균 밀도</b>까지 나옵니다.");
      ep.clear(2);
    }
  }
  two();

  /* ---------------- 장면 4 — 생명 가능 지대 ---------------- */
  (function () {
    var canvas = $("c-hz"); if (!canvas) return;
    var ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var STARS = [
      {
        k: "sun", n: "☀️ 태양", s: "", R: 1.00, T: 5772, c: "--amber",
        pl: [{ n: "수성", r: 0.387 }, { n: "금성", r: 0.723 }, { n: "지구", r: 1.000 }, { n: "화성", r: 1.524 }],
        note: "우리 태양입니다. 지구는 생명 가능 지대의 한가운데쯤에 있습니다."
      },
      {
        k: "tr1", n: "🔴 TRAPPIST-1", s: "TRAPPIST-1", R: 0.119, T: 2566, c: "--coral",
        pl: [{ n: "b", r: 0.01154 }, { n: "c", r: 0.01580 }, { n: "d", r: 0.02227 }, { n: "e", r: 0.02925 }, { n: "f", r: 0.03849 }, { n: "g", r: 0.04683 }, { n: "h", r: 0.06189 }],
        note: "약 40광년 거리의 아주 작고 차가운 적색 왜성입니다. 지구만 한 행성 7개가 모두 수성 궤도 안쪽보다 가까이 돌고 있습니다."
      },
      {
        k: "pro", n: "🟠 프록시마 센타우리", s: "프록시마 ", R: 0.154, T: 3042, c: "--coral",
        pl: [{ n: "d", r: 0.02885 }, { n: "b", r: 0.0485 }, { n: "c", r: 1.489 }],
        note: "태양에서 가장 가까운 별(4.2광년)입니다. 다만 자주 큰 플레어를 일으켜 행성의 대기를 벗겨 낼 수 있다는 걱정이 있습니다."
      },
      {
        k: "sir", n: "🔵 시리우스 A", s: "시리우스 ", R: 1.711, T: 9940, c: "--cold",
        pl: [],
        note: "밤하늘에서 가장 밝게 보이는 별입니다. 뜨겁고 밝은 만큼 생명 가능 지대가 훨씬 멀리 밀려나 있습니다. 아직 알려진 행성은 없습니다."
      }
    ];
    var si = 0, ri = 50, got = window.sthState("hz") || { sun: false, tr1: false };
    function lum(s) { return s.R * s.R * Math.pow(s.T / 5772, 4); }
    function hz(s) { var L = Math.sqrt(lum(s)); return { i: 0.95 * L, o: 1.37 * L, wi: 0.75 * L, wo: 1.77 * L }; }
    function orb(i) { return Math.pow(10, -2.5 + i * 0.035); }

    function draw() {
      paper(ctx, W, H);
      var s = STARS[si], L = lum(s), z = hz(s), r = orb(ri);
      var x0 = 130, x1 = 850, cy = 210;
      function px(rr) { return x0 + (Math.log(clamp(rr, 0.0031, 10)) / Math.LN10 + 2.5) / 3.5 * (x1 - x0); }
      /* 별 */
      var sr = clamp(16 + 26 * Math.log(s.R * 10) / Math.LN10, 12, 54);
      dot(ctx, 62, cy, sr, v(s.c));
      ring(ctx, 62, cy, sr, v("--line"), 2);
      ctx.font = "900 12px " + FONT;
      var nw = ctx.measureText(s.n).width;
      text(ctx, s.n, clamp(62, nw / 2 + 6, 894 - nw / 2), cy + sr + 24, { s: 12, w: "900", a: "center" });
      text(ctx, "반지름 " + s.R.toFixed(3) + " R☉", 62, cy + sr + 42, { s: 10, c: v("--mist"), a: "center" });
      text(ctx, "표면 온도 " + s.T.toLocaleString() + " K", 62, cy + sr + 58, { s: 10, c: v("--mist"), a: "center" });

      /* 넓게 잡은 지대 */
      ctx.save(); ctx.globalAlpha = .16; ctx.fillStyle = v("--teal");
      ctx.fillRect(px(z.wi), cy - 92, px(z.wo) - px(z.wi), 184); ctx.restore();
      /* 보수적 지대 */
      ctx.save(); ctx.globalAlpha = .42; ctx.fillStyle = v("--teal");
      ctx.fillRect(px(z.i), cy - 74, px(z.o) - px(z.i), 148); ctx.restore();
      text(ctx, "생명 가능 지대", (px(z.i) + px(z.o)) / 2, cy - 84, { s: 12, w: "900", c: v("--teal-700"), a: "center" });
      text(ctx, "넓게 잡은 지대", (px(z.wi) + px(z.i)) / 2, cy - 100, { s: 10, c: v("--teal-700"), a: "center" });

      /* 축 */
      line(ctx, x0, cy + 96, x1, cy + 96, v("--mist"), 1.5);
      [0.01, 0.1, 1, 10].forEach(function (t) {
        line(ctx, px(t), cy - 104, px(t), cy + 96, v("--line"), 1, [3, 4]);
        text(ctx, t + " AU", px(t), cy + 118, { s: 10.5, c: v("--mist"), a: "center" });
      });
      /* 행성 */
      s.pl.forEach(function (p, i) {
        var x = px(p.r), inHz = p.r >= z.i && p.r <= z.o;
        dot(ctx, x, cy + 96, 6, inHz ? v("--green") : v("--violet"));
        text(ctx, p.n, x, cy + 96 + (i % 2 ? 44 : 62), { s: 10.5, w: inHz ? "900" : "500", c: inHz ? v("--green-700") : v("--mist"), a: "center" });
      });
      /* 내가 보는 궤도 */
      var mx = px(r), inZ = r >= z.i && r <= z.o;
      line(ctx, mx, cy - 108, mx, cy + 96, inZ ? v("--green") : v("--brand"), 3);
      dot(ctx, mx, cy, 8, inZ ? v("--green") : v("--brand"));
      text(ctx, r.toFixed(r < 0.1 ? 4 : 3) + " AU", mx, cy - 116, { s: 12, w: "900", a: "center", c: inZ ? v("--green-700") : v("--brand-700") });

      /* 수치 상자 */
      bar(ctx, 24, 24, 380, 60, v("--card-2"), 14);
      text(ctx, "광도 L = (R/R☉)² × (T/5772)⁴ = " + (L >= 0.01 ? L.toFixed(3) : L.toExponential(2)) + " L☉", 40, 48, { s: 12, w: "800" });
      text(ctx, "생명 가능 지대 = 0.95√L ~ 1.37√L = " + z.i.toFixed(z.i < 0.1 ? 4 : 2) + " ~ " + z.o.toFixed(z.o < 0.1 ? 4 : 2) + " AU", 40, 70, { s: 12, w: "800", c: v("--teal-700") });

      var near = null;
      s.pl.forEach(function (p) { if (near === null || Math.abs(Math.log(p.r / r)) < Math.abs(Math.log(near.r / r))) near = p; });
      $("c-hz-info").innerHTML = "<b>" + s.n + "</b> — " + s.note + "<br>광도는 태양의 <b>" + (L >= 0.01 ? L.toFixed(3) : L.toExponential(2)) +
        "배</b>, 생명 가능 지대는 <b>" + z.i.toFixed(z.i < 0.1 ? 4 : 2) + " ~ " + z.o.toFixed(z.o < 0.1 ? 4 : 2) + " AU</b>. " +
        "지금 보고 있는 궤도 <b>" + r.toFixed(r < 0.1 ? 4 : 3) + " AU</b> 는 " + (inZ ? "<b>지대 안</b>입니다." : (r < z.i ? "지대보다 <b>안쪽</b>이라 물이 끓어 날아갑니다." : "지대보다 <b>바깥쪽</b>이라 물이 얼어붙습니다.")) +
        (near ? " 이 자리에 가장 가까운 행성은 <b>" + s.s + near.n + "</b> (" + near.r.toFixed(near.r < 0.1 ? 4 : 3) + " AU)입니다." +
          (near.r >= z.i && near.r <= z.o ? " 이 행성은 <b>생명 가능 지대 안</b>에 있습니다." : "") : " 이 별에는 아직 알려진 행성이 없습니다.");

      var ch = false;
      if (!got.sun && s.k === "sun" && inZ) { got.sun = true; ch = true; }
      if (!got.tr1 && s.k === "tr1" && inZ) { got.tr1 = true; ch = true; }
      if (ch) { window.sthState("hz", got); check(); }
    }
    canvas._redraw = draw;
    function check() {
      if (got.sun) done("m3-4a");
      if (got.tr1) done("m3-4b");
      three();
    }
    /* 별 고르기 버튼 */
    var seg = $("c-star");
    STARS.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = s.n;
      if (i === 0) b.className = "on";
      b.addEventListener("click", function () {
        si = i;
        Array.prototype.forEach.call(seg.children, function (o, j) { o.className = j === i ? "on" : ""; });
        draw();
      });
      seg.appendChild(b);
    });
    $("c-r").addEventListener("input", function (ev) {
      ri = +ev.target.value; $("c-r-val").textContent = orb(ri).toFixed(orb(ri) < 0.1 ? 4 : 3); draw();
    });
    $("c-r-val").textContent = orb(ri).toFixed(orb(ri) < 0.1 ? 4 : 3);
    draw(); check();
  })();

  var okQ2 = !!window.sthState("hzQ");
  window.sthPick({
    mount: "c-q2",
    q: "어떤 외계 행성이 생명 가능 지대 안에 있다는 것이 확인되었습니다. 이때 할 수 있는 말로 가장 알맞은 것은?",
    options: [
      "그 행성에는 생명체가 있다",
      "그 행성 표면에 <b>액체 상태의 물이 있을 수 있는 거리</b>라는 뜻일 뿐, 생명체가 있다고 할 수는 없다",
      "생명 가능 지대 밖이면 생명체가 있을 가능성이 완전히 없다",
      "생명 가능 지대는 별의 종류와 상관없이 늘 1 AU 부근이다"
    ],
    answer: 1,
    why: [
      "거리는 여러 조건 가운데 하나일 뿐입니다. 금성은 태양계 생명 가능 지대의 안쪽 가장자리 근처인데도 표면이 460℃가 넘습니다.",
      "생명 가능 지대는 <b>거리</b>에 대한 조건입니다. 실제로 물이 있으려면 대기의 양과 성분, 자기장, 중심별의 안정성 같은 조건이 함께 맞아야 합니다. 그래서 ‘있다/없다’가 아니라 <b>어떤 조건이 갖춰졌는지를 근거로 따지는 일</b>이 됩니다.",
      "목성의 위성 유로파나 토성의 위성 엔켈라두스는 생명 가능 지대 밖이지만, 조석력으로 데워진 얼음 밑 바다가 있을 것으로 봅니다.",
      "별의 광도에 따라 크게 달라집니다. TRAPPIST-1은 0.02 AU 부근, 시리우스 A는 5 AU 부근입니다."
    ],
    onDone: function () { okQ2 = true; window.sthState("hzQ", 1); done("m3-4c"); three(); }
  });
  if (okQ2) done("m3-4c");

  function three() {
    var g = window.sthState("hz") || {};
    if (g.sun && g.tr1 && window.sthState("hzQ")) {
      window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>보수적 기준으로 TRAPPIST-1의 생명 가능 지대(<b>0.0223~0.0322 AU</b>)에 들어오는 행성은 <b>e</b> 하나였습니다. 생명 가능 지대의 자리는 <b>별의 광도</b>가 정합니다.");
      ep.clear(3);
    }
  }
  three();

  /* ---------------- 장면 5 — 결말 ---------------- */
  var SORT3 = {
    mount: "c-sort",
    buckets: [
      { id: "rv", label: "시선 속도법", sub: "별의 흔들림을 잰다" },
      { id: "tr", label: "식 현상(통과)법", sub: "별의 밝기 변화를 잰다" },
      { id: "ml", label: "미세 중력 렌즈법", sub: "휘어진 빛을 잰다" }
    ],
    items: [
      { t: "별빛 스펙트럼의 흡수선이 4.2일마다 짧은 쪽과 긴 쪽으로 번갈아 치우친다", a: "rv", why: "도플러 효과로 나타나는 시선 속도 변화입니다." },
      { t: "별이 공통 질량 중심을 도는 속도의 크기에서 행성의 최소 질량을 구했다", a: "rv", why: "시선 속도법이 주는 값은 질량(정확히는 최소 질량)입니다." },
      { t: "행성이 무겁고 별에 가까울수록 별을 세게 흔들어 찾기 쉽다", a: "rv", why: "진폭이 커지기 때문입니다.", hint: "무엇이 커져야 찾기 쉬워질까요?" },
      { t: "별의 밝기가 3.5일마다 1.4%씩 줄었다가 되돌아온다", a: "tr", why: "행성이 별 앞을 가로지를 때의 밝기 감소입니다." },
      { t: "밝기가 줄어든 깊이에서 행성의 반지름을 구했다", a: "tr", why: "깊이 = (행성 반지름 ÷ 별 반지름)² 입니다." },
      { t: "행성이 별 앞을 가로질러야만 관측되므로, 궤도면이 시선 방향과 거의 나란한 계에서만 찾을 수 있다", a: "tr", why: "그래서 실제 행성 수에 비해 찾아내는 비율이 낮습니다.", hint: "무엇이 가려져야 관측이 되는지 생각해 보세요." },
      { t: "멀리 있는 배경별의 밝기가 한 번 크게 밝아졌다가 되돌아왔다", a: "ml", why: "앞을 지나간 천체가 렌즈 노릇을 한 것입니다." },
      { t: "앞을 지나가는 별과 그 행성의 중력이 뒤쪽 별빛을 휘게 해 모아 준다", a: "ml", why: "중력이 빛을 휘게 하는 현상을 이용합니다." },
      { t: "같은 일이 다시 일어나지 않아 되풀이해 확인할 수 없지만, 별에서 멀리 떨어진 가벼운 행성까지 찾을 수 있다", a: "ml", why: "일회성이라는 약점과 먼 행성까지 찾는 장점을 함께 가집니다." }
    ]
  };
  function reveal() {
    $("c-end-wrap").hidden = false;
    var p = window.sthState("p3") || "";
    $("c-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") +
      (p.indexOf("㉡") === 0 ? " — 정확했습니다. 별과 행성은 서로를 끌어당깁니다."
        : " — 별의 맥동도 자전도 아니었습니다. 보이지 않는 행성이 별을 끌어당기고 있었습니다.") +
      "<br><b>내가 알아낸 값</b> 51 Peg b 질량 " + ((window.sthState("rvMp") || 0.48).toFixed(2)) + " 목성질량 · HD 209458 b 반지름 지구의 " +
      ((window.sthState("trR") || 15.5).toFixed(1)) + "배 · 생명 가능 지대 후보 TRAPPIST-1e";
  }
  function finish() {
    window.sthState("r3", "해결 · 51 Peg b " + ((window.sthState("rvMp") || 0.48).toFixed(2)) + " 목성질량, HD 209458 b 반지름 지구의 " +
      ((window.sthState("trR") || 15.5).toFixed(1)) + "배, 후보 TRAPPIST-1e");
  }
  if (ep.cleared(4)) {
    var html = "<div class='sort'><div class='buckets'>";
    SORT3.buckets.forEach(function (b) {
      html += "<div class='bucket'><span class='b-name'>" + b.label + "</span><span class='b-sub'>" + b.sub + "</span>";
      SORT3.items.forEach(function (it) { if (it.a === b.id) html += "<span class='in'>" + it.t + "</span>"; });
      html += "</div>";
    });
    html += "</div><div class='msg'>🎉 분류를 모두 마쳤습니다.</div></div>";
    $("c-sort").innerHTML = html;
    reveal();
  } else {
    SORT3.onDone = function () { reveal(); ep.clear(4); };
    window.sthSort(SORT3);
  }

  window.sthWork({
    mount: "wk3", unitLabel: "[행성우주과학 Ⅰ-2] 이야기 ③ 별이 흔들렸다",
    items: [
      { id: "w2", label: "외계 행성을 찾는 방법", hint: "시선속도법과 식(통과)법 중 하나를 골라, 무엇을 관측해 무엇을 알아내는지 쓰세요." },
      { id: "e3b", label: "이 행성에 생명체가 있을까 — 근거를 들어 논증하기", hint: "행성 하나(예: TRAPPIST-1e)를 골라, 유리한 조건과 불리한 조건을 각각 들고 ‘지금 자료로는 어디까지 말할 수 있는지’로 마무리하세요." }
    ]
  });
})();

/* ========================================================================= 04 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[행성우주과학 Ⅰ-2] 태양계 천체와 외계 행성 — 정리",
  recap: [
    { key: "r1", label: "① 8분의 오차" },
    { key: "r2", label: "② 명왕성의 자격 심사" },
    { key: "r3", label: "③ 별이 흔들렸다" }
  ],
  items: [
    { id: "all", label: "세 사건을 꿰는 한 문장", hint: "8분의 어긋남, μ = 0.077, 56 m/s의 흔들림. 세 이야기 모두 <b>작은 값 하나를 끝까지 따져 물은 일</b>에서 시작했습니다. 이 점이 드러나게, ‘관측’과 ‘정의(또는 모형)’라는 말을 넣어 한 문장으로 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 05 우리 반 */
window.sthShare({
  mount: "share", unit: "psp-1-2", unitLabel: "[행성우주과학 Ⅰ-2] 태양계 천체와 외계 행성",
  rows: [
    { key: "r1", label: "① 8분의 오차" },
    { key: "r2", label: "② 명왕성의 자격 심사" },
    { key: "r3", label: "③ 별이 흔들렸다" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
