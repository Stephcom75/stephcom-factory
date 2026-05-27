import fs from "fs";

const envPath = ".env";
const synastryPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/synastry_aspects_personne_a_b.json";
const outputMdPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/rapport_compatibilite_premium_mistral.md";

function loadEnvFile(path) {
  if (!fs.existsSync(path)) {
    return {};
  }

  const content = fs.readFileSync(path, "utf8");
  const env = {};

  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

const localEnv = loadEnvFile(envPath);

const MISTRAL_API_KEY =
  process.env.MISTRAL_API_KEY ||
  process.env.MISTRAL_API ||
  process.env.MISTRAL_KEY ||
  localEnv.MISTRAL_API_KEY ||
  localEnv.MISTRAL_API ||
  localEnv.MISTRAL_KEY ||
  "";

const MISTRAL_MODEL =
  process.env.MISTRAL_MODEL ||
  localEnv.MISTRAL_MODEL ||
  "mistral-large-latest";

if (!MISTRAL_API_KEY) {
  console.error("Erreur : aucune cle Mistral trouvee.");
  console.error("Ajoute MISTRAL_API_KEY=ta_cle dans le fichier .env");
  process.exit(1);
}

if (!fs.existsSync(synastryPath)) {
  console.error("Erreur : fichier de synastrie introuvable.");
  console.error(synastryPath);
  console.error("Lance d'abord generate_synastry_aspects.mjs");
  process.exit(1);
}

const synastry = JSON.parse(fs.readFileSync(synastryPath, "utf8"));

function safe(value, fallback) {
  if (value === null || value === undefined || value === "") {
    return fallback || "";
  }

  return String(value);
}

function compactAspect(aspect) {
  return {
    person_a_body: aspect.person_a_label,
    person_a_sign: aspect.person_a_sign_fr,
    person_a_position: aspect.person_a_position,
    person_b_body: aspect.person_b_label,
    person_b_sign: aspect.person_b_sign_fr,
    person_b_position: aspect.person_b_position,
    aspect: aspect.aspect_label_fr,
    symbol: aspect.aspect_symbol,
    orb: aspect.orb,
    strength: aspect.strength,
    category: aspect.category,
    polarity: aspect.polarity
  };
}

function buildAstroDataForPrompt(report) {
  return {
    people: {
      person_a: {
        name: safe(report.people?.person_a?.name, "Personne A")
      },
      person_b: {
        name: safe(report.people?.person_b?.name, "Personne B")
      }
    },
    scores: report.scores,
    counts: report.counts,
    top_strengths: (report.top_strengths || []).slice(0, 7).map(compactAspect),
    top_challenges: (report.top_challenges || []).slice(0, 7).map(compactAspect),
    major_aspects: (report.major_aspects || []).slice(0, 12).map(compactAspect)
  };
}

function buildSystemPrompt() {
  return [
    "Tu es un astrologue francophone premium, expert en synastrie relationnelle.",
    "Tu écris pour un produit digital payant, élégant, rassurant et vendeur.",
    "Tu dois transformer des données techniques d'astrologie en une lecture claire, émotionnelle et crédible.",
    "",
    "Règles de style :",
    "- écrire en français naturel, élégant et accessible ;",
    "- ne jamais donner l'impression d'un texte automatique ;",
    "- ne pas être fataliste ;",
    "- ne pas dire que l'astrologie prédit tout ;",
    "- parler de tendances, dynamiques, forces, zones de vigilance ;",
    "- utiliser un ton premium, humain, subtil et vendeur ;",
    "- ne pas inventer des aspects absents des données ;",
    "- ne pas citer trop de jargon technique ;",
    "- expliquer les aspects seulement quand ils apportent de la valeur ;",
    "- écrire comme un rapport que le client pourrait acheter.",
    "",
    "Structure obligatoire :",
    "1. Titre premium",
    "2. Résumé général de la relation",
    "3. Score global expliqué",
    "4. Compatibilité amoureuse",
    "5. Compatibilité émotionnelle et amicale",
    "6. Compatibilité travail / projet",
    "7. Les grandes forces du lien",
    "8. Les tensions possibles",
    "9. Conseils pour mieux fonctionner ensemble",
    "10. Verdict premium final",
    "",
    "Longueur attendue : environ 900 à 1300 mots.",
    "Format attendu : Markdown propre."
  ].join("\n");
}

function buildUserPrompt(data) {
  return [
    "Voici les données de synastrie entre deux personnes.",
    "Utilise uniquement ces informations pour produire un rapport premium.",
    "",
    "IMPORTANT : les scores sont déjà calibrés. Ne les modifie pas.",
    "",
    "DONNEES :",
    JSON.stringify(data, null, 2),
    "",
    "Rédige maintenant le rapport premium de compatibilité."
  ].join("\n");
}

async function callMistral(systemPrompt, userPrompt) {
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + MISTRAL_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MISTRAL_MODEL,
      temperature: 0.72,
      max_tokens: 2600,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ]
    })
  });

  const rawText = await response.text();

  if (!response.ok) {
    console.error("Erreur API Mistral :");
    console.error(rawText);
    process.exit(1);
  }

  const data = JSON.parse(rawText);

  const content =
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content
      ? data.choices[0].message.content
      : "";

  if (!content) {
    console.error("Erreur : Mistral n'a pas retourne de contenu exploitable.");
    console.error(rawText);
    process.exit(1);
  }

  return content;
}

function buildHeader(report) {
  const personA = safe(report.people?.person_a?.name, "Personne A");
  const personB = safe(report.people?.person_b?.name, "Personne B");

  const love = report.scores?.love?.score;
  const friendship = report.scores?.friendship?.score;
  const work = report.scores?.work?.score;
  const global = report.scores?.global?.score;

  return [
    "# Rapport premium de compatibilité astrologique",
    "",
    "## Données principales",
    "",
    "- Personne A : " + personA,
    "- Personne B : " + personB,
    "- Amour : " + love + "%",
    "- Amitié : " + friendship + "%",
    "- Travail / projet : " + work + "%",
    "- Compatibilité globale : " + global + "%",
    "",
    "---",
    ""
  ].join("\n");
}

async function main() {
  console.log("Lecture de la synastrie calibree...");
  console.log(synastryPath);

  const promptData = buildAstroDataForPrompt(synastry);
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(promptData);

  console.log("Appel Mistral en cours...");
  console.log("Modele utilise : " + MISTRAL_MODEL);

  const premiumText = await callMistral(systemPrompt, userPrompt);

  const finalReport = buildHeader(synastry) + premiumText + "\n";

  fs.writeFileSync(outputMdPath, finalReport, "utf8");

  console.log("Rapport premium genere avec succes :");
  console.log(outputMdPath);
}

main();