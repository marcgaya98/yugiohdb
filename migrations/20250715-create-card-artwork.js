import { DataTypes } from 'sequelize';

/**
 * Migration para crear la tabla card_artwork para variantes de arte alternativo.
 */
export async function up(queryInterface) {
    await queryInterface.createTable('card_artwork', {
        cardId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            comment: 'ID de la carta base (card.id)'
        },
        imageUrl: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'URL de la imagen del arte alternativo'
        },
        group: {
            type: DataTypes.ENUM('A', 'B', 'C', 'D'),
            allowNull: true,
            comment: 'Grupo de lotería Tag Force (A, B, C, D) si aplica'
        }
    });
    await queryInterface.addIndex('card_artwork', ['cardId']);
    await queryInterface.addIndex('card_artwork', ['group']);
}

export async function down(queryInterface) {
    await queryInterface.dropTable('card_artwork');
}
