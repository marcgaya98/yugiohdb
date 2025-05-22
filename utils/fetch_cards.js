// Script para descargar información de cartas desde la API de YGOPRODeck y guardarla en un archivo JSON

const fs = require('fs');
const https = require('https');

const cardNames = [
  "Exodia the Forbidden One",
  "Mirror Force",
  "Exodia Necross",
  "Right Leg of the Forbidden One",
  "Left Leg of the Forbidden One",
  "Right Arm of the Forbidden One",
  "Left Arm of the Forbidden One",
  "Fiber Jar",
  "Yata-Garasu",
  "Mirage of Nightmare",
  "Chaos Emperor Dragon - Envoy of the End",
  "Raigeki",
  "Sinister Serpent",
  "Witch of the Black Forest",
  "Harpie's Feather Duster",
  "Change of Heart",
  "Delinquent Duo",
  "The Forceful Sentry",
  "Painful Choice",
  "Imperial Order",
  "Ring of Destruction",
  "Makyura the Destructor",
  "Magical Scientist",
  "Butterfly Dagger - Elma",
  "Black Luster Soldier - Envoy of the Beginning",
  "Sixth Sense",
  "Larvae Moth",
  "Great Moth",
  "Perfectly Ultimate Great Moth",
  "Cocoon of Evolution",
  "Petit Moth",
  "Labyrinth Wall",
  "Wall Shadow",
  "Sanga of the Thunder",
  "Kazejin",
  "Suijin",
  "Gate Guardian",
  "Zoa",
  "Metalzoa",
  "Gale Dogra",
  "Magical Labyrinth",
  "Metalmorph",
  "Red-Eyes Black Metal Dragon",
  "Call of the Grave",
  "Anti Raigeki",
  "Call of the Dark",
  "Gryphon Wing",
  "Contract with Exodia",
  "Primal Seed"
];

const baseUrl = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?name=';
const param = cardNames.map(encodeURIComponent).join('|');
const url = baseUrl + param;

https.get(url, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      fs.writeFileSync('cards.json', JSON.stringify(json.data || [], null, 2));
      console.log('Información guardada en cards.json');
    } catch (err) {
      console.error('Error al parsear o guardar:', err);
    }
  });
}).on('error', err => {
  console.error('Error en la petición:', err);
});