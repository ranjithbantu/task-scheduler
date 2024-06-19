import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import { createTask, updateTask } from '../services/api';
import {
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Box,
} from '@mui/material';

type Task = {
  id: number;
  type: string;
  cron: string | null;
  scheduledTime: Date | null;
  executed: boolean;
};

type Props = {
  task?: Task;
  onClose: () => void;
  onTaskUpdated?: (updatedTask: Task) => void;
  onTaskCreated?: (createdTask: Task) => void;
};

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);

const toLocalISOString = (date: Date, timezone: string) => {
  return moment(date).tz(timezone).format('YYYY-MM-DDTHH:mm');
};

const timezone = process.env.REACT_APP_TIMEZONE || 'UTC';

const parseCron = (cron: string) => {
  const [minute, hour, dayOfMonth, , dayOfWeek] = cron.split(' ');
  return {
    hour,
    minute,
    dayOfMonth,
    dayOfWeek,
  };
};

const TaskForm: React.FC<Props> = ({ task, onClose, onTaskUpdated, onTaskCreated }) => {
  const [type, setType] = useState(task ? task.type : 'one-time');
  const [recurrence, setRecurrence] = useState('daily');
  const [time, setTime] = useState(
    task && task.scheduledTime
      ? new Date(task.scheduledTime).toLocaleTimeString('it-IT')
      : '17:30'
  );
  const [weekday, setWeekday] = useState(0);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [scheduledTime, setScheduledTime] = useState(
    task && task.scheduledTime
      ? toLocalISOString(new Date(task.scheduledTime), timezone)
      : ''
  );

  useEffect(() => {
    if (task) {
      setType(task.type);
      setScheduledTime(
        task.scheduledTime ? toLocalISOString(new Date(task.scheduledTime), timezone) : ''
      );
      setTime(
        task.scheduledTime
          ? new Date(task.scheduledTime).toLocaleTimeString('it-IT')
          : '17:30'
      );
      if (task.cron) {
        const { hour, minute, dayOfMonth, dayOfWeek } = parseCron(task.cron);
        setTime(`${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`);
        if (dayOfMonth !== '*') {
          setDayOfMonth(parseInt(dayOfMonth));
          setRecurrence('monthly');
        } else if (dayOfWeek !== '*') {
          setWeekday(parseInt(dayOfWeek));
          setRecurrence('weekly');
        } else {
          setRecurrence('daily');
        }
      }
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let cron = null;
    const [hour, minute] = time.split(':');
    if (type === 'recurring') {
      switch (recurrence) {
        case 'daily':
          cron = `${minute} ${hour} * * *`;
          break;
        case 'weekly':
          cron = `${minute} ${hour} * * ${weekday}`;
          break;
        case 'monthly':
          cron = `${minute} ${hour} ${dayOfMonth} * *`;
          break;
        default:
          cron = `${minute} ${hour} * * *`;
      }
    }

    const taskData = {
      type,
      cron,
      scheduledTime: type === 'one-time' ? scheduledTime : null,
    };

    if (task) {
      const updatedTask = await updateTask(task.id, taskData);
      if (onTaskUpdated) {
        onTaskUpdated(updatedTask.data);
      }
    } else {
      const createdTask = await createTask(taskData);
      if (onTaskCreated) {
        onTaskCreated(createdTask.data);
      }
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth>
        <InputLabel id="task-type">Type</InputLabel>
        <Select
          data-testid="task-type"
          labelId="task-type"
          value={type}
          onChange={(e) => setType(e.target.value as string)}
        >
          <MenuItem value="one-time">One-time</MenuItem>
          <MenuItem value="recurring">Recurring</MenuItem>
        </Select>
      </FormControl>
      {type === 'recurring' && (
        <>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box mt={2}>
                <FormControl fullWidth>
                  <InputLabel id='recurrence-type'>Recurrence</InputLabel>
                  <Select
                    data-testid="recurrence-type"
                    labelId="recurrence-type"
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as string)}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="time"
                label="Time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>
          </Grid>
          {recurrence === 'weekly' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Weekday</InputLabel>
              <Select
                value={weekday}
                onChange={(e) => setWeekday(e.target.value as number)}
              >
                {daysOfWeek.map((day, index) => (
                  <MenuItem key={index} value={index}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {recurrence === 'monthly' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Day of Month</InputLabel>
              <Select
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value as number)}
              >
                {daysOfMonth.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </>
      )}
      {type === 'one-time' && (
        <TextField
          fullWidth
          type="datetime-local"
          label="Scheduled Time"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          margin="normal"
        />
      )}
      <Button type="submit" variant="contained" color="primary">
        {task ? 'Update Task' : 'Create Task'}
      </Button>
      <Button variant="outlined" color="secondary" onClick={onClose}>
        Cancel
      </Button>
    </form>
  );
};

export default TaskForm;
