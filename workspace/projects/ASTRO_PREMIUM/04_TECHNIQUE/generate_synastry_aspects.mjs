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
  { type: "conjunction", label_fr: "Conjonction", angle: 0, orb: 8, symbol: "☌", polarity: "intense" },
  { type: "sextile", label_fr: "Sextile", angle: 60, orb: 5, symbol: "⚹", polarity: "positive" },
  { type: "square", label_fr: "Carré", angle: 90, orb: 6, symbol: "□", polarity: "challenge" },
  { type: "trine", label_fr: "Trigone", angle: 120, orb: 7, symbol: "△", polarity: "positive" },
  { type: "opposition", label_fr: "Opposition", angle: 180, orb: 8, symbol: "☍", polarity: "challenge" }
];

const relationshipWeights = {
  sun_moon: 1.35,
  moon_sun: 1.35,
  moon_moon: 1.4,
  venus_mars: 1.45,
  mars_venus: 1.45,
  venus_venus: 1.2,
  mars_mars: 1.05,
  mercury_mercury: 1.15,
  ascendant_sun: 1.2,
  sun_ascendant: 1.2,
  ascendant_moon: 1.15,
  moon_ascendant: 1.15,
  ascendant_venus: 1.2,
  venus_ascendant: 1.2,
  ascendant_mars: 1.1,
  mars_ascendant: 1.1,
  saturn_sun: 1.1,
  sun_saturn: 1.1,
  saturn_moon: 1.15,
  moon_saturn: 1.15,
  saturn_venus: 1.15,
  venus_saturn: 1.15
};

function getWestern(data) {
  return data.western_astrology || {};
}

function getClientName(data, fallback) {
  if (data.client && data.client.first_name) {
    return data.client.first_name;
  }
  return fallback;
}

function getBody(data, key) {
  const western = getWestern(data);
  return western[key] || null;
}

function normalizeAngle(angle) {
  let n = angle % 360;
  if (n < 0) n += 360;
  return n;
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

  return normalizeAngle(signOrder[body.sign] * 30 + degree + minute / 60 + second / 3600);
}

function angularDistance(a, b) {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, 360 - diff);
}

function detectAspect(distance) {
  for (const aspect of aspectTypes) {
    const deviation = Math.abs(distance - aspect.angle);
    if (deviation <= aspect.orb) {
      return {
        type: aspect.type,
        label_fr: aspect.label_fr,
        angle: aspect.angle,
        orb: aspect.orb,
        symbol: aspect.symbol,
        polarity: aspect.polarity,
        deviation: deviation
      };
    }
  }
  return null;
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

  if (aspect.polarity === "positive") return "harmonique";
  if (aspect.polarity === "challenge") return "tension constructive";
  return "intense";
}

function aspectStrength(aspect, bodyA, bodyB) {
  const pairKey = String(bodyA.key) + "_" + String(bodyB.key);
  const pairWeight = relationshipWeights[pairKey] || 1;
  const priorityBonus = ((bodyA.priority || 1) + (bodyB.priority || 1)) * 3;
  const orbQuality = Math.max(0, 1 - aspect.deviation / aspect.orb);
  const exactnessBonus = Math.round(orbQuality * 28);
  const raw = 32 + priorityBonus + exactnessBonus;
  return Math.min(92, Math.round(raw * pairWeight));
}

function domainImpact(aspect, bodyA, bodyB) {
  const pairKey = String(bodyA.key) + "_" + String(bodyB.key);

  let love = 0;
  let friendship = 0;
  let work = 0;

  let multiplier = 1;
  if (aspect.polarity === "challenge") multiplier = 0.42;
  if (aspect.polarity === "intense") multiplier = 0.68;

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
    love += 9 * multiplier;
  }

  if (
    pairKey === "sun_sun" ||
    pairKey === "moon_moon" ||
    pairKey === "mercury_mercury" ||
    pairKey === "venus_venus"
  ) {
    friendship += 8 * multiplier;
  }

  if (
    pairKey === "mercury_mercury" ||
    pairKey === "sun_saturn" ||
    pairKey === "saturn_sun" ||
    pairKey === "mars_mars"
  ) {
    work += 7 * multiplier;
  }

  if (aspect.polarity === "positive") {
    love += 1.8;
    friendship += 1.8;
    work += 1.3;
  }

  if (aspect.polarity === "challenge") {
    love -= 2.8;
    friendship -= 2.2;
    work -= 2;
  }

  if (aspect.polarity === "intense") {
    love += 0.8;
    friendship += 0.4;
  }

  return { love: love, friendship: friendship, work: work };
}

