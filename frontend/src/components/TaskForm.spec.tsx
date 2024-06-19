import React from 'react';
import { render, screen, fireEvent, waitFor, within, getByRole, act } from '@testing-library/react';
import UserEvent from "@testing-library/user-event";
import '@testing-library/jest-dom/extend-expect';
import TaskForm from './TaskForm';
import * as api from '../services/api';

jest.mock('axios');

jest.mock('../services/api', () => ({
  createTask: jest.fn(),
  updateTask: jest.fn(),
}));

const mockOnClose = jest.fn();
const mockOnTaskUpdated = jest.fn();

describe('TaskForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders TaskForm component', () => {
    render(<TaskForm onClose={mockOnClose} />);

    expect(screen.getByLabelText(/Type/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Task/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
  });

  test('renders one-time task form correctly', async () => {
    render(<TaskForm onClose={mockOnClose} />);

    await waitFor(() => UserEvent.click(screen.getByText(/One-time/i)));

    expect(screen.getByLabelText(/Scheduled Time/i)).toBeInTheDocument();
  });

  test('renders recurring task form correctly', async () => {
    render(<TaskForm onClose={mockOnClose} />);

    await act(async () => {
      UserEvent.click(getByRole(screen.getByTestId("task-type"), "combobox"));
    });

    await waitFor(() => UserEvent.click(screen.getByText(/Recurring/i)));

    expect(screen.getByLabelText(/Recurrence/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Time/i)).toBeInTheDocument();
  });

  test('submits one-time task form', async () => {
    (api.createTask as jest.Mock).mockResolvedValue({ data: {} });

    render(<TaskForm onClose={mockOnClose} />);

    fireEvent.mouseDown(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText(/One-time/i));
    fireEvent.change(screen.getByLabelText(/Scheduled Time/i), { target: { value: '2023-06-18T17:30' } });

    fireEvent.click(screen.getByText(/Create Task/i));

    await waitFor(() => {
      expect(api.createTask).toHaveBeenCalledWith({
        type: 'one-time',
        cron: null,
        scheduledTime: '2023-06-18T17:30',
      });
    });
  });

  test('submits recurring task form', async () => {
    (api.createTask as jest.Mock).mockResolvedValue({ data: {} });

    render(<TaskForm onClose={mockOnClose} />);

    await act(async () => {
      UserEvent.click(getByRole(screen.getByTestId("task-type"), "combobox"));
    });

    await waitFor(() => UserEvent.click(screen.getByText(/Recurring/i)));

    await waitFor(() => UserEvent.click(screen.getByText(/Daily/i)));

    fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: '17:30' } });

    fireEvent.click(screen.getByText(/Create Task/i));

    await waitFor(() => {
      expect(api.createTask).toHaveBeenCalledWith({
        type: 'recurring',
        cron: '30 17 * * *',
        scheduledTime: null,
      });
    });
  });

  test('updates existing task', async () => {
    const task = {
      id: 1,
      type: 'one-time',
      cron: null,
      scheduledTime: new Date(),
      executed: false,
    };

    (api.updateTask as jest.Mock).mockResolvedValue({ data: task });

    render(<TaskForm task={task} onClose={mockOnClose} onTaskUpdated={mockOnTaskUpdated} />);

    fireEvent.change(screen.getByLabelText(/Scheduled Time/i), { target: { value: '2023-06-18T18:00' } });

    fireEvent.click(screen.getByText(/Update Task/i));

    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledWith(task.id, {
        type: 'one-time',
        cron: null,
        scheduledTime: '2023-06-18T18:00',
      });
    });
  });
});
