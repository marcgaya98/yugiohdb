import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'yugioh',
  process.env.DB_USER || 'yugioh',
  process.env.DB_PASS || 'yugioh',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 60000,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

export default sequelize;

export const authenticate = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión con la base de datos establecida.');
    return true;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw error;
  }
};