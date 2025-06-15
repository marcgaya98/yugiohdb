import sequelize from '../config/database.js';
import '../models/Card.js';
import '../models/MonsterCard.js';
import '../models/SpellCard.js';
import '../models/TrapCard.js';
import '../models/CardPack.js';
import '../models/associations.js';


// Nombres de las tablas que NO quieres eliminar
const tablasAConservar = ['genres', 'pack', 'sandwiches'];

async function vaciarYSincronizar() {
    // Sincronizar modelos (esto solo crea las tablas de los modelos definidos)
    await sequelize.sync();
    console.log('Modelos sincronizados.');
}

vaciarYSincronizar()
    .then(() => {
        console.log('Base de datos reseteada (excepto tablas conservadas).');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });