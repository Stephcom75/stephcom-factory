import fs from "fs";

const inputPath = "workspace/projects/ASTRO_PREMIUM/04_TECHNIQUE/exemple_sortie_schema_astro.json";
const outputPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/theme_astral_visuel.html";

const astroData = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const western = astroData.western_astrology || {};

const compatibilityPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/compatibilite_personne_a_b.json";
let compatibility = null;
if (fs.existsSync(compatibilityPath)) {
  compatibility = JSON.parse(fs.readFileSync(compatibilityPath, "utf8"));
}

const planets = [
  ["sun", "☉", "Soleil"],
  ["moon", "☽", "Lune"],
  ["mercury", "☿", "Mercure"],
  ["venus", "♀️", "Vénus"],
  ["mars", "♂️", "Mars"],
  ["jupiter", "♃", "Jupiter"],
  ["saturn", "♄", "Saturne"],
  ["uranus", "♅", "Uranus"],
  ["neptune", "♆", "Neptune"],
  ["pluto", "♇", "Pluton"]
];

const signs = [
  ["Aries", "Bélier", "♈"],
  ["Taurus", "Taureau", "♉"],
  ["Gemini", "Gémeaux", "♊"],
  ["Cancer", "Cancer", "♋"],
  ["Leo", "Lion", "♌"],
  ["Virgo", "Vierge", "♍"],
  ["Libra", "Balance", "♎"],
  ["Scorpio", "Scorpion", "♏"],
  ["Sagittarius", "Sagittaire", "♐"],
  ["Capricorn", "Capricorne", "♑"],
  ["Aquarius", "Verseau", "♒"],
  ["Pisces", "Poissons", "♓"]
];

const signMap = Object.fromEntries(signs.map((sign, index) => [sign[0], index]));

function safe(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function polar(cx, cy, radius, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad)
  };
}

function longitude(body) {
  if (!body || !body.sign || body.degree === null || body.degree === undefined) {
    return null;
  }

  const signIndex = signMap[body.sign];

  if (signIndex === undefined) {
    return null;
  }

  return (
    signIndex * 30 +
    Number(body.degree || 0) +
    Number(body.minute || 0) / 60 +
    Number(body.second || 0) / 3600
  );
}

function angleFromLongitude(lon, ascLon) {
  return lon - ascLon + 180;
}

function svgLine(cx, cy, r1, r2, angle, className) {
  const p1 = polar(cx, cy, r1, angle);
  const p2 = polar(cx, cy, r2, angle);

  return '<line x1="' + p1.x.toFixed(2) +
    '" y1="' + p1.y.toFixed(2) +
    '" x2="' + p2.x.toFixed(2) +
    '" y2="' + p2.y.toFixed(2) +
    '" class="' + className + '" />';
}

function svgText(cx, cy, radius, angle, text, className) {
  const p = polar(cx, cy, radius, angle);

  return '<text x="' + p.x.toFixed(2) +
    '" y="' + p.y.toFixed(2) +
    '" class="' + className +
    '" text-anchor="middle" dominant-baseline="middle">' +
    safe(text) +
    "</text>";
}

const cx = 430;
const cy = 430;
const outerR = 350;
const innerR = 135;
const ascLon = longitude(western.ascendant) ?? 0;
const mcLon = longitude(western.midheaven) ?? 0;

let wheel = "";
let planetSvg = "";
let rows = "";

for (let i = 0; i < 12; i++) {
  const startLon = i * 30;
  const startAngle = angleFromLongitude(startLon, ascLon);
  const middleAngle = angleFromLongitude(startLon + 15, ascLon);

  wheel += svgLine(cx, cy, innerR, outerR, startAngle, "zodiac-line");
  wheel += svgText(cx, cy, 318, middleAngle, signs[i][2], "zodiac-glyph");
  wheel += svgText(cx, cy, 286, middleAngle, signs[i][1], "sign-label");

  for (let d = 0; d < 30; d += 5) {
    const tickAngle = angleFromLongitude(startLon + d, ascLon);
    const r1 = d === 0 ? outerR - 32 : outerR - 20;
    wheel += svgLine(cx, cy, r1, outerR - 8, tickAngle, d === 0 ? "major-tick" : "minor-tick");
  }
}

if (Array.isArray(western.houses) && western.houses.length > 0) {
  western.houses.forEach((house, index) => {
    const houseLon = house.longitude ?? house.cusp ?? null;

    if (houseLon === null) {
      return;
    }

    const houseAngle = angleFromLongitude(houseLon, ascLon);
    wheel += svgLine(cx, cy, innerR, outerR, houseAngle, "house-line");
    wheel += svgText(cx, cy, 245, houseAngle + 15, String(index + 1), "house-label");
  });
}

