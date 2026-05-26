import fs from "fs";

const personAPath = "workspace/projects/ASTRO_PREMIUM/04_TECHNIQUE/exemple_sortie_schema_astro.json";
const personBPath = "workspace/projects/ASTRO_PREMIUM/04_TECHNIQUE/exemple_sortie_schema_astro_partner.json";

const outputJsonPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/compatibilite_personne_a_b.json";
const outputMdPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/rapport_compatibilite_personne_a_b.md";

const personA = JSON.parse(fs.readFileSync(personAPath, "utf8"));
const personB = JSON.parse(fs.readFileSync(personBPath, "utf8"));

const signs = {
  Aries: { fr: "Bélier", element: "Feu", mode: "Cardinal" },
  Taurus: { fr: "Taureau", element: "Terre", mode: "Fixe" },
  Gemini: { fr: "Gémeaux", element: "Air", mode: "Mutable" },
  Cancer: { fr: "Cancer", element: "Eau", mode: "Cardinal" },
  Leo: { fr: "Lion", element: "Feu", mode: "Fixe" },
  Virgo: { fr: "Vierge", element: "Terre", mode: "Mutable" },
  Libra: { fr: "Balance", element: "Air", mode: "Cardinal" },
  Scorpio: { fr: "Scorpion", element: "Eau", mode: "Fixe" },
  Sagittarius: { fr: "Sagittaire", element: "Feu", mode: "Mutable" },
  Capricorn: { fr: "Capricorne", element: "Terre", mode: "Cardinal" },
  Aquarius: { fr: "Verseau", element: "Air", mode: "Fixe" },
  Pisces: { fr: "Poissons", element: "Eau", mode: "Mutable" }
};

const elementAffinity = {
  Feu: { Feu: 18, Air: 16, Terre: 8, Eau: 6 },
  Air: { Air: 18, Feu: 16, Eau: 9, Terre: 7 },
  Terre: { Terre: 18, Eau: 16, Feu: 8, Air: 7 },
  Eau: { Eau: 18, Terre: 16, Air: 9, Feu: 6 }
};

const modeAffinity = {
  Cardinal: { Cardinal: 8, Fixe: 6, Mutable: 7 },
  Fixe: { Fixe: 8, Cardinal: 6, Mutable: 7 },
  Mutable: { Mutable: 8, Cardinal: 7, Fixe: 7 }
};

function getWestern(data) {
  return data.western_astrology || {};
}

function getClientName(data, fallback) {
  return data.client?.first_name || fallback;
}

function getBody(data, key) {
  const western = getWestern(data);
  return western[key] || {};
}

function getSign(data, key) {
  return getBody(data, key).sign || "";
}

function signFr(sign) {
  return signs[sign]?.fr || sign || "Non renseigné";
}

function elementOf(sign) {
  return signs[sign]?.element || "Inconnu";
}

function modeOf(sign) {
  return signs[sign]?.mode || "Inconnu";
}

function compareElements(signA, signB) {
  const elementA = elementOf(signA);
  const elementB = elementOf(signB);

  if (!elementAffinity[elementA] || elementAffinity[elementA][elementB] === undefined) {
    return 8;
  }

  return elementAffinity[elementA][elementB];
}

function compareModes(signA, signB) {
  const modeA = modeOf(signA);
  const modeB = modeOf(signB);

  if (!modeAffinity[modeA] || modeAffinity[modeA][modeB] === undefined) {
    return 5;
  }

  return modeAffinity[modeA][modeB];
}

function comparePair(dataA, keyA, dataB, keyB, weight) {
  const signA = getSign(dataA, keyA);
  const signB = getSign(dataB, keyB);

  const elementScore = compareElements(signA, signB);
  const modeScore = compareModes(signA, signB);
  const rawScore = elementScore + modeScore;

  return {
    keyA,
    keyB,
    signA,
    signB,
    signA_fr: signFr(signA),
    signB_fr: signFr(signB),
    elementA: elementOf(signA),
    elementB: elementOf(signB),
    modeA: modeOf(signA),
    modeB: modeOf(signB),
    rawScore,
    weight,
    weightedScore: rawScore * weight
  };
}

function normalizeScore(points, maxPoints) {
  const score = Math.round((points / maxPoints) * 100);
  return Math.max(0, Math.min(100, score));
}

function scoreLabel(score) {
  if (score >= 85) return "Exceptionnelle";
  if (score >= 75) return "Très forte";
  if (score >= 65) return "Bonne";
  if (score >= 50) return "Équilibrée";
  return "À travailler";
}

