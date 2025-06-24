// Script para importar duelistas desde duelist.json a la base de datos
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import Character from '../models/Character.js';

// Configuración de rutas para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constantes
const DUELIST_FILE = path.join(__dirname, 'data', 'duelist.json');
const RESULTS_FILE = path.join(__dirname, 'data', 'characters_import_results.json');

// Función principal
async function importDuelists() {
    try {
        console.log('Iniciando importación de duelistas desde duelist.json...');

        // Sincronizar el modelo de Character con la base de datos
        console.log('Verificando si la tabla Character ya existe...');
        try {
            // Primero intentar una operación de consulta ligera para ver si la tabla existe
            await Character.findOne();
            console.log('La tabla Character ya existe, no es necesario crearla');
        } catch (err) {
            // Si la tabla no existe, crearla
            console.log('Creando tabla Character...');
            await Character.sync({ force: false });
            console.log('Tabla Character creada correctamente');
        }

        // Leer el archivo JSON
        const duelistData = JSON.parse(fs.readFileSync(DUELIST_FILE, 'utf8'));

        // Objeto para almacenar los resultados
        const results = {
            created: [],
            existing: [],
            errors: []
        };

        // Para cada tier en el archivo
        for (const [tier, characters] of Object.entries(duelistData)) {
            console.log(`\nProcesando tier: ${tier} (${characters.length} personajes)`);

            // Para cada personaje en el tier
            for (const character of characters) {
                try {
                    // Verificar si el personaje ya existe
                    const existingCharacter = await Character.findOne({
                        where: { name: character.name }
                    });

                    if (existingCharacter) {
                        console.log(`Personaje ya existe: ${character.name}`);
                        results.existing.push({
                            name: character.name,
                            tier: tier,
                            id: existingCharacter.id
                        });
                        continue;
                    }

                    // Crear el personaje en la base de datos sin imagen
                    const newCharacter = await Character.create({
                        name: character.name,
                        tier: tier,
                        category: null, // Se llenará más tarde si es necesario
                        image: null     // No incluimos imagen por ahora
                    });

                    console.log(`Creado: ${character.name} (${tier}) - ID: ${newCharacter.id}`);
                    results.created.push({
                        name: character.name,
                        tier: tier,
                        id: newCharacter.id
                    });
                } catch (error) {
                    console.error(`Error procesando el personaje ${character.name}:`, error);
                    results.errors.push({
                        name: character.name,
                        tier: tier,
                        error: error.message
                    });
                }
            }
        }

        // Guardar los resultados
        fs.writeFileSync(
            RESULTS_FILE,
            JSON.stringify(results, null, 2),
            'utf8'
        );

        // Mostrar estadísticas
        console.log('\n=== ESTADÍSTICAS DE IMPORTACIÓN ===');
        console.log(`Personajes creados: ${results.created.length}`);
        console.log(`Personajes ya existentes: ${results.existing.length}`);
        console.log(`Errores: ${results.errors.length}`);
        console.log(`Total procesados: ${results.created.length + results.existing.length + results.errors.length}`);
        console.log(`\nResultados guardados en: ${RESULTS_FILE}`);

    } catch (error) {
        console.error('Error general durante la importación de duelistas:', error);
    } finally {
        // Cerrar la conexión a la base de datos
        await sequelize.close();
    }
}

// Las URLs de imágenes de yugipedia se añadirán más adelante si es necesario
// Eliminada la función extractImageFromUrl por ahora

// Ejecutar la función principal
importDuelists().catch(err => {
    console.error('Error fatal durante la importación:', err);
    process.exit(1);
});