planets.forEach((planet, index) => {
  const key = planet[0];
  const glyph = planet[1];
  const name = planet[2];
  const body = western[key];
  const lon = longitude(body);

  if (lon === null) {
    return;
  }

  const planetAngle = angleFromLongitude(lon, ascLon);
  const radius = 214 - (index % 3) * 24;
  const p = polar(cx, cy, radius, planetAngle);

  planetSvg += '<g class="planet">' +
    '<circle cx="' + p.x.toFixed(2) + '" cy="' + p.y.toFixed(2) + '" r="26"></circle>' +
    '<text x="' + p.x.toFixed(2) + '" y="' + p.y.toFixed(2) + '" text-anchor="middle" dominant-baseline="middle">' + safe(glyph) + "</text>" +
    "</g>";

  rows += "<tr>" +
    '<td><span class="mini">' + safe(glyph) + "</span>" + safe(name) + "</td>" +
    "<td>" + safe(body.sign) + "</td>" +
    "<td>" + safe(body.formatted) + "</td>" +
    "<td>" + safe(body.house || "") + "</td>" +
    "</tr>";
});

const ascAngle = angleFromLongitude(ascLon, ascLon);
const mcAngle = angleFromLongitude(mcLon, ascLon);

const axes =
  svgLine(cx, cy, innerR - 28, outerR + 24, ascAngle, "axis asc") +
  svgText(cx, cy, outerR + 46, ascAngle, "ASC", "axis-label") +
  svgLine(cx, cy, innerR - 28, outerR + 24, mcAngle, "axis mc") +
  svgText(cx, cy, outerR + 46, mcAngle, "MC", "axis-label");

const client = astroData.client?.first_name || "Client";
const birthDate = astroData.birth_data?.birth_date || "";
const birthTime = astroData.birth_data?.birth_time || "";
const birthCity = astroData.birth_data?.birth_city || "";

const compatibilityScores = compatibility?.scores || {};
const compatibilityPeople = compatibility?.people || {};

const personAName = compatibilityPeople.person_a?.name || client;
const personBName = compatibilityPeople.person_b?.name || "Personne B";

const loveScore = compatibilityScores.love?.score ?? 82;
const loveLevel = compatibilityScores.love?.level || "Tres forte";
const friendshipScore = compatibilityScores.friendship?.score ?? 76;
const friendshipLevel = compatibilityScores.friendship?.level || "Tres bonne";
const workScore = compatibilityScores.work?.score ?? 68;
const workLevel = compatibilityScores.work?.level || "Bonne";

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Carte natale premium</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: radial-gradient(circle at 50% 8%, #352260 0%, #121331 42%, #050817 100%);
  color: #f8efe0;
  font-family: Inter, Arial, sans-serif;
}

.app {
  max-width: 1540px;
  margin: 0 auto;
  padding: 26px;
}

.topbar {
  border: 1px solid rgba(255,214,138,.22);
  background: rgba(6,9,26,.76);
  border-radius: 28px;
  padding: 18px 24px;
  margin-bottom: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  box-shadow: 0 24px 80px rgba(0,0,0,.34);
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255,214,138,.55);
  color: #f8d68b;
  font-size: 30px;
  background: radial-gradient(circle, rgba(255,214,138,.18), rgba(255,214,138,.03));
}

.brand-title {
  font-family: Cinzel, serif;
  font-size: 25px;
  text-transform: uppercase;
  letter-spacing: .8px;
}

.brand-sub {
  font-size: 12px;
  color: #bfb6d7;
  margin-top: 3px;
}

