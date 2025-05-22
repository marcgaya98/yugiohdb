import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Card = sequelize.define('Card', {
  name: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  image_url: { type: DataTypes.STRING, allowNull: false },
  rarity_id: { type: DataTypes.INTEGER, allowNull: false },
  limit_id: { type: DataTypes.INTEGER },
  pack_id: { type: DataTypes.INTEGER, allowNull: false },
  frame_id: { type: DataTypes.INTEGER, allowNull: false },
  genre_id: { type: DataTypes.INTEGER },
  archetype: { type: DataTypes.STRING }
}, {
  tableName: 'card',
  timestamps: false,
});

export default Card;
