import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TaskList from './TaskList';
import * as api from '../services/api';

jest.mock('../services/api', () => ({
  getTasks: jest.fn(),
  deleteTask: jest.fn(),
}));

const mockTasks = [
  {
    id: 1,
    type: 'one-time',
    cron: null,
    scheduledTime: new Date('2023-06-18T17:30:00Z'),
    executed: false,
  },
  {
    id: 2,
    type: 'recurring',
    cron: '30 17 * * *',
    scheduledTime: null,
    executed: true,
  },
];

describe('TaskList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders TaskList component', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText(/Task Scheduler/i)).toBeInTheDocument();
      expect(screen.getByText(/Type: one-time/i)).toBeInTheDocument();
      expect(screen.getByText(/Type: recurring/i)).toBeInTheDocument();
    });
  });

  test('handles create new task form visibility', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

    render(<TaskList />);

    await waitFor(() => {
      fireEvent.click(screen.getByText(/Create New Task/i));
      expect(screen.getByText(/Create Task/i)).toBeInTheDocument();
    });
  });

  test('handles editing a task', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

    render(<TaskList />);

    await waitFor(() => {
      fireEvent.click(screen.getAllByLabelText(/edit/i)[0]);
      expect(screen.getByText(/Update Task/i)).toBeInTheDocument();
    });
  });

  test('handles deleting a task', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });
    (api.deleteTask as jest.Mock).mockResolvedValue({});

    render(<TaskList />);

    await waitFor(() => {
      fireEvent.click(screen.getAllByLabelText(/delete/i)[0]);
    });

    await waitFor(() => {
      expect(api.deleteTask).toHaveBeenCalledWith(1);
      expect(screen.queryByText(/Type: one-time/i)).not.toBeInTheDocument();
    });
  });

  test('explains cron expressions correctly', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText(/Explanation: Runs at 17:30 every day/i)).toBeInTheDocument();
    });
  });
});
