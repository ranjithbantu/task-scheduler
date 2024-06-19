process.env.TZ = 'UTC';

import 'jest-extended';

const originalError = console.error;
console.error = (...args: any[]) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};
