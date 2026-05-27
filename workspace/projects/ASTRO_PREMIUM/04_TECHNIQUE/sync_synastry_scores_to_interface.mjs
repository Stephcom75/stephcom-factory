import fs from "fs";

const synastryPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/synastry_aspects_personne_a_b.json";
const interfaceCompatibilityPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/compatibilite_personne_a_b.json";

const synastryReport = JSON.parse(fs.readFileSync(synastryPath, "utf8"));

const interfaceCompatibility = {
  metadata: {
    project: "ASTRO_PREMIUM",
    version: "2.0",
    type: "compatibility_interface_data",
    source: "synastry_aspects_personne_a_b.json",
    note: "Données de compatibilité utilisées par l'interface visuelle Astro Premium. Les scores proviennent du moteur de synastrie calibré."
  },

  people: {
    person_a: {
      name: synastryReport.people?.person_a?.name || "Personne A"
    },
    person_b: {
      name: synastryReport.people?.person_b?.name || "Personne B"
    }
  },

  scores: {
    love: {
      label: "Amour",
      score: synastryReport.scores?.love?.score ?? 0,
      level: synastryReport.scores?.love?.level || ""
    },
    friendship: {
      label: "Amitié",
      score: synastryReport.scores?.friendship?.score ?? 0,
      level: synastryReport.scores?.friendship?.level || ""
    },
    work: {
      label: "Travail",
      score: synastryReport.scores?.work?.score ?? 0,
      level: synastryReport.scores?.work?.level || ""
    },
    global: {
      label: "Compatibilité globale",
      score: synastryReport.scores?.global?.score ?? 0,
      level: synastryReport.scores?.global?.level || ""
    }
  },

  highlights: {
    top_strengths: synastryReport.top_strengths || [],
    top_challenges: synastryReport.top_challenges || [],
    major_aspects: synastryReport.major_aspects || []
  }
};

fs.writeFileSync(interfaceCompatibilityPath, JSON.stringify(interfaceCompatibility, null, 2), "utf8");

console.log("Scores de synastrie synchronises avec l'interface :");
console.log(interfaceCompatibilityPath);
console.log("Amour : " + interfaceCompatibility.scores.love.score + "%");
console.log("Amitie : " + interfaceCompatibility.scores.friendship.score + "%");
console.log("Travail : " + interfaceCompatibility.scores.work.score + "%");
console.log("Global : " + interfaceCompatibility.scores.global.score + "%");