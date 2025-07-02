import sequelize from '../config/database.js';
import CardPackObtention from '../models/CardPackObtention.js';
import CardConverterObtention from '../models/CardConverterObtention.js';
import CardCharacterObtention from '../models/CardCharacterObtention.js';
import CardTutorialObtention from '../models/CardTutorialObtention.js';
import CardInitialDeck from '../models/CardInitialDeck.js';
import CardSandwichObtention from '../models/CardSandwichObtention.js';

/**
 * Script para crear las tablas de los modelos de obtención específicos
 */
async function createObtentionTables() {
    try {
        console.log('Iniciando creación de tablas de obtención específicas...');

        // Autenticación con la base de datos
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');

        // Crear las tablas si no existen
        await CardPackObtention.sync({ force: false });
        console.log('Tabla card_pack_obtention sincronizada.');

        await CardConverterObtention.sync({ force: false });
        console.log('Tabla card_converter_obtention sincronizada.');

        await CardCharacterObtention.sync({ force: false });
        console.log('Tabla card_character_obtention sincronizada.');

        await CardTutorialObtention.sync({ force: false });
        console.log('Tabla card_tutorial_obtention sincronizada.');

        await CardInitialDeck.sync({ force: false });
        console.log('Tabla card_initial_deck sincronizada.');

        await CardSandwichObtention.sync({ force: false });
        console.log('Tabla card_sandwich_obtention sincronizada.');

        console.log('¡Tablas creadas correctamente!');
    } catch (error) {
        console.error('Ocurrió un error durante la creación de las tablas:', error);
    } finally {
        // Cerrar la conexión a la base de datos
        await sequelize.close();
        console.log('Conexión a la base de datos cerrada.');
    }
}

// Ejecutar la función
createObtentionTables();
