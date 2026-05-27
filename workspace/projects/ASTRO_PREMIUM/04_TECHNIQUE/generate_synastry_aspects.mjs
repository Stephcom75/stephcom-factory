import fs from "fs";

const personAPath = "workspace/projects/ASTRO_PREMIUM/04_TECHNIQUE/exemple_sortie_schema_astro.json";
const personBPath = "workspace/projects/ASTRO_PREMIUM/04_TECHNIQUE/exemple_sortie_schema_astro_partner.json";

const outputJsonPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/synastry_aspects_personne_a_b.json";
const outputMdPath = "workspace/projects/ASTRO_PREMIUM/08_SORTIES/rapport_synastry_aspects_personne_a_b.md";

const personA = JSON.parse(fs.readFileSync(personAPath, "utf8"));
const personB = JSON.parse(fs.readFileSync(personBPath, "utf8"));

const signOrder = {
  Aries: 0,
  Taurus: 1,
  Gemini: 2,
  Cancer: 3,
  Leo: 4,
  Virgo: 5,
  Libra: 6,
  Scorpio: 7,
  Sagittarius: 8,
  Capricorn: 9,
  Aquarius: 10,
  Pisces: 11
};

const signNamesFr = {
  Aries: "Bélier",
  Taurus: "Taureau",
  Gemini: "Gémeaux",
  Cancer: "Cancer",
  Leo: "Lion",
  Virgo: "Vierge",
  Libra: "Balance",
  Scorpio: "Scorpion",
  Sagittarius: "Sagittaire",
  Capricorn: "Capricorne",
  Aquarius: "Verseau",
  Pisces: "Poissons"
};

const bodies = [
  { key: "sun", label: "Soleil", priority: 5 },
  { key: "moon", label: "Lune", priority: 5 },
  { key: "mercury", label: "Mercure", priority: 3 },
  { key: "venus", label: "Vénus", priority: 5 },
  { key: "mars", label: "Mars", priority: 5 },
  { key: "jupiter", label: "Jupiter", priority: 3 },
  { key: "saturn", label: "Saturne", priority: 4 },
  { key: "uranus", label: "Uranus", priority: 2 },
  { key: "neptune", label: "Neptune", priority: 2 },
  { key: "pluto", label: "Pluton", priority: 2 },
  { key: "ascendant", label: "Ascendant", priority: 5 },
  { key: "midheaven", label: "Milieu du Ciel", priority: 3 }
];

const aspectTypes = [
  {
    type: "conjunction",
    label_fr: "Conjonction",
    angle: 0,
    orb: 8,
    symbol: "☌",
    nature: "fusion",
    polarity: "intense"
  },
  {
    type: "sextile",
    label_fr: "Sextile",
    angle: 60,
    orb: 5,
    symbol: "⚹",
    nature: "harmonique",
    polarity: "positive"
  },
  {
    type: "square",
    label_fr: "Carré",
    angle: 90,
    orb: 6,
    symbol: "□",
    nature: "tension",
    polarity: "challenge"
  },
  {
    type: "trine",
    label_fr: "Trigone",
    angle: 120,
    orb: 7,
    symbol: "△",
    nature: "harmonique",
    polarity: "positive"
  },
  {
    type: "opposition",
    label_fr: "Opposition",
    angle: 180,
    orb: 8,
    symbol: "☍",
    nature: "polarité",
    polarity: "challenge"
  }
];

const relationshipWeights = {
  sun_moon: 1.45,
  moon_sun: 1.45,
  moon_moon: 1.55,
  venus_mars: 1.6,
  mars_venus: 1.6,
  venus_venus: 1.25,
  mars_mars: 1.15,
  mercury_mercury: 1.2,
  ascendant_sun: 1.35,
  sun_ascendant: 1.35,
  ascendant_moon: 1.25,
  moon_ascendant: 1.25,
  ascendant_venus: 1.3,
  venus_ascendant: 1.3,
  ascendant_mars: 1.2,
  mars_ascendant: 1.2,
  saturn_sun: 1.15,
  sun_saturn: 1.15,
  saturn_moon: 1.2,
  moon_saturn: 1.2,
  saturn_venus: 1.2,
  venus_saturn: 1.2,
  jupiter_sun: 1.1,
  sun_jupiter: 1.1,
  jupiter_moon: 1.05,
  moon_jupiter: 1.05
};

