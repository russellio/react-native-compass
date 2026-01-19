// Jest setup file for React Native Testing Library
// This file is executed before each test file

// Mock console.warn to reduce noise in tests but show errors
const originalWarn = console.warn;
console.warn = (...args) => {
  // Filter out specific warnings if needed
  if (args[0]?.includes?.('Animated')) return;
  if (args[0]?.includes?.('react-test-renderer is deprecated')) return;
  originalWarn.apply(console, args);
};

// Capture uncaught errors more explicitly
const originalError = console.error;
console.error = (...args) => {
  // Print the full error if it's an error object
  args.forEach(arg => {
    if (arg instanceof Error) {
      originalError.call(console, 'Caught Error:', arg.message, arg.stack);
    }
  });
  originalError.apply(console, args);
};
