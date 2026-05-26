import { calculateChart } from "celestine";

console.log("=== INSPECTION STRUCTURE CELESTINE ===");

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

console.log("Clés principales du résultat :");
console.log(Object.keys(chart));

console.log("\nAperçu complet limité :");
console.log(JSON.stringify(chart, null, 2).slice(0, 6000));