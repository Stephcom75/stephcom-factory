import { calculateChart } from "celestine";

console.log("=== INSPECTION PARTIES UTILES CELESTINE ===");

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

console.log("\n=== PLANETS ===");
console.log(JSON.stringify(chart.planets, null, 2).slice(0, 4000));

console.log("\n=== ANGLES ===");
console.log(JSON.stringify(chart.angles, null, 2).slice(0, 3000));

console.log("\n=== HOUSES ===");
console.log(JSON.stringify(chart.houses, null, 2).slice(0, 3000));

console.log("\n=== ASPECTS ===");
console.log(JSON.stringify(chart.aspects, null, 2).slice(0, 4000));

console.log("\n=== SUMMARY ===");
console.log(JSON.stringify(chart.summary, null, 2).slice(0, 3000));