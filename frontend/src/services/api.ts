import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

export const createTask = (task: any) => api.post('/tasks', task);
export const getTasks = () => api.get('/tasks');
export const updateTask = (id: number, task: any) => api.put(`/tasks/${id}`, task);
export const deleteTask = (id: number) => api.delete(`/tasks/${id}`);