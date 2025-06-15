import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Pack = sequelize.define('Pack', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  unlock_methods: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  card_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  total_cards: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description_extra: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cover_card: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'pack',
  timestamps: false,
});

export default Pack;