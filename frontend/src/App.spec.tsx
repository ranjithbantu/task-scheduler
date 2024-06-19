import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './App';
import * as api from './services/api';

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

jest.mock('./services/api', () => ({
  getTasks: jest.fn(),
  deleteTask: jest.fn(),
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders TaskList component within App', async () => {
    (api.getTasks as jest.Mock).mockResolvedValue({ data: mockTasks });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Task Scheduler/i)).toBeInTheDocument();
      expect(screen.getByText(/Type: one-time/i)).toBeInTheDocument();
      expect(screen.getByText(/Type: recurring/i)).toBeInTheDocument();
    });
  });
});
