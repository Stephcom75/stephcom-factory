import { getSunPosition, getMoonPosition, getAllPositions } from 'celestine';

console.log('=== TEST THEME NATAL SIMPLE ===');

const birth = {
  year: 1990,
  month: 1,
  day: 1,
  hour: 12,
  minute: 0,
  second: 0
};

console.log('Données naissance test :');
console.log(birth);

console.log('Soleil :');
console.log(getSunPosition(birth));

console.log('Lune :');
console.log(getMoonPosition(birth));

console.log('Toutes positions :');
console.log(getAllPositions(birth));
