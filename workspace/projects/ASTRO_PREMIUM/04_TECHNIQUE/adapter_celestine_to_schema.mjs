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

const birthData = {
  year: 1990,
  month: 1,
  day: 1,
  hour: 12,
  minute: 0,
  second: 0,
  latitude: 48.8566,
  longitude: 2.3522,
  timezone: 1
};

const chart = calculateChart(birthData);

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
    purpose: "Données astrologiques structurées pour génération du rapport Astro Premium."
  },

  client: {
    first_name: "Test",
    email: "",
    main_intention: "connaissance de soi",
    language: "fr"
  },

  birth_data: {
    birth_date: birthDate,
    birth_time: birthTime,
    birth_city: "Paris",
    birth_country: "France",
    timezone: birthData.timezone,
    latitude: birthData.latitude,
    longitude: birthData.longitude,
    birth_time_quality: "exact"
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