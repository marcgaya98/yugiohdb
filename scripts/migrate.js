#!/bin/node

import sequelize from '../config/database.js';
import Pack from '../models/Pack.js';
import Genre from '../models/Genre.js';
// Importa otros modelos que necesites

async function migrate() {
  try {
    console.log('Iniciando migración de la base de datos...');

    // Sincroniza todos los modelos
    await Promise.all([
      Pack.sync({ alter: true }),
      Genre.sync({ alter: true }),
      // Añade aquí otros modelos
    ]);

    console.log('Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  }
}

migrate();
