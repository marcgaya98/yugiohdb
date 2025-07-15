import fs from 'fs';
import path from 'path';
import { Sequelize, Op } from 'sequelize';
import Card from '../models/Card.js'; // Ajusta el path según tu estructura

// Configuración de Sequelize (ajusta según tu proyecto)
const sequelize = new Sequelize(process.env.DB_URI || 'mysql://user:pass@localhost:3306/yugioh', {
    logging: false
});

/**
 * Revisa si los materiales de fusión existen en la base de datos.
 * Busca por name y, si falla, por alter_name.
 */
const checkFusionMaterials = async () => {
    // Carga el JSON de materiales de fusión
    const fusionsPath = path.resolve('data/fusions_materials.json');
    const fusions = JSON.parse(fs.readFileSync(fusionsPath, 'utf8'));

    const notFound = [];

    for (const fusion of fusions) {
        for (const material of fusion.materials) {
            // Busca por name o alter_name (case-insensitive)
            const card = await Card.findOne({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: material } },
                        { alter_name: { [Op.like]: material } }
                    ]
                }
            });
            if (!card) {
                notFound.push({ fusion: fusion.name, material });
            }
        }
    }

    // Muestra los materiales no encontrados
    if (notFound.length) {
        console.log('Materiales no encontrados:');
        notFound.forEach(({ fusion, material }) => {
            console.log(`Fusion: ${fusion} | Material: ${material}`);
        });
        // Opcional: guardar en un archivo
        fs.writeFileSync('data/fusion_materials_not_found.json', JSON.stringify(notFound, null, 2));
    } else {
        console.log('Todos los materiales fueron encontrados en la base de datos.');
    }

    await sequelize.close();
};

checkFusionMaterials().catch(err => {
    console.error('Error al revisar materiales:', err);
    sequelize.close();
});
