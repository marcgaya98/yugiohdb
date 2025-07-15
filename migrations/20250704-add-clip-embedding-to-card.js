'use strict';

export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('card', 'clip_embedding', {
        type: Sequelize.TEXT('long'), // Para embeddings CLIP más grandes
        allowNull: true,
        comment: 'CLIP embedding for visual-semantic search (text to image matching)'
    });

    // Nota: Los índices en columnas TEXT en MySQL requieren longitud específica
    // Para consultas de embedding usaremos búsquedas lineales optimizadas
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('card', 'clip_embedding');
}
