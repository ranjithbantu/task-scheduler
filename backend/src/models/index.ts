import { Sequelize } from 'sequelize';

const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/task_scheduler';

export const sequelize = new Sequelize(dbUrl);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
