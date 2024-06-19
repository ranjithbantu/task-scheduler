import request from 'supertest';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import * as taskController from './taskController';
import Task from '../models/task';
import { taskQueue } from '../queues/taskQueue';

jest.mock('../models/task');
jest.mock('../queues/taskQueue');

const app: Application = express();
app.use(bodyParser.json());

app.post('/tasks', taskController.createTask);
app.get('/tasks', taskController.getTasks);
app.put('/tasks/:id', taskController.updateTask);
app.delete('/tasks/:id', taskController.deleteTask);

describe('Task Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a one-time task', async () => {
      (Task.create as jest.Mock).mockResolvedValue({
        id: 1,
        type: 'one-time',
        scheduledTime: new Date().toISOString(),
      });

      const date = new Date().toISOString();

      const response = await request(app)
        .post('/tasks')
        .send({ type: 'one-time', scheduledTime: date });

      expect(response.status).toBe(200);
      expect(Task.create).toHaveBeenCalledWith({
        type: 'one-time',
        cron: undefined,
        scheduledTime: date,
      });
      expect(taskQueue.add).toHaveBeenCalledWith(
        'one-time-1',
        { taskId: 1 },
        { delay: expect.any(Number) },
      );
    });

    it('should create a recurring task', async () => {
      (Task.create as jest.Mock).mockResolvedValue({
        id: 2,
        type: 'recurring',
        cron: '30 17 * * *',
      });

      const response = await request(app)
        .post('/tasks')
        .send({ type: 'recurring', cron: '30 17 * * *' });

      expect(response.status).toBe(200);
      expect(Task.create).toHaveBeenCalledWith({
        type: 'recurring',
        cron: '30 17 * * *',
        scheduledTime: undefined,
      });
      expect(taskQueue.add).toHaveBeenCalledWith(
        'recurring-2',
        { taskId: 2 },
        { repeat: { pattern: '30 17 * * *' } }
      );
    });

    it('should return 400 if cron is missing for recurring task', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ type: 'recurring' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Cron expression is required for recurring tasks');
    });

    it('should return 400 if scheduledTime is missing for one-time task', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ type: 'one-time' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Scheduled time is required for one-time tasks');
    });
  });

  describe('getTasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      (Task.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        type: 'one-time',
        cron: null,
        scheduledTime: new Date(),
        save: jest.fn().mockResolvedValue({}),
      });

      const response = await request(app)
        .put('/tasks/1')
        .send({ type: 'recurring', cron: '30 17 * * *' });

      expect(response.status).toBe(200);
      expect(Task.findByPk).toHaveBeenCalledWith('1');
      expect(taskQueue.remove).toHaveBeenCalled();
      expect(taskQueue.add).toHaveBeenCalled();
    });

    it('should return 404 if task not found', async () => {
      (Task.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/tasks/999')
        .send({ type: 'recurring', cron: '30 17 * * *' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('deleteTask', () => {
    it('should delete an existing task', async () => {
      (Task.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        type: 'one-time',
        destroy: jest.fn().mockResolvedValue({}),
      });

      const response = await request(app).delete('/tasks/1');

      expect(response.status).toBe(204);
      expect(Task.findByPk).toHaveBeenCalledWith('1');
      expect(taskQueue.remove).toHaveBeenCalledWith('one-time-1');
    });

    it('should return 404 if task not found', async () => {
      (Task.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete('/tasks/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });
});