function buildCompatibility() {
  const lovePairs = [
    comparePair(personA, "sun", personB, "moon", 1.2),
    comparePair(personA, "moon", personB, "moon", 1.3),
    comparePair(personA, "venus", personB, "mars", 1.4),
    comparePair(personA, "mars", personB, "venus", 1.4),
    comparePair(personA, "ascendant", personB, "sun", 1.0)
  ];

  const friendshipPairs = [
    comparePair(personA, "sun", personB, "sun", 1.2),
    comparePair(personA, "moon", personB, "moon", 1.2),
    comparePair(personA, "mercury", personB, "mercury", 1.2),
    comparePair(personA, "venus", personB, "venus", 1.0),
    comparePair(personA, "ascendant", personB, "ascendant", 1.0)
  ];

  const workPairs = [
    comparePair(personA, "sun", personB, "saturn", 1.1),
    comparePair(personA, "saturn", personB, "sun", 1.1),
    comparePair(personA, "mercury", personB, "mercury", 1.3),
    comparePair(personA, "mars", personB, "mars", 1.1),
    comparePair(personA, "jupiter", personB, "saturn", 1.0)
  ];

  function sumPairs(pairs) {
    return pairs.reduce((total, pair) => total + pair.weightedScore, 0);
  }

  function maxPairs(pairs) {
    return pairs.reduce((total, pair) => total + 26 * pair.weight, 0);
  }

  const loveScore = normalizeScore(sumPairs(lovePairs), maxPairs(lovePairs));
  const friendshipScore = normalizeScore(sumPairs(friendshipPairs), maxPairs(friendshipPairs));
  const workScore = normalizeScore(sumPairs(workPairs), maxPairs(workPairs));

  const globalScore = Math.round((loveScore * 0.45) + (friendshipScore * 0.3) + (workScore * 0.25));

  return {
    metadata: {
      project: "ASTRO_PREMIUM",
      version: "1.0",
      type: "compatibility_report",
      note: "Première version de compatibilité basée sur signes, éléments et modes. La vraie synastrie par aspects précis sera ajoutée ensuite."
    },
    people: {
      person_a: {
        name: getClientName(personA, "Personne A"),
        sun: signFr(getSign(personA, "sun")),
        moon: signFr(getSign(personA, "moon")),
        ascendant: signFr(getSign(personA, "ascendant")),
        venus: signFr(getSign(personA, "venus")),
        mars: signFr(getSign(personA, "mars"))
      },
      person_b: {
        name: getClientName(personB, "Personne B"),
        sun: signFr(getSign(personB, "sun")),
        moon: signFr(getSign(personB, "moon")),
        ascendant: signFr(getSign(personB, "ascendant")),
        venus: signFr(getSign(personB, "venus")),
        mars: signFr(getSign(personB, "mars"))
      }
    },
    scores: {
      love: {
        label: "Amour",
        score: loveScore,
        level: scoreLabel(loveScore)
      },
      friendship: {
        label: "Amitié",
        score: friendshipScore,
        level: scoreLabel(friendshipScore)
      },
      work: {
        label: "Travail",
        score: workScore,
        level: scoreLabel(workScore)
      },
      global: {
        label: "Compatibilité globale",
        score: globalScore,
        level: scoreLabel(globalScore)
      }
    },
    details: {
      love_pairs: lovePairs,
      friendship_pairs: friendshipPairs,
      work_pairs: workPairs
    },
    synthesis: buildSynthesis(loveScore, friendshipScore, workScore)
  };
}

function buildSynthesis(loveScore, friendshipScore, workScore) {
  const strengths = [];
  const tensions = [];
  const recommendations = [];

  if (loveScore >= 70) {
    strengths.push("La dynamique affective montre une bonne résonance émotionnelle et relationnelle.");
  } else {
    tensions.push("La dynamique affective demande davantage d’écoute et d’ajustement.");
  }

  if (friendshipScore >= 70) {
    strengths.push("La complicité naturelle peut être forte, avec une bonne capacité à se comprendre.");
  } else {
    tensions.push("La complicité peut nécessiter du temps, de la pédagogie et des efforts de communication.");
  }

  if (workScore >= 70) {
    strengths.push("La collaboration peut être constructive, avec une complémentarité utile dans les projets.");
  } else {
    tensions.push("La collaboration peut demander une clarification des rôles, des priorités et du rythme de chacun.");
  }

  recommendations.push("Utiliser cette première lecture comme un indicateur général, puis affiner avec une vraie synastrie par aspects.");
  recommendations.push("Ajouter ensuite les aspects exacts entre les deux cartes : Soleil-Lune, Vénus-Mars, Lune-Lune, Ascendant-planètes.");
  recommendations.push("Transformer les scores en explications premium lisibles par le client final.");

  return {
    strengths,
    tensions,
    recommendations
  };
}

function markdownReport(report) {
  return `# Rapport de compatibilité astrologique

## Personnes comparées

### ${report.people.person_a.name}

- Soleil : ${report.people.person_a.sun}
- Lune : ${report.people.person_a.moon}
- Ascendant : ${report.people.person_a.ascendant}
- Vénus : ${report.people.person_a.venus}
- Mars : ${report.people.person_a.mars}

### ${report.people.person_b.name}

- Soleil : ${report.people.person_b.sun}
- Lune : ${report.people.person_b.moon}
- Ascendant : ${report.people.person_b.ascendant}
- Vénus : ${report.people.person_b.venus}
- Mars : ${report.people.person_b.mars}

---

## Scores principaux

| Domaine | Score | Niveau |
|---|---:|---|
| Amour | ${report.scores.love.score}% | ${report.scores.love.level} |
| Amitié | ${report.scores.friendship.score}% | ${report.scores.friendship.level} |
| Travail | ${report.scores.work.score}% | ${report.scores.work.level} |
| Global | ${report.scores.global.score}% | ${report.scores.global.level} |

---

## Points forts

${report.synthesis.strengths.map((item) => "- " + item).join("\n")}

## Points de vigilance

${report.synthesis.tensions.map((item) => "- " + item).join("\n")}

## Prochaines améliorations techniques

${report.synthesis.recommendations.map((item) => "- " + item).join("\n")}

---

## Note technique

Cette version est une première base de scoring.
Elle utilise les signes, éléments et modes.
La prochaine version devra intégrer les aspects précis entre les deux thèmes pour produire une vraie synastrie premium.
`;
}

const compatibilityReport = buildCompatibility();

fs.writeFileSync(outputJsonPath, JSON.stringify(compatibilityReport, null, 2), "utf8");
fs.writeFileSync(outputMdPath, markdownReport(compatibilityReport), "utf8");

console.log("Rapport de compatibilite genere avec succes :");
console.log(outputJsonPath);
console.log(outputMdPath);