function calculateAspects() {
  const results = [];

  for (const bodyA of bodies) {
    const sourceA = getBody(personA, bodyA.key);
    const lonA = bodyLongitude(sourceA);

    if (lonA === null) continue;

    for (const bodyB of bodies) {
      const sourceB = getBody(personB, bodyB.key);
      const lonB = bodyLongitude(sourceB);

      if (lonB === null) continue;

      const distance = angularDistance(lonA, lonB);
      const aspect = detectAspect(distance);

      if (!aspect) continue;

      const strength = aspectStrength(aspect, bodyA, bodyB);
      const category = aspectCategory(aspect, bodyA, bodyB);
      const impact = domainImpact(aspect, bodyA, bodyB);

      results.push({
        person_a_body: bodyA.key,
        person_a_label: bodyA.label,
        person_a_sign: sourceA.sign || "",
        person_a_sign_fr: signNamesFr[sourceA.sign] || sourceA.sign || "",
        person_a_position: sourceA.formatted || "",
        person_b_body: bodyB.key,
        person_b_label: bodyB.label,
        person_b_sign: sourceB.sign || "",
        person_b_sign_fr: signNamesFr[sourceB.sign] || sourceB.sign || "",
        person_b_position: sourceB.formatted || "",
        aspect_type: aspect.type,
        aspect_label_fr: aspect.label_fr,
        aspect_symbol: aspect.symbol,
        exact_angle: Number(distance.toFixed(3)),
        target_angle: aspect.angle,
        orb: Number(aspect.deviation.toFixed(3)),
        max_orb: aspect.orb,
        polarity: aspect.polarity,
        category: category,
        strength: strength,
        domain_impact: impact
      });
    }
  }

  return results.sort(function (a, b) {
    return b.strength - a.strength;
  });
}

function normalizeScore(value) {
  return Math.round(Math.max(0, Math.min(100, value)));
}

function scoreLabel(score) {
  if (score >= 85) return "Exceptionnelle";
  if (score >= 75) return "Très forte";
  if (score >= 65) return "Bonne";
  if (score >= 50) return "Équilibrée";
  return "À travailler";
}

function applyDiminishingReturns(value) {
  if (value <= 0) return value;
  return Math.sqrt(value) * 6.5;
}

function buildScores(aspects) {
  let lovePositive = 0;
  let loveChallenge = 0;
  let friendshipPositive = 0;
  let friendshipChallenge = 0;
  let workPositive = 0;
  let workChallenge = 0;

  for (const aspect of aspects) {
    const factor = aspect.strength / 100;

    const loveImpact = aspect.domain_impact.love * factor;
    const friendshipImpact = aspect.domain_impact.friendship * factor;
    const workImpact = aspect.domain_impact.work * factor;

    if (loveImpact >= 0) lovePositive += loveImpact;
    else loveChallenge += Math.abs(loveImpact);

    if (friendshipImpact >= 0) friendshipPositive += friendshipImpact;
    else friendshipChallenge += Math.abs(friendshipImpact);

    if (workImpact >= 0) workPositive += workImpact;
    else workChallenge += Math.abs(workImpact);
  }

  let love = 52 + applyDiminishingReturns(lovePositive) - applyDiminishingReturns(loveChallenge) * 0.75;
  let friendship = 52 + applyDiminishingReturns(friendshipPositive) - applyDiminishingReturns(friendshipChallenge) * 0.75;
  let work = 52 + applyDiminishingReturns(workPositive) - applyDiminishingReturns(workChallenge) * 0.75;

  love = normalizeScore(love);
  friendship = normalizeScore(friendship);
  work = normalizeScore(work);

  const global = normalizeScore(love * 0.45 + friendship * 0.3 + work * 0.25);

  return {
    love: { label: "Amour", score: love, level: scoreLabel(love) },
    friendship: { label: "Amitié", score: friendship, level: scoreLabel(friendship) },
    work: { label: "Travail", score: work, level: scoreLabel(work) },
    global: { label: "Compatibilité globale", score: global, level: scoreLabel(global) }
  };
}

