import fs from "fs";

const htmlPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/theme_astral_visuel.html";
const reportPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/rapport_compatibilite_premium_mistral.md";

if (!fs.existsSync(htmlPath)) {
  console.error("Fichier HTML introuvable : " + htmlPath);
  process.exit(1);
}

if (!fs.existsSync(reportPath)) {
  console.error("Rapport premium introuvable : " + reportPath);
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

function markdownToHtml(markdown) {
  const lines = cleanMarkdown(markdown).split("\n");
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

    if (!line) {
      closeList();
      continue;
    }

    if (line === "---") {
      closeList();
      parts.push("<div class=\"premium-separator\"></div>");
      continue;
    }

    if (line.startsWith("# ")) {
      closeList();
      parts.push("<h1>" + escapeHtml(line.slice(2)) + "</h1>");
      continue;
    }

    if (line.startsWith("## ")) {
      closeList();
      parts.push("<h2>" + escapeHtml(line.slice(3)) + "</h2>");
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

function buildSection(reportHtml) {
  return [
    "<!-- ASTRO_PREMIUM_REPORT_START -->",
    "<style>",
    ".premium-report-section{max-width:1180px;margin:56px auto 90px;padding:0 24px;color:#fff;font-family:Inter,Arial,sans-serif;}",
    ".premium-report-card{border-radius:34px;padding:44px;background:linear-gradient(145deg,rgba(33,27,94,.96),rgba(12,16,50,.98));border:1px solid rgba(255,231,180,.28);box-shadow:0 30px 90px rgba(0,0,0,.42);}",
    ".premium-report-kicker{display:inline-block;margin-bottom:18px;padding:10px 16px;border-radius:999px;background:rgba(255,231,180,.12);border:1px solid rgba(255,231,180,.25);color:#ffe8b0;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;}",
    ".premium-report-content h1{font-size:46px;line-height:1.05;margin:0 0 24px;color:#fff;}",
    ".premium-report-content h2{font-size:30px;margin:42px 0 16px;color:#ffe8b0;}",
    ".premium-report-content h3{font-size:22px;margin:30px 0 12px;color:#f2d6ff;}",
    ".premium-report-content p{font-size:17px;line-height:1.75;color:rgba(255,255,255,.86);margin:0 0 18px;}",
    ".premium-report-content ul{display:grid;gap:12px;margin:18px 0 24px;padding:0;list-style:none;}",
    ".premium-report-content li{font-size:16px;line-height:1.6;color:rgba(255,255,255,.86);padding:14px 16px;border-radius:18px;background:rgba(255,255,255,.065);border:1px solid rgba(255,255,255,.10);}",
    ".premium-separator{height:1px;background:linear-gradient(90deg,transparent,rgba(255,232,180,.34),transparent);margin:34px 0;}",
    ".premium-report-actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:34px;}",
    ".premium-report-button{border:0;border-radius:18px;padding:15px 22px;font-size:15px;font-weight:850;cursor:pointer;background:linear-gradient(135deg,#ffe8a8,#c99a36);color:#17122d;}",
    ".premium-report-button.secondary{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.18);}",
    "</style>",
    "<section id=\"rapport-premium\" class=\"premium-report-section\">",
    "<div class=\"premium-report-card\">",
    "<div class=\"premium-report-kicker\">✦ Analyse premium de compatibilité</div>",
    "<div class=\"premium-report-content\">",
    reportHtml,
    "</div>",
    "<div class=\"premium-report-actions\">",
    "<button class=\"premium-report-button\">Débloquer le rapport complet</button>",
    "<button class=\"premium-report-button secondary\">Comparer un autre thème</button>",
    "</div>",
    "</div>",
    "</section>",
    "<!-- ASTRO_PREMIUM_REPORT_END -->"
  ].join("\n");
}

const markdown = fs.readFileSync(reportPath, "utf8");
const reportHtml = markdownToHtml(markdown);

let html = fs.readFileSync(htmlPath, "utf8");
html = removeOldPremiumSection(html);

const section = buildSection(reportHtml);

if (html.includes("</body>")) {
  html = html.replace("</body>", section + "\n</body>");
} else {
  html = html + "\n" + section;
}

fs.writeFileSync(htmlPath, html, "utf8");

console.log("Rapport premium injecte avec succes :");
console.log(htmlPath);