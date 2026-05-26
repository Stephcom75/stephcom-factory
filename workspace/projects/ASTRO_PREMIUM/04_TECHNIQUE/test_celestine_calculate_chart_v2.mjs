import { calculateChart } from "celestine";

console.log("=== TEST CALCULATE CHART FORMAT 2 ===");

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

console.log("Données envoyées :");
console.log(JSON.stringify(birthData, null, 2));

const chart = calculateChart(birthData);

console.log("Résultat brut :");
console.log(JSON.stringify(chart, null, 2));