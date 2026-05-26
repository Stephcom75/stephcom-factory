import fs from "fs";
import { calculateChart } from "celestine";

function findPlanet(chart, name) {
  return chart.planets.find(
    (planet) => planet.name && planet.name.toLowerCase() === name.toLowerCase()
  );
}

function mapPlanet(planet) {
  if (!planet) {
    return {
      sign: "",
      degree: null,
      minute: null,
      second: null,
      house: null,
      formatted: "",
      isRetrograde: null
    };
  }

  return {
    sign: planet.signName || "",
    degree: planet.degree ?? null,
    minute: planet.minute ?? null,
    second: planet.second ?? null,
    house: planet.house ?? null,
    formatted: planet.formatted || "",
    isRetrograde: planet.isRetrograde ?? null
  };
}

function mapAngle(angle) {
  if (!angle) {
    return {
      sign: "",
      degree: null,
      minute: null,
      second: null,
      formatted: ""
    };
  }

  return {
    sign: angle.signName || "",
    degree: angle.degree ?? null,
    minute: angle.minute ?? null,
    second: angle.second ?? null,
    formatted: angle.formatted || ""
  };
}

const inputPath = "workspace/projects/ASTRO_PREMIUM/03_INPUTS/birth_input_partner.json";
const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const birthData = input.birth_data;
const clientData = input.client || {};

const chart = calculateChart({
  year: birthData.year,
  month: birthData.month,
  day: birthData.day,
  hour: birthData.hour,
  minute: birthData.minute,
  second: birthData.second || 0,
  latitude: birthData.latitude,
  longitude: birthData.longitude,
  timezone: birthData.timezone
});

const birthDate =
  birthData.year +
  "-" +
  String(birthData.month).padStart(2, "0") +
  "-" +
  String(birthData.day).padStart(2, "0");

const birthTime =
  String(birthData.hour).padStart(2, "0") +
  ":" +
  String(birthData.minute).padStart(2, "0");

const astroSchema = {
  metadata: {
    project: "ASTRO_PREMIUM",
    version: "1.0",
    source_engine: "celestine",
    purpose: "DonnÃ©es astrologiques structurÃ©es pour gÃ©nÃ©ration du rapport Astro Premium."
  },

  client: {
    first_name: clientData.first_name || "Test",
    email: clientData.email || "",
    main_intention: clientData.main_intention || "connaissance de soi",
    language: clientData.language || "fr"
  },

  birth_data: {
    birth_date: birthDate,
    birth_time: birthTime,
    birth_city: birthData.birth_city || "",
    birth_country: birthData.birth_country || "",
    timezone: birthData.timezone,
    latitude: birthData.latitude,
    longitude: birthData.longitude,
    birth_time_quality: birthData.birth_time_quality || "exact"
  },

  western_astrology: {
    sun: mapPlanet(findPlanet(chart, "Sun")),
    moon: mapPlanet(findPlanet(chart, "Moon")),
    mercury: mapPlanet(findPlanet(chart, "Mercury")),
    venus: mapPlanet(findPlanet(chart, "Venus")),
    mars: mapPlanet(findPlanet(chart, "Mars")),
    jupiter: mapPlanet(findPlanet(chart, "Jupiter")),
    saturn: mapPlanet(findPlanet(chart, "Saturn")),
    uranus: mapPlanet(findPlanet(chart, "Uranus")),
    neptune: mapPlanet(findPlanet(chart, "Neptune")),
    pluto: mapPlanet(findPlanet(chart, "Pluto")),

    ascendant: mapAngle(chart.angles?.ascendant),
    midheaven: mapAngle(chart.angles?.midheaven),

    houses: chart.houses || [],
    major_aspects: chart.aspects || [],

    dominants: {
      dominant_element: "",
      dominant_mode: "",
      dominant_planets: [],
      dominant_signs: []
    }
  },

  additional_systems: {
    chinese_astrology: {
      animal: "",
      element: "",
      polarity: "",
      interpretation_hint: ""
    },
    numerology: {
      life_path_number: null,
      interpretation_hint: ""
    }
  },

  report_generation: {
    target_product: "theme_astral_premium_pdf",
    report_length: "12-18 pages",
    tone: ["premium", "clair", "profond", "non fataliste", "accessible"]
  }
};

console.log(JSON.stringify(astroSchema, null, 2));
