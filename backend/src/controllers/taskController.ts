import { Request, Response } from 'express';
import Task from '../models/task';
import { taskQueue } from '../queues/taskQueue';

export const createTask = async (req: Request, res: Response) => {
  const { type, cron, scheduledTime } = req.body;

  if (type === 'recurring' && !cron) {
    return res
      .status(400)
      .json({ error: 'Cron expression is required for recurring tasks' });
  }

  if (type === 'one-time' && !scheduledTime) {
    return res
      .status(400)
      .json({ error: 'Scheduled time is required for one-time tasks' });
  }

  const task = await Task.create({ type, cron, scheduledTime });

  if (type === 'one-time') {
    await taskQueue.add(
      `one-time-${task.id}`,
      { taskId: task.id },
      { delay: new Date(scheduledTime).getTime() - Date.now() }
    );
  } else if (type === 'recurring') {
    await taskQueue.add(
      `recurring-${task.id}`,
      { taskId: task.id },
      { repeat: { pattern: cron } }
    );
  }

  res.json(task);
};

export const getTasks = async (req: Request, res: Response) => {
  const tasks = await Task.findAll();
  res.json(tasks);
};

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type, cron, scheduledTime } = req.body;

  const task = await Task.findByPk(id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (task.type === 'one-time') {
    await taskQueue.remove(`one-time-${task.id}`);
  } else if (task.type === 'recurring') {
    await taskQueue.remove(`recurring-${task.id}`);
  }

  task.type = type;
  task.cron = cron;
  task.scheduledTime = scheduledTime;
  await task.save();

  if (type === 'one-time') {
    await taskQueue.add(
      `one-time-${task.id}`,
      { taskId: task.id },
      { delay: new Date(scheduledTime).getTime() - Date.now() }
    );
  } else if (type === 'recurring') {
    await taskQueue.add(
      `recurring-${task.id}`,
      { taskId: task.id },
      { repeat: { pattern: cron } }
    );
  }

  res.json(task);
};

export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;

  const task = await Task.findByPk(id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (task.type === 'one-time') {
    await taskQueue.remove(`one-time-${task.id}`);
  } else if (task.type === 'recurring') {
    await taskQueue.remove(`recurring-${task.id}`);
  }

  await task.destroy();

  res.status(204).send();
};
