const tasks = [
    { id: 1, type: 'one-time', cron: null, scheduledTime: new Date(), executed: false },
    { id: 2, type: 'recurring', cron: '30 17 * * *', scheduledTime: null, executed: true },
  ];
  
  export default {
    create: jest.fn().mockImplementation((task) => Promise.resolve({ ...task, id: Date.now() })),
    findAll: jest.fn().mockResolvedValue(tasks),
    findByPk: jest.fn().mockImplementation((id) => {
      const task = tasks.find((task) => task.id === parseInt(id));
      if (task) {
        return Promise.resolve({
          ...task,
          save: jest.fn().mockResolvedValue(task),
        });
      }
      return Promise.resolve(null);
    }),
    destroy: jest.fn().mockResolvedValue({}),
  };
  