function getWestern(data) {
  return data.western_astrology || {};
}

function getClientName(data, fallback) {
  return data.client?.first_name || fallback;
}

function safe(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function getBody(data, bodyKey) {
  const western = getWestern(data);
  return western[bodyKey] || null;
}

function bodyLongitude(body) {
  if (!body) return null;

  if (typeof body.longitude === "number" && Number.isFinite(body.longitude)) {
    return normalizeAngle(body.longitude);
  }

  if (!body.sign || signOrder[body.sign] === undefined) {
    return null;
  }

  const degree = Number(body.degree || 0);
  const minute = Number(body.minute || 0);
  const second = Number(body.second || 0);

  return normalizeAngle(
    signOrder[body.sign] * 30 +
    degree +
    minute / 60 +
    second / 3600
  );
}

function normalizeAngle(angle) {
  let normalized = angle % 360;

  if (normalized < 0) {
    normalized += 360;
  }

  return normalized;
}

function angularDistance(angleA, angleB) {
  const diff = Math.abs(normalizeAngle(angleA) - normalizeAngle(angleB));
  return Math.min(diff, 360 - diff);
}

function detectAspect(distance) {
  for (const aspect of aspectTypes) {
    const deviation = Math.abs(distance - aspect.angle);

    if (deviation <= aspect.orb) {
      return {
        ...aspect,
        deviation
      };
    }
  }

  return null;
}

function aspectStrength(aspect, bodyA, bodyB) {
  const priorityA = bodyA.priority || 1;
  const priorityB = bodyB.priority || 1;
  const pairKey = String(bodyA.key) + "_" + String(bodyB.key);
  const pairWeight = relationshipWeights[pairKey] || 1;
  const orbQuality = Math.max(0, 1 - aspect.deviation / aspect.orb);

  const base = 40;
  const priorityBonus = (priorityA + priorityB) * 4;
  const exactnessBonus = Math.round(orbQuality * 40);
  const weighted = Math.round((base + priorityBonus + exactnessBonus) * pairWeight);

  return Math.min(100, weighted);
}

function aspectCategory(aspect, bodyA, bodyB) {
  const pairKey = String(bodyA.key) + "_" + String(bodyB.key);

  if (
    pairKey === "venus_mars" ||
    pairKey === "mars_venus" ||
    pairKey === "ascendant_venus" ||
    pairKey === "venus_ascendant" ||
    pairKey === "ascendant_mars" ||
    pairKey === "mars_ascendant"
  ) {
    return "magnétique";
  }

  if (
    pairKey === "saturn_sun" ||
    pairKey === "sun_saturn" ||
    pairKey === "saturn_moon" ||
    pairKey === "moon_saturn" ||
    pairKey === "saturn_venus" ||
    pairKey === "venus_saturn"
  ) {
    return "karmique / structurant";
  }

  if (aspect.polarity === "positive") {
    return "harmonique";
  }

  if (aspect.polarity === "challenge") {
    return "tension constructive";
  }

  return "intense";
}

function impactForDomain(aspect, bodyA, bodyB) {
  const pairKey = String(bodyA.key) + "_" + String(bodyB.key);

  let love = 0;
  let friendship = 0;
  let work = 0;

  const positiveMultiplier =
    aspect.polarity === "positive" ? 1 :
    aspect.polarity === "intense" ? 0.75 :
    0.45;

  const challengeMultiplier =
    aspect.polarity === "challenge" ? 0.65 :
    aspect.polarity === "intense" ? 0.75 :
    1;

  if (
    pairKey === "venus_mars" ||
    pairKey === "mars_venus" ||
    pairKey === "sun_moon" ||
    pairKey === "moon_sun" ||
    pairKey === "moon_moon" ||
    pairKey === "venus_venus" ||
    pairKey === "ascendant_venus" ||
    pairKey === "venus_ascendant"
  ) {
    love += 18 * positiveMultiplier * challengeMultiplier;
  }

  if (
    pairKey === "sun_sun" ||
    pairKey === "moon_moon" ||
    pairKey === "mercury_mercury" ||
    pairKey === "venus_venus" ||
    pairKey === "jupiter_moon" ||
    pairKey === "moon_jupiter"
  ) {
    friendship += 16 * positiveMultiplier * challengeMultiplier;
  }

  if (
    pairKey === "mercury_mercury" ||
    pairKey === "sun_saturn" ||
    pairKey === "saturn_sun" ||
    pairKey === "mars_mars" ||
    pairKey === "jupiter_saturn" ||
    pairKey === "saturn_jupiter" ||
    pairKey === "sun_jupiter" ||
    pairKey === "jupiter_sun"
  ) {
    work += 15 * positiveMultiplier * challengeMultiplier;
  }

  if (aspect.polarity === "positive") {
    love += 4;
    friendship += 4;
    work += 3;
  }

  if (aspect.polarity === "challenge") {
    love -= 2;
    friendship -= 1;
    work -= 1;
  }

  return {
    love,
    friendship,
    work
  };
}

function calculateSynastryAspects() {
  const aspects = [];

  for (const bodyA of bodies) {
    const sourceBodyA = getBody(personA, bodyA.key);
    const longitudeA = bodyLongitude(sourceBodyA);

    if (longitudeA === null) {
      continue;
    }

    for (const bodyB of bodies) {
      const sourceBodyB = getBody(personB, bodyB.key);
      const longitudeB = bodyLongitude(sourceBodyB);

      if (longitudeB === null) {
        continue;
      }

      const distance = angularDistance(longitudeA, longitudeB);
      const aspect = detectAspect(distance);

      if (!aspect) {
        continue;
      }

      const strength = aspectStrength(aspect, bodyA, bodyB);
      const category = aspectCategory(aspect, bodyA, bodyB);
      const domainImpact = impactForDomain(aspect, bodyA, bodyB);

      aspects.push({
        person_a_body: bodyA.key,
        person_a_label: bodyA.label,
        person_a_sign: sourceBodyA?.sign || "",
        person_a_sign_fr: signNamesFr[sourceBodyA?.sign] || sourceBodyA?.sign || "",
        person_a_position: sourceBodyA?.formatted || "",
        person_b_body: bodyB.key,
        person_b_label: bodyB.label,
        person_b_sign: sourceBodyB?.sign || "",
        person_b_sign_fr: signNamesFr[sourceBodyB?.sign] || sourceBodyB?.sign || "",
        person_b_position: sourceBodyB?.formatted || "",
        aspect_type: aspect.type,
        aspect_label_fr: aspect.label_fr,
        aspect_symbol: aspect.symbol,
        exact_angle: Number(distance.toFixed(3)),
        target_angle: aspect.angle,
        orb: Number(aspect.deviation.toFixed(3)),
        max_orb: aspect.orb,
        nature: aspect.nature,
        polarity: aspect.polarity,
        category,
        strength,
        domain_impact: domainImpact
      });
    }
  }

  return aspects.sort((a, b) => b.strength - a.strength);
}

function scoreLabel(score) {
  if (score >= 85) return "Exceptionnelle";
  if (score >= 75) return "Très forte";
  if (score >= 65) return "Bonne";
  if (score >= 50) return "Équilibrée";
  return "À travailler";
}

function normalizeScore(value) {
  const score = Math.round(Math.max(0, Math.min(100, value)));
  return score;
}

function buildScores(aspects) {
  let love = 45;
  let friendship = 45;
  let work = 45;

  for (const aspect of aspects) {
    const strengthFactor = aspect.strength / 100;

    love += aspect.domain_impact.love * strengthFactor;
    friendship += aspect.domain_impact.friendship * strengthFactor;
    work += aspect.domain_impact.work * strengthFactor;
  }

  love = normalizeScore(love);
  friendship = normalizeScore(friendship);
  work = normalizeScore(work);

  const global = normalizeScore(love * 0.45 + friendship * 0.3 + work * 0.25);

  return {
    love: {
      label: "Amour",
      score: love,
      level: scoreLabel(love)
    },
    friendship: {
      label: "Amitié",
      score: friendship,
      level: scoreLabel(friendship)
    },
    work: {
      label: "Travail",
      score: work,
      level: scoreLabel(work)
    },
    global: {
      label: "Compatibilité globale",
      score: global,
      level: scoreLabel(global)
    }
  };
}

function splitAspects(aspects) {
  const strengths = aspects.filter((aspect) => {
    return aspect.polarity === "positive" || aspect.category === "magnétique";
  });

  const challenges = aspects.filter((aspect) => {
    return aspect.polarity === "challenge" || aspect.category === "karmique / structurant";
  });

  return {
    top_strengths: strengths.slice(0, 7),
    top_challenges: challenges.slice(0, 7),
    major_aspects: aspects.slice(0, 12)
  };
}

function buildReport(aspects, scores) {
  const split = splitAspects(aspects);

  return {
    metadata: {
      project: "ASTRO_PREMIUM",
      version: "1.0",
      type: "synastry_aspects",
      note: "Calcul des aspects exacts entre deux thèmes. Base technique du futur moteur de compatibilité premium."
    },
    people: {
      person_a: {
        name: getClientName(personA, "Personne A")
      },
      person_b: {
        name: getClientName(personB, "Personne B")
      }
    },
    scores,
    counts: {
      total_aspects: aspects.length,
      strengths: split.top_strengths.length,
      challenges: split.top_challenges.length
    },
    aspects,
    top_strengths: split.top_strengths,
    top_challenges: split.top_challenges,
    major_aspects: split.major_aspects
  };
}

function aspectLine(aspect) {
  return "- " +
    aspect.person_a_label +
    " A " +
    aspect.aspect_symbol +
    " " +
    aspect.person_b_label +
    " B — " +
    aspect.aspect_label_fr +
    ", orbe " +
    aspect.orb +
    "°, force " +
    aspect.strength +
    "/100, catégorie : " +
    aspect.category;
}

function markdownReport(report) {
  const strengthsText =
    report.top_strengths.length > 0
      ? report.top_strengths.map(aspectLine).join("\n")
      : "- Aucun aspect harmonique majeur détecté dans cette première sélection.";

  const challengesText =
    report.top_challenges.length > 0
      ? report.top_challenges.map(aspectLine).join("\n")
      : "- Aucun aspect de tension majeur détecté dans cette première sélection.";

  const majorText =
    report.major_aspects.length > 0
      ? report.major_aspects.map(aspectLine).join("\n")
      : "- Aucun aspect majeur détecté.";

  return `# Rapport technique de synastrie

## Personnes comparées

- Personne A : ${report.people.person_a.name}
- Personne B : ${report.people.person_b.name}

---

## Scores recalculés avec aspects exacts

| Domaine | Score | Niveau |
|---|---:|---|
| Amour | ${report.scores.love.score}% | ${report.scores.love.level} |
| Amitié | ${report.scores.friendship.score}% | ${report.scores.friendship.level} |
| Travail | ${report.scores.work.score}% | ${report.scores.work.level} |
| Global | ${report.scores.global.score}% | ${report.scores.global.level} |

---

## Aspects forts / harmonieux

${strengthsText}

---

## Aspects de tension / structuration

${challengesText}

---

## Aspects majeurs détectés

${majorText}

---

## Note produit

Ce fichier est une base technique.
La prochaine étape consiste à utiliser ces aspects exacts pour générer une interprétation premium avec Mistral, puis à connecter ces nouveaux scores au bloc visuel de compatibilité.
`;
}

const aspects = calculateSynastryAspects();
const scores = buildScores(aspects);
const report = buildReport(aspects, scores);

fs.writeFileSync(outputJsonPath, JSON.stringify(report, null, 2), "utf8");
fs.writeFileSync(outputMdPath, markdownReport(report), "utf8");

console.log("Synastrie generee avec succes :");
console.log(outputJsonPath);
console.log(outputMdPath);
console.log("Nombre d'aspects detectes :", aspects.length);
console.log("Score amour :", scores.love.score + "%");
console.log("Score amitie :", scores.friendship.score + "%");
console.log("Score travail :", scores.work.score + "%");
console.log("Score global :", scores.global.score + "%");