.nav {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.nav div {
  padding: 12px 16px;
  border-radius: 16px;
  color: #bfb6d7;
  font-size: 14px;
}

.nav .active {
  color: #f8d68b;
  border: 1px solid rgba(255,214,138,.38);
  background: rgba(255,214,138,.08);
}

.grid {
  display: grid;
  grid-template-columns: 118px 1.35fr .9fr;
  gap: 22px;
}

.sidebar,
.card {
  border: 1px solid rgba(255,214,138,.18);
  background: linear-gradient(145deg, rgba(22,22,55,.88), rgba(9,10,28,.84));
  border-radius: 28px;
  box-shadow: 0 30px 90px rgba(0,0,0,.35);
}

.sidebar {
  padding: 18px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.side {
  height: 74px;
  border-radius: 20px;
  color: #aeb0c7;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 7px;
  font-size: 12px;
}

.side b {
  font-size: 23px;
}

.side.active {
  color: #f8d68b;
  background: linear-gradient(135deg, rgba(255,214,138,.26), rgba(255,214,138,.06));
  border: 1px solid rgba(255,214,138,.26);
}

.promo {
  margin-top: auto;
  border: 1px solid rgba(255,214,138,.35);
  border-radius: 20px;
  padding: 14px;
  text-align: center;
  color: #f8d68b;
  font-size: 12px;
}

.promo button {
  margin-top: 10px;
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 11px;
  background: linear-gradient(135deg, #f9d989, #be8b3a);
  color: #1d1730;
  font-weight: 800;
}

.chart-card {
  padding: 28px;
}

.title {
  font-family: Cinzel, serif;
  font-size: 26px;
  margin: 0 0 18px;
}

.title span {
  color: #f8d68b;
}

svg {
  width: 100%;
  max-width: 860px;
  display: block;
  margin: auto;
}

.outer {
  fill: none;
  stroke: rgba(255,214,138,.9);
  stroke-width: 2.2;
  filter: url(#glow);
}

.mid {
  fill: none;
  stroke: rgba(255,214,138,.32);
  stroke-width: 1.2;
}

.inner {
  fill: rgba(255,255,255,.025);
  stroke: rgba(255,214,138,.22);
  stroke-width: 1.2;
}

.zodiac-line {
  stroke: rgba(255,214,138,.48);
  stroke-width: 1.15;
}

.house-line {
  stroke: rgba(210,223,255,.34);
  stroke-width: 1;
}

.major-tick {
  stroke: rgba(255,214,138,.62);
  stroke-width: 1.2;
}

.minor-tick {
  stroke: rgba(255,214,138,.28);
  stroke-width: .8;
}

.axis {
  stroke-width: 3;
  filter: url(#glow);
}

.asc {
  stroke: #f8d68b;
}

.mc {
  stroke: #8ee5ff;
}

.axis-label {
  fill: #fff;
  font-size: 17px;
  font-weight: 900;
}

.zodiac-glyph {
  fill: #f8d68b;
  font-size: 35px;
  font-weight: 800;
}

.sign-label {
  fill: #f5dfb0;
  font-size: 13px;
  font-weight: 800;
}

.house-label {
  fill: #fff;
  font-size: 16px;
  font-weight: 800;
}

.planet circle {
  fill: #fff4ce;
  stroke: #f8d68b;
  stroke-width: 2.5;
  filter: url(#planetGlow);
}

.planet text {
  fill: #18142f;
  font-size: 30px;
  font-weight: 900;
}

.legend {
  margin: 18px auto 0;
  max-width: 720px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  border: 1px solid rgba(255,214,138,.22);
  background: rgba(255,255,255,.04);
  border-radius: 22px;
  padding: 16px 22px;
}

.legend div {
  font-size: 13px;
  line-height: 1.45;
}

.legend b {
  color: #f8d68b;
}

.right {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel {
  padding: 24px;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  font-size: 14px;
}

th {
  text-align: left;
  color: #f8d68b;
  padding: 0 12px 8px;
}

td {
  background: rgba(255,255,255,.055);
  padding: 12px;
  border-top: 1px solid rgba(255,255,255,.06);
  border-bottom: 1px solid rgba(255,255,255,.06);
}

td:first-child {
  border-left: 1px solid rgba(255,255,255,.06);
  border-radius: 14px 0 0 14px;
  font-weight: 800;
}

td:last-child {
  border-right: 1px solid rgba(255,255,255,.06);
  border-radius: 0 14px 14px 0;
  text-align: center;
}

.mini {
  display: inline-grid;
  place-items: center;
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background: rgba(248,214,139,.1);
  color: #f8d68b;
  margin-right: 8px;
  font-size: 18px;
}

.note {
  margin-top: 14px;
  color: #f8d68b;
  font-size: 14px;
  line-height: 1.6;
}

.people {
  display: grid;
  grid-template-columns: 1fr 54px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
}

.person,
.link {
  border: 1px solid rgba(255,214,138,.22);
  background: rgba(255,255,255,.05);
  border-radius: 22px;
}

.person {
  padding: 14px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.avatar,
.link {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #f8d68b;
}

.avatar {
  background: radial-gradient(circle, rgba(248,214,139,.3), rgba(248,214,139,.06));
  border: 1px solid rgba(248,214,139,.42);
}

.person small {
  display: block;
  color: #bfb6d7;
  margin-top: 2px;
}

.scores {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.score {
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.045);
  border-radius: 22px;
  padding: 18px;
  text-align: center;
}

.ring {
  width: 106px;
  height: 106px;
  border-radius: 50%;
  margin: 12px auto 10px;
  display: grid;
  place-items: center;
  background: conic-gradient(var(--c) calc(var(--s) * 1%), rgba(255,255,255,.08) 0);
  position: relative;
}

.ring:before {
  content: "";
  position: absolute;
  inset: 11px;
  border-radius: 50%;
  background: #151634;
}

.ring b {
  position: relative;
  font-family: Cinzel, serif;
  font-size: 28px;
}

.compare {
  margin-top: 16px;
  width: 100%;
  border: none;
  border-radius: 18px;
  padding: 16px;
  background: linear-gradient(135deg, #f9d989, #c99745);
  color: #1d1730;
  font-weight: 900;
  font-size: 15px;
}

@media(max-width:1200px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .topbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .legend,
  .scores {
    grid-template-columns: 1fr;
  }
}
</style>
</head>
<body>
<div class="app">
  <div class="topbar">
    <div class="brand">
      <div class="logo">✦</div>
      <div>
        <div class="brand-title">Carte Natale</div>
        <div class="brand-sub">${safe(client)} — ${safe(birthDate)} à ${safe(birthTime)}, ${safe(birthCity)}</div>
      </div>
    </div>
    <div class="nav">
      <div class="active">◎ Carte natale</div>
      <div>◌ Transits</div>
      <div>∞ Synastrie</div>
      <div>☉ Révolutions solaires</div>
    </div>
  </div>

  <div class="grid">
    <aside class="sidebar">
      <div class="side active"><b>☉</b>Résumé</div>
      <div class="side"><b>☿</b>Planètes</div>
      <div class="side"><b>⌂</b>Maisons</div>
      <div class="side"><b>△</b>Aspects</div>
      <div class="side"><b>♡</b>Compatibilités</div>
      <div class="promo">Débloquez tout votre potentiel<button>Passer Premium</button></div>
    </aside>

    <main class="card chart-card">
      <h1 class="title"><span>✧</span> Votre carte natale</h1>
      <svg viewBox="0 0 860 860">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="planetGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#f8d68b" flood-opacity=".45"/>
          </filter>
        </defs>

        <circle cx="${cx}" cy="${cy}" r="${outerR}" class="outer"/>
        <circle cx="${cx}" cy="${cy}" r="${outerR - 42}" class="mid"/>
        <circle cx="${cx}" cy="${cy}" r="${innerR}" class="inner"/>

        ${wheel}
        ${axes}
        ${planetSvg}
      </svg>

      <div class="legend">
        <div><b>ASC</b><br>${safe(western.ascendant?.sign)}<br>${safe(western.ascendant?.formatted)}</div>
        <div><b>MC</b><br>${safe(western.midheaven?.sign)}<br>${safe(western.midheaven?.formatted)}</div>
        <div><b>Système</b><br>Placidus<br>Carte natale</div>
      </div>
    </main>

    <section class="right">
      <div class="card panel">
        <h2 class="title"><span>✧</span> Positions principales</h2>
        <table>
          <thead>
            <tr>
              <th>Astre</th>
              <th>Signe</th>
              <th>Position</th>
              <th>Maison</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="note">
          Ascendant : <strong>${safe(western.ascendant?.sign)}</strong> — ${safe(western.ascendant?.formatted)}<br>
          Milieu du Ciel : <strong>${safe(western.midheaven?.sign)}</strong> — ${safe(western.midheaven?.formatted)}
        </div>
      </div>

      <div class="card panel">
        <h2 class="title"><span>✦</span> Compatibilités</h2>
        <div class="people">
          <div class="person">
            <div class="avatar">A</div>
            <div><strong>Personne A</strong><small>${safe(personAName)}</small></div>
          </div>
          <div class="link">∞</div>
          <div class="person">
            <div class="avatar">+</div>
            <div><strong>Personne B</strong><small>${safe(personBName)}</small></div>
          </div>
        </div>

        <div class="scores">
          <div class="score" style="--s:${loveScore};--c:#ff7f9f">♡ Amour<div class="ring"><b>${loveScore}%</b></div><small>${safe(loveLevel)}</small></div>
          <div class="score" style="--s:${friendshipScore};--c:#b884ff">♢ Amitié<div class="ring"><b>${friendshipScore}%</b></div><small>${safe(friendshipLevel)}</small></div>
          <div class="score" style="--s:${workScore};--c:#86b8ff">▣ Travail<div class="ring"><b>${workScore}%</b></div><small>${safe(workLevel)}</small></div>
        </div>

        <button class="compare">Comparer en détail →</button>
        <div class="note">Bloc préparé pour la future synastrie : deux thèmes, scores par domaine et rapport de compatibilité premium.</div>
      </div>
    </section>
  </div>
</div>
</body>
</html>`;

fs.writeFileSync(outputPath, html, "utf8");

console.log("Carte astrale HTML premium générée avec succès :");
console.log(outputPath);