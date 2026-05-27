import fs from "fs";

const htmlPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/theme_astral_visuel.html";

if (!fs.existsSync(htmlPath)) {
  console.error("Fichier HTML introuvable : " + htmlPath);
  process.exit(1);
}

function removeOldInjection(html) {
  const start = "<!-- ASTRO_VISUAL_OVERHAUL_START -->";
  const end = "<!-- ASTRO_VISUAL_OVERHAUL_END -->";

  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end);

  if (startIndex === -1 || endIndex === -1) {
    return html;
  }

  return html.slice(0, startIndex) + html.slice(endIndex + end.length);
}

function buildInjection() {
  return `
<!-- ASTRO_VISUAL_OVERHAUL_START -->
<style>
  .astro-old-wheel-hidden {
    display: none !important;
  }

  .astro-premium-chart-module {
    width: min(880px, 98%);
    margin: 34px auto 34px auto;
    position: relative;
    border-radius: 42px;
    padding: 28px 28px 24px;
    overflow: hidden;
    background:
      radial-gradient(circle at 50% 40%, rgba(255, 232, 180, .15), transparent 26%),
      radial-gradient(circle at 80% 12%, rgba(180, 120, 255, .22), transparent 36%),
      radial-gradient(circle at 18% 86%, rgba(96, 230, 255, .09), transparent 32%),
      linear-gradient(145deg, rgba(31, 28, 92, .985), rgba(7, 10, 38, .99));
    border: 1px solid rgba(255, 232, 180, .25);
    box-shadow:
      0 34px 96px rgba(0, 0, 0, .36),
      inset 0 1px 0 rgba(255, 255, 255, .13);
  }

  .astro-premium-chart-module::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle, rgba(255, 232, 180, .24) 1px, transparent 1.4px);
    background-size: 32px 32px;
    opacity: .055;
    pointer-events: none;
  }

  .astro-premium-chart-module::after {
    content: "";
    position: absolute;
    inset: 20px;
    border-radius: 34px;
    border: 1px solid rgba(255,255,255,.055);
    pointer-events: none;
  }

  .astro-premium-chart-header {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    margin-bottom: 12px;
  }

  .astro-premium-chart-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 9px;
    padding: 8px 12px;
    border-radius: 999px;
    color: #ffe8b0;
    background: rgba(255, 232, 180, .11);
    border: 1px solid rgba(255, 232, 180, .24);
    font: 950 10px/1 Inter, Arial, sans-serif;
    letter-spacing: .13em;
    text-transform: uppercase;
  }

  .astro-premium-chart-kicker::before {
    content: "✦";
  }

  .astro-premium-chart-title {
    margin: 0;
    color: #fff;
    font: 950 clamp(28px, 3.8vw, 44px)/.98 Inter, Arial, sans-serif;
    letter-spacing: -.055em;
  }

  .astro-premium-chart-subtitle {
    margin: 9px 0 0;
    max-width: 620px;
    color: rgba(255, 255, 255, .72);
    font: 750 13.5px/1.5 Inter, Arial, sans-serif;
  }

  .astro-premium-chart-badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .astro-premium-chart-badge {
    min-width: 82px;
    padding: 10px 12px;
    border-radius: 17px;
    background: rgba(255, 255, 255, .07);
    border: 1px solid rgba(255, 255, 255, .12);
    text-align: center;
  }

  .astro-premium-chart-badge span {
    display: block;
    margin-bottom: 3px;
    color: rgba(255, 255, 255, .58);
    font: 850 9px/1 Inter, Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: .1em;
  }

  .astro-premium-chart-badge strong {
    display: block;
    color: #ffe8b0;
    font: 950 13px/1.15 Inter, Arial, sans-serif;
  }

  .astro-premium-svg-wrap {
    position: relative;
    z-index: 2;
    display: grid;
    place-items: center;
    padding: 0;
    margin-top: 2px;
  }

  .astro-premium-chart-svg {
    width: min(700px, 100%);
    height: auto;
    display: block;
    overflow: visible;
    filter: drop-shadow(0 26px 46px rgba(0,0,0,.36));
  }

  .premium-zodiac-disc {
    filter: drop-shadow(0 8px 16px rgba(0,0,0,.26));
  }

  .premium-zodiac-disc circle {
    fill: url(#premiumPurpleGold);
    stroke: rgba(255, 232, 180, .78);
    stroke-width: 1.45;
  }

  .premium-zodiac-symbol {
    fill: #ffe8b0;
    font: 950 23px/1 Inter, Arial, sans-serif;
    text-anchor: middle;
    dominant-baseline: middle;
  }

  .premium-zodiac-name {
    fill: rgba(255,255,255,.94);
    font: 850 13px/1 Inter, Arial, sans-serif;
    text-anchor: middle;
    dominant-baseline: middle;
    paint-order: stroke;
    stroke: rgba(7,10,38,.76);
    stroke-width: 3.2px;
  }

  .premium-house-number {
    fill: rgba(255, 232, 180, .75);
    font: 900 13px/1 Inter, Arial, sans-serif;
    text-anchor: middle;
    dominant-baseline: middle;
  }

  .premium-planet-disc {
    filter: drop-shadow(0 0 15px rgba(255, 232, 180, .35));
  }

  .premium-planet-disc circle {
    fill: url(#premiumPlanetGold);
    stroke: rgba(255, 245, 210, .78);
    stroke-width: 1.5;
  }

  .premium-planet-disc.is-accent circle {
    fill: url(#premiumPlanetAccent);
  }

  .premium-planet-symbol {
    fill: #2a2354;
    font: 950 23px/1 Inter, Arial, sans-serif;
    text-anchor: middle;
    dominant-baseline: middle;
  }

  .premium-axis-text {
    fill: #ffe8b0;
    font: 950 17px/1 Inter, Arial, sans-serif;
    text-anchor: middle;
    dominant-baseline: middle;
    paint-order: stroke;
    stroke: rgba(7,10,38,.78);
    stroke-width: 4px;
  }

  .astro-premium-chart-footer {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 11px;
    margin-top: 12px;
  }

  .astro-premium-chart-info {
    padding: 13px 14px;
    border-radius: 18px;
    background: rgba(255, 255, 255, .062);
    border: 1px solid rgba(255, 255, 255, .11);
  }

  .astro-premium-chart-info span {
    display: block;
    margin-bottom: 5px;
    color: rgba(255,255,255,.58);
    font: 850 9px/1 Inter, Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: .12em;
  }

  .astro-premium-chart-info strong {
    display: block;
    color: #fff;
    font: 950 13px/1.2 Inter, Arial, sans-serif;
  }

  .astro-premium-chart-info small {
    display: block;
    margin-top: 4px;
    color: #ffe8b0;
    font: 800 11px/1.25 Inter, Arial, sans-serif;
  }

  .astro-legacy-premium-card-upgraded {
    box-sizing: border-box !important;
    overflow: hidden !important;
    width: 100% !important;
    max-width: 142px !important;
    margin: 0 auto !important;
    padding: 10px !important;
    border-radius: 22px !important;
    text-align: center !important;
    background:
      radial-gradient(circle at 20% 0%, rgba(255,232,180,.20), transparent 38%),
      linear-gradient(145deg, rgba(255,255,255,.10), rgba(255,255,255,.045)) !important;
    border: 1px solid rgba(255,232,180,.24) !important;
    box-shadow:
      0 14px 34px rgba(0,0,0,.22),
      inset 0 1px 0 rgba(255,255,255,.12) !important;
  }

  .astro-legacy-premium-card-upgraded * {
    box-sizing: border-box !important;
  }

  .astro-legacy-premium-content {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 7px !important;
    width: 100% !important;
  }

  .astro-legacy-premium-badge {
    display: inline-flex !important;
    justify-content: center !important;
    align-items: center !important;
    max-width: 100% !important;
    padding: 5px 8px !important;
    border-radius: 999px !important;
    background: rgba(255,232,180,.12) !important;
    border: 1px solid rgba(255,232,180,.25) !important;
    color: #ffe8b0 !important;
    font: 950 8.5px/1 Inter, Arial, sans-serif !important;
    letter-spacing: .08em !important;
    text-transform: uppercase !important;
    text-align: center !important;
    white-space: nowrap !important;
  }

  .astro-legacy-premium-title {
    width: 100% !important;
    margin: 0 !important;
    color: #fff !important;
    font: 950 13px/1.12 Inter, Arial, sans-serif !important;
    letter-spacing: -.02em !important;
    text-align: center !important;
  }

  .astro-legacy-premium-text {
    width: 100% !important;
    margin: 0 !important;
    color: rgba(255,255,255,.72) !important;
    font: 750 10px/1.28 Inter, Arial, sans-serif !important;
    text-align: center !important;
  }

  .astro-legacy-premium-button {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    min-height: 36px !important;
    padding: 8px 8px !important;
    border: 0 !important;
    border-radius: 13px !important;
    background: linear-gradient(135deg,#fff1bd,#d6a13a) !important;
    color: #18122e !important;
    font: 950 11px/1.1 Inter, Arial, sans-serif !important;
    text-align: center !important;
    white-space: normal !important;
    overflow: hidden !important;
    cursor: pointer !important;
    box-shadow: 0 10px 22px rgba(255,202,88,.18) !important;
  }

  @media (max-width: 900px) {
    .astro-premium-chart-module {
      width: 94%;
      padding: 20px;
      border-radius: 30px;
    }

    .astro-premium-chart-header {
      display: block;
    }

    .astro-premium-chart-badges {
      margin-top: 14px;
      justify-content: flex-start;
    }

    .astro-premium-chart-footer {
      grid-template-columns: 1fr;
    }

    .astro-premium-chart-svg {
      width: min(620px, 100%);
    }
  }
</style>

<script>
(function () {
  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\\u0300-\\u036f]/g, "")
      .replace(/\\s+/g, " ")
      .trim();
  }

  function getText(el) {
    return (el.innerText || el.textContent || "").trim();
  }

  function all(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function scoreSvg(svg) {
    var box = svg.getBoundingClientRect();
    return box.width * box.height;
  }

  function polar(cx, cy, radius, angleDeg) {
    var angle = (angleDeg - 90) * Math.PI / 180;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  }

  function extractField(label, fallback) {
    var text = document.body.innerText || "";
    var re = new RegExp(label + "\\\\s*[:：]\\\\s*([^\\\\n]+)", "i");
    var match = text.match(re);
    if (!match) return fallback;
    return match[1].trim().slice(0, 46);
  }

  function buildPremiumChartSvg() {
    var signs = [
      { name: "Bélier", symbol: "♈" },
      { name: "Taureau", symbol: "♉" },
      { name: "Gémeaux", symbol: "♊" },
      { name: "Cancer", symbol: "♋" },
      { name: "Lion", symbol: "♌" },
      { name: "Vierge", symbol: "♍" },
      { name: "Balance", symbol: "♎" },
      { name: "Scorpion", symbol: "♏" },
      { name: "Sagittaire", symbol: "♐" },
      { name: "Capricorne", symbol: "♑" },
      { name: "Verseau", symbol: "♒" },
      { name: "Poissons", symbol: "♓" }
    ];

    var planets = [
      { symbol: "♃", angle: 275, r: 206, accent: false },
      { symbol: "♇", angle: 48, r: 212, accent: false },
      { symbol: "♂️", angle: 78, r: 194, accent: true },
      { symbol: "♆", angle: 114, r: 142, accent: false },
      { symbol: "♅", angle: 126, r: 158, accent: false },
      { symbol: "☿", angle: 141, r: 136, accent: false },
      { symbol: "♄", angle: 132, r: 188, accent: false },
      { symbol: "♀️", angle: 157, r: 190, accent: true },
      { symbol: "☽", angle: 178, r: 174, accent: false }
    ];

    var cx = 360;
    var cy = 360;
    var outerR = 302;
    var midR = 244;
    var innerR = 118;

    var parts = [];

    parts.push('<svg class="astro-premium-chart-svg" viewBox="0 0 720 720" aria-label="Carte natale premium">');
    parts.push('<defs>');
    parts.push('<radialGradient id="premiumWheelBg" cx="50%" cy="50%" r="60%"><stop offset="0%" stop-color="#1c1a62"/><stop offset="58%" stop-color="#17154f"/><stop offset="100%" stop-color="#0b0e34"/></radialGradient>');
    parts.push('<linearGradient id="premiumPurpleGold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7351ff"/><stop offset="58%" stop-color="#2b225c"/><stop offset="100%" stop-color="#18133a"/></linearGradient>');
    parts.push('<radialGradient id="premiumPlanetGold" cx="35%" cy="25%" r="70%"><stop offset="0%" stop-color="#fffbe8"/><stop offset="55%" stop-color="#ffe8a8"/><stop offset="100%" stop-color="#d7a94c"/></radialGradient>');
    parts.push('<radialGradient id="premiumPlanetAccent" cx="35%" cy="25%" r="70%"><stop offset="0%" stop-color="#fff0ff"/><stop offset="55%" stop-color="#ff9dd5"/><stop offset="100%" stop-color="#914bff"/></radialGradient>');
    parts.push('<radialGradient id="premiumCenter" cx="50%" cy="50%" r="60%"><stop offset="0%" stop-color="rgba(255,232,180,.18)"/><stop offset="45%" stop-color="rgba(255,255,255,.035)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>');
    parts.push('<filter id="premiumGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>');
    parts.push('</defs>');

    parts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + outerR + '" fill="url(#premiumWheelBg)" stroke="rgba(255,232,180,.94)" stroke-width="3" filter="url(#premiumGlow)"/>');
    parts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + midR + '" fill="none" stroke="rgba(255,232,180,.34)" stroke-width="1.2"/>');
    parts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + innerR + '" fill="url(#premiumCenter)" stroke="rgba(255,232,180,.30)" stroke-width="1.2"/>');
    parts.push('<circle cx="' + cx + '" cy="' + cy + '" r="44" fill="none" stroke="rgba(255,232,180,.13)" stroke-width="1"/>');
    parts.push('<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#ffe8b0"/>');

    for (var i = 0; i < 12; i++) {
      var angle = i * 30;
      var a = polar(cx, cy, innerR, angle);
      var b = polar(cx, cy, outerR, angle);
      parts.push('<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" stroke="rgba(255,232,180,.42)" stroke-width="1"/>');

      var house = polar(cx, cy, 162, angle + 15);
      parts.push('<text class="premium-house-number" x="' + house.x + '" y="' + house.y + '">' + String(i + 1) + '</text>');
    }

    for (var tick = 0; tick < 72; tick++) {
      var tickAngle = tick * 5;
      var p1 = polar(cx, cy, outerR - 8, tickAngle);
      var p2 = polar(cx, cy, outerR - (tick % 6 === 0 ? 18 : 12), tickAngle);
      parts.push('<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" stroke="rgba(255,255,255,.21)" stroke-width="' + (tick % 6 === 0 ? "1.1" : ".75") + '"/>');
    }

    for (var s = 0; s < signs.length; s++) {
      var signAngle = s * 30 + 15;
      var disc = polar(cx, cy, 292, signAngle);
      var label = polar(cx, cy, 334, signAngle);

      parts.push('<g class="premium-zodiac-disc">');
      parts.push('<circle cx="' + disc.x + '" cy="' + disc.y + '" r="23"/>');
      parts.push('<text class="premium-zodiac-symbol" x="' + disc.x + '" y="' + (disc.y + 1) + '">' + signs[s].symbol + '</text>');
      parts.push('</g>');
      parts.push('<text class="premium-zodiac-name" x="' + label.x + '" y="' + label.y + '">' + signs[s].name + '</text>');
    }

    parts.push('<line x1="' + (cx - outerR - 16) + '" y1="' + cy + '" x2="' + (cx + outerR + 16) + '" y2="' + cy + '" stroke="#82f4ff" stroke-width="3" filter="url(#premiumGlow)"/>');
    parts.push('<text class="premium-axis-text" x="' + (cx - outerR - 38) + '" y="' + (cy + 2) + '">ASC</text>');
    parts.push('<text class="premium-axis-text" x="' + (cx + outerR + 38) + '" y="' + (cy + 2) + '">MC</text>');

    planets.forEach(function (planet) {
      var p = polar(cx, cy, planet.r, planet.angle);
      parts.push('<g class="premium-planet-disc ' + (planet.accent ? "is-accent" : "") + '">');
      parts.push('<circle cx="' + p.x + '" cy="' + p.y + '" r="24"/>');
      parts.push('<text class="premium-planet-symbol" x="' + p.x + '" y="' + (p.y + 1) + '">' + planet.symbol + '</text>');
      parts.push('</g>');
    });

    parts.push('</svg>');

    return parts.join("");
  }

  function buildPremiumChartModule() {
    var asc = extractField("Ascendant", "Poissons — 26°04'53");
    var mc = extractField("Milieu du Ciel", "Sagittaire — 28°20'13");
    var system = extractField("Système", "Placidus");

    return [
      '<section class="astro-premium-chart-module">',
      '  <div class="astro-premium-chart-header">',
      '    <div>',
      '      <div class="astro-premium-chart-kicker">Carte natale premium</div>',
      '      <h2 class="astro-premium-chart-title">Votre ciel de naissance</h2>',
      '      <p class="astro-premium-chart-subtitle">Une carte astrale repensée pour une lecture plus élégante, plus claire et plus premium : signes, planètes, maisons et axes sont hiérarchisés visuellement.</p>',
      '    </div>',
      '    <div class="astro-premium-chart-badges">',
      '      <div class="astro-premium-chart-badge"><span>ASC</span><strong>' + asc.split(" ")[0] + '</strong></div>',
      '      <div class="astro-premium-chart-badge"><span>MC</span><strong>' + mc.split(" ")[0] + '</strong></div>',
      '    </div>',
      '  </div>',
      '  <div class="astro-premium-svg-wrap">',
      buildPremiumChartSvg(),
      '  </div>',
      '  <div class="astro-premium-chart-footer">',
      '    <div class="astro-premium-chart-info"><span>Ascendant</span><strong>' + asc + '</strong><small>Votre porte d’entrée dans le monde</small></div>',
      '    <div class="astro-premium-chart-info"><span>Milieu du Ciel</span><strong>' + mc + '</strong><small>Votre trajectoire publique</small></div>',
      '    <div class="astro-premium-chart-info"><span>Système</span><strong>' + system + '</strong><small>Carte natale</small></div>',
      '  </div>',
      '</section>'
    ].join("");
  }

  function upgradeLegacyPremiumCard() {
    var candidates = all("div,section,article,aside").filter(function (el) {
      var t = normalize(getText(el));
      return t.includes("debloquez tout votre potentiel") && t.includes("passer premium");
    });

    if (!candidates.length) return;

    candidates.sort(function (a, b) {
      return getText(a).length - getText(b).length;
    });

    var card = candidates[0];
    card.classList.add("astro-legacy-premium-card-upgraded");
    card.innerHTML = [
      '<div class="astro-legacy-premium-content">',
      '<div class="astro-legacy-premium-badge">Premium</div>',
      '<h4 class="astro-legacy-premium-title">Lecture complète</h4>',
      '<p class="astro-legacy-premium-text">Rapport détaillé + PDF.</p>',
      '<button type="button" class="astro-legacy-premium-button">Débloquer</button>',
      '</div>'
    ].join("");
  }

  function replaceLargestWheel() {
    if (document.querySelector(".astro-premium-chart-module")) return;

    var svgs = all("svg");
    if (!svgs.length) return;

    svgs.sort(function (a, b) {
      return scoreSvg(b) - scoreSvg(a);
    });

    var oldSvg = svgs[0];
    var oldHost = oldSvg.parentElement || oldSvg;

    oldHost.classList.add("astro-old-wheel-hidden");

    var moduleWrapper = document.createElement("div");
    moduleWrapper.innerHTML = buildPremiumChartModule();

    oldHost.parentElement.insertBefore(moduleWrapper.firstElementChild, oldHost);
  }

  function run() {
    upgradeLegacyPremiumCard();
    replaceLargestWheel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  setTimeout(run, 400);
  setTimeout(run, 1200);
})();
</script>
<!-- ASTRO_VISUAL_OVERHAUL_END -->
`;
}

let html = fs.readFileSync(htmlPath, "utf8");
html = removeOldInjection(html);

const injection = buildInjection();

if (html.includes("</body>")) {
  html = html.replace("</body>", injection + "\n</body>");
} else {
  html = html + "\n" + injection;
}

fs.writeFileSync(htmlPath, html, "utf8");

console.log("Roue premium V3 et CTA gauche centre injectes avec succes :");
console.log(htmlPath);