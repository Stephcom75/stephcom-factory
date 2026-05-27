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

function paragraphHtml(lines) {
  const blocks = [];
  let listOpen = false;

  function closeList() {
    if (listOpen) {
      blocks.push("</ul>");
      listOpen = false;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line === "---") {
      closeList();
      continue;
    }

    if (line.startsWith("- ")) {
      if (!listOpen) {
        blocks.push("<ul>");
        listOpen = true;
      }

      blocks.push("<li>" + escapeHtml(line.slice(2)) + "</li>");
      continue;
    }

    closeList();
    blocks.push("<p>" + escapeHtml(line) + "</p>");
  }

  closeList();

  return blocks.join("\n");
}

function splitReportIntoSections(markdown) {
  const clean = cleanMarkdown(markdown);
  const lines = clean.split("\n");

  const sections = [];
  let currentTitle = "Vue d’ensemble";
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
    "<a href=\"#astro-app-overview\">Vue globale</a>",
    "<a href=\"#astro-app-scores\">Scores</a>"
  ];

  const sectionHtml = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const id = slugify(section.title, i + 1);

    navItems.push("<a href=\"#" + id + "\">" + escapeHtml(section.title) + "</a>");

    sectionHtml.push([
      "<article id=\"" + id + "\" class=\"astro-report-panel\">",
      "<div class=\"astro-report-panel-number\">" + String(i + 1).padStart(2, "0") + "</div>",
      "<h2>" + escapeHtml(section.title) + "</h2>",
      paragraphHtml(section.lines),
      "</article>"
    ].join("\n"));
  }

  return [
    start,
    "<style>",
    "html{scroll-behavior:smooth;}",
    ".astro-premium-app{max-width:1380px;margin:56px auto 110px;padding:0 24px;color:#fff;font-family:Inter,Arial,sans-serif;}",
    ".astro-app-shell{display:grid;grid-template-columns:260px minmax(0,1fr);gap:24px;align-items:start;}",
    ".astro-app-sidebar{position:sticky;top:24px;border-radius:30px;padding:18px;background:linear-gradient(180deg,rgba(24,24,74,.92),rgba(13,16,50,.94));border:1px solid rgba(255,255,255,.13);box-shadow:0 24px 70px rgba(0,0,0,.28);}",
    ".astro-brand-pill{display:flex;align-items:center;gap:10px;margin-bottom:18px;padding:13px 14px;border-radius:20px;background:rgba(255,232,180,.10);border:1px solid rgba(255,232,180,.22);color:#ffe8b0;font-weight:900;letter-spacing:.08em;text-transform:uppercase;font-size:12px;}",
    ".astro-app-nav{display:grid;gap:8px;}",
    ".astro-app-nav a{display:flex;align-items:center;min-height:42px;padding:10px 13px;border-radius:16px;color:rgba(255,255,255,.78);text-decoration:none;font-weight:750;font-size:13px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07);}",
    ".astro-app-nav a:hover{background:rgba(255,232,180,.12);border-color:rgba(255,232,180,.28);color:#fff;}",
    ".astro-sidebar-cta{margin-top:16px;padding:16px;border-radius:22px;background:linear-gradient(145deg,rgba(255,232,180,.16),rgba(188,118,255,.10));border:1px solid rgba(255,232,180,.22);}",
    ".astro-sidebar-cta strong{display:block;font-size:15px;line-height:1.2;color:#fff;margin-bottom:8px;}",
    ".astro-sidebar-cta span{display:block;font-size:12px;line-height:1.45;color:rgba(255,255,255,.68);margin-bottom:12px;}",
    ".astro-sidebar-cta button{width:100%;border:0;border-radius:15px;padding:12px 14px;background:linear-gradient(135deg,#ffe8a8,#c9942e);color:#18122e;font-weight:900;cursor:pointer;}",
    ".astro-app-main{display:grid;gap:24px;min-width:0;}",
    ".astro-hero{position:relative;overflow:hidden;border-radius:38px;padding:44px;background:radial-gradient(circle at 10% 0%,rgba(255,231,178,.20),transparent 30%),radial-gradient(circle at 90% 10%,rgba(175,116,255,.22),transparent 34%),linear-gradient(145deg,rgba(38,33,113,.97),rgba(10,14,47,.98));border:1px solid rgba(255,255,255,.14);box-shadow:0 34px 100px rgba(0,0,0,.35);}",
    ".astro-hero-kicker{display:inline-flex;align-items:center;gap:10px;margin-bottom:18px;padding:10px 15px;border-radius:999px;background:rgba(255,232,180,.13);border:1px solid rgba(255,232,180,.25);color:#ffe8b0;font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;}",
    ".astro-hero h1{max-width:860px;margin:0;font-size:clamp(38px,5vw,74px);line-height:.98;letter-spacing:-.055em;color:#fff;}",
    ".astro-hero-sub{max-width:760px;margin:22px 0 0;font-size:18px;line-height:1.65;color:rgba(255,255,255,.78);}",
    ".astro-hero-bottom{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:34px;flex-wrap:wrap;}",
    ".astro-couple{display:flex;align-items:center;gap:12px;}",
    ".astro-person-badge{padding:13px 16px;border-radius:18px;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.11);font-weight:850;color:#fff;}",
    ".astro-link-symbol{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:rgba(255,232,180,.12);border:1px solid rgba(255,232,180,.28);color:#ffe8b0;font-weight:900;}",
    ".astro-global-score{min-width:170px;text-align:center;padding:18px 20px;border-radius:26px;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.12);}",
    ".astro-global-score span{display:block;color:#ffe8b0;font-size:12px;text-transform:uppercase;letter-spacing:.12em;font-weight:900;margin-bottom:6px;}",
    ".astro-global-score strong{display:block;font-size:46px;line-height:1;color:#fff;}",
    ".astro-score-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;}",
    ".astro-score-card{position:relative;overflow:hidden;border-radius:30px;padding:22px;background:linear-gradient(145deg,rgba(255,255,255,.085),rgba(255,255,255,.035));border:1px solid rgba(255,255,255,.12);box-shadow:0 22px 70px rgba(0,0,0,.24);}",
    ".astro-score-card.high{border-color:rgba(255,232,180,.28);}",
    ".astro-score-card.medium{border-color:rgba(190,155,255,.28);}",
    ".astro-score-card.soft{border-color:rgba(120,220,255,.22);}",
    ".astro-score-card-top{display:flex;align-items:center;gap:10px;margin-bottom:16px;}",
    ".astro-score-icon{width:38px;height:38px;border-radius:14px;display:grid;place-items:center;background:rgba(255,232,180,.12);border:1px solid rgba(255,232,180,.22);}",
    ".astro-score-label{font-weight:900;color:#fff;}",
    ".astro-score-value{font-size:52px;line-height:1;font-weight:950;letter-spacing:-.05em;color:#fff;margin-bottom:8px;}",
    ".astro-score-level{font-size:14px;font-weight:850;color:#ffe8b0;margin-bottom:16px;}",
    ".astro-score-bar{height:9px;border-radius:999px;background:rgba(255,255,255,.10);overflow:hidden;}",
    ".astro-score-bar span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#ff9dc7,#ffe8a8,#80eaff);}",
    ".astro-report-panel{position:relative;border-radius:32px;padding:34px;background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.032));border:1px solid rgba(255,255,255,.115);box-shadow:0 24px 80px rgba(0,0,0,.24);}",
    ".astro-report-panel-number{position:absolute;right:28px;top:22px;font-size:48px;line-height:1;font-weight:950;color:rgba(255,232,180,.10);}",
    ".astro-report-panel h2{max-width:820px;margin:0 0 20px;font-size:clamp(26px,3vw,42px);line-height:1.05;letter-spacing:-.035em;color:#ffe8b0;}",
    ".astro-report-panel h3{font-size:21px;margin:26px 0 10px;color:#f6d6ff;}",
    ".astro-report-panel p{font-size:17px;line-height:1.78;color:rgba(255,255,255,.84);margin:0 0 18px;}",
    ".astro-report-panel ul{display:grid;gap:12px;margin:18px 0 0;padding:0;list-style:none;}",
    ".astro-report-panel li{font-size:16px;line-height:1.62;color:rgba(255,255,255,.84);padding:15px 17px;border-radius:18px;background:rgba(255,255,255,.065);border:1px solid rgba(255,255,255,.10);}",
    ".astro-final-cta{border-radius:34px;padding:34px;background:linear-gradient(135deg,rgba(255,232,180,.18),rgba(180,115,255,.12));border:1px solid rgba(255,232,180,.26);display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;}",
    ".astro-final-cta h2{margin:0 0 8px;font-size:30px;color:#fff;}",
    ".astro-final-cta p{margin:0;color:rgba(255,255,255,.72);font-size:16px;line-height:1.55;max-width:720px;}",
    ".astro-final-cta button{border:0;border-radius:18px;padding:16px 24px;background:linear-gradient(135deg,#ffe8a8,#c9942e);color:#18122e;font-weight:950;font-size:15px;cursor:pointer;box-shadow:0 18px 44px rgba(255,202,88,.22);}",
    "@media(max-width:980px){.astro-app-shell{grid-template-columns:1fr}.astro-app-sidebar{position:relative;top:auto}.astro-app-nav{grid-template-columns:repeat(2,minmax(0,1fr))}.astro-score-grid{grid-template-columns:1fr}.astro-hero{padding:30px}.astro-report-panel{padding:26px}}",
    "</style>",
    "<section id=\"rapport-premium\" class=\"astro-premium-app\">",
    "<div class=\"astro-app-shell\">",
    "<aside class=\"astro-app-sidebar\">",
    "<div class=\"astro-brand-pill\">✦ Astro Premium</div>",
    "<nav class=\"astro-app-nav\">",
    navItems.join("\n"),
    "</nav>",
    "<div class=\"astro-sidebar-cta\">",
    "<strong>Débloquez l’analyse complète</strong>",
    "<span>Synastrie détaillée, conseils personnalisés et version PDF premium.</span>",
    "<button>Passer Premium</button>",
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
    sectionHtml.join("\n"),
    "<section class=\"astro-final-cta\">",
    "<div>",
    "<h2>Aller plus loin dans l’analyse</h2>",
    "<p>Cette version donne déjà une lecture claire de la relation. La version complète pourra intégrer un PDF premium, des conseils personnalisés et une comparaison plus détaillée des aspects clés.</p>",
    "</div>",
    "<button>Débloquer le rapport complet</button>",
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

console.log("Interface application premium injectee avec succes :");
console.log(htmlPath);