function splitAspects(aspects) {
  const strengths = aspects.filter(function (a) {
    return a.polarity === "positive" || a.category === "magnétique";
  });

  const challenges = aspects.filter(function (a) {
    return a.polarity === "challenge" || a.category === "karmique / structurant";
  });

  return {
    top_strengths: strengths.slice(0, 7),
    top_challenges: challenges.slice(0, 7),
    major_aspects: aspects.slice(0, 12)
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
  const strengthLines = report.top_strengths.length
    ? report.top_strengths.map(aspectLine).join("\n")
    : "- Aucun aspect harmonique majeur détecté.";

  const challengeLines = report.top_challenges.length
    ? report.top_challenges.map(aspectLine).join("\n")
    : "- Aucun aspect de tension majeur détecté.";

  const majorLines = report.major_aspects.length
    ? report.major_aspects.map(aspectLine).join("\n")
    : "- Aucun aspect majeur détecté.";

  return [
    "# Rapport technique de synastrie",
    "",
    "## Personnes comparées",
    "",
    "- Personne A : " + report.people.person_a.name,
    "- Personne B : " + report.people.person_b.name,
    "",
    "---",
    "",
    "## Scores recalculés avec aspects exacts",
    "",
    "| Domaine | Score | Niveau |",
    "|---|---:|---|",
    "| Amour | " + report.scores.love.score + "% | " + report.scores.love.level + " |",
    "| Amitié | " + report.scores.friendship.score + "% | " + report.scores.friendship.level + " |",
    "| Travail | " + report.scores.work.score + "% | " + report.scores.work.level + " |",
    "| Global | " + report.scores.global.score + "% | " + report.scores.global.level + " |",
    "",
    "---",
    "",
    "## Aspects forts / harmonieux",
    "",
    strengthLines,
    "",
    "---",
    "",
    "## Aspects de tension / structuration",
    "",
    challengeLines,
    "",
    "---",
    "",
    "## Aspects majeurs détectés",
    "",
    majorLines,
    "",
    "---",
    "",
    "## Note produit",
    "",
    "Ce fichier est une base technique. La prochaine étape consiste à utiliser ces aspects exacts pour générer une interprétation premium avec Mistral, puis à connecter ces nouveaux scores au bloc visuel de compatibilité.",
    ""
  ].join("\n");
}

const aspects = calculateAspects();
const scores = buildScores(aspects);
const split = splitAspects(aspects);

const report = {
  metadata: {
    project: "ASTRO_PREMIUM",
    version: "1.1",
    type: "synastry_aspects",
    note: "Calcul des aspects exacts entre deux thèmes avec scoring calibré."
  },
  people: {
    person_a: { name: getClientName(personA, "Personne A") },
    person_b: { name: getClientName(personB, "Personne B") }
  },
  scores: scores,
  counts: {
    total_aspects: aspects.length,
    strengths: split.top_strengths.length,
    challenges: split.top_challenges.length
  },
  aspects: aspects,
  top_strengths: split.top_strengths,
  top_challenges: split.top_challenges,
  major_aspects: split.major_aspects
};

fs.writeFileSync(outputJsonPath, JSON.stringify(report, null, 2), "utf8");
fs.writeFileSync(outputMdPath, markdownReport(report), "utf8");

console.log("Synastrie calibree generee avec succes :");
console.log(outputJsonPath);
console.log(outputMdPath);
console.log("Nombre d'aspects detectes : " + aspects.length);
console.log("Score amour : " + scores.love.score + "%");
console.log("Score amitie : " + scores.friendship.score + "%");
console.log("Score travail : " + scores.work.score + "%");
console.log("Score global : " + scores.global.score + "%");