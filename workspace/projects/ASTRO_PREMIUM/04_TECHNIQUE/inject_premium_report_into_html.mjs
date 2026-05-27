import fs from "fs";

const htmlPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/theme_astral_visuel.html";
const reportPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/rapport_compatibilite_premium_mistral.md";
const compatibilityPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/compatibilite_personne_a_b.json";

if (!fs.existsSync(htmlPath)) {
  console.error("Fichier HTML introuvable : " + htmlPath);
  process.exit(1);
}

if (!fs.existsSync(reportPath)) {
  console.error("Rapport premium introuvable : " + reportPath);
  process.exit(1);
}

if (!fs.existsSync(compatibilityPath)) {
  console.error("Fichier compatibilite introuvable : " + compatibilityPath);
  process.exit(1);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function cleanMarkdown(text) {
  return String(text)
    .replaceAll("markdown", "")
    .replaceAll("", "")
    .replaceAll("**", "")
    .replaceAll("*", "")
    .replaceAll("\r\n", "\n")
    .trim();
}

function removeOldPremiumSection(html) {
  const start = "<!-- ASTRO_PREMIUM_REPORT_START -->";
  const end = "<!-- ASTRO_PREMIUM_REPORT_END -->";

  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end);

  if (startIndex === -1 || endIndex === -1) {
    return html;
  }

  return html.slice(0, startIndex) + html.slice(endIndex + end.length);
}

function scoreLevel(score) {
  const n = Number(score || 0);

  if (n >= 85) return "Exceptionnelle";
  if (n >= 75) return "Très forte";
  if (n >= 65) return "Bonne";
  if (n >= 50) return "Équilibrée";
  return "À travailler";
}

function scoreTone(score) {
  const n = Number(score || 0);

  if (n >= 75) return "high";
  if (n >= 60) return "medium";
  return "soft";
}

function splitReportIntoSections(markdown) {
  const clean = cleanMarkdown(markdown);
  const lines = clean.split("\n");

  const sections = [];
  let currentTitle = "Synthèse";
  let currentLines = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("# ")) {
      continue;
    }

    if (line.startsWith("## ")) {
      if (currentLines.length > 0) {
        sections.push({
          title: currentTitle,
          lines: currentLines
        });
      }

      currentTitle = line.slice(3).trim();
      currentLines = [];
      continue;
    }

    currentLines.push(rawLine);
  }

  if (currentLines.length > 0) {
    sections.push({
      title: currentTitle,
      lines: currentLines
    });
  }

  return sections;
}

function slugify(title, index) {
  const base = String(title)
    .toLowerCase()
    .replaceAll("é", "e")
    .replaceAll("è", "e")
    .replaceAll("ê", "e")
    .replaceAll("à", "a")
    .replaceAll("ù", "u")
    .replaceAll("ç", "c")
    .replaceAll("œ", "oe")
    .replaceAll("'", "")
    .replaceAll("/", "-")
    .replaceAll(" ", "-");

  let clean = "";

  for (const char of base) {
    if (
      (char >= "a" && char <= "z") ||
      (char >= "0" && char <= "9") ||
      char === "-"
    ) {
      clean += char;
    }
  }

  return "rapport-section-" + index + "-" + clean;
}

function shortNavLabel(title, index) {
  const t = String(title).toLowerCase();

  if (t.includes("données principales")) return "Données";
  if (t.includes("résumé")) return "Synthèse";
  if (t.includes("score global")) return "Score global";
  if (t.includes("amoureuse") || t.includes("amour")) return "Amour";
  if (t.includes("émotionnelle") || t.includes("amicale") || t.includes("amitié")) return "Émotion";
  if (t.includes("travail") || t.includes("projet")) return "Travail";
  if (t.includes("forces")) return "Forces";
  if (t.includes("vigilance") || t.includes("tension")) return "Vigilance";
  if (t.includes("conseil")) return "Conseils";
  if (t.includes("verdict")) return "Verdict";

  return "Section " + index;
}

function sectionIcon(title) {
  const t = String(title).toLowerCase();

  if (t.includes("amour")) return "♡";
  if (t.includes("émotion") || t.includes("amitié") || t.includes("amicale")) return "◇";
  if (t.includes("travail") || t.includes("projet")) return "□";
  if (t.includes("forces")) return "✦";
  if (t.includes("vigilance") || t.includes("tension")) return "!";
  if (t.includes("conseil")) return "↗️";
  if (t.includes("verdict")) return "✓";
  if (t.includes("score")) return "%";

  return "✧";
}

