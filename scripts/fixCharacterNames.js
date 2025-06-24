import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nameMapping = {
    "Blair Flannigan": "Blair", // Blair Flannigan existe como Blair
    "Para": "Paradox Brothers Para", // Para existe como Paradox Brothers Para
    "Dox": "Paradox Brothers Dox", // Dox existe como Paradox Brothers Dox
    "Ms. Dorothy": "Dorothy", // Ms. Dorothy existe como Dorothy
    "Pierre the Gambler": "The Gambler", // Pierre the Gambler existe como The Gambler
    "Rock (character)": "Rock", // Rock (character) existe como Rock
    "Rie Yamatani": "Rie", // Rie Yamatani existe como Rie
    "Maki Kirioka": "Maki", // Maki Kirioka existe como Maki
    "Yumi Yoshizawa": "Yumi", // Yumi Yoshizawa existe como Yumi
    "Kaiser Umiuma": "Emperor.Umiuma", // Kaiser Umiuma existe como Emperor.Umiuma
    "Shironosu": "Sironos" // Shironosu existe como Sironos
};

async function updateAllDecksJson() {
    try {
        // Rutas de archivos
        const ALL_DECKS_FILE = path.join(__dirname, '..', 'all_decks_transformed.json');
        const ALL_DECKS_BACKUP = path.join(__dirname, '..', 'all_decks_transformed_backup.json');

        // Hacer una copia de seguridad
        fs.copyFileSync(ALL_DECKS_FILE, ALL_DECKS_BACKUP);
        console.log(`Copia de seguridad creada: ${ALL_DECKS_BACKUP}`);

        // Leer el archivo
        const decksData = JSON.parse(fs.readFileSync(ALL_DECKS_FILE, 'utf8'));

        // Contar nombres cambiados
        let changedNames = 0;

        // Iterar sobre cada personaje y actualizar los nombres
        for (let characterData of decksData) {
            if (nameMapping[characterData.name]) {
                console.log(`Cambiando nombre: ${characterData.name} -> ${nameMapping[characterData.name]}`);
                characterData.name = nameMapping[characterData.name];
                changedNames++;
            }
        }

        // Guardar el archivo actualizado
        fs.writeFileSync(ALL_DECKS_FILE, JSON.stringify(decksData, null, 2), 'utf8');

        console.log(`\nActualización completada: ${changedNames} nombres de personajes actualizados.`);
    } catch (error) {
        console.error('Error durante la actualización de nombres de personajes:', error);
    }
}

// Ejecutar la función
updateAllDecksJson().catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
});
