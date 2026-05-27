import fs from "fs";

const htmlPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/theme_astral_visuel.html";

if (!fs.existsSync(htmlPath)) {
  console.error("Fichier HTML introuvable : " + htmlPath);
  process.exit(1);
}

function removeOldModalInjection(html) {
  const start = "<!-- ASTRO_PREMIUM_MODAL_START -->";
  const end = "<!-- ASTRO_PREMIUM_MODAL_END -->";

  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end);

  if (startIndex === -1 || endIndex === -1) {
    return html;
  }

  return html.slice(0, startIndex) + html.slice(endIndex + end.length);
}

function buildModalInjection() {
  return [
    "<!-- ASTRO_PREMIUM_MODAL_START -->",
    "<style>",
    ".astro-premium-modal-overlay{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(5,7,25,.76);backdrop-filter:blur(18px);}",
    ".astro-premium-modal-overlay.is-open{display:flex;}",
    ".astro-premium-modal{position:relative;width:min(1040px,100%);max-height:92vh;overflow:auto;border-radius:38px;padding:34px;background:radial-gradient(circle at 10% 0%,rgba(255,232,180,.25),transparent 34%),radial-gradient(circle at 90% 16%,rgba(182,120,255,.21),transparent 38%),linear-gradient(145deg,rgba(31,28,92,.985),rgba(9,12,42,.99));border:1px solid rgba(255,232,180,.32);box-shadow:0 44px 150px rgba(0,0,0,.60);color:#fff;font-family:Inter,Arial,sans-serif;}",
    ".astro-premium-modal-close{position:absolute;right:18px;top:18px;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:#fff;font-size:24px;cursor:pointer;}",
    ".astro-premium-modal-kicker{display:inline-flex;margin-bottom:16px;padding:9px 13px;border-radius:999px;background:rgba(255,232,180,.12);border:1px solid rgba(255,232,180,.25);color:#ffe8b0;font-size:11px;font-weight:950;text-transform:uppercase;letter-spacing:.14em;}",
    ".astro-premium-modal h2{max-width:830px;margin:0 0 14px;font-size:clamp(34px,5vw,62px);line-height:.98;letter-spacing:-.06em;color:#fff;}",
    ".astro-premium-modal-intro{max-width:830px;margin:0 0 22px;font-size:17px;line-height:1.65;color:rgba(255,255,255,.80);}",
    ".astro-payment-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:18px 0 26px;}",
    ".astro-payment-pill{display:inline-flex;align-items:center;gap:8px;padding:10px 13px;border-radius:999px;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.13);color:rgba(255,255,255,.86);font-size:12px;font-weight:850;}",
    ".astro-payment-pill strong{color:#ffe8b0;font-weight:950;}",
    ".astro-premium-highlight{display:grid;grid-template-columns:1.1fr .9fr;gap:18px;margin:24px 0;}",
    ".astro-premium-teaser{border-radius:26px;padding:22px;background:rgba(255,255,255,.065);border:1px solid rgba(255,255,255,.11);}",
    ".astro-premium-teaser strong{display:block;font-size:20px;letter-spacing:-.025em;margin-bottom:8px;color:#fff;}",
    ".astro-premium-teaser p{margin:0;color:rgba(255,255,255,.72);font-size:14.5px;line-height:1.55;}",
    ".astro-premium-offers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:24px 0 26px;}",
    ".astro-premium-offer{position:relative;overflow:hidden;border-radius:28px;padding:21px;background:linear-gradient(145deg,rgba(255,255,255,.085),rgba(255,255,255,.035));border:1px solid rgba(255,255,255,.12);display:flex;flex-direction:column;}",
    ".astro-premium-offer.featured{border-color:rgba(255,232,180,.38);box-shadow:0 18px 56px rgba(255,202,88,.12);}",
    ".astro-premium-offer-badge{display:inline-flex;width:max-content;margin-bottom:12px;padding:7px 10px;border-radius:999px;background:rgba(255,232,180,.12);border:1px solid rgba(255,232,180,.22);color:#ffe8b0;font-size:10px;font-weight:950;letter-spacing:.12em;text-transform:uppercase;}",
    ".astro-premium-offer h3{margin:0 0 8px;color:#fff;font-size:22px;line-height:1.12;letter-spacing:-.03em;}",
    ".astro-price{display:flex;align-items:flex-end;gap:5px;margin:0 0 12px;color:#fff;}",
    ".astro-price strong{font-size:42px;line-height:.95;letter-spacing:-.06em;color:#ffe8b0;}",
    ".astro-price span{font-size:13px;color:rgba(255,255,255,.62);font-weight:800;margin-bottom:4px;}",
    ".astro-premium-offer p{margin:0 0 15px;color:rgba(255,255,255,.70);font-size:13.5px;line-height:1.5;}",
    ".astro-premium-offer ul{display:grid;gap:9px;margin:0 0 18px;padding:0;list-style:none;}",
    ".astro-premium-offer li{display:flex;gap:8px;color:rgba(255,255,255,.84);font-size:13px;line-height:1.35;}",
    ".astro-premium-offer li span{color:#ffe8b0;font-weight:950;}",
    ".astro-offer-button{margin-top:auto;border:0;border-radius:16px;padding:13px 14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#fff;font-weight:900;cursor:pointer;}",
    ".astro-premium-offer.featured .astro-offer-button{background:linear-gradient(135deg,#fff1bd,#d6a13a);color:#18122e;border:0;box-shadow:0 16px 38px rgba(255,202,88,.20);}",
    ".astro-premium-modal-value{display:grid;gap:10px;margin:22px 0 28px;padding:0;list-style:none;}",
    ".astro-premium-modal-value li{display:flex;gap:12px;align-items:flex-start;padding:14px 15px;border-radius:18px;background:rgba(255,255,255,.065);border:1px solid rgba(255,255,255,.10);color:rgba(255,255,255,.86);font-size:14px;line-height:1.48;}",
    ".astro-premium-modal-value li span{color:#ffe8b0;font-weight:950;}",
    ".astro-premium-modal-actions{display:flex;gap:12px;flex-wrap:wrap;align-items:center;}",
    ".astro-premium-modal-primary{border:0;border-radius:18px;padding:16px 23px;background:linear-gradient(135deg,#fff1bd,#d6a13a);color:#18122e;font-weight:950;cursor:pointer;box-shadow:0 18px 44px rgba(255,202,88,.24);}",
    ".astro-premium-modal-secondary{border:1px solid rgba(255,255,255,.18);border-radius:18px;padding:16px 23px;background:rgba(255,255,255,.08);color:#fff;font-weight:850;cursor:pointer;}",
    ".astro-premium-modal-note{margin:0;color:rgba(255,255,255,.60);font-size:12.5px;line-height:1.45;max-width:600px;}",
    "@media(max-width:860px){.astro-premium-modal{padding:26px;border-radius:28px}.astro-premium-highlight{grid-template-columns:1fr}.astro-premium-offers{grid-template-columns:1fr}.astro-premium-modal-actions{display:grid}.astro-premium-modal-primary,.astro-premium-modal-secondary{width:100%}}",
    "</style>",
    "<div class=\"astro-premium-modal-overlay\" id=\"astroPremiumModal\">",
    "<div class=\"astro-premium-modal\">",
    "<button class=\"astro-premium-modal-close\" type=\"button\" id=\"astroPremiumModalClose\">×</button>",
    "<div class=\"astro-premium-modal-kicker\">Offres premium</div>",
    "<h2>Choisissez le rapport qui correspond à votre question</h2>",
    "<p class=\"astro-premium-modal-intro\">Votre aperçu gratuit donne les grandes tendances. Les versions premium vont plus loin : elles transforment les indices astrologiques en une analyse complète, personnelle et exploitable — pour vous comprendre, avancer dans votre vie, ou analyser une relation importante.</p>",
    "<div class=\"astro-payment-row\">",
    "<div class=\"astro-payment-pill\"><strong>Google Play</strong> paiement sécurisé</div>",
    "<div class=\"astro-payment-pill\"><strong>PayPal</strong> disponible sur la version web</div>",
    "<div class=\"astro-payment-pill\"><strong>Facture mobile</strong> selon opérateur et disponibilité</div>",
    "</div>",
    "<div class=\"astro-premium-highlight\">",
    "<div class=\"astro-premium-teaser\">",
    "<strong>Version gratuite</strong>",
    "<p>Score global, premières tendances, mini-synthèse et quelques indices clés. Assez pour ressentir la justesse de l’analyse, sans dévoiler toute la lecture.</p>",
    "</div>",
    "<div class=\"astro-premium-teaser\">",
    "<strong>Version premium</strong>",
    "<p>Analyse complète, conseils personnalisés, lecture détaillée des forces et blocages, puis PDF premium à conserver ou partager.</p>",
    "</div>",
    "</div>",
    "<div class=\"astro-premium-offers\">",
    "<div class=\"astro-premium-offer\">",
    "<div class=\"astro-premium-offer-badge\">Base premium</div>",
    "<h3>Thème personnel</h3>",
    "<div class=\"astro-price\"><strong>4,99 €</strong><span>paiement unique</span></div>",
    "<p>Pour comprendre votre profil, vos forces et les grandes tendances de votre vie.</p>",
    "<ul>",
    "<li><span>✦</span><div>Personnalité, Soleil, Lune, Ascendant.</div></li>",
    "<li><span>✦</span><div>Amour, travail, énergie et équilibre.</div></li>",
    "<li><span>✦</span><div>Conseils personnalisés et période actuelle.</div></li>",
    "</ul>",
    "<button class=\"astro-offer-button\" type=\"button\">Choisir le thème personnel</button>",
    "</div>",
    "<div class=\"astro-premium-offer featured\">",
    "<div class=\"astro-premium-offer-badge\">Relation</div>",
    "<h3>Compatibilité premium</h3>",
    "<div class=\"astro-price\"><strong>6,99 €</strong><span>paiement unique</span></div>",
    "<p>Pour comparer votre thème avec celui d’une personne importante : rencontre, conjoint, ex, associé.</p>",
    "<ul>",
    "<li><span>✦</span><div>Amour, émotion, communication et attraction.</div></li>",
    "<li><span>✦</span><div>Forces du lien et zones de vigilance.</div></li>",
    "<li><span>✦</span><div>Synastrie complète avec aspects exacts.</div></li>",
    "</ul>",
    "<button class=\"astro-offer-button\" type=\"button\">Choisir la compatibilité</button>",
    "</div>",
    "<div class=\"astro-premium-offer\">",
    "<div class=\"astro-premium-offer-badge\">Meilleure valeur</div>",
    "<h3>Pack complet</h3>",
    "<div class=\"astro-price\"><strong>9,99 €</strong><span>au lieu de 11,98 €</span></div>",
    "<p>Pour obtenir votre lecture personnelle et une compatibilité complète avec une personne.</p>",
    "<ul>",
    "<li><span>✦</span><div>Thème personnel complet.</div></li>",
    "<li><span>✦</span><div>Compatibilité détaillée avec une personne.</div></li>",
    "<li><span>✦</span><div>PDF premium et synthèse finale.</div></li>",
    "</ul>",
    "<button class=\"astro-offer-button\" type=\"button\">Choisir le pack complet</button>",
    "</div>",
    "</div>",
    "<ul class=\"astro-premium-modal-value\">",
    "<li><span>✦</span><div>Le thème personnel répond à : qui suis-je, qu’est-ce qui se joue en amour, travail, énergie et équilibre ?</div></li>",
    "<li><span>✦</span><div>La compatibilité répond à : pourquoi cette personne m’attire, où sont nos forces, et quels blocages peuvent apparaître ?</div></li>",
    "<li><span>✦</span><div>Le pack complet est pensé pour ceux qui veulent à la fois se comprendre eux-mêmes et comprendre une relation précise.</div></li>",
    "</ul>",
    "<div class=\"astro-premium-modal-actions\">",
    "<button class=\"astro-premium-modal-primary\" type=\"button\">Débloquer à partir de 4,99 €</button>",
    "<button class=\"astro-premium-modal-secondary\" type=\"button\" id=\"astroPremiumModalLater\">Continuer avec l’aperçu gratuit</button>",
    "<p class=\"astro-premium-modal-note\">Paiement sécurisé via Google Play pour l’application. PayPal pourra être proposé sur la version web. Le paiement sur facture mobile dépend du pays, du compte et de l’opérateur.</p>",
    "</div>",
    "</div>",
    "</div>",
    "<script>",
    "(function(){",
    "var modal=document.getElementById('astroPremiumModal');",
    "var closeBtn=document.getElementById('astroPremiumModalClose');",
    "var laterBtn=document.getElementById('astroPremiumModalLater');",
    "function openModal(){if(modal){modal.classList.add('is-open');}}",
    "function closeModal(){if(modal){modal.classList.remove('is-open');}}",
    "document.addEventListener('click',function(event){",
    "var target=event.target;",
    "if(!target){return;}",
    "var text=(target.textContent||'').toLowerCase();",
    "if(text.includes('débloquer')||text.includes('passer premium')||text.includes('rapport premium')||text.includes('paiement')){",
    "event.preventDefault();",
    "openModal();",
    "}",
    "});",
    "if(closeBtn){closeBtn.addEventListener('click',closeModal);}",
    "if(laterBtn){laterBtn.addEventListener('click',closeModal);}",
    "if(modal){modal.addEventListener('click',function(event){if(event.target===modal){closeModal();}});}",
    "document.addEventListener('keydown',function(event){if(event.key==='Escape'){closeModal();}});",
    "})();",
    "</script>",
    "<!-- ASTRO_PREMIUM_MODAL_END -->"
  ].join("\n");
}

let html = fs.readFileSync(htmlPath, "utf8");
html = removeOldModalInjection(html);

const modalInjection = buildModalInjection();

if (html.includes("</body>")) {
  html = html.replace("</body>", modalInjection + "\n</body>");
} else {
  html = html + "\n" + modalInjection;
}

fs.writeFileSync(htmlPath, html, "utf8");

console.log("Modale pricing Google Play PayPal restauree avec succes :");
console.log(htmlPath);