function linesToHtml(lines) {
  const parts = [];
  let listOpen = false;

  function closeList() {
    if (listOpen) {
      parts.push("</ul>");
      listOpen = false;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line === "---") {
      closeList();
      continue;
    }

    if (line.startsWith("### ")) {
      closeList();
      parts.push("<h3>" + escapeHtml(line.slice(4)) + "</h3>");
      continue;
    }

    if (line.startsWith("- ")) {
      if (!listOpen) {
        parts.push("<ul>");
        listOpen = true;
      }

      parts.push("<li>" + escapeHtml(line.slice(2)) + "</li>");
      continue;
    }

    closeList();
    parts.push("<p>" + escapeHtml(line) + "</p>");
  }

  closeList();

  return parts.join("\n");
}

function getPreview(lines) {
  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line === "---") {
      continue;
    }

    if (line.startsWith("- ")) {
      return line.slice(2);
    }

    if (line.startsWith("### ")) {
      continue;
    }

    return line;
  }

  return "Ouvrir cette section pour lire l’analyse détaillée.";
}

function buildScoreCard(label, score, icon) {
  const level = scoreLevel(score);
  const tone = scoreTone(score);

  return [
    "<div class=\"astro-score-card " + tone + "\">",
    "<div class=\"astro-score-card-top\">",
    "<span class=\"astro-score-icon\">" + icon + "</span>",
    "<span class=\"astro-score-label\">" + escapeHtml(label) + "</span>",
    "</div>",
    "<div class=\"astro-score-value\">" + escapeHtml(score) + "%</div>",
    "<div class=\"astro-score-level\">" + escapeHtml(level) + "</div>",
    "<div class=\"astro-score-bar\"><span style=\"width:" + escapeHtml(score) + "%\"></span></div>",
    "</div>"
  ].join("\n");
}

