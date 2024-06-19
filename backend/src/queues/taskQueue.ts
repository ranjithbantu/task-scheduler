import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import Task from '../models/task';
import { executeTask } from '../services/taskService';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const taskQueue = new Queue('tasks', { connection });

const taskWorker = new Worker(
  'tasks',
  async (job) => {
    const task = await Task.findByPk(job.data.taskId);
    if (task) {
      await executeTask(task);
    }
  },
  { connection }
);

export { taskQueue, taskWorker };
