/**
 * Migration: create mentioned_card table
 * Relaciona una carta con otra carta mencionada en su descripción.
 */

export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('mentioned_card', {
        cardId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: { model: 'card', key: 'id' },
            onDelete: 'CASCADE',
            comment: 'ID de la carta que menciona a otra'
        },
        mentionedCardId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: { model: 'card', key: 'id' },
            onDelete: 'CASCADE',
            comment: 'ID de la carta mencionada'
        }
    });
    await queryInterface.addIndex('mentioned_card', ['cardId']);
    await queryInterface.addIndex('mentioned_card', ['mentionedCardId']);
    await queryInterface.addIndex('mentioned_card', ['cardId', 'mentionedCardId'], { unique: true });
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mentioned_card');
}