function buildPremiumAppSection(reportMarkdown, compatibility) {
  const start = "<!-- ASTRO_PREMIUM_REPORT_START -->";
  const end = "<!-- ASTRO_PREMIUM_REPORT_END -->";

  const scores = compatibility.scores || {};
  const people = compatibility.people || {};

  const personA = people.person_a && people.person_a.name ? people.person_a.name : "Personne A";
  const personB = people.person_b && people.person_b.name ? people.person_b.name : "Personne B";

  const loveScore = scores.love && scores.love.score !== undefined ? scores.love.score : 0;
  const friendshipScore = scores.friendship && scores.friendship.score !== undefined ? scores.friendship.score : 0;
  const workScore = scores.work && scores.work.score !== undefined ? scores.work.score : 0;
  const globalScore = scores.global && scores.global.score !== undefined ? scores.global.score : 0;

  const sections = splitReportIntoSections(reportMarkdown);

  const navItems = [
    "<a href=\"#astro-app-overview\"><span>✦</span>Vue globale</a>",
    "<a href=\"#astro-app-scores\"><span>◌</span>Scores</a>",
    "<a href=\"#astro-app-reading\"><span>▤</span>Lecture guidée</a>"
  ];

  const sectionCards = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const sectionIndex = i + 1;
    const id = slugify(section.title, sectionIndex);
    const navLabel = shortNavLabel(section.title, sectionIndex);
    const preview = getPreview(section.lines);
    const icon = sectionIcon(section.title);
    const openAttribute = sectionIndex <= 2 ? " open" : "";

    navItems.push(
      "<a href=\"#" + id + "\"><span>" + icon + "</span>" + escapeHtml(navLabel) + "</a>"
    );

    sectionCards.push([
      "<details id=\"" + id + "\" class=\"astro-report-card\"" + openAttribute + ">",
      "<summary>",
      "<div class=\"astro-report-summary-left\">",
      "<span class=\"astro-report-icon\">" + icon + "</span>",
      "<div>",
      "<strong>" + escapeHtml(section.title) + "</strong>",
      "<p>" + escapeHtml(preview) + "</p>",
      "</div>",
      "</div>",
      "<span class=\"astro-open-indicator\">+</span>",
      "</summary>",
      "<div class=\"astro-report-body\">",
      linesToHtml(section.lines),
      "</div>",
      "</details>"
    ].join("\n"));
  }

  return [
    start,
    "<style>",
    "html{scroll-behavior:smooth;}",
    ".astro-premium-app{max-width:1400px;margin:56px auto 110px;padding:0 24px;color:#fff;font-family:Inter,Arial,sans-serif;}",
    ".astro-app-shell{display:grid;grid-template-columns:260px minmax(0,1fr);gap:28px;align-items:start;}",
    ".astro-app-sidebar{position:sticky;top:24px;border-radius:34px;padding:18px;background:linear-gradient(180deg,rgba(23,24,76,.96),rgba(9,13,42,.98));border:1px solid rgba(255,255,255,.14);box-shadow:0 24px 70px rgba(0,0,0,.30);}",
    ".astro-brand-pill{display:flex;align-items:center;gap:10px;margin-bottom:18px;padding:14px 15px;border-radius:21px;background:linear-gradient(135deg,rgba(255,232,180,.15),rgba(255,255,255,.055));border:1px solid rgba(255,232,180,.24);color:#ffe8b0;font-weight:950;letter-spacing:.08em;text-transform:uppercase;font-size:12px;}",
    ".astro-app-nav{display:grid;gap:8px;}",
    ".astro-app-nav a{display:flex;align-items:center;gap:10px;min-height:42px;padding:10px 13px;border-radius:16px;color:rgba(255,255,255,.78);text-decoration:none;font-weight:800;font-size:13px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07);transition:.18s ease;}",
    ".astro-app-nav a span{width:26px;height:26px;border-radius:10px;display:grid;place-items:center;background:rgba(255,255,255,.07);color:#ffe8b0;font-size:11px;font-weight:950;flex:0 0 auto;}",
    ".astro-app-nav a:hover{transform:translateX(3px);background:rgba(255,232,180,.12);border-color:rgba(255,232,180,.28);color:#fff;}",
    ".astro-sidebar-cta{position:relative;overflow:hidden;margin-top:18px;padding:19px;border-radius:26px;background:radial-gradient(circle at 20% 0%,rgba(255,232,180,.25),transparent 42%),linear-gradient(145deg,rgba(255,232,180,.16),rgba(188,118,255,.11));border:1px solid rgba(255,232,180,.28);box-shadow:0 18px 46px rgba(0,0,0,.22);}",
    ".astro-sidebar-cta:before{display:none;}",
    ".astro-sidebar-cta small{display:inline-flex;margin-bottom:10px;padding:6px 9px;border-radius:999px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12);color:#ffe8b0;font-size:10px;font-weight:950;letter-spacing:.12em;text-transform:uppercase;}",
    ".astro-sidebar-cta strong{display:block;font-size:18px;line-height:1.12;color:#fff;margin-bottom:8px;letter-spacing:-.025em;}",
    ".astro-sidebar-cta span{display:block;font-size:12.5px;line-height:1.5;color:rgba(255,255,255,.72);margin-bottom:14px;}",
    ".astro-sidebar-cta button{width:100%;border:0;border-radius:17px;padding:14px 14px;background:linear-gradient(135deg,#fff1bd,#d6a13a);color:#18122e;font-weight:950;cursor:pointer;box-shadow:0 16px 38px rgba(255,202,88,.22);}",
    ".astro-app-main{display:grid;gap:26px;min-width:0;}",
    ".astro-hero{position:relative;overflow:hidden;border-radius:42px;padding:50px;background:radial-gradient(circle at 10% 0%,rgba(255,231,178,.20),transparent 30%),radial-gradient(circle at 90% 10%,rgba(175,116,255,.22),transparent 34%),linear-gradient(145deg,rgba(38,33,113,.97),rgba(10,14,47,.98));border:1px solid rgba(255,255,255,.14);box-shadow:0 34px 100px rgba(0,0,0,.35);}",
    ".astro-hero:after{content:'';position:absolute;right:-160px;top:-160px;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(255,232,180,.16),transparent 62%);pointer-events:none;}",
    ".astro-hero-kicker{display:inline-flex;align-items:center;gap:10px;margin-bottom:18px;padding:10px 15px;border-radius:999px;background:rgba(255,232,180,.13);border:1px solid rgba(255,232,180,.25);color:#ffe8b0;font-size:12px;font-weight:950;letter-spacing:.14em;text-transform:uppercase;}",
    ".astro-hero h1{max-width:880px;margin:0;font-size:clamp(40px,5.4vw,82px);line-height:.96;letter-spacing:-.06em;color:#fff;}",
    ".astro-hero-sub{max-width:780px;margin:24px 0 0;font-size:18px;line-height:1.65;color:rgba(255,255,255,.80);}",
    ".astro-hero-bottom{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:36px;flex-wrap:wrap;}",
    ".astro-couple{display:flex;align-items:center;gap:12px;}",
    ".astro-person-badge{padding:13px 16px;border-radius:18px;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.11);font-weight:900;color:#fff;}",
    ".astro-link-symbol{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:rgba(255,232,180,.12);border:1px solid rgba(255,232,180,.28);color:#ffe8b0;font-weight:950;}",
    ".astro-global-score{min-width:175px;text-align:center;padding:18px 20px;border-radius:28px;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.12);}",
    ".astro-global-score span{display:block;color:#ffe8b0;font-size:12px;text-transform:uppercase;letter-spacing:.12em;font-weight:950;margin-bottom:6px;}",
    ".astro-global-score strong{display:block;font-size:48px;line-height:1;color:#fff;letter-spacing:-.04em;}",
    ".astro-score-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;}",
    ".astro-score-card{position:relative;overflow:hidden;border-radius:32px;padding:24px;background:linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.035));border:1px solid rgba(255,255,255,.12);box-shadow:0 22px 70px rgba(0,0,0,.24);}",
    ".astro-score-card.high{border-color:rgba(255,232,180,.28);}",
    ".astro-score-card.medium{border-color:rgba(190,155,255,.28);}",
    ".astro-score-card.soft{border-color:rgba(120,220,255,.22);}",
    ".astro-score-card-top{display:flex;align-items:center;gap:10px;margin-bottom:16px;}",
    ".astro-score-icon{width:40px;height:40px;border-radius:15px;display:grid;place-items:center;background:rgba(255,232,180,.12);border:1px solid rgba(255,232,180,.22);}",
    ".astro-score-label{font-weight:950;color:#fff;}",
    ".astro-score-value{font-size:56px;line-height:1;font-weight:950;letter-spacing:-.055em;color:#fff;margin-bottom:8px;}",
    ".astro-score-level{font-size:14px;font-weight:900;color:#ffe8b0;margin-bottom:16px;}",
    ".astro-score-bar{height:9px;border-radius:999px;background:rgba(255,255,255,.10);overflow:hidden;}",
    ".astro-score-bar span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#ff9dc7,#ffe8a8,#80eaff);}",
    ".astro-reading-header{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin:6px 0 -2px;}",
    ".astro-reading-header h2{margin:0;font-size:clamp(30px,3.5vw,48px);letter-spacing:-.045em;line-height:1.02;color:#fff;}",
    ".astro-reading-header p{max-width:560px;margin:0;color:rgba(255,255,255,.68);line-height:1.55;font-size:15px;}",
    ".astro-report-grid{display:grid;gap:14px;}",
    ".astro-report-card{border-radius:26px;background:linear-gradient(145deg,rgba(255,255,255,.078),rgba(255,255,255,.034));border:1px solid rgba(255,255,255,.115);box-shadow:0 20px 60px rgba(0,0,0,.20);overflow:hidden;scroll-margin-top:30px;}",
    ".astro-report-card summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:22px 24px;}",
    ".astro-report-card summary::-webkit-details-marker{display:none;}",
    ".astro-report-summary-left{display:flex;align-items:center;gap:16px;min-width:0;}",
    ".astro-report-icon{width:44px;height:44px;border-radius:16px;display:grid;place-items:center;background:rgba(255,232,180,.11);border:1px solid rgba(255,232,180,.22);color:#ffe8b0;font-weight:950;flex:0 0 auto;}",
    ".astro-report-summary-left strong{display:block;color:#fff;font-size:19px;line-height:1.22;letter-spacing:-.02em;margin-bottom:5px;}",
    ".astro-report-summary-left p{margin:0;color:rgba(255,255,255,.62);font-size:13px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}",
    ".astro-open-indicator{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.11);color:#ffe8b0;font-size:20px;font-weight:900;flex:0 0 auto;}",
    ".astro-report-card[open] .astro-open-indicator{transform:rotate(45deg);}",
    ".astro-report-body{padding:0 24px 24px 84px;}",
    ".astro-report-body h3{font-size:20px;margin:22px 0 10px;color:#f6d6ff;}",
    ".astro-report-body p{font-size:16.5px;line-height:1.76;color:rgba(255,255,255,.84);margin:0 0 16px;}",
    ".astro-report-body ul{display:grid;gap:10px;margin:14px 0 0;padding:0;list-style:none;}",
    ".astro-report-body li{font-size:15.5px;line-height:1.58;color:rgba(255,255,255,.84);padding:13px 15px;border-radius:16px;background:rgba(255,255,255,.060);border:1px solid rgba(255,255,255,.09);}",
    ".astro-final-cta{position:relative;overflow:hidden;border-radius:36px;padding:38px;background:radial-gradient(circle at 10% 0%,rgba(255,232,180,.22),transparent 34%),linear-gradient(135deg,rgba(255,232,180,.18),rgba(180,115,255,.12));border:1px solid rgba(255,232,180,.28);display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;box-shadow:0 28px 80px rgba(0,0,0,.28);}",
    ".astro-final-cta h2{margin:0 0 8px;font-size:34px;color:#fff;letter-spacing:-.035em;}",
    ".astro-final-cta p{margin:0;color:rgba(255,255,255,.74);font-size:16px;line-height:1.55;max-width:760px;}",
    ".astro-final-cta button{border:0;border-radius:19px;padding:17px 26px;background:linear-gradient(135deg,#fff1bd,#d6a13a);color:#18122e;font-weight:950;font-size:15px;cursor:pointer;box-shadow:0 18px 44px rgba(255,202,88,.24);}",
    "@media(max-width:980px){.astro-app-shell{grid-template-columns:1fr}.astro-app-sidebar{position:relative;top:auto}.astro-app-nav{grid-template-columns:repeat(2,minmax(0,1fr))}.astro-score-grid{grid-template-columns:1fr}.astro-hero{padding:30px}.astro-reading-header{display:block}.astro-reading-header p{margin-top:12px}.astro-report-body{padding:0 20px 22px 20px}}",
    "</style>",
    "<section id=\"rapport-premium\" class=\"astro-premium-app\">",
    "<div class=\"astro-app-shell\">",
    "<aside class=\"astro-app-sidebar\">",
    "<div class=\"astro-brand-pill\">✦ Astro Premium</div>",
    "<nav class=\"astro-app-nav\">",
    navItems.join("\n"),
    "</nav>",
    "<div class=\"astro-sidebar-cta\">",
    "<small>Rapport complet</small>",
    "<strong>Débloquer la lecture premium</strong>",
    "<span>Synastrie détaillée, conseils personnalisés, PDF élégant et analyse approfondie des forces du lien.</span>",
    "<button>Débloquer maintenant</button>",
    "</div>",
    "</aside>",
    "<main class=\"astro-app-main\">",
    "<section id=\"astro-app-overview\" class=\"astro-hero\">",
    "<div class=\"astro-hero-kicker\">Compatibilité premium</div>",
    "<h1>Votre dynamique relationnelle</h1>",
    "<p class=\"astro-hero-sub\">Une lecture guidée de votre lien, construite à partir des aspects exacts de vos deux thèmes astraux. L’objectif : comprendre ce qui rapproche, ce qui demande de l’attention, et comment transformer la relation en vraie complémentarité.</p>",
    "<div class=\"astro-hero-bottom\">",
    "<div class=\"astro-couple\">",
    "<div class=\"astro-person-badge\">" + escapeHtml(personA) + "</div>",
    "<div class=\"astro-link-symbol\">∞</div>",
    "<div class=\"astro-person-badge\">" + escapeHtml(personB) + "</div>",
    "</div>",
    "<div class=\"astro-global-score\"><span>Score global</span><strong>" + escapeHtml(globalScore) + "%</strong></div>",
    "</div>",
    "</section>",
    "<section id=\"astro-app-scores\" class=\"astro-score-grid\">",
    buildScoreCard("Amour", loveScore, "♡"),
    buildScoreCard("Amitié", friendshipScore, "◇"),
    buildScoreCard("Travail", workScore, "□"),
    "</section>",
    "<section id=\"astro-app-reading\" class=\"astro-reading-header\">",
    "<h2>Lecture guidée</h2>",
    "<p>Les sections ci-dessous sont volontairement compactes : l’utilisateur peut ouvrir uniquement ce qui l’intéresse, comme dans une vraie application premium.</p>",
    "</section>",
    "<section class=\"astro-report-grid\">",
    sectionCards.join("\n"),
    "</section>",
    "<section class=\"astro-final-cta\">",
    "<div>",
    "<h2>Recevoir l’analyse complète</h2>",
    "<p>Débloquez une lecture plus profonde : conseils personnalisés, synthèse émotionnelle, points de vigilance détaillés et version PDF premium prête à conserver ou à partager.</p>",
    "</div>",
    "<button>Débloquer le rapport premium</button>",
    "</section>",
    "</main>",
    "</div>",
    "</section>",
    end
  ].join("\n");
}

const markdown = fs.readFileSync(reportPath, "utf8");
const compatibility = JSON.parse(fs.readFileSync(compatibilityPath, "utf8"));

let html = fs.readFileSync(htmlPath, "utf8");
html = removeOldPremiumSection(html);

const section = buildPremiumAppSection(markdown, compatibility);

if (html.includes("</body>")) {
  html = html.replace("</body>", section + "\n</body>");
} else {
  html = html + "\n" + section;
}

fs.writeFileSync(htmlPath, html, "utf8");

console.log("Interface premium allegee injectee avec succes :");
console.log(htmlPath);