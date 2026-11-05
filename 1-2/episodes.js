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

/* 그림 도구(무대) */
var K = window.sthKit, KC = K.C, REDUCE = K.REDUCE;
function playBtn(id, on, onTxt, offTxt, set) {
  var b = $(id); if (!b) return;
  b.textContent = on ? onTxt : offTxt;
  b.addEventListener("click", function () { on = !on; set(on); b.textContent = on ? onTxt : offTxt; });
}
/* 무대 위 카드(반투명 어두운 판) */
function card(ctx, x, y, w, h, edge) {
  ctx.fillStyle = "rgba(9,12,34,.62)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill();
  ctx.strokeStyle = edge || "rgba(200,210,255,.16)"; ctx.lineWidth = 1; ctx.stroke();
}
/* 막대(빛나는 그라데이션) */
function gbar(ctx, x, y, w, h, col, r) {
  var g = ctx.createLinearGradient(x, 0, x + Math.max(2, w), 0); g.addColorStop(0, "rgba(255,255,255,.10)"); g.addColorStop(1, col);
  ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 6; ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(x, y, Math.max(2, w), h, r == null ? 5 : r); ctx.fill(); ctx.restore();
}
/* 울퉁불퉁한 암석 덩어리(소행성) */
function rock(ctx, x, y, r, seed, sx, sy) {
  var R = K.rng(seed || 3), n = 16, pts = [], i;
  for (i = 0; i < n; i++) pts.push(1 + (R() - .5) * .24);
  sx = sx || 1; sy = sy || 1;
  ctx.save(); ctx.beginPath();
  for (i = 0; i <= n; i++) {
    var a = i / n * 6.2832, rr = r * pts[i % n];
    if (i) ctx.lineTo(x + Math.cos(a) * rr * sx, y + Math.sin(a) * rr * sy); else ctx.moveTo(x + Math.cos(a) * rr * sx, y + Math.sin(a) * rr * sy);
  }
  ctx.closePath();
  var g = ctx.createRadialGradient(x - r * .4, y - r * .45, r * .08, x, y, r * 1.15);
  g.addColorStop(0, "#c9bba8"); g.addColorStop(.5, "#6e6255"); g.addColorStop(1, "#211c18");
  ctx.fillStyle = g; ctx.fill(); ctx.clip();
  for (i = 0; i < 6; i++) {
    var cx = x + (R() - .5) * r * 1.3 * sx, cy = y + (R() - .5) * r * 1.3 * sy, cr = r * (.08 + R() * .15);
    ctx.fillStyle = "rgba(15,10,8,.35)"; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, 6.2832); ctx.fill();
  }
  ctx.restore();
}
/* 행성 그리기(이름별 색) */
var LOOK = {
  "수성": ["#c9c2b8", "#4a4642"], "금성": ["#f3dca4", "#8a6a2a"], "화성": ["#ef8f60", "#5a2412"], "목성": ["#ecd6b2", "#7a5634"],
  "토성": ["#f3e2b6", "#8a6d3b"], "천왕성": ["#c4f2f2", "#2f7f8f"], "해왕성": ["#8cc0ff", "#1d3f8a"], "명왕성": ["#ecdcc8", "#6b5040"],
  "세레스": ["#b0aca6", "#3a3836"], "달": ["#dcdcdc", "#4b4e55"], "베스타": ["#c2b4a2", "#4a3e32"], "하우메아": ["#eef2f6", "#7a8494"],
  "에리스": ["#f2f2f0", "#8a8a88"]
};
function body(ctx, name, x, y, r) {
  if (name === "지구") { K.earth(ctx, x, y, r); return; }
  if (name === "류구" || name === "베누" || name === "이토카와") { rock(ctx, x, y, r, name.length * 7 + 3, name === "이토카와" ? 1.35 : 1, name === "이토카와" ? .75 : 1); return; }
  var c = LOOK[name] || ["#c9a26b", "#3b2a17"];
  if (name === "토성" && r > 6) {
    ctx.strokeStyle = "rgba(240,220,170,.55)"; ctx.lineWidth = Math.max(1.5, r * .16);
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.9, r * .5, -.3, Math.PI, 6.2832); ctx.stroke();
  }
  K.planet(ctx, x, y, r, c[0], c[1]);
  if ((name === "목성" || name === "토성") && r > 8) {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.clip();
    ctx.strokeStyle = "rgba(120,70,30,.28)"; ctx.lineWidth = r * .1;
    [-.45, -.15, .2, .5].forEach(function (k) { ctx.beginPath(); ctx.moveTo(x - r, y + k * r); ctx.lineTo(x + r, y + k * r); ctx.stroke(); });
    ctx.restore();
  }
  if (name === "토성" && r > 6) {
    ctx.strokeStyle = "rgba(240,220,170,.7)"; ctx.lineWidth = Math.max(1.5, r * .16);
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.9, r * .5, -.3, 0, Math.PI); ctx.stroke();
  }
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

    var Mm = 0, orbiting = !REDUCE;
    /* 우주 진열장 블록 모형: 상자 속 수평판(궤도면) 위에 화성 궤도. 위에서 본 좌표(X 오른쪽, Y 위)를 판 위로 옮긴다 */
    var LW = 628, ZH = 150, ZC = 62, SCw = 74, memo = {};
    var I = K.iso({ ox: 340, oy: 150, s: 0.62, L: 330, D: 330 });
    var CXw = 190, CYw = 165;                               /* 태양(초점) 자리 */
    function Pp(X, Y, z) { return I.P(CXw + X * SCw, CYw - Y * SCw, z == null ? ZC : z); }
    function paintCase(c) {
      var f = I.P(I.L, I.D, 0);
      K.studio(c, 0, 0, LW, H, { x: f.x - 20, y: f.y - 36, rx: 290, ry: 52 });
      caseBack(c, I, ZH, 15, 55);
      poly(c, [I.P(0, 0, ZC), I.P(I.L, 0, ZC), I.P(I.L, I.D, ZC), I.P(0, I.D, ZC)], "rgba(127,211,255,.06)", "rgba(127,211,255,.28)");
      [0.5, 1, 1.5].forEach(function (rr) {
        c.strokeStyle = "rgba(200,210,255,.18)"; c.lineWidth = 1; c.setLineDash([3, 5]); c.beginPath();
        for (var t = 0; t <= 360; t += 6) { var q = Pp(rr * Math.cos(t * D2R), rr * Math.sin(t * D2R)); if (t) c.lineTo(q.x, q.y); else c.moveTo(q.x, q.y); }
        c.stroke(); c.setLineDash([]);
      });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(cached(canvas, W, H, memo, "case", paintCase), 0, 0, W, H);
      var g = maxGap(e), ok = g <= 0.010;
      /* 모형 곡선 */
      ctx.save(); ctx.shadowColor = KC.blue; ctx.shadowBlur = 8; ctx.strokeStyle = KC.blue; ctx.lineWidth = 2.6; ctx.beginPath();
      for (var t = 0; t <= 360; t += 2) { var r = rad(e, t), q = Pp(r * Math.cos(t * D2R), r * Math.sin(t * D2R)); if (t === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y); }
      ctx.closePath(); ctx.stroke(); ctx.restore();
      /* 빈 초점 */
      var f2 = Pp(-2 * MA * e, 0);
      if (e > 0.01) { ctx.strokeStyle = "rgba(220,228,255,.8)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(f2.x, f2.y, 4.5, 2.6, 0, 0, 6.2832); ctx.stroke(); }
      /* 관측점(빨간 ✕) */
      THS.forEach(function (t, i) {
        var q = Pp(OBS[i] * Math.cos(t * D2R), OBS[i] * Math.sin(t * D2R));
        ctx.save(); ctx.shadowColor = KC.red; ctx.shadowBlur = 6; ctx.strokeStyle = KC.red; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(q.x - 5, q.y - 4); ctx.lineTo(q.x + 5, q.y + 4); ctx.moveTo(q.x + 5, q.y - 4); ctx.lineTo(q.x - 5, q.y + 4); ctx.stroke(); ctx.restore();
      });
      /* 태양(초점): 바닥 그림자와 높이 막대 */
      var s0 = Pp(0, 0), sf = Pp(0, 0, 0);
      ctx.fillStyle = "rgba(255,200,110,.25)"; ctx.beginPath(); ctx.ellipse(sf.x, sf.y, 18, 8, 0, 0, 6.2832); ctx.fill();
      K.line(ctx, sf, s0, "rgba(255,220,160,.4)", 1, [3, 3]);
      K.sun(ctx, s0.x, s0.y, 8); K.glow(ctx, s0.x, s0.y, 5, "rgba(255,226,150,.98)", 2.2);
      var E = solveKepler(e, Mm), th = trueFromEcc(e, E), rm = rad(e, th * R2D), mp = Pp(rm * Math.cos(th), rm * Math.sin(th));
      body(ctx, "화성", mp.x, mp.y, 7);
      caseFront(ctx, I, ZH);
      /* 이름표 */
      var box = [0, LW];
      I.label(ctx, CXw, CYw, ZC, "태양 (한 초점)", -150, 62, "#ffe7a8", box);
      if (e > 0.01) I.label(ctx, CXw - 2 * MA * e * SCw, CYw, ZC, "빈 초점", -60, -50, "#e8ecff", box);
      var oq = OBS[2]; I.label(ctx, CXw, CYw - oq * SCw, ZC, "✕ 티코의 관측 8개", 40, -40, "#ff9aac", box);
      var r2 = rad(e, 250); I.label(ctx, CXw + r2 * Math.cos(250 * D2R) * SCw, CYw - r2 * Math.sin(250 * D2R) * SCw, ZC, "내가 계산한 궤도", 70, 40, "#bfe6ff", box);
      K.pill(ctx, "화성", mp.x, mp.y - 14, { s: 10.5, a: "center", c: "#ffd9b8", box: box });
      K.bigText(ctx, "이심률 e = " + e.toFixed(3), 18, 50, 28, ok ? "#7dffc4" : "#ffd35a");
      K.bigText(ctx, e === 0 ? "완전한 원" : (ok ? "여덟 관측점이 모두 곡선 위에" : "최대 어긋남 " + g.toFixed(3) + " AU"), 18, 84, 18, "#ffffff");
      K.warn(ctx, LW - 14, H - 16, "⚠ 태양·화성 크기는 과장 · 궤도 모양은 실제 비율", "right");
      K.pill(ctx, "점선 원 = 태양에서 0.5 · 1 · 1.5 AU", 16, H - 16, { s: 10.5, c: "#e8ecff", box: [0, 300] });

      /* 오른쪽 판정 카드: 관측점별 거리표 */
      var RX = LW + 10, px = RX + 18, cw = W - RX;
      K.card(ctx, RX, 0, cw, H, "판정 · 관측점별 태양까지 거리 (AU)");
      K.t(ctx, e === 0 ? "원으로는 설명 못 함" : (ok ? "여덟 점 모두 합격" : (e < ME ? "아직 원에 가깝다" : "너무 찌그러졌다")), px, 64, { s: 19, w: "900", c: ok ? LT.green : (e === 0 ? LT.mute : LT.red) });
      var y0 = 98;
      K.t(ctx, "방향", px, y0, { s: 11, w: "800", c: LT.mute });
      K.t(ctx, "관측", px + 92, y0, { s: 11, w: "800", c: LT.red, a: "right" });
      K.t(ctx, "계산", px + 150, y0, { s: 11, w: "800", c: LT.blue, a: "right" });
      K.t(ctx, "차이", W - 18, y0, { s: 11, w: "800", c: LT.mute, a: "right" });
      THS.forEach(function (t, i) {
        var yy = y0 + 26 + i * 25, rm2 = rad(e, t), d = Math.abs(rm2 - OBS[i]), okd = d <= 0.010;
        if (i % 2 === 0) { ctx.fillStyle = "rgba(20,40,90,.05)"; ctx.fillRect(px - 8, yy - 17, cw - 20, 25); }
        K.t(ctx, t + "°", px, yy, { s: 12, w: "700", c: LT.ink });
        K.t(ctx, OBS[i].toFixed(3), px + 92, yy, { s: 12, w: "800", a: "right", c: LT.red });
        K.t(ctx, rm2.toFixed(3), px + 150, yy, { s: 12, w: "800", a: "right", c: LT.blue });
        ctx.fillStyle = okd ? LT.green : LT.red; ctx.beginPath(); ctx.roundRect(px + 158, yy - 9, Math.max(3, clamp(d / 0.15, 0, 1) * 30), 9, 3); ctx.fill();
        K.t(ctx, d.toFixed(3), W - 18, yy, { s: 12, w: "900", a: "right", c: okd ? LT.green : LT.red });
      });
      var yb = y0 + 26 + 8 * 25 + 8;
      K.row(ctx, "최대 어긋남 (기준 0.010)", g.toFixed(3) + " AU", px, W - 18, yb, ok ? LT.green : LT.red);
      K.t(ctx, "근일점 " + (MA * (1 - e)).toFixed(3) + " · 원일점 " + (MA * (1 + e)).toFixed(3) + " AU", px, yb + 24, { s: 11, w: "700", c: LT.mute });
      K.tip(ctx, ok ? "궤도는 태양을 한 초점에 둔 타원" : "이심률 슬라이더로 곡선을 맞춰 보세요", px - 4, H - 46, cw - 28, ok ? true : null);

      $("a-orbit-info").innerHTML = "이심률 <b>e = " + e.toFixed(3) + "</b> · 근일점 거리 " + (MA * (1 - e)).toFixed(3) +
        " AU · 원일점 거리 " + (MA * (1 + e)).toFixed(3) + " AU · 최대 어긋남 <b>" + g.toFixed(3) + " AU</b><br>" +
        (e === 0 ? "지금은 <b>완전한 원</b>입니다. 태양에서 어느 쪽이든 거리가 1.524 AU로 같으니, 1.38 AU와 1.67 AU를 동시에 설명할 수 없습니다."
          : (g <= 0.010 ? "🎉 여덟 관측점이 모두 곡선 위에 올라왔습니다. 화성의 실제 이심률은 <b>0.0934</b>입니다."
            : (e < ME ? "아직 원에 가깝습니다. 이심률을 더 키워 보세요." : "이번에는 너무 찌그러졌습니다. 이심률을 조금 줄여 보세요.")));
    }
    playBtn("a-orbit-play", orbiting, "⏸ 화성 멈추기", "▶ 화성 돌리기", function (on) { orbiting = on; });
    K.animate(canvas, function (dt) { if (orbiting) { Mm = (Mm + dt * 6.2832 / 9000) % 6.2832; draw(); } });
    canvas._redraw = draw;

    function check() {
      if (okE) {
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>이심률 <b>" + (okE).toFixed(3) +
          "</b>로 여덟 관측점을 모두 맞췄습니다. 행성의 궤도는 태양을 한 초점으로 하는 <b>타원</b>입니다 — 케플러 제1법칙.");
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

    /* 우주 진열장 블록 모형: 궤도면 위에서 60일 동안 쓸고 간 부채꼴 */
    var LW = 628, ZH = 140, ZC = 58, SCw = 80, memo = {};
    var I = K.iso({ ox: 340, oy: 146, s: 0.6, L: 330, D: 330 });
    var CXw = 180, CYw = 165;
    function Pp(X, Y, z) { return I.P(CXw + X * SCw, CYw - Y * SCw, z == null ? ZC : z); }
    function polar(r, th) { return Pp(r * Math.cos(th), r * Math.sin(th)); }
    function paintCase(c) {
      var f = I.P(I.L, I.D, 0);
      K.studio(c, 0, 0, LW, H, { x: f.x - 20, y: f.y - 36, rx: 290, ry: 50 });
      caseBack(c, I, ZH, 27, 55);
      poly(c, [I.P(0, 0, ZC), I.P(I.L, 0, ZC), I.P(I.L, I.D, ZC), I.P(0, I.D, ZC)], "rgba(127,211,255,.06)", "rgba(127,211,255,.28)");
      c.strokeStyle = "rgba(220,228,255,.6)"; c.lineWidth = 2; c.beginPath();
      for (var t = 0; t <= 360; t += 2) { var q = polar(rAt(t * D2R), t * D2R); if (t) c.lineTo(q.x, q.y); else c.moveTo(q.x, q.y); }
      c.closePath(); c.stroke();
      K.line(c, polar(rAt(Math.PI), Math.PI), polar(rAt(0), 0), "rgba(200,210,255,.4)", 1, [4, 4]);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(cached(canvas, W, H, memo, "case", paintCase), 0, 0, W, H);
      var p = path || sweep(start), upto = path ? shown : 0, s0 = Pp(0, 0);
      /* 쓸고 간 부채꼴 */
      if (upto > 0) {
        ctx.beginPath(); ctx.moveTo(s0.x, s0.y);
        for (var i = 0; i <= upto; i++) { var q = polar(p.pts[i].r, p.pts[i].th); ctx.lineTo(q.x, q.y); }
        ctx.closePath();
        ctx.fillStyle = "rgba(63,211,163,.5)"; ctx.fill(); ctx.strokeStyle = KC.green; ctx.lineWidth = 1.6; ctx.stroke();
      }
      /* 이미 잰 두 기록은 옅게 남겨 둔다 */
      [[got.near, "rgba(255,179,92,.28)"], [got.far, "rgba(127,211,255,.28)"]].forEach(function (g2) {
        if (!g2[0] || path) return;
        var sw = sweep(g2[0].from); ctx.beginPath(); ctx.moveTo(s0.x, s0.y);
        sw.pts.forEach(function (q) { var qq = polar(q.r, q.th); ctx.lineTo(qq.x, qq.y); }); ctx.closePath(); ctx.fillStyle = g2[1]; ctx.fill();
      });
      var sf = Pp(0, 0, 0);
      ctx.fillStyle = "rgba(255,200,110,.25)"; ctx.beginPath(); ctx.ellipse(sf.x, sf.y, 18, 8, 0, 0, 6.2832); ctx.fill();
      K.line(ctx, sf, s0, "rgba(255,220,160,.4)", 1, [3, 3]);
      K.sun(ctx, s0.x, s0.y, 9); K.glow(ctx, s0.x, s0.y, 5, "rgba(255,226,150,.98)", 2.2);
      var cur = p.pts[upto], cp = polar(cur.r, cur.th);
      body(ctx, "화성", cp.x, cp.y, 7.5);
      caseFront(ctx, I, ZH);
      var box = [0, LW];
      I.label(ctx, CXw + rAt(0) * SCw, CYw, ZC, "근일점", 34, 26, "#ffd9a8", box);
      I.label(ctx, CXw - rAt(Math.PI) * SCw, CYw, ZC, "원일점", -40, -34, "#bfe6ff", box);
      I.label(ctx, CXw, CYw, ZC, "태양 (초점)", -120, 70, "#ffe7a8", box);
      K.pill(ctx, "화성", cp.x, cp.y - 14, { s: 10.5, a: "center", c: "#ffd9b8", box: box });
      var both = got.near && got.far;
      K.bigText(ctx, both ? "넓이가 같다" : "60일 동안 쓸고 간 넓이", 18, 50, both ? 28 : 25, both ? "#7dffc4" : "#ffd35a");
      K.bigText(ctx, path ? "출발 " + p.from + "° · 쓸고 가는 중" : "출발 자리 " + start + "°", 18, 84, 18, "#ffffff");
      K.warn(ctx, LW - 14, H - 16, "⚠ 태양·화성 크기는 과장", "right");

      /* 오른쪽 판정 카드: 측정 기록 */
      var RX = LW + 10, px = RX + 18, cw = W - RX;
      K.card(ctx, RX, 0, cw, H, "판정 · 측정 기록 (60일)");
      K.t(ctx, both ? "같은 시간 → 같은 넓이" : "기록 " + ((got.near ? 1 : 0) + (got.far ? 1 : 0)) + " / 2", px, 64, { s: 19, w: "900", c: both ? LT.green : LT.mute });
      function rec(y, label, r, col) {
        ctx.fillStyle = "rgba(20,40,90,.05)"; ctx.beginPath(); ctx.roundRect(px - 8, y, cw - 20, 96, 10); ctx.fill();
        ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(px - 8, y, 5, 96, [10, 0, 0, 10]); ctx.fill();
        K.t(ctx, label, px + 4, y + 22, { s: 12, w: "900", c: col });
        if (!r) { K.t(ctx, "아직 재지 않았습니다", px + 4, y + 50, { s: 12, w: "700", c: LT.dim }); return; }
        K.row(ctx, "쓸고 간 넓이", r.area.toFixed(3) + " AU²", px + 4, W - 28, y + 48, LT.ink);
        K.row(ctx, "돈 각도", r.deg.toFixed(1) + "°", px + 4, W - 28, y + 68, col);
        K.row(ctx, "이동 거리", r.arc.toFixed(3) + " AU", px + 4, W - 28, y + 88, col);
      }
      rec(90, "① 근일점 부근에서 출발", got.near, LT.orange);
      rec(198, "② 원일점 부근에서 출발", got.far, LT.blue);
      K.tip(ctx, both ? "가까울수록 빠르게 움직인다" : "근일점·원일점 부근에서 한 번씩", px - 4, H - 46, cw - 28, both ? true : null);
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
          got.near.area.toFixed(3) + " AU²</b>로 같았습니다. 대신 근일점 쪽에서 더 많이 돌고 더 멀리 갔습니다. 이것이 <b>면적 속도 일정 법칙</b>(제2법칙)입니다.");
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
      ctx.clearRect(0, 0, W, H);
      var LW = 628, wv = worst(n), ok = wv <= 5;
      K.studio(ctx, 0, 0, LW, H);
      /* 밝은 그래프: 두 축 모두 10배씩 커지는 눈금 */
      var x0 = 82, x1 = 606, y0 = 124, y1 = H - 52;
      var lxA = -0.55, lxB = 1.75, lyA = -0.85, lyB = 2.65;
      function px(la) { return x0 + (la - lxA) / (lxB - lxA) * (x1 - x0); }
      function py(lp) { return y1 - (lp - lyA) / (lyB - lyA) * (y1 - y0); }
      ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      ctx.strokeStyle = LT.grid; ctx.lineWidth = 1;
      [-0.5, 0, 0.5, 1, 1.5].forEach(function (la) {
        ctx.beginPath(); ctx.moveTo(px(la), y0); ctx.lineTo(px(la), y1); ctx.stroke();
        K.t(ctx, Math.pow(10, la) < 1 ? Math.pow(10, la).toFixed(1) : String(Math.round(Math.pow(10, la))), px(la), y1 + 17, { s: 10.5, c: LT.mute, a: "center", w: "700" });
      });
      [-0.5, 0, 0.5, 1, 1.5, 2, 2.5].forEach(function (lp) {
        ctx.beginPath(); ctx.moveTo(x0, py(lp)); ctx.lineTo(x1, py(lp)); ctx.stroke();
        K.t(ctx, Math.pow(10, lp) < 1 ? Math.pow(10, lp).toFixed(1) : String(Math.round(Math.pow(10, lp))), x0 - 8, py(lp) + 4, { s: 10.5, c: LT.mute, a: "right", w: "700" });
      });
      ctx.strokeStyle = LT.line; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      K.t(ctx, "궤도 긴반지름 a (AU)", x1, y1 + 36, { s: 11.5, w: "800", c: LT.mute, a: "right" });
      K.t(ctx, "공전 주기 P (년)", x0 - 50, y0 - 10, { s: 11.5, w: "800", c: LT.mute });
      /* 직선 P = a^n */
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
      ctx.strokeStyle = ok ? LT.green : LT.blue; ctx.lineWidth = 3; ctx.shadowColor = "rgba(20,40,90,.25)"; ctx.shadowBlur = 3;
      ctx.beginPath(); ctx.moveTo(px(lxA), py(n * lxA)); ctx.lineTo(px(lxB), py(n * lxB)); ctx.stroke();
      ctx.restore();
      /* 점: 입체 공 + 바닥 그림자 */
      BODIES.forEach(function (b, i) {
        var x = px(Math.log(b.a) / Math.LN10), y = py(Math.log(b.p) / Math.LN10);
        ctx.fillStyle = "rgba(20,30,60,.18)"; ctx.beginPath(); ctx.ellipse(x + 2, y + 7, 6, 2, 0, 0, 6.2832); ctx.fill();
        body(ctx, b.n, x, y, 6.5);
        K.pill(ctx, b.n, i % 2 ? x - 11 : x + 11, y + 5, { s: 10.5, a: i % 2 ? "right" : "left", c: "#e8ecff", box: [x0, x1] });
      });
      K.bigText(ctx, "P = a^" + n.toFixed(2), 18, 50, 30, ok ? "#7dffc4" : "#ffd35a");
      K.bigText(ctx, ok ? "곧 P² = a³ · 아홉 천체가 한 직선 위에" : "직선이 점들을 비껴간다 · 최대 오차 " + wv.toFixed(0) + "%", 18, 86, 18, "#ffffff");

      /* 오른쪽 판정 카드: 주기 예측 오차 */
      var RX = LW + 10, bx = RX + 18, cw = W - RX;
      K.card(ctx, RX, 0, cw, H, "판정 · 주기 예측 오차 (기준 ±5%)");
      K.t(ctx, ok ? "모두 5% 이내" : "최대 오차 " + wv.toFixed(1) + "%", bx, 64, { s: 19, w: "900", c: ok ? LT.green : LT.red });
      BODIES.forEach(function (b, i) {
        var pr = Math.pow(b.a, n), er = (pr / b.p - 1) * 100, yy = 100 + i * 28, ok5 = Math.abs(er) <= 5;
        K.t(ctx, b.n, bx, yy, { s: 12, c: LT.ink, w: "800" });
        var mid = bx + 112, wd = clamp(Math.abs(er) / 60, 0, 1) * 46;
        ctx.fillStyle = "#e3e9f1"; ctx.beginPath(); ctx.roundRect(mid - 46, yy - 10, 92, 11, 4); ctx.fill();
        ctx.strokeStyle = LT.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(mid, yy - 13); ctx.lineTo(mid, yy + 4); ctx.stroke();
        ctx.fillStyle = ok5 ? LT.green : LT.red; ctx.beginPath(); ctx.roundRect(er >= 0 ? mid : mid - Math.max(2, wd), yy - 10, Math.max(2, wd), 11, 3); ctx.fill();
        K.t(ctx, (er >= 0 ? "+" : "") + (Math.abs(er) >= 1000 ? Math.round(er).toLocaleString() : er.toFixed(1)) + "%", W - 18, yy, { s: 12, w: "900", a: "right", c: ok5 ? LT.green : LT.red });
      });
      K.tip(ctx, ok ? "a³/P² = 1 (AU³/년²) · 모두 같다" : "기울기 n 을 바꿔 보세요", bx - 4, H - 46, cw - 28, ok ? true : null);

      $("a-law3-info").innerHTML = "지수 <b>n = " + n.toFixed(2) + "</b> — 최대 오차 <b>" + wv.toFixed(1) + "%</b>. " +
        (wv <= 5 ? "🎉 아홉 천체가 한 직선 위에 놓였습니다. n = 1.5는 곧 <b>P = a<sup>1.5</sup>, 즉 P² = a³</b>입니다. a³/P² 값이 태양계의 모든 천체에서 <b>1 (AU³/년²)</b>로 같습니다."
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
    /* 우주 진열장 블록 모형: 태양(왼쪽 위 끝)에서 0.1~100 AU 를 10배씩 커지는 눈금으로 늘어놓은 긴 상자 */
    var LW = 628, ZH = 58, DL = 640, memo = {};
    var I = K.iso({ ox: 168, oy: 136, s: 0.6, L: DL, D: 60 });
    function XW(r) { return 20 + (Math.log(clamp(r, 0.1, 100)) / Math.LN10 + 1) / 3 * (DL - 40); }
    var YC = 30, ZC = ZH / 2;
    var SIDE = [[-1, 34], [-1, 80], [-1, 40], [-1, 82], [1, 40, 34]];
    function paintCase(c) {
      var f = I.P(DL * .6, I.D, 0);
      K.studio(c, 0, 0, LW, H, { x: f.x, y: f.y + 4, rx: 300, ry: 54 });
      caseBack(c, I, ZH, 33, 60);
      [0.1, 1, 10, 100].forEach(function (r) { K.line(c, I.P(XW(r), 0, 0), I.P(XW(r), I.D, 0), "rgba(255,211,107,.4)", 1, [2, 3]); });
      MARK.forEach(function (m) {
        var x = XW(m.r), p = I.P(x, YC, ZC), fp = I.P(x, YC, 0);
        c.fillStyle = "rgba(0,0,0,.35)"; c.beginPath(); c.ellipse(fp.x, fp.y, 7, 3, 0, 0, 6.2832); c.fill();
        K.line(c, fp, p, "rgba(200,210,255,.3)", 1, [2, 3]);
      });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var P = Math.pow(a, 1.5), q = a * (1 - HE), Q = a * (1 + HE), ok = Math.abs(P - 76) <= 1;
      ctx.drawImage(cached(canvas, W, H, memo, "case", paintCase), 0, 0, W, H);
      var sp = I.P(4, YC, ZC); K.sun(ctx, sp.x, sp.y, 9);
      MARK.forEach(function (m) { var p = I.P(XW(m.r), YC, ZC); body(ctx, m.n, p.x, p.y, m.n === "목성" || m.n === "토성" ? 6.5 : 5); });
      /* 핼리 혜성이 오가는 구간: 빛나는 띠(근일점 ~ 원일점) */
      var x1 = XW(q), x2 = Math.max(XW(q) + 4, XW(Q)), b1 = I.P(x1, YC - 14, ZC + 10), b2 = I.P(x2, YC - 14, ZC + 10);
      ctx.save(); ctx.shadowColor = KC.violet; ctx.shadowBlur = 10; ctx.lineCap = "round";
      var bg = ctx.createLinearGradient(b1.x, b1.y, b2.x, b2.y); bg.addColorStop(0, "rgba(182,156,255,.95)"); bg.addColorStop(1, "rgba(182,156,255,.35)");
      ctx.strokeStyle = bg; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(b1.x, b1.y); ctx.lineTo(b2.x, b2.y); ctx.stroke(); ctx.restore();
      K.glow(ctx, b1.x, b1.y, 3.2, "rgba(220,235,255,.95)", 4.5);
      caseFront(ctx, I, ZH);
      var box = [0, LW];
      I.label(ctx, 4, YC, ZC + 6, "태양", -14, 44, "#ffe7a8", box);
      MARK.forEach(function (m, k) { var sd = SIDE[k]; I.label(ctx, XW(m.r), YC, ZC, m.n + " " + m.r + " AU", sd[0] * sd[1], sd[2] != null ? sd[2] : (sd[0] < 0 ? sd[1] * .6 : -sd[1] * .6), "#e8ecff", box); });
      var tq = I.P(x1, YC - 14, ZC + 10), tQ = I.P(x2, YC - 14, ZC + 10);
      K.pill(ctx, "근일점 " + q.toFixed(2) + " AU", tq.x + 4, tq.y - 16, { s: 11, a: "center", c: "#d8ccff", box: box });
      K.pill(ctx, "원일점 " + Q.toFixed(1) + " AU", tQ.x, tQ.y - 16, { s: 11, a: "center", c: "#d8ccff", box: box });
      K.bigText(ctx, "P = " + a.toFixed(1) + "^1.5 = " + P.toFixed(1) + "년", 18, 50, 27, ok ? "#7dffc4" : "#ffd35a");
      K.bigText(ctx, "관측된 주기 76년 · 차이 " + (P - 76 >= 0 ? "+" : "") + (P - 76).toFixed(1) + "년", 18, 82, 17, "#ffffff");
      K.warn(ctx, LW - 14, H - 16, "⚠ 거리는 10배씩 커지는 눈금 · 천체 크기는 과장", "right");

      /* 오른쪽 판정 카드 */
      var RX = LW + 10, px = RX + 18, cw = W - RX;
      var yy = verdict(ctx, RX, 0, cw, H, ok ? "주기가 맞았다" : (P < 76 ? "주기가 짧다" : "주기가 너무 길다"), ok ? LT.green : LT.red,
        [["긴반지름 a", a.toFixed(1) + " AU"], ["계산한 주기 a^1.5", P.toFixed(1) + "년", LT.blue], ["관측된 주기", "76년"], ["근일점 거리", q.toFixed(2) + " AU", LT.violet], ["원일점 거리", Q.toFixed(1) + " AU", LT.violet]], 102, 28);
      K.bar(ctx, px, yy - 4, cw - 36, P / 152, ok ? LT.green : LT.yellow);
      var mx = px + (cw - 36) * 0.5; K.line(ctx, { x: mx, y: yy - 9 }, { x: mx, y: yy + 11 }, LT.ink, 2);
      K.t(ctx, "76년", mx, yy + 26, { s: 10.5, w: "900", a: "center", c: LT.ink });
      K.tip(ctx, ok ? "혜성도 행성과 같은 법칙" : "긴반지름을 바꿔 76년에 맞추기", px - 4, H - 46, cw - 28, ok ? true : null);

      $("a-halley-info").innerHTML = "긴반지름 <b>" + a.toFixed(1) + " AU</b> → 조화 법칙으로 계산한 주기 <b>" + P.toFixed(1) + "년</b>" +
        " (근일점 " + q.toFixed(2) + " AU, 원일점 " + Q.toFixed(1) + " AU, 이심률 0.967로 계산)<br>" +
        (Math.abs(P - 76) <= 1 ? "🎉 핼리 혜성의 긴반지름은 약 <b>17.8 AU</b>입니다. 태양에 금성보다 가까이 다가왔다가 <b>해왕성 바깥까지</b> 나갔다 오는 셈입니다. 혜성도 행성과 <b>같은 법칙</b>을 따릅니다."
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
    q: "수성부터 명왕성, 그리고 핼리 혜성까지 a³/P²이 모두 같은 값이 나옵니다. 이것은 무엇을 뜻할까요?",
    options: [
      "천체들이 서로 약속이나 한 듯 같은 속도로 움직인다는 뜻이다",
      "이 천체들이 모두 <b>태양이라는 하나의 중심 천체의 중력</b>에 매여 있고, 그 공통의 값은 태양의 질량으로 정해진다",
      "태양계의 모든 천체는 질량이 같다는 뜻이다",
      "우연히 맞아떨어진 것이라 다른 항성계에서는 성립하지 않는다"
    ],
    answer: 1,
    why: [
      "속도는 천체마다 다릅니다. 수성은 초속 47 km, 해왕성은 초속 5.4 km로 움직입니다.",
      "뉴턴이 보인 대로 a³/P² = GM/4π²입니다. 여기서 M은 태양의 질량이므로, 이 값이 모두 같다는 것은 <b>같은 태양의 중력</b>이 이들을 붙잡고 있다는 뜻입니다. 실제로 이 관계를 거꾸로 쓰면 태양의 질량을 구할 수 있습니다.",
      "질량은 전혀 다릅니다. 목성은 수성의 약 5,800배입니다.",
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
        : " — 8분은 관측의 잘못이 아니었습니다. 궤도가 원이 아니었던 것입니다.") +
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
      { n: "이토카와", d: 0.33, c1: true, c2: false, mu: null, kind: "소천체", note: "길이 535 m의 땅콩 모양 소행성입니다. 중력이 너무 약해 둥글어지지 못했습니다. 2005년 하야부사가 내려앉아 표본을 담았고, 2010년 지구로 가져왔습니다." },
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

    /* 밝은 스튜디오: 왼쪽 대리석 심사대 위 천체(입체 공), 오른쪽 '궤도 영역' 모형, 아래 μ 눈금 카드, 오른쪽 판정 카드 */
    var LW = 628, PI = K.iso({ ox: 170, oy: 194, s: 0.8, L: 130, D: 130 });
    function debrisN(o) { return !o.c1 ? 0 : (o.mu == null ? 46 : (o.mu < 1 ? 38 : (o.mu < 1e5 ? 6 : 3))); }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var o = OBJ[idx], TH = 300;
      var judge = o.kind === "행성" ? "행성" : (o.kind === "왜소행성" ? "왜소행성" : (o.kind === "위성" ? "위성 · 후보 아님" : "태양계 소천체"));
      var jc = o.kind === "행성" ? LT.blue : (o.kind === "왜소행성" ? LT.green : (o.kind === "위성" ? LT.mute : LT.orange));
      K.studio(ctx, 0, 0, LW, H, { x: 170, y: 292, rx: 130, ry: 26 });
      /* 심사대(대리석 받침) */
      PI.box(ctx, 0, 0, 0, 130, 130, 30, "#f4f5f7", "#dfe3e8", "#c3c9d1");
      PI.box(ctx, 10, 10, 30, 120, 120, 36, "#ffffff", "#e8ebef", "#cdd2d9");
      var plate0 = PI.P(30, 96, 8), plate1 = PI.P(70, 96, 26);
      poly(ctx, [PI.P(40, 130, 8), PI.P(90, 130, 8), PI.P(90, 130, 22), PI.P(40, 130, 22)], "#c9a24a", "#9c7a2c", 1);
      var top = PI.P(65, 65, 36), r = clamp(14 + 13 * Math.log(o.d / 0.3) / Math.LN10, 11, 64), cy = top.y - r - 2;
      ctx.fillStyle = "rgba(20,30,60,.22)"; ctx.beginPath(); ctx.ellipse(top.x + 4, top.y + 2, Math.min(60, r * .9), Math.min(22, r * .32), 0, 0, 6.2832); ctx.fill();
      if (o.n === "목성" || o.n === "지구" || o.n === "수성") { var hal = ctx.createRadialGradient(top.x, cy, r, top.x, cy, r + 12); hal.addColorStop(0, "rgba(127,211,255,.35)"); hal.addColorStop(1, "rgba(127,211,255,0)"); ctx.fillStyle = hal; ctx.beginPath(); ctx.arc(top.x, cy, r + 12, 0, 6.2832); ctx.fill(); }
      if (o.n === "하우메아") { ctx.save(); ctx.translate(top.x, cy + r * .2); ctx.scale(1.45, .8); body(ctx, o.n, 0, 0, r * .85); ctx.restore(); }
      else if (o.n === "베스타") rock(ctx, top.x, cy, r, 11, 1.05, .95);
      else body(ctx, o.n, top.x, cy, r);
      K.pill(ctx, o.n + " · 지름 " + (o.d >= 1 ? Math.round(o.d).toLocaleString() + " km" : Math.round(o.d * 1000) + " m"), top.x, 284, { s: 12, a: "center", c: "#ffe7a8", box: [0, 360] });
      /* 궤도 영역 모형: 기울어진 궤도 고리와 함께 도는 천체들 */
      var ox = 478, oy = 196, rx = 118, ry = 40, n = debrisN(o), R = K.rng(7 + idx);
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.25)"; ctx.shadowBlur = 16; ctx.fillStyle = "#141a46";
      ctx.beginPath(); ctx.ellipse(ox, oy, rx + 26, ry + 22, 0, 0, 6.2832); ctx.fill(); ctx.restore();
      ctx.strokeStyle = "rgba(127,211,255,.7)"; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.ellipse(ox, oy, rx, ry, 0, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
      if (o.c1) { K.sun(ctx, ox, oy, 6); } else { K.earth(ctx, ox, oy, 8); }
      for (var i = 0; i < n; i++) { var a = R() * 6.2832, k = .86 + R() * .28; ctx.fillStyle = "rgba(220,210,190," + (.5 + R() * .4) + ")"; ctx.beginPath(); ctx.arc(ox + Math.cos(a) * rx * k, oy + Math.sin(a) * ry * k, 1 + R() * 1.6, 0, 6.2832); ctx.fill(); }
      body(ctx, o.n === "이토카와" || o.n === "베스타" ? "세레스" : o.n, ox + rx * .7, oy + ry * .72, 6);
      K.pill(ctx, o.c1 ? "궤도 영역 · 함께 도는 천체 " + (n > 30 ? "많음" : (n ? "거의 없음" : "")) : "지구 둘레를 돈다", ox, oy + ry + 44, { s: 11, a: "center", c: "#bfe6ff", box: [370, LW - 4] });
      K.bigText(ctx, o.n + " → " + judge, 18, 50, 27, o.kind === "행성" ? "#9fdcff" : (o.kind === "왜소행성" ? "#7dffc4" : "#ffd35a"));
      K.bigText(ctx, o.kind === "행성" ? "세 조건을 모두 통과" : (o.kind === "왜소행성" ? "③ 궤도 주변을 치우지 못함" : (o.kind === "위성" ? "① 태양을 직접 돌지 않음" : "② 자기 중력으로 둥글지 못함")), 18, 82, 17, "#ffffff");
      K.warn(ctx, LW - 14, 30, "⚠ 천체 크기는 10배씩 커지는 눈금", "right");

      /* 아래: μ 눈금 카드 */
      var BY = TH + 8, bx0 = 40, bx1 = 596, by = H - 30;
      K.card(ctx, 8, BY, LW - 16, H - BY - 8, "궤도 정리 지수 μ (10배씩 커지는 눈금)");
      K.t(ctx, "μ = 자기 질량 ÷ 같은 궤도 영역 다른 천체 질량 합", LW - 26, BY + 28, { s: 10.5, w: "700", a: "right", c: LT.mute });
      function mx(m) { return bx0 + (Math.log(clamp(m, 0.01, 1e7)) / Math.LN10 + 2) / 9 * (bx1 - bx0); }
      ctx.fillStyle = "rgba(15,159,118,.12)"; ctx.fillRect(bx0, by - 54, mx(1) - bx0, 54);
      ctx.fillStyle = "rgba(28,126,214,.10)"; ctx.fillRect(mx(1), by - 54, bx1 - mx(1), 54);
      K.t(ctx, "← 왜소행성 쪽", mx(1) - 10, by - 6, { s: 11, w: "800", a: "right", c: LT.green });
      K.t(ctx, "행성 쪽 →", mx(1) + 10, by - 6, { s: 11, w: "800", c: LT.blue });
      K.line(ctx, { x: bx0, y: by }, { x: bx1, y: by }, LT.line, 1.5);
      [0.01, 0.1, 1, 100, 10000, 1000000].forEach(function (m) { K.t(ctx, m >= 1 ? m.toLocaleString() : String(m), mx(m), by + 16, { s: 10, c: LT.mute, a: "center", w: "700" }); });
      K.line(ctx, { x: mx(1), y: by - 52 }, { x: mx(1), y: by + 4 }, LT.yellow, 2.4);
      OBJ.forEach(function (b) {
        if (b.mu == null) return;
        var x = mx(b.mu), on = b === o;
        ctx.fillStyle = b.mu > 1 ? LT.blue : LT.green; ctx.beginPath(); ctx.arc(x, by - 26, on ? 7 : 4, 0, 6.2832); ctx.fill();
        if (on) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke(); K.pill(ctx, b.n + " μ = " + (b.mu >= 1000 ? b.mu.toLocaleString() : b.mu), x, by - 38, { s: 11, a: "center", c: "#ffe7a8", box: [10, LW - 10] }); }
      });

      /* 오른쪽 판정 카드: 세 조건 */
      var RX = LW + 10, px = RX + 18, cw = W - RX;
      K.card(ctx, RX, 0, cw, H, "판정 · IAU 행성의 세 조건");
      K.t(ctx, judge, px, 64, { s: 21, w: "900", c: jc });
      var labels = [
        ["① 태양을 직접 도는가", o.c1, o.c1 ? "태양을 직접 돈다" : "다른 천체의 위성이다"],
        ["② 자기 중력으로 둥근가", o.c1 && o.c2, o.c2 ? "정역학 평형을 이룬 둥근 모양" : "중력이 약해 둥글어지지 못함"],
        ["③ 궤도 주변을 치웠는가", o.c1 && o.c2 && o.mu != null && o.mu > 1, o.mu != null ? "μ = " + (o.mu >= 1000 ? o.mu.toLocaleString() : o.mu) : "μ가 1보다 훨씬 작다"]
      ];
      labels.forEach(function (L, i) {
        var yy = 92 + i * 84, okc = L[1];
        ctx.fillStyle = okc ? "#e7f7f0" : "#fdeee4"; ctx.beginPath(); ctx.roundRect(px - 8, yy, cw - 20, 72, 12); ctx.fill();
        ctx.fillStyle = okc ? LT.green : LT.red; ctx.beginPath(); ctx.arc(px + 14, yy + 36, 13, 0, 6.2832); ctx.fill();
        K.t(ctx, okc ? "✓" : "✕", px + 14, yy + 42, { s: 15, w: "900", a: "center", c: "#fff" });
        K.t(ctx, L[0], px + 36, yy + 30, { s: 12.5, w: "900", c: LT.ink });
        K.t(ctx, L[2], px + 36, yy + 52, { s: 11, w: "700", c: okc ? "#0f766e" : "#b4400c" });
      });
      K.tip(ctx, o.kind === "행성" ? "①②③ 모두 → 행성" : (o.kind === "왜소행성" ? "①② 만 → 왜소행성" : (o.kind === "위성" ? "위성은 심사 대상이 아님" : "① 만 → 태양계 소천체")), px - 4, H - 48, cw - 28, o.kind === "행성" || o.kind === "왜소행성" ? true : null);

      $("b-iau-info").innerHTML = "<b>" + o.n + " → " + (o.kind === "위성" ? "위성 (행성 후보 아님)" : judge) + "</b> · " + o.note +
        (o.mu != null ? "<br>μ = " + (o.mu >= 1000 ? o.mu.toLocaleString() : o.mu) + " 이므로, 궤도 영역에 남은 다른 천체들의 질량 합은 자기 질량의 <b>" +
          (o.mu > 1 ? "1/" + Math.round(o.mu).toLocaleString() : Math.round(1 / o.mu) + "배") + "</b>입니다." : "");
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
      ctx.clearRect(0, 0, W, H);
      var p = B[idx], d = dens(p), gg = grav(p), LW = 628;
      K.studio(ctx, 0, 0, LW, H, { x: 130, y: 318, rx: 110, ry: 22 });
      /* ── 왼쪽: 고른 천체를 받침 위에 (반지름 제곱근 눈금) + 지구 크기 점선 ── */
      var cx = 130, KS = 92 / Math.sqrt(B[4].r), rp = Math.max(9, Math.sqrt(p.r) * KS), re = Math.max(9, Math.sqrt(B[2].r) * KS);
      var PI = K.iso({ ox: 130, oy: 300, s: 1, L: 50, D: 50 }), cy = 300 - 18 - Math.max(rp, re) - 6 + (Math.max(rp, re) - rp);
      PI.box(ctx, -25, -25, 0, 25, 25, 16, "#f4f5f7", "#dfe3e8", "#c3c9d1");
      cy = PI.P(0, 0, 16).y - rp - 2;
      ctx.fillStyle = "rgba(20,30,60,.22)"; ctx.beginPath(); ctx.ellipse(cx + 3, PI.P(0, 0, 16).y + 1, Math.min(40, rp * .8), Math.min(12, rp * .25), 0, 0, 6.2832); ctx.fill();
      body(ctx, p.n, cx, cy, rp);
      ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(28,126,214,.85)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, PI.P(0, 0, 16).y - re - 2, re, 0, 6.2832); ctx.stroke(); ctx.restore();
      K.pill(ctx, p.n + " · " + p.g, cx, 352, { s: 13, a: "center", c: "#ffe7a8", box: [0, 262] });
      K.t(ctx, "반지름 " + (p.r >= 1 ? p.r.toLocaleString() + " km" : Math.round(p.r * 1000) + " m") + " · 점선 = 지구 크기", cx, 378, { s: 10.5, c: LT.mute, a: "center", w: "700" });
      /* ── 오른쪽: 밀도 막대(밝은 그래프) ── */
      var x0 = 340, x1 = 604, y0 = 112, rowH = 24;
      function bx(dd) { return x0 + clamp(dd / 6, 0, 1) * (x1 - x0); }
      ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.fillRect(x0, y0 - 6, x1 - x0, 12 * rowH + 8);
      [0, 1, 2, 3, 4, 5, 6].forEach(function (t) {
        K.line(ctx, { x: bx(t), y: y0 - 6 }, { x: bx(t), y: y0 + 12 * rowH + 2 }, LT.grid, 1);
        K.t(ctx, String(t), bx(t), y0 + 12 * rowH + 18, { s: 10, c: LT.mute, a: "center", w: "700" });
      });
      K.t(ctx, "밀도 (g/cm³)", x0 - 12, y0 + 12 * rowH + 18, { s: 10.5, w: "800", c: LT.mute, a: "right" });
      ctx.fillStyle = "rgba(20,40,90,.06)"; ctx.fillRect(268, y0 + 8 * rowH - 2, x1 - 268, 4 * rowH);
      B.forEach(function (b, i) {
        var yy = y0 + i * rowH, dd = dens(b), on = i === idx;
        K.t(ctx, b.n, x0 - 10, yy + 12, { s: 11.5, a: "right", w: on ? "900" : "700", c: on ? LT.orange : LT.ink });
        ctx.fillStyle = i < 8 ? (dd >= cut ? LT.orange : LT.blue) : "#a7b0bf"; ctx.beginPath(); ctx.roundRect(x0, yy, Math.max(2, bx(dd) - x0), 15, 4); ctx.fill();
        if (bx(dd) > x1 - 40) K.t(ctx, dd.toFixed(2), bx(dd) - 6, yy + 12, { s: 10.5, c: "#ffffff", w: "900", a: "right" }); else K.t(ctx, dd.toFixed(2), bx(dd) + 6, yy + 12, { s: 10.5, c: LT.mute, w: "800" });
        if (on) { ctx.strokeStyle = LT.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(270, yy - 4, x1 - 266, 23, 7); ctx.stroke(); }
      });
      K.line(ctx, { x: bx(cut), y: y0 - 10 }, { x: bx(cut), y: y0 + 12 * rowH + 2 }, LT.yellow, 3);
      K.t(ctx, "기준 " + cut.toFixed(1), Math.min(bx(cut) + 6, x1 - 50), y0 - 14, { s: 11, w: "900", c: "#b45309" });
      K.t(ctx, "회색 4줄 = 왜소행성·소행성", x1 - 6, y0 + 10 * rowH + 12, { s: 10, w: "800", c: LT.dim, a: "right" });
      K.bigText(ctx, p.n + " " + d.toFixed(2) + " g/cm³", 18, 50, 27, d >= 3 ? "#ffb37a" : "#9fdcff");
      K.bigText(ctx, d >= 3 ? "암석·금속이 주를 이룬다" : (d >= 1.5 ? "얼음과 암석이 섞였다" : "기체·얼음이거나 속이 비었다"), 18, 82, 17, "#ffffff");
      K.warn(ctx, 16, H - 16, "⚠ 공 크기는 제곱근 눈금");

      /* 오른쪽 판정 카드 */
      var RX = LW + 10, px = RX + 18, cw = W - RX, sp = splitOK(cut), n4 = 0, i;
      for (i = 0; i < 8; i++) if (dens(B[i]) >= cut) n4++;
      var gr = gg / EG;
      var yy2 = verdict(ctx, RX, 0, cw, H, sp ? "지구형 4 · 목성형 4" : "기준선 위 행성 " + n4 + "개", sp ? LT.green : LT.mute,
        [["평균 밀도", d.toFixed(2) + " g/cm³", LT.orange], ["표면 중력", (gr < 0.01 ? gr.toExponential(1) : gr.toFixed(2)) + " × 지구", LT.blue], ["분류", p.g], ["기준선", cut.toFixed(1) + " g/cm³", "#b45309"]], 104, 30);
      K.t(ctx, "밀도 = 질량 ÷ (4/3·π·r³)", px, yy2 + 6, { s: 11.5, w: "800", c: LT.mute });
      K.t(ctx, "표면 중력 = G·질량 ÷ 반지름²", px, yy2 + 28, { s: 11.5, w: "800", c: LT.mute });
      K.t(ctx, "물 1.00 · 암석 약 3 · 철 약 7.9", px, yy2 + 50, { s: 11.5, w: "800", c: LT.mute });
      K.tip(ctx, sp ? "겉모습이 아니라 밀도가 속을 알려 준다" : "지구형 4개만 위에 남게 옮기기", px - 4, H - 48, cw - 28, sp ? true : null);

      $("b-d1").textContent = d.toFixed(2) + " g/cm³";
      $("b-d2").textContent = (gg / EG) < 0.01 ? (gg / EG).toExponential(1) + "배" : (gg / EG).toFixed(2) + "배";
      $("b-d3").textContent = p.g;

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

    /* 블록 모형: 류구 속을 정육면체로 잘라 낸 단면. 앞면·오른쪽 면에 돌덩이와 빈틈이 보인다 */
    var LW = 628, BS = 200;
    var I = K.iso({ ox: 300, oy: 204, s: 0.55, L: BS, D: BS });
    function faceRocks(side, keep) {
      I.face(ctx, side, function (Lw) {
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, Lw, BS); ctx.clip();
        ctx.fillStyle = "#0c0d1c"; ctx.fillRect(0, 0, Lw, BS);
        SEEDS.forEach(function (q, i) {
          if (i >= keep) return;
          var u = ((q.a / 6.2832) * Lw + (side === "right" ? 37 : 0)) % Lw, z = q.q * BS, rr = q.r * 1.15;
          var sh = 0.55 + (i % 5) * .08, g = ctx.createRadialGradient(u - rr * .35, z + rr * .35, rr * .1, u, z, rr);
          g.addColorStop(0, "rgba(" + Math.round(205 * sh) + "," + Math.round(190 * sh) + "," + Math.round(170 * sh) + ",1)"); g.addColorStop(1, "#231d18");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(u, z, rr, 0, 6.2832); ctx.fill();
        });
        ctx.restore();
      });
      I.shade(ctx, side, function () { return BS; });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var d = GRAIN * (1 - f / 100), ok = Math.abs(d - TARGET) <= 0.03, keep = Math.round(SEEDS.length * (1 - f / 100));
      var fl = I.P(BS, BS, 0);
      K.studio(ctx, 0, 0, LW, H, { x: fl.x - 20, y: fl.y - 10, rx: 220, ry: 40 });
      faceRocks("front", keep); faceRocks("right", keep);
      /* 윗면: 류구 겉의 거친 바위 표면 */
      I.plane(ctx, BS, "#4d443c");
      var R = K.rng(3);
      for (var i = 0; i < 70; i++) { var q = I.P(R() * BS, R() * BS, BS); rock(ctx, q.x, q.y, 2 + R() * 5, 40 + i); }
      I.edges(ctx, BS, BS);
      var box = [0, LW];
      I.label(ctx, 30, BS, BS * .4, "돌덩이", -40, 20, "#ffd9b8", box);
      I.label(ctx, BS, BS * .45, BS * .62, "빈틈", 40, -10, "#bfe6ff", box);
      I.label(ctx, BS * .7, BS * .15, BS, "표면 · 바위투성이", 70, -24, "#e8ecff", box);
      K.bigText(ctx, "빈틈 " + f + "% → 밀도 " + d.toFixed(2), 18, 50, 27, ok ? "#7dffc4" : "#ffd35a");
      K.bigText(ctx, ok ? "속이 절반 넘게 빈 돌무더기" : "탐사선이 잰 값 1.19 g/cm³", 18, 82, 17, "#ffffff");
      K.warn(ctx, LW - 14, H - 16, "⚠ 류구 속 일부를 잘라 낸 모형 · 돌 크기는 실제 비율이 아님", "right");

      /* 오른쪽 판정 카드: 밀도 비교 */
      var RX = LW + 10, px = RX + 18, cw = W - RX;
      K.card(ctx, RX, 0, cw, H, "판정 · 평균 밀도 (g/cm³)");
      K.t(ctx, ok ? "탐사 값과 같다" : (d > TARGET ? "아직 너무 무겁다" : "너무 비었다"), px, 62, { s: 19, w: "900", c: ok ? LT.green : LT.red });
      [["돌 알갱이 자체", GRAIN, LT.orange], ["내 모형", d, LT.blue], ["탐사선이 잰 값", TARGET, LT.green]].forEach(function (q, k) {
        var yy = 96 + k * 50;
        K.row(ctx, q[0], q[1].toFixed(2), px, W - 18, yy, q[2]);
        K.bar(ctx, px, yy + 10, cw - 36, q[1] / 3, q[2]);
      });
      var tx = px + (cw - 36) * TARGET / 3; K.line(ctx, { x: tx, y: 100 }, { x: tx, y: 230 }, LT.green, 1.6, [4, 3]);
      K.t(ctx, "밀도 = 2.7 × (1 − 빈틈 비율)", px, H - 66, { s: 11, w: "800", c: LT.mute });
      K.tip(ctx, ok ? "부서진 돌이 헐겁게 모인 천체" : "차이 " + (d - TARGET >= 0 ? "+" : "") + (d - TARGET).toFixed(2) + " g/cm³", px - 4, H - 50, cw - 28, ok ? true : null);
      $("b-por-info").innerHTML = "빈틈 비율 <b>" + f + "%</b> → 평균 밀도 = 2.7 × (1 − " + (f / 100).toFixed(2) + ") = <b>" + d.toFixed(2) + " g/cm³</b><br>" +
        (ok ? "🎉 류구의 속은 <b>절반 넘게 비어 있습니다.</b> 통째로 된 바윗덩이가 아니라, 부서진 돌덩이들이 약한 중력으로 헐겁게 모인 <b>돌무더기(rubble pile)</b>인 것입니다. 하야부사2가 충돌 장치로 표면에 구덩이를 만들었을 때 예상보다 훨씬 큰 크레이터가 생긴 것도 이 때문입니다."
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

    /* 우주 진열장 블록 모형(궤도면 위 핼리 혜성 궤도) + 동그란 확대 창 + 오른쪽 판정 카드 */
    var LW = 628, ZH = 70, ZC = 30, memo = {};
    var I = K.iso({ ox: 150, oy: 150, s: 0.6, L: 520, D: 150 });
    var SCw = 13.4, SX = 46, SY = 75;                       /* 태양 자리(그림 단위). 근일점 쪽 = 왼쪽 위 */
    function Pp(X, Y, z) { return I.P(SX - X * SCw, SY + Y * SCw, z == null ? ZC : z); }
    function paintCase(c) {
      var f = I.P(I.L * .6, I.D, 0);
      K.studio(c, 0, 0, LW, H, { x: f.x, y: f.y + 4, rx: 300, ry: 56 });
      caseBack(c, I, ZH, 51, 60);
      poly(c, [I.P(0, 0, ZC), I.P(I.L, 0, ZC), I.P(I.L, I.D, ZC), I.P(0, I.D, ZC)], "rgba(127,211,255,.06)", "rgba(127,211,255,.28)");
      /* 목성 궤도(원) · 해왕성 궤도(상자 안에 든 부분만) */
      c.save(); poly(c, [I.P(0, 0, ZC), I.P(I.L, 0, ZC), I.P(I.L, I.D, ZC), I.P(0, I.D, ZC)]); c.clip();
      [[5.203, "rgba(255,211,107,.55)"], [30.07, "rgba(140,192,255,.55)"]].forEach(function (m) {
        c.strokeStyle = m[1]; c.lineWidth = 1.3; c.setLineDash([3, 4]); c.beginPath();
        for (var t = 0; t <= 360; t += 2) { var q = Pp(m[0] * Math.cos(t * D2R), m[0] * Math.sin(t * D2R)); if (t) c.lineTo(q.x, q.y); else c.moveTo(q.x, q.y); }
        c.stroke(); c.setLineDash([]);
      });
      c.restore();
      /* 핼리 혜성 궤도 */
      c.strokeStyle = "rgba(220,228,255,.75)"; c.lineWidth = 1.8; c.beginPath();
      for (var t2 = 0; t2 <= 360; t2 += 1) { var r2 = rAt(t2 * D2R), q2 = Pp(r2 * Math.cos(t2 * D2R), r2 * Math.sin(t2 * D2R)); if (t2) c.lineTo(q2.x, q2.y); else c.moveTo(q2.x, q2.y); }
      c.stroke();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var t = th * D2R, r = rAt(t);
      ctx.drawImage(cached(canvas, W, H, memo, "case", paintCase), 0, 0, W, H);
      var s0 = Pp(0, 0), sf = Pp(0, 0, 0);
      ctx.fillStyle = "rgba(255,200,110,.25)"; ctx.beginPath(); ctx.ellipse(sf.x, sf.y, 14, 6, 0, 0, 6.2832); ctx.fill();
      K.sun(ctx, s0.x, s0.y, 6);
      var cp = Pp(r * Math.cos(t), r * Math.sin(t)), cf = Pp(r * Math.cos(t), r * Math.sin(t), 0);
      ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(cf.x, cf.y, 5, 2.2, 0, 0, 6.2832); ctx.fill();
      K.line(ctx, cf, cp, "rgba(200,210,255,.35)", 1, [2, 3]);
      /* 화면 위 방향: 태양 쪽 u, 진행 방향 v (진열장에 그린 그대로) */
      var ux = s0.x - cp.x, uy = s0.y - cp.y, un = Math.sqrt(ux * ux + uy * uy) || 1; ux /= un; uy /= un;
      var t2 = t + 0.01, r2 = rAt(t2), cp2 = Pp(r2 * Math.cos(t2), r2 * Math.sin(t2));
      var vsx = cp2.x - cp.x, vsy = cp2.y - cp.y, vn = Math.sqrt(vsx * vsx + vsy * vsy) || 1; vsx /= vn; vsy /= vn;
      var vis = r <= 2.6;
      if (vis) { var tlm = clamp(40 / (r * r) + 10, 0, 34); var ig = ctx.createLinearGradient(cp.x, cp.y, cp.x - ux * tlm, cp.y - uy * tlm); ig.addColorStop(0, "rgba(160,210,255,.9)"); ig.addColorStop(1, "rgba(160,210,255,0)"); ctx.strokeStyle = ig; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cp.x, cp.y); ctx.lineTo(cp.x - ux * tlm, cp.y - uy * tlm); ctx.stroke(); }
      K.glow(ctx, cp.x, cp.y, 3.4, "rgba(182,156,255,.95)", 4.5);
      caseFront(ctx, I, ZH);
      var box = [0, LW];
      I.label(ctx, SX, SY, ZC, "태양", -16, -36, "#ffe7a8", box);
      var jq = Pp(5.203 * Math.cos(120 * D2R), 5.203 * Math.sin(120 * D2R)); K.pill(ctx, "목성 궤도", jq.x - 6, jq.y - 8, { s: 10, a: "right", c: "#ffe7a8", box: box });
      var nq = Pp(-30.07 * .96, 3); K.pill(ctx, "해왕성 궤도", nq.x + 8, nq.y + 30, { s: 10, c: "#bfe6ff", box: box });
      var aq = Pp(rAt(Math.PI) * Math.cos(Math.PI), 0); I.label(ctx, SX + rAt(Math.PI) * SCw, SY, ZC, "핼리 혜성 궤도 · 원일점 35 AU", -30, 52, "#e8ecff", box);

      /* 동그란 확대 창: 꼬리는 태양의 반대쪽 */
      var zx = 520, zy = 236, zr = 92;
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.3)"; ctx.shadowBlur = 16; ctx.fillStyle = "#2b3350"; ctx.beginPath(); ctx.arc(zx, zy, zr + 6, 0, 6.2832); ctx.fill(); ctx.restore();
      K.line(ctx, { x: cp.x + 6, y: cp.y }, { x: zx - zr * .86, y: zy - zr * .5 }, "rgba(80,100,140,.55)", 1.2, [4, 4]);
      ctx.save(); ctx.beginPath(); ctx.arc(zx, zy, zr, 0, 6.2832); ctx.fillStyle = "#06081c"; ctx.fill(); ctx.clip();
      var SR = K.rng(52); for (var i = 0; i < 60; i++) { ctx.globalAlpha = .3 + SR() * .6; ctx.fillStyle = "#fff"; ctx.fillRect(zx - zr + SR() * zr * 2, zy - zr + SR() * zr * 2, 1, 1); } ctx.globalAlpha = 1;
      K.sun(ctx, zx + ux * (zr - 6), zy + uy * (zr - 6), 9);
      K.line(ctx, { x: zx, y: zy }, { x: zx + ux * (zr - 22), y: zy + uy * (zr - 22) }, "rgba(255,211,107,.7)", 1.2, [4, 4]);
      var tl = clamp(60 / (r * r) + 34, 0, 80) * .95;
      if (vis) {
        var nxp = -uy, nyp = ux, ex = zx - ux * tl, ey = zy - uy * tl;
        var g1 = ctx.createLinearGradient(zx, zy, ex, ey); g1.addColorStop(0, "rgba(140,200,255,.9)"); g1.addColorStop(1, "rgba(140,200,255,0)");
        ctx.fillStyle = g1; ctx.beginPath(); ctx.moveTo(zx + nxp * 4, zy + nyp * 4); ctx.lineTo(ex + nxp * 9, ey + nyp * 9); ctx.lineTo(ex - nxp * 9, ey - nyp * 9); ctx.lineTo(zx - nxp * 4, zy - nyp * 4); ctx.closePath(); ctx.fill();
        var dxx = -ux * 0.87 - vsx * 0.5, dyy = -uy * 0.87 - vsy * 0.5, dn = Math.sqrt(dxx * dxx + dyy * dyy) || 1, dx2 = zx + dxx / dn * tl, dy2 = zy + dyy / dn * tl;
        var g2 = ctx.createLinearGradient(zx, zy, dx2, dy2); g2.addColorStop(0, "rgba(255,236,190,.9)"); g2.addColorStop(1, "rgba(255,200,120,0)");
        ctx.strokeStyle = g2; ctx.lineCap = "round";
        [14, 9, 4].forEach(function (w, k) { ctx.globalAlpha = .35 + k * .2; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(zx, zy); ctx.quadraticCurveTo(zx - ux * tl * .55, zy - uy * tl * .55, dx2, dy2); ctx.stroke(); });
        ctx.globalAlpha = 1; ctx.lineCap = "butt";
        var co = ctx.createRadialGradient(zx, zy, 1, zx, zy, 20); co.addColorStop(0, "rgba(220,240,255,.8)"); co.addColorStop(1, "rgba(160,200,255,0)");
        ctx.fillStyle = co; ctx.beginPath(); ctx.arc(zx, zy, 20, 0, 6.2832); ctx.fill();
      }
      K.glow(ctx, zx, zy, 4, "rgba(230,240,255,.95)", 3);
      K.arrow(ctx, { x: zx, y: zy }, { x: zx + vsx * 54, y: zy + vsy * 54 }, KC.green, 3, 12);
      ctx.restore();
      if (vis) {
        var sdx = -ux, sdy = -uy;
        K.pill(ctx, "꼬리", clamp(zx + sdx * (zr + 2), 440, LW - 30), clamp(zy + sdy * (zr + 2) + 4, 140, H - 24), { s: 10.5, a: "center", c: "#bfe6ff", box: [420, LW - 2] });
      }
      K.pill(ctx, "확대해 본 혜성 · 초록 화살표 = 진행 방향", zx, zy - zr - 16, { s: 10.5, a: "center", c: "#bfe6ff", box: [400, LW - 2] });

      /* 판정은 원래 식 그대로(위에서 본 궤도면 기준) */
      var oux = -Math.cos(t), ouy = Math.sin(t), ovx0 = -Math.sin(t), ovy0 = HE + Math.cos(t), on0 = Math.sqrt(ovx0 * ovx0 + ovy0 * ovy0);
      var fwd = (-oux) * (ovx0 / on0) + (-ouy) * (-ovy0 / on0);
      var judge = !vis ? "태양에서 멀어 꼬리가 거의 없다" : (fwd > 0.15 ? "꼬리가 진행 방향 ‘앞쪽’" : (fwd < -0.15 ? "꼬리가 진행 방향 ‘뒤쪽’" : "꼬리가 진행 방향과 거의 직각"));
      K.bigText(ctx, "태양까지 " + r.toFixed(2) + " AU", 18, 50, 27, vis ? "#ffd35a" : "#9fdcff");
      K.bigText(ctx, vis ? "꼬리는 늘 태양의 반대쪽" : "얼음이 승화하지 않아 꼬리가 없다", 18, 82, 17, "#ffffff");
      K.warn(ctx, LW - 14, H - 16, "⚠ 혜성·태양·꼬리 크기는 과장 · 궤도 모양은 실제 비율", "right");

      /* 오른쪽 판정 카드 */
      var RX = LW + 10, px = RX + 18, cw = W - RX, good = vis && fwd > 0.15;
      var yy = verdict(ctx, RX, 0, cw, H, !vis ? "꼬리 없음" : (fwd > 0.15 ? "꼬리가 앞장선다" : (fwd < -0.15 ? "꼬리가 뒤로 처진다" : "꼬리가 옆으로")), good ? LT.green : (vis ? LT.orange : LT.mute),
        [["궤도 위 자리", th + "°"], ["태양까지", r.toFixed(2) + " AU", LT.blue], ["움직임", th > 0 && th < 180 ? "멀어지는 중" : (th > 180 ? "다가가는 중" : (th === 180 ? "원일점" : "근일점"))]], 104, 30);
      K.t(ctx, "이온 꼬리: 태양풍에 밀려 곧게", px, yy + 10, { s: 11.5, w: "800", c: "#1c7ed6" });
      K.t(ctx, "먼지 꼬리: 궤도를 따라 조금 휜다", px, yy + 32, { s: 11.5, w: "800", c: "#b45309" });
      K.t(ctx, "꼬리는 약 3 AU 안쪽에서 생긴다", px, yy + 54, { s: 11.5, w: "800", c: LT.mute });
      K.tip(ctx, good ? "멀어질 때는 꼬리가 앞장서 간다" : judge, px - 4, H - 48, cw - 28, good ? true : null);

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

    var tau = 0, rvPlay = !REDUCE;
    /* 스튜디오: 왼쪽 위 우주 진열장(위에서 본 별·행성 → 궤도면), 오른쪽 위 별빛 스펙트럼 띠, 아래 밝은 시선 속도 그래프, 오른쪽 판정 카드 */
    var LW = 628, ZH = 96, ZC = 40, memo = {};
    var I = K.iso({ ox: 196, oy: 146, s: 0.6, L: 190, D: 190 });
    var CX = 95, CY = 95, RPw = 76, RSw = 11;
    function paintCase(c) {
      var f = I.P(I.L, I.D, 0);
      K.studio(c, 0, 0, LW, H, { x: f.x - 40, y: f.y - 20, rx: 170, ry: 34 });
      caseBack(c, I, ZH, 61, 48);
      poly(c, [I.P(0, 0, ZC), I.P(I.L, 0, ZC), I.P(I.L, I.D, ZC), I.P(0, I.D, ZC)], "rgba(127,211,255,.06)", "rgba(127,211,255,.28)");
      c.strokeStyle = "rgba(200,210,255,.4)"; c.lineWidth = 1.2; c.setLineDash([4, 5]); c.beginPath();
      for (var t = 0; t <= 360; t += 6) { var q = I.P(CX + RPw * Math.cos(t * D2R), CY + RPw * Math.sin(t * D2R), ZC); if (t) c.lineTo(q.x, q.y); else c.moveTo(q.x, q.y); }
      c.closePath(); c.stroke(); c.setLineDash([]);
    }
    function paint() {
      ctx.clearRect(0, 0, W, H);
      var KA = amp(P, Mp), vNow = KA * Math.sin(2 * Math.PI * tau / P);
      var okP = Math.abs(P - 4.23) <= 0.1, okK = Math.abs(KA - OBS_K) <= 1.5;
      ctx.drawImage(cached(canvas, W, H, memo, "case", paintCase), 0, 0, W, H);
      var ph = 2 * Math.PI * tau / P - Math.PI / 2, cs = Math.cos(ph), sn = Math.sin(ph);
      var st = I.P(CX - cs * RSw, CY - sn * RSw, ZC), pl = I.P(CX + cs * RPw, CY + sn * RPw, ZC);
      var red = clamp(vNow / 80, -1, 1);
      var col = red > 0 ? "rgba(255," + Math.round(200 - 110 * red) + "," + Math.round(170 - 120 * red) + ",.95)" : "rgba(" + Math.round(220 + 35 * red) + "," + Math.round(230 + 10 * red) + ",255,.95)";
      var c0 = I.P(CX, CY, ZC); ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(c0.x - 4, c0.y); ctx.lineTo(c0.x + 4, c0.y); ctx.stroke();
      var farP = (cs + sn) < 0;
      if (farP) K.planet(ctx, pl.x, pl.y, 5.5, "#7a6a5a", "#1a1410");
      K.glow(ctx, st.x, st.y, 9, col, 3);
      if (!farP) K.planet(ctx, pl.x, pl.y, 5.5, "#7a6a5a", "#1a1410");
      caseFront(ctx, I, ZH);
      /* 관측 방향(지구 쪽) */
      var e0 = I.P(CX, I.D + 6, ZC), e1 = I.P(CX, I.D + 70, ZC);
      K.arrow(ctx, e0, e1, "#5c7086", 2.4, 10);
      var box = [0, LW];
      K.pill(ctx, "지구 쪽 (관측 방향)", e1.x - 8, e1.y + 22, { s: 10.5, a: "center", c: "#e8ecff", box: box });
      I.label(ctx, CX + cs * RPw, CY + sn * RPw, ZC, "행성 (직접 보이지 않음)", 50, -30, "#e8ecff", [0, 400]);
      I.label(ctx, CX, CY, ZC + 8, "별 · 공통 무게중심 둘레로 흔들림", -70, -52, "#ffe7a8", box);
      /* 별빛 스펙트럼 띠: 흡수선이 다가오면 파랑 쪽, 멀어지면 빨강 쪽으로 (크게 과장) */
      var sx0 = 392, sx1 = 612, sy0 = 112, sh = 46, shift = clamp(vNow / 130, -1, 1) * 14;
      var sg = ctx.createLinearGradient(sx0, 0, sx1, 0);
      ["#6a3cff", "#2f6bff", "#20c0ff", "#3fe08a", "#f5e64a", "#ff9a2a", "#ff3b2f"].forEach(function (cc, i) { sg.addColorStop(i / 6, cc); });
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.25)"; ctx.shadowBlur = 10; ctx.fillStyle = sg; ctx.beginPath(); ctx.roundRect(sx0, sy0, sx1 - sx0, sh, 8); ctx.fill(); ctx.restore();
      [0.18, 0.31, 0.47, 0.6, 0.78].forEach(function (k) {
        var lx = sx0 + (sx1 - sx0) * k;
        K.line(ctx, { x: lx, y: sy0 + 4 }, { x: lx, y: sy0 + sh - 4 }, "rgba(255,255,255,.55)", 1, [2, 2]);
        ctx.fillStyle = "rgba(10,10,20,.88)"; ctx.fillRect(lx + shift - 1.6, sy0 + 2, 3.2, sh - 4);
      });
      K.t(ctx, "← 파랑 쪽 (다가옴)", sx0, sy0 + sh + 16, { s: 10.5, w: "800", c: LT.blue });
      K.t(ctx, "빨강 쪽 (멀어짐) →", sx1, sy0 + sh + 16, { s: 10.5, w: "800", c: LT.red, a: "right" });
      K.t(ctx, "별빛 스펙트럼 · 흡수선 (점선 = 제자리)", (sx0 + sx1) / 2, sy0 - 8, { s: 10.5, w: "800", c: LT.mute, a: "center" });
      K.t(ctx, (vNow >= 0 ? "+" : "") + vNow.toFixed(0) + " m/s", (sx0 + sx1) / 2, sy0 + sh + 46, { s: 22, w: "900", a: "center", c: vNow > 2 ? LT.red : (vNow < -2 ? LT.blue : LT.ink) });
      K.t(ctx, vNow > 2 ? "멀어지는 중 → 붉게" : (vNow < -2 ? "다가오는 중 → 푸르게" : "옆으로 움직이는 중"), (sx0 + sx1) / 2, sy0 + sh + 66, { s: 11.5, w: "800", a: "center", c: LT.mute });
      K.bigText(ctx, "흔들림 ±" + KA.toFixed(0) + " m/s", 18, 50, 27, okK ? "#7dffc4" : "#ffd35a");
      K.bigText(ctx, "주기 " + P.toFixed(2) + "일 · 관측 4.23일 ±56 m/s", 18, 82, 16, "#ffffff");
      K.warn(ctx, LW - 14, 30, "⚠ 별의 흔들림·선 이동은 크게 과장", "right");

      /* 아래: 밝은 시선 속도 그래프 */
      var TMAX = 12.5, VMAX = 130;
      var g = K.chart(ctx, { x: 6, y: 278, w: LW - 12, h: H - 282, x0: 0, x1: TMAX, y0: -VMAX, y1: VMAX, xt: 5, yt: 4, pl: 48, pr: 12, pt: 10, pb: 26, light: true, xf: function (v2) { return v2.toFixed(1) + "일"; } });
      ctx.fillStyle = "rgba(224,49,49,.08)"; ctx.fillRect(g.L, g.Y(OBS_K), g.R - g.L, g.Y(-OBS_K) - g.Y(OBS_K));
      K.line(ctx, { x: g.L, y: g.Y(OBS_K) }, { x: g.R, y: g.Y(OBS_K) }, LT.red, 1.3, [6, 4]);
      K.line(ctx, { x: g.L, y: g.Y(-OBS_K) }, { x: g.R, y: g.Y(-OBS_K) }, LT.red, 1.3, [6, 4]);
      K.line(ctx, { x: g.L, y: g.Y(0) }, { x: g.R, y: g.Y(0) }, LT.line, 1.2);
      var pts = []; for (var t = 0; t <= TMAX + 1e-6; t += 0.02) pts.push([t, clamp(KA * Math.sin(2 * Math.PI * t / P), -VMAX, VMAX)]);
      K.plot(ctx, g, pts, okP && okK ? LT.green : LT.blue, { light: true, w: 2.6 });
      OBS.forEach(function (o) { ctx.fillStyle = LT.red; ctx.beginPath(); ctx.arc(g.X(o.t), g.Y(clamp(o.v, -VMAX, VMAX)), 3.4, 0, 6.2832); ctx.fill(); });
      if (tau <= TMAX) { K.line(ctx, { x: g.X(tau), y: g.T }, { x: g.X(tau), y: g.B }, LT.ink, 1, null, .5); ctx.fillStyle = LT.ink; ctx.beginPath(); ctx.arc(g.X(tau), g.Y(clamp(vNow, -VMAX, VMAX)), 4, 0, 6.2832); ctx.fill(); }
      K.t(ctx, "● 관측 자료  — 내 모형  · 빨간 띠 = 관측 진폭 ±56 m/s", g.L + 8, g.T + 14, { s: 10.5, w: "800", c: LT.mute });
      K.t(ctx, "시선 속도 (m/s)", g.L + 8, g.B - 6, { s: 10, w: "800", c: LT.dim });

      /* 오른쪽 판정 카드 */
      var RX = LW + 10, px = RX + 18, cw = W - RX, a = Math.pow(MSTAR * Math.pow(P / 365.25, 2), 1 / 3);
      verdict(ctx, RX, 0, cw, H, okP && okK ? "관측을 재현했다" : (!okP ? "먼저 주기를 맞추기" : "질량으로 높이 맞추기"), okP && okK ? LT.green : LT.orange,
        [["공전 주기", P.toFixed(2) + "일", okP ? LT.green : LT.blue], ["", "관측 4.23일", LT.mute], ["시선 속도 진폭", KA.toFixed(1) + " m/s", okK ? LT.green : "#b45309"], ["", "관측 56 m/s", LT.mute], ["행성 질량", Mp.toFixed(2) + " 목성질량"], ["궤도 반지름", a.toFixed(4) + " AU", LT.blue]], 104, 30);
      K.t(ctx, "질량이 클수록 별이 크게 흔들린다", px, 300, { s: 11.5, w: "800", c: LT.mute });
      K.t(ctx, "주기가 길수록 흔들림은 작다", px, 320, { s: 11.5, w: "800", c: LT.mute });
      K.tip(ctx, okP && okK ? "별 가까이 도는 뜨거운 목성" : (!okP ? "곡선 간격을 관측점에 겹치기" : (KA > OBS_K ? "지금은 너무 높다" : "지금은 너무 낮다")), px - 4, H - 48, cw - 28, okP && okK ? true : null);
    }
    function draw() {
      paint();
      var KA = amp(P, Mp);
      var a = Math.pow(MSTAR * Math.pow(P / 365.25, 2), 1 / 3);
      var okP = Math.abs(P - 4.23) <= 0.1, okK = Math.abs(KA - OBS_K) <= 1.5;
      var rd = $("c-rv-read");
      if (rd) rd.innerHTML = "<span class='k'>공전 주기</span><span class='v " + (okP ? "g" : "b") + "'>" + P.toFixed(2) + "일</span><span class='sub'>관측 4.23일</span>" +
        "<span class='k'>시선 속도 진폭</span><span class='v " + (okK ? "g" : "y") + "'>" + KA.toFixed(1) + " m/s</span><span class='sub'>관측 56 m/s · 행성 " + Mp.toFixed(2) + " 목성질량</span>" +
        "<span class='k'>궤도 반지름</span><span class='v b'>" + a.toFixed(4) + " AU</span>" +
        "<span class='ok " + (okP && okK ? "g" : "r") + "'>" + (okP && okK ? "관측을 재현했습니다" : (!okP ? "먼저 주기를 맞추세요" : "이제 질량으로 높이를 맞추세요")) + "</span>";
      $("c-rv-info").innerHTML = "공전 주기 <b>" + P.toFixed(2) + "일</b>, 행성 질량 <b>" + Mp.toFixed(2) + " 목성질량</b> → 계산한 시선 속도 진폭 <b>" +
        KA.toFixed(1) + " m/s</b> (관측값 56) · 조화 법칙으로 구한 궤도 반지름 <b>" + a.toFixed(4) + " AU</b><br>" +
        (!okP ? "먼저 <b>주기</b>부터 맞추세요. 곡선이 되풀이되는 간격을 관측점의 오르내림에 겹쳐 보면 됩니다."
          : (!okK ? "주기는 맞았습니다. 이제 <b>질량</b>을 바꿔 곡선의 높이를 ±56 m/s 띠에 맞추세요. " + (KA > OBS_K ? "지금은 너무 높습니다." : "지금은 너무 낮습니다.")
            : "🎉 관측을 재현했습니다. 목성의 절반쯤 되는 행성이 <b>수성(0.39 AU)의 7분의 1</b>밖에 안 되는 거리를 4일 만에 한 바퀴 돌고 있습니다. 이런 행성을 <b>뜨거운 목성</b>이라 부릅니다. 당시 이론으로는 거대 기체 행성이 별 가까이에서 만들어질 수 없다고 보았기 때문에, 이 발견은 행성계 형성 이론을 다시 쓰게 했습니다."));

      var ch = false;
      if (!got.p && okP) { got.p = true; ch = true; }
      if (!got.k && okK) { got.k = true; ch = true; }
      /* 기록으로 남기는 질량은 주기까지 맞은 값만 */
      if (okP && okK && window.sthState("rvMp") !== Mp) window.sthState("rvMp", Mp);
      if (ch) { window.sthState("rv", got); check(); }
    }
    playBtn("c-rv-play", rvPlay, "⏸ 별 멈추기", "▶ 별 움직이기", function (on) { rvPlay = on; });
    K.animate(canvas, function (dt) { if (rvPlay) { tau += dt / 1000 * 1.5; if (tau > 12.5) tau = 0; paint(); } });
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

  /* ---------------- 장면 3 — 식 현상(통과)법 (우주 진열장 블록 모형 + 망원경 화면 + 광도 곡선) ---------------- */
  (function () {
    var canvas = $("c-tr"); if (!canvas) return;
    var ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var RSUN = 695700, RE = 6371, RJ = 71492, MJKG = 1.898e27;
    var RSTAR = 1.20 * RSUN, OBS_D = 1.40, MP_J = 0.69;
    var rp = 1, phase = null, busy = false, okR = window.sthState("trR") || 0;
    var th = -2.2, orbiting = !REDUCE;                 /* th: 궤도 위 행성 각(0 = 지구 쪽 한가운데) */

    function depth(rr) { var x = rr * RE / RSTAR; return x * x * 100; }
    function kk() { return rp * RE / RSTAR; }

    /* ── 진열장: x 0~L(화면 오른쪽 아래), y 0~D(왼쪽 아래), z 위. 지구는 +x 쪽 바깥 ── */
    var DH = 440;
    var I = K.iso({ ox: 372, oy: 218, s: 0.72, L: 300, D: 300 });
    var L = I.L, D = I.D, ZH = 210, ZC = 105, CX = 150, CY = 150;
    var A = 104, RS = 23;                              /* 궤도 반지름 · 별 반지름(그림 단위, 크게 과장) */
    var EARTH = { x: L + 175, y: CY, z: ZC };
    var INS = { x: 772, y: 262, r: 86, R: 60 };         /* 망원경으로 본 모습(동그란 창) */

    function poly(pts, fill, stroke, lw) {
      ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
    }
    function pPos(a) { return { x: CX + A * Math.cos(a), y: CY + A * Math.sin(a) }; }
    /* 지구에서 본 가로 위치(별 반지름 단위): 시선(+x 쪽)에서 보면 +y 가 오른쪽 */
    function phOf(a) { return A * Math.sin(a) / RS; }
    function nearSide(a) { return Math.cos(a) > 0; }
    function curPh() {
      if (phase != null) return phase;
      var p = phOf(th);
      return nearSide(th) && Math.abs(p) <= 1.6 ? p : null;
    }
    function bright(u) {                               /* u: −1.6~1.6 (0이 한가운데) */
      var k = kk(), d = depth(rp), edge = 1 + k, inn = 1 - k, au = Math.abs(u);
      if (au >= edge) return 100;
      if (au <= inn) return 100 - d;
      return 100 - d * (edge - au) / Math.max(1e-6, edge - inn);
    }

    function drawOrbit(front) {
      ctx.save(); ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.strokeStyle = "rgba(127,211,255,.75)";
      ctx.beginPath(); var on = false;
      for (var i = 0; i <= 120; i++) {
        var a = i / 120 * 6.2832, p = pPos(a), isF = (p.x + p.y) > (CX + CY);
        if (isF === front) { var q = I.P(p.x, p.y, ZC); if (on) ctx.lineTo(q.x, q.y); else { ctx.moveTo(q.x, q.y); on = true; } }
        else on = false;
      }
      ctx.stroke(); ctx.restore();
    }
    function drawPlanet(pa, prPx) {
      var w = pPos(pa), q = I.P(w.x, w.y, ZC);
      K.planet(ctx, q.x, q.y, prPx, "#d9a46a", "#4a2a14");
      return q;
    }

    function drawModel() {
      var k = kk(), d = depth(rp), ph = curPh();
      var pa = phase != null ? Math.asin(clamp(phase * RS / A, -1, 1)) : th;
      K.studio(ctx, 0, 0, W, DH, { x: I.P(L, D, 0).x - 60, y: I.P(L, D, 0).y - 40, rx: 300, ry: 52 });
      /* 안쪽 우주: 바닥과 뒤쪽 두 벽 */
      var f00 = I.P(0, 0, 0), fL0 = I.P(L, 0, 0), fLD = I.P(L, D, 0), f0D = I.P(0, D, 0);
      var t00 = I.P(0, 0, ZH), tL0 = I.P(L, 0, ZH), t0D = I.P(0, D, ZH);
      var g = ctx.createLinearGradient(0, t00.y, 0, fLD.y); g.addColorStop(0, "#0b1030"); g.addColorStop(1, "#1a1f4e");
      poly([f00, fL0, tL0, t00], g); poly([f00, f0D, t0D, t00], "#0d1238"); poly([f00, fL0, fLD, f0D], "#141a46");
      ctx.save(); ctx.beginPath(); [f0D, f00, fL0, tL0, t00, t0D].forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.lineTo(fLD.x, fLD.y); ctx.closePath(); ctx.clip();
      var R = K.rng(83);
      for (var i = 0; i < 140; i++) { ctx.globalAlpha = .25 + R() * .6; ctx.fillStyle = R() > .9 ? "#ffe2b8" : "#ffffff"; ctx.beginPath(); ctx.arc(t0D.x + R() * (tL0.x - t0D.x), t00.y + R() * (fLD.y - t00.y), R() > .95 ? 1.4 : .7, 0, 6.2832); ctx.fill(); }
      ctx.globalAlpha = 1; ctx.restore();
      /* 바닥 눈금 */
      ctx.strokeStyle = "rgba(160,175,255,.14)"; ctx.lineWidth = 1;
      for (var gx = 50; gx < L; gx += 50) { var a1 = I.P(gx, 0, 0), b1 = I.P(gx, D, 0); ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(b1.x, b1.y); ctx.stroke(); }
      for (var gy = 50; gy < D; gy += 50) { var a2 = I.P(0, gy, 0), b2 = I.P(L, gy, 0); ctx.beginPath(); ctx.moveTo(a2.x, a2.y); ctx.lineTo(b2.x, b2.y); ctx.stroke(); }
      /* 바닥 그림자 · 높이 막대 */
      var wp = pPos(pa);
      [[CX, CY, 26, "rgba(255,200,110,.22)"], [wp.x, wp.y, 9, "rgba(0,0,0,.45)"]].forEach(function (s) {
        var c0 = I.P(s[0], s[1], 0); ctx.fillStyle = s[3]; ctx.beginPath(); ctx.ellipse(c0.x, c0.y, s[2], s[2] * .5, 0, 0, 6.2832); ctx.fill();
        K.line(ctx, c0, I.P(s[0], s[1], ZC), "rgba(200,210,255,.35)", 1, [3, 3]);
      });
      /* 궤도면(시선과 나란한 판) */
      I.plane(ctx, ZC, "rgba(127,211,255,.07)", "rgba(127,211,255,.28)");
      /* 시선: 별 → 지구 (궤도면 위) */
      var sc = I.P(CX, CY, ZC), ep = I.P(EARTH.x, EARTH.y, EARTH.z);
      drawOrbit(false);
      var prPx = Math.max(3.4, RS * k * I.s * 2.6);
      var far = !((wp.x + wp.y) > (CX + CY));
      if (far) drawPlanet(pa, prPx);
      K.sun(ctx, sc.x, sc.y, RS * I.s * .9);
      K.glow(ctx, sc.x, sc.y, RS * I.s * .55, "rgba(255,226,150,.98)", 2.2);
      if (!far) drawPlanet(pa, prPx);
      drawOrbit(true);
      /* 앞쪽 유리 두 면 + 윗면 */
      var tLD = I.P(L, D, ZH);
      var gl = ctx.createLinearGradient(f0D.x, f0D.y, fLD.x, tLD.y); gl.addColorStop(0, "rgba(255,255,255,.10)"); gl.addColorStop(1, "rgba(200,225,255,.04)");
      poly([f0D, fLD, tLD, t0D], gl, "rgba(255,255,255,.55)", 1.2);
      poly([fLD, fL0, tL0, tLD], "rgba(190,215,255,.07)", "rgba(255,255,255,.55)", 1.2);
      poly([t00, tL0, tLD, t0D], "rgba(255,255,255,.05)", "rgba(255,255,255,.7)", 1.2);
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(t0D.x + 8, t0D.y + 10); ctx.lineTo(t0D.x + 40, t0D.y + 52); ctx.stroke();
      K.line(ctx, sc, ep, "rgba(255,211,107,.85)", 1.6, [7, 5]);
      /* 지구(관측자) */
      K.earth(ctx, ep.x, ep.y, 11);
      K.pill(ctx, "지구 · 망원경", ep.x - 6, ep.y + 30, { s: 11, a: "center", c: KC.blue });
      /* 이름표 */
      var box = [0, 650];
      I.label(ctx, CX, CY, ZC + RS, "별 HD 209458 (태양의 1.20배)", -178, -40, "#ffe7a8", box);
      var oL = pPos(-2.35); I.label(ctx, oL.x, oL.y, ZC, "행성의 궤도면 — 지구 쪽에서 보면 거의 옆면", 150, -66, "#bfe6ff", box);
      var mid = { x: (sc.x + ep.x) / 2, y: (sc.y + ep.y) / 2 };
      K.pill(ctx, "시선 방향", mid.x + 10, mid.y + 26, { s: 10.5, c: KC.yellow, box: box });
      var pq = I.P(wp.x, wp.y, ZC);
      K.pill(ctx, "행성 (지구의 " + rp.toFixed(1) + "배)", pq.x, pq.y - prPx - 10, { s: 10.5, a: "center", c: "#e8ecff", box: box });
      /* 망원경으로 본 모습 */
      var cx = INS.x, cy = INS.y, RR = INS.R;
      K.line(ctx, { x: ep.x + 12, y: ep.y - 4 }, { x: cx - INS.r * .9, y: cy + 30 }, "rgba(80,100,140,.55)", 1.2, [4, 4]);
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, INS.r, 0, 6.2832); ctx.fillStyle = "#05071a"; ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = "#2b3350"; ctx.stroke(); ctx.clip();
      var cg = ctx.createRadialGradient(cx, cy, RR * .8, cx, cy, RR * 1.5); cg.addColorStop(0, "rgba(255,200,110,.35)"); cg.addColorStop(1, "rgba(255,170,80,0)");
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, RR * 1.5, 0, 6.2832); ctx.fill();
      var sg = ctx.createRadialGradient(cx - RR * .1, cy - RR * .1, RR * .05, cx, cy, RR);
      sg.addColorStop(0, "#fff6d8"); sg.addColorStop(.6, "#ffd06a"); sg.addColorStop(.9, "#f29a34"); sg.addColorStop(1, "#c25a14");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, RR, 0, 6.2832); ctx.fill();
      var inFront = ph != null && Math.abs(ph) < 1 + k;
      if (ph != null) {
        var prr = Math.max(2, RR * k), pxx = cx + ph * RR;
        ctx.fillStyle = "#05060f"; ctx.beginPath(); ctx.arc(pxx, cy, prr, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = "rgba(127,211,255,.6)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(pxx, cy, prr + 1, 0, 6.2832); ctx.stroke();
      }
      ctx.restore();
      K.pill(ctx, "망원경으로 본 모습", cx, cy - INS.r - 12, { s: 11.5, a: "center", c: KC.blue });
      K.pill(ctx, inFront ? "별빛 " + (100 - bright(ph)).toFixed(2) + "% 가려짐" : "행성이 별 앞에 없음", cx, cy + INS.r + 24, { s: 11, a: "center", c: inFront ? KC.yellow : KC.mute });
      /* 큰 글자 */
      var ok = Math.abs(d - OBS_D) <= 0.06;
      if (busy || inFront) { K.bigText(ctx, "별빛에 그림자가 진다", 22, 52, 28, "#ffd35a"); K.bigText(ctx, "가려진 면적만큼 어두워진다", 22, 86, 18, "#ffffff"); }
      else if (rp <= 1.5) { K.bigText(ctx, "지구만 한 행성이라면", 22, 52, 28, "#ffffff"); K.bigText(ctx, "별빛은 " + d.toFixed(3) + "%밖에 안 줄어든다", 22, 86, 18, "#ffd35a"); }
      else if (ok) { K.bigText(ctx, "관측과 같은 그림자", 22, 52, 28, "#ffd35a"); K.bigText(ctx, "깊이 " + d.toFixed(2) + "% · 관측 1.40%", 22, 86, 18, "#ffffff"); }
      else if (d < OBS_D) { K.bigText(ctx, "아직 덜 가린다", 22, 52, 28, "#ffffff"); K.bigText(ctx, "내 모형 " + d.toFixed(2) + "% · 관측 1.40%", 22, 86, 18, "#ffd35a"); }
      else { K.bigText(ctx, "너무 많이 가렸다", 22, 52, 28, "#ffffff"); K.bigText(ctx, "내 모형 " + d.toFixed(2) + "% · 관측 1.40%", 22, 86, 18, "#ff9aac"); }
      K.warn(ctx, W - 14, 30, "⚠ 별·행성 크기와 궤도는 보기 쉽게 과장", "right");
    }

    function drawChart() {
      var d = depth(rp), BY = DH + 8, x0 = 90, x1 = 870, y0 = BY + 46, y1 = H - 18, ph = curPh();
      K.card(ctx, 0, BY, W, H - BY, "별의 밝기 · 행성이 별 앞을 가로지르는 동안 (가로축: 별 반지름 단위)");
      function py(f) { return clamp(y1 - (f - (100 - 2.2)) / 2.6 * (y1 - y0), y0, y1); }
      ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      [100, 99.5, 99, 98.5, 98].forEach(function (f) {
        K.line(ctx, { x: x0, y: py(f) }, { x: x1, y: py(f) }, LT.grid, 1);
        K.t(ctx, f.toFixed(1) + "%", x0 - 8, py(f) + 4, { s: 10.5, c: LT.mute, a: "right", w: "700" });
      });
      K.line(ctx, { x: x0, y: py(100 - OBS_D) }, { x: x1, y: py(100 - OBS_D) }, LT.red, 1.6, [6, 4]);
      K.t(ctx, "관측된 깊이 1.40%", x1 - 4, py(100 - OBS_D) + 16, { s: 11, w: "900", c: LT.red, a: "right" });
      var ok = Math.abs(d - OBS_D) <= 0.06;
      ctx.strokeStyle = ok ? LT.green : LT.orange; ctx.lineWidth = 2.8; ctx.lineJoin = "round"; ctx.beginPath();
      for (var u = -1.6; u <= 1.6; u += 0.004) {
        var xx = x0 + (u + 1.6) / 3.2 * (x1 - x0);
        if (u === -1.6) ctx.moveTo(xx, py(bright(u))); else ctx.lineTo(xx, py(bright(u)));
      }
      ctx.stroke();
      if (ph != null) {
        var mx = x0 + (ph + 1.6) / 3.2 * (x1 - x0);
        K.line(ctx, { x: mx, y: y0 }, { x: mx, y: y1 }, LT.ink, 1.4, null, .6);
        ctx.fillStyle = "#fff"; ctx.strokeStyle = LT.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, py(bright(ph)), 5, 0, 6.2832); ctx.fill(); ctx.stroke();
      }
      K.t(ctx, "내 모형 깊이 " + d.toFixed(2) + "%", x0 + 8, y1 - 8, { s: 12, w: "900", c: ok ? LT.green : LT.orange });
    }
    function paint() { ctx.clearRect(0, 0, W, H); drawModel(); drawChart(); }

    function draw() {
      paint();
      var d = depth(rp);
      var ok = Math.abs(d - OBS_D) <= 0.06;
      $("c-tr-info").innerHTML = "행성 반지름 <b>" + rp.toFixed(1) + " 지구 반지름</b> (= " + (rp * RE).toLocaleString() + " km = 목성의 " +
        (rp * RE / RJ).toFixed(2) + "배) → 밝기 감소 깊이 <b>" + d.toFixed(3) + "%</b> (관측값 1.40%)<br>" +
        (ok ? "🎉 맞췄습니다. 시선 속도법으로 잰 이 행성의 질량은 <b>0.69 목성질량</b>입니다. 질량과 반지름을 함께 쓰면 평균 밀도가 <b>" +
          (MP_J * MJKG / (4 / 3 * Math.PI * Math.pow(rp * RE * 1000, 3)) / 1000).toFixed(2) +
          " g/cm³</b> — <b>물보다도 가볍습니다.</b> 별에 바싹 붙어 뜨겁게 달궈진 채 부풀어 오른 기체 행성이라는 뜻입니다."
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
        paint();
        if (phase < 1.6) window.setTimeout(step, 18);
        else { th = Math.asin(clamp(1.6 * RS / A, -1, 1)); busy = false; $("c-tr-run").disabled = false; $("c-tr-run").textContent = "↻ 다시 관측하기"; phase = null; draw(); }
      })();
    });
    playBtn("c-tr-play", orbiting, "⏸ 공전 멈추기", "▶ 공전 보기", function (on) { orbiting = on; });
    K.animate(canvas, function (dt) {
      if (!orbiting || busy) return;
      var ft = nearSide(th) && Math.abs(phOf(th)) < 1.8;      /* 별 앞을 지날 때는 천천히 */
      th += dt / 1000 * (ft ? 0.16 : 0.75);
      if (th > Math.PI) th -= 6.2832;
      paint();
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
      "밀도 = 질량 ÷ 부피이고 부피는 반지름으로 구하므로, 두 방법을 합치면 평균 밀도가 나옵니다. HD 209458 b처럼 밀도가 0.3 g/cm³ 대면 기체 행성, 5 g/cm³ 대면 암석 행성입니다.",
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
        note: "약 40광년 거리의 아주 작고 차가운 적색 왜성입니다. 지구만 한 행성 7개가 모두 수성 궤도보다 훨씬 안쪽에서 돌고 있습니다."
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

    var SCOL = { sun: "rgba(255,226,140,.98)", tr1: "rgba(255,110,70,.98)", pro: "rgba(255,140,90,.98)", sir: "rgba(200,225,255,.98)" };
    /* 우주 진열장 블록 모형: 별(왼쪽 위 끝)에서 0.003~10 AU 를 10배씩 커지는 눈금으로. 초록 덩어리 = 생명 가능 지대 */
    var LW = 628, ZH = 84, DL = 640, ZC = 34, YC = 40, memo = {};
    var I = K.iso({ ox: 160, oy: 152, s: 0.62, L: DL, D: 80 });
    function XW(rr) { return 24 + (Math.log(clamp(rr, 0.0031, 10)) / Math.LN10 + 2.5) / 3.5 * (DL - 40); }
    function paintCase(c) {
      var f = I.P(DL * .6, I.D, 0);
      K.studio(c, 0, 0, LW, H, { x: f.x, y: f.y + 4, rx: 300, ry: 56 });
      caseBack(c, I, ZH, 81, 60);
      [0.01, 0.1, 1, 10].forEach(function (t) { K.line(c, I.P(XW(t), 0, 0), I.P(XW(t), I.D, 0), "rgba(255,211,107,.4)", 1, [2, 3]); });
      K.line(c, I.P(10, YC, ZC), I.P(DL - 6, YC, ZC), "rgba(200,210,255,.3)", 1.2, [3, 5]);
    }
    function slab(a, b, fill, top) {
      var x0 = XW(a), x1 = XW(b);
      poly(ctx, [I.P(x0, 0, 0), I.P(x1, 0, 0), I.P(x1, I.D, 0), I.P(x0, I.D, 0)], fill);
      poly(ctx, [I.P(x0, 0, 0), I.P(x1, 0, 0), I.P(x1, 0, ZH), I.P(x0, 0, ZH)], fill);
      if (top) { poly(ctx, [I.P(x0, I.D, 0), I.P(x1, I.D, 0), I.P(x1, I.D, ZH), I.P(x0, I.D, ZH)], fill, "rgba(63,211,163,.8)", 1); poly(ctx, [I.P(x0, 0, ZH), I.P(x1, 0, ZH), I.P(x1, I.D, ZH), I.P(x0, I.D, ZH)], fill); }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var s = STARS[si], L = lum(s), z = hz(s), r = orb(ri), inZ = r >= z.i && r <= z.o;
      ctx.drawImage(cached(canvas, W, H, memo, "case", paintCase), 0, 0, W, H);
      slab(z.wi, z.wo, "rgba(63,211,163,.10)", false);
      slab(z.i, z.o, "rgba(63,211,163,.20)", false);
      /* 별 */
      var sp = I.P(6, YC, ZC), sr = clamp(16 + 26 * Math.log(s.R * 10) / Math.LN10, 12, 54);
      ctx.save(); poly(ctx, [I.P(0, 0, 0), I.P(DL, 0, 0), I.P(DL, 0, ZH), I.P(0, 0, ZH), I.P(0, I.D, ZH), I.P(0, I.D, 0)]); ctx.lineTo(I.P(DL, I.D, 0).x, I.P(DL, I.D, 0).y); ctx.clip();
      K.glow(ctx, sp.x, sp.y, sr * .4, SCOL[s.k], 2.6); ctx.restore();
      /* 행성 */
      s.pl.forEach(function (p) {
        var xw = XW(p.r), q = I.P(xw, YC, ZC), f = I.P(xw, YC, 0), inHz = p.r >= z.i && p.r <= z.o;
        ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(f.x, f.y, 5, 2.2, 0, 0, 6.2832); ctx.fill();
        K.line(ctx, f, q, "rgba(200,210,255,.3)", 1, [2, 3]);
        if (s.k === "sun") body(ctx, p.n, q.x, q.y, 5.5);
        else K.planet(ctx, q.x, q.y, 4.6, inHz ? "#9ff0cf" : "#c7b9ff", inHz ? "#1f6b52" : "#3d2f7a");
      });
      /* 살펴보는 궤도 */
      var mxw = XW(r), oc = inZ ? KC.green : KC.blue;
      poly(ctx, [I.P(mxw, 0, 0), I.P(mxw, I.D, 0), I.P(mxw, I.D, ZH), I.P(mxw, 0, ZH)], inZ ? "rgba(63,211,163,.22)" : "rgba(127,211,255,.18)", oc, 1.6);
      var mp = I.P(mxw, YC, ZC); K.glow(ctx, mp.x, mp.y, 4.5, inZ ? "rgba(63,211,163,.95)" : "rgba(127,211,255,.95)", 3);
      slab(z.i, z.o, "rgba(63,211,163,.10)", true);
      caseFront(ctx, I, ZH);
      var box = [0, LW];
      [0.01, 0.1, 1, 10].forEach(function (t) { var q = I.P(XW(t), I.D, 0); K.t(ctx, t + " AU", q.x - 6, q.y + 14, { s: 10, w: "800", c: LT.mute, a: "right" }); });
      I.label(ctx, 6, YC, ZC + 6, s.n.replace(/^\S+\s/, ""), -10, -40, "#ffe7a8", box);
      s.pl.forEach(function (p, i) {
        var inHz = p.r >= z.i && p.r <= z.o, up = i % 2 === 0, len = s.pl.length > 4 ? (i % 4 < 2 ? 30 : 52) : 36;
        I.label(ctx, XW(p.r), YC, ZC, p.n, up ? len * .6 : -len * .6, up ? -len : len, inHz ? "#9ff0d0" : "#e8ecff", box);
      });
      var zc = I.P((XW(z.i) + XW(z.o)) / 2, 0, ZH), zl = { x: 470, y: 150 };
      K.line(ctx, zc, { x: zl.x - 40, y: zl.y + 4 }, "rgba(20,25,40,.6)", 1.2);
      ctx.fillStyle = "#111622"; ctx.beginPath(); ctx.arc(zc.x, zc.y, 2.5, 0, 6.283); ctx.fill();
      K.pill(ctx, "생명 가능 지대 " + z.i.toFixed(z.i < 0.1 ? 4 : 2) + "~" + z.o.toFixed(z.o < 0.1 ? 4 : 2) + " AU", zl.x, zl.y, { s: 11.5, a: "center", c: "#9ff0d0", box: box });
      K.bigText(ctx, r.toFixed(r < 0.1 ? 4 : 3) + " AU", 18, 50, 28, inZ ? "#7dffc4" : "#9fdcff");
      K.bigText(ctx, inZ ? "물이 액체로 있을 수 있는 거리" : (r < z.i ? "지대보다 안쪽 · 너무 뜨겁다" : "지대보다 바깥쪽 · 너무 차갑다"), 18, 84, 17, "#ffffff");
      K.warn(ctx, LW - 14, H - 16, "⚠ 거리는 10배씩 커지는 눈금 · 진한 초록 = 생명 가능 지대, 옅은 초록 = 넓게 잡은 지대", "right");

      /* 오른쪽 판정 카드 */
      var RX = LW + 10, px = RX + 18, cw = W - RX;
      var yy = verdict(ctx, RX, 0, cw, H, inZ ? "생명 가능 지대 안" : (r < z.i ? "너무 뜨겁다" : "너무 차갑다"), inZ ? LT.green : (r < z.i ? LT.red : LT.blue),
        [["별", s.n.replace(/^\S+\s/, "")], ["반지름", s.R.toFixed(3) + " R☉"], ["표면 온도", s.T.toLocaleString() + " K"], ["광도 L", (L >= 0.01 ? L.toFixed(3) : L.toExponential(2)) + " L☉", "#b45309"], ["살펴보는 궤도", r.toFixed(r < 0.1 ? 4 : 3) + " AU", LT.blue]], 102, 28);
      K.t(ctx, "L = (R/R☉)² × (T/5772)⁴", px, yy + 4, { s: 11.5, w: "800", c: LT.mute });
      K.t(ctx, "지대 = 0.95√L ~ 1.37√L AU", px, yy + 24, { s: 11.5, w: "800", c: LT.green });
      K.tip(ctx, inZ ? "거리 조건만 맞았다 · 생명은 따로" : "궤도 슬라이더로 초록 덩어리 안에", px - 4, H - 48, cw - 28, inZ ? true : null);

      var near = null;
      s.pl.forEach(function (p) { if (near === null || Math.abs(Math.log(p.r / r)) < Math.abs(Math.log(near.r / r))) near = p; });
      var rd = $("c-hz-read");
      if (rd) rd.innerHTML = "<span class='k'>광도</span><span class='v y'>" + (L >= 0.01 ? L.toFixed(3) : L.toExponential(2)) + " L☉</span>" +
        "<span class='k'>생명 가능 지대</span><span class='v g'>" + z.i.toFixed(z.i < 0.1 ? 4 : 2) + " ~ " + z.o.toFixed(z.o < 0.1 ? 4 : 2) + " AU</span>" +
        "<span class='k'>살펴보는 궤도</span><span class='v b'>" + r.toFixed(r < 0.1 ? 4 : 3) + " AU</span>" +
        "<span class='ok " + (inZ ? "g" : "r") + "'>" + (inZ ? "지대 안 · 물이 액체로 있을 수 있는 거리" : (r < z.i ? "지대보다 안쪽 · 너무 뜨겁다" : "지대보다 바깥쪽 · 너무 차갑다")) + "</span>";
      $("c-hz-info").innerHTML = "<b>" + s.n + "</b> — " + s.note + "<br>광도는 태양의 <b>" + (L >= 0.01 ? L.toFixed(3) : L.toExponential(2)) +
        "배</b>, 생명 가능 지대는 <b>" + z.i.toFixed(z.i < 0.1 ? 4 : 2) + " ~ " + z.o.toFixed(z.o < 0.1 ? 4 : 2) + " AU</b>. " +
        "지금 보고 있는 궤도 <b>" + r.toFixed(r < 0.1 ? 4 : 3) + " AU</b>는 " + (inZ ? "<b>지대 안</b>입니다." : (r < z.i ? "지대보다 <b>안쪽</b>이라 물이 끓어 날아갑니다." : "지대보다 <b>바깥쪽</b>이라 물이 얼어붙습니다.")) +
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
      { t: "밝기가 줄어든 깊이에서 행성의 반지름을 구했다", a: "tr", why: "깊이 = (행성 반지름 ÷ 별 반지름)²입니다." },
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
    { key: "r3", label: "③ 별이 흔들렸다" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
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
    { key: "r3", label: "③ 별이 흔들렸다" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
