import Task from '../models/task';

export const executeTask = async (task: Task) => {
  task.executed = true;
  await task.save();
  console.log(`Executed task ${task.id} at ${new Date().toISOString()}`);
};
