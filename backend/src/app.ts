import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createTask, getTasks, updateTask, deleteTask } from './controllers/taskController';
import { connectDB } from './models';

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};

const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.post('/tasks', createTask);
app.get('/tasks', getTasks);
app.put('/tasks/:id', updateTask);
app.delete('/tasks/:id', deleteTask);

connectDB();

export default app;