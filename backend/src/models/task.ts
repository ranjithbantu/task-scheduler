import { Model, DataTypes } from 'sequelize';
import { sequelize } from './index';

class Task extends Model {
  public id!: number;
  public type!: string;
  public cron!: string;
  public scheduledTime!: Date;
  public executed!: boolean;
}

Task.init(
  {
    type: { type: DataTypes.STRING, allowNull: false },
    cron: { type: DataTypes.STRING, allowNull: true },
    scheduledTime: { type: DataTypes.DATE, allowNull: true },
    executed: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, modelName: 'task' }
);

export default Task;
