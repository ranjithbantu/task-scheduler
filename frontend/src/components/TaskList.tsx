import React, { useEffect, useState } from 'react';
import { getTasks, deleteTask } from '../services/api';
import TaskForm from './TaskForm';
import {
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Container,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

type Task = {
  id: number;
  type: string;
  cron: string | null;
  scheduledTime: Date | null;
  executed: boolean;
};

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    (async () => {
      const response = await getTasks();
      setTasks(response.data);
    })();
  }, []);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowCreateForm(false);
  };

  const handleDelete = async (id: number) => {
    await deleteTask(id);
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setEditingTask(null);
  };

  const handleTaskCreated = (createdTask: Task) => {
    setTasks([...tasks, createdTask]);
    setShowCreateForm(false);
  };

  const explainCron = (cron: string) => {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = cron.split(' ');
    let explanation = '';

    if (dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') {
      explanation = `Runs at ${hour}:${minute} on day ${dayOfMonth} of every month.`;
    } else if (dayOfWeek !== '*' && dayOfMonth === '*' && month === '*') {
      const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      explanation = `Runs at ${hour}:${minute} every ${
        days[parseInt(dayOfWeek)]
      }.`;
    } else if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      explanation = `Runs at ${hour}:${minute} every day.`;
    } else {
      explanation = `Cron expression: ${cron}`;
    }

    return explanation;
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" margin={2} gutterBottom>
        Task Scheduler
      </Typography>
      <Box my={3}>
        {showCreateForm && (
          <TaskForm onClose={() => setShowCreateForm(false)} onTaskCreated={handleTaskCreated} />
        )}
        {editingTask && (
          <TaskForm
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onTaskUpdated={handleTaskUpdated}
          />
        )}
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowCreateForm(true)}
      >
        Create New Task
      </Button>
      <List>
        {tasks.map((task) => (
          <ListItem key={task.id}>
            <ListItemText
              primary={`Type: ${task.type}`}
              secondary={
                <>
                  {task.type === 'recurring' && task.cron && (
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        Cron Expression: {task.cron}
                      </Typography>
                      <br />
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        Explanation: {explainCron(task.cron)}
                      </Typography>
                      <br />
                    </>
                  )}
                  {task.type === 'one-time' && task.scheduledTime && (
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        Scheduled Time:{' '}
                        {new Date(task.scheduledTime).toLocaleString()}
                      </Typography>
                      <br />
                    </>
                  )}
                  <Typography
                    component="span"
                    variant="body2"
                    color="textPrimary"
                  >
                    Executed: {task.executed ? 'Yes' : 'No'}
                  </Typography>
                </>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleEdit(task)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDelete(task.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default TaskList;
