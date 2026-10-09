/* 교과서 실험 — 교과서 탐구를 시뮬레이션으로 해 보고 하나만 바꿔 내 탐구로. 엔진: ../assets/inquiry.js
   교과서 쪽 번호는 비상교육 교과서. 내용은 교과서 문장을 옮기지 않고 짧게 줄여 새로 썼다. */
window.sthInquiry({ mount: "inq", key: "inq", result: "rInq", items: [
  { id: "e1", sec: "01", book: "행성우주과학", page: 28, title: "케플러 법칙으로 태양계 천체 자료 해석하기", purpose: "행성의 거리·위치·공전 주기 자료로 케플러의 세 법칙이 맞는지 확인한다.",
    steps: ["천체 관측 프로그램에서 대기·지면 효과를 끄고 태양계 밖에서 보는 시점으로 바꾼다", "날짜를 넘기며 행성이 태양에 가장 가까울 때와 멀 때의 거리를 찾아 긴반지름을 구한다", "화성의 두 기간 위치를 캡처해 쓸고 간 넓이를 격자 칸으로 센다", "공전 주기와 긴반지름으로 P²–a³ 그래프를 그려 기울기를 구한다"],
    iv: "행성 종류(수성·금성·지구·화성)", dv: "긴반지름(AU), 쓸고 간 넓이(칸), 공전 주기(년)", cv: ["관측자 시점", "대기·지면 효과 끔", "같은 기간 길이(약 30일)"], safety: "",
    extend: ["중심별의 질량을 바꾸면 같은 긴반지름에서 공전 주기가 어떻게 달라질까", "이심률만 크게 하면 같은 시간 동안 쓸고 간 넓이는 여전히 같을까"],
    sim: { kind: "iframe", name: "PhET 케플러의 법칙", url: "https://phet.colorado.edu/sims/html/keplers-laws/latest/keplers-laws_ko.html", h: 600,
      ivControl: "'제3법칙' 화면의 목표 궤도 목록에서 수성·금성·지구·화성 고르기(쓸고 간 넓이는 '제2법칙' 화면에서 구간 나누기)",
      dvReading: "긴반지름 a 와 공전 주기 T(그래프에서 T², a³ 단추로 기울기 확인)",
      x: { label: "긴반지름 a", unit: "AU" }, y: { label: "공전 주기 T", unit: "년" } } },
  { id: "e2", sec: "03", book: "행성우주과학", page: 40, title: "중심별 표면 온도에 따른 생명 가능 지대 추론", purpose: "주계열성의 질량(표면 온도)이 달라질 때 생명 가능 지대의 거리와 폭이 어떻게 바뀌는지 찾는다.",
    steps: ["H-R도에서 주계열성의 질량과 표면 온도 관계를 읽는다", "질량별 생명 가능 지대 그림에서 지대까지의 거리와 폭을 읽는다", "질량이 큰 별과 작은 별(스피카, 백조자리 61B)을 견준다", "표면 온도와 생명 가능 지대의 관계를 정리한다"],
    iv: "중심별의 질량(표면 온도)", dv: "생명 가능 지대까지의 거리와 폭(AU)", cv: ["주계열성만 비교"], safety: "",
    extend: ["별의 질량은 그대로 두고 시간이 흐르면 생명 가능 지대가 어디로 옮겨 갈까", "행성 거리만 바꿔 같은 별 둘레에서 생명 가능 지대에 드는 범위를 찾아보기"],
    sim: { kind: "iframe", name: "NAAP 생명 가능 지대 시뮬레이터(영어)", url: "https://astro.unl.edu/naap/habitablezones/animations/stellarHabitableZone.html", h: 600,
      ivControl: "'initial star mass' 슬라이더(별 질량을 바꾸면 temperature 값도 함께 바뀜)",
      dvReading: "궤도 그림의 파란 'Habitable Zone' 띠의 안쪽·바깥쪽 경계 거리('initial planet distance' 슬라이더로 맞춰 읽기)",
      x: { label: "별의 질량", unit: "태양 질량" }, y: { label: "생명 가능 지대 가운데 거리", unit: "AU" } } }
] });
