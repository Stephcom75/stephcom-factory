import "dotenv/config";
import fs from "fs";
import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY;
const model = process.env.MISTRAL_MODEL || "mistral-small-latest";

if (!apiKey) {
  console.error("Erreur : MISTRAL_API_KEY est absent du fichier .env");
  process.exit(1);
}

const client = new Mistral({ apiKey });

const astroJsonPath =
  "workspace/projects/ASTRO_PREMIUM/04_TECHNIQUE/exemple_sortie_schema_astro.json";

const masterPromptPath =
  "workspace/projects/ASTRO_PREMIUM/06_PROMPTS/prompt_maitre_astro_premium.md";

const outputPath =
  "workspace/projects/ASTRO_PREMIUM/08_SORTIES/rapport_resume_essentiel.md";

const astroData = JSON.parse(fs.readFileSync(astroJsonPath, "utf8"));
const masterPrompt = fs.readFileSync(masterPromptPath, "utf8");

const usefulData = {
  client: astroData.client,
  birth_data: astroData.birth_data,
  sun: astroData.western_astrology.sun,
  moon: astroData.western_astrology.moon,
  ascendant: astroData.western_astrology.ascendant,
  midheaven: astroData.western_astrology.midheaven,
  mercury: astroData.western_astrology.mercury,
  venus: astroData.western_astrology.venus,
  mars: astroData.western_astrology.mars,
  jupiter: astroData.western_astrology.jupiter,
  saturn: astroData.western_astrology.saturn,
  main_aspects: Array.isArray(astroData.western_astrology.major_aspects)
  ? astroData.western_astrology.major_aspects.slice(0, 8)
  : Object.values(astroData.western_astrology.major_aspects || {}).flat().slice(0, 8)
};

const userPrompt = `
Tu vas générer uniquement la section "Résumé essentiel" d'un rapport Astro Premium.

Règles :
- Ne génère pas le rapport complet.
- Ne parle pas de diagnostic médical ou psychologique.
- Ton premium, clair, profond, accessible.
- Style non fataliste.
- 500 à 800 mots maximum.
- Structure avec un titre, puis 4 à 6 paragraphes.
- Tu dois t'appuyer uniquement sur les données fournies.
- Ne dis jamais que tu as reçu un JSON.
- Ne mentionne pas Celestine, Mistral, API ou logiciel.

Prompt maître de référence :
${masterPrompt}

Données astrologiques structurées :
${JSON.stringify(usefulData, null, 2)}
`;

console.log("Appel Mistral en cours...");
console.log("Modèle utilisé :", model);

const response = await client.chat.complete({
  model,
  messages: [
    {
      role: "system",
      content:
        "Tu es un rédacteur expert en rapports astrologiques premium, prudent, nuancé et non fataliste."
    },
    {
      role: "user",
      content: userPrompt
    }
  ],
  temperature: 0.7
});

const content = response.choices?.[0]?.message?.content || "";

fs.writeFileSync(outputPath, content, "utf8");

console.log("Rapport généré avec succès :");
console.log(outputPath);
console.log("");
console.log(content);