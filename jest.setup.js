// Jest setup file for React Native Testing Library
// This file is executed before each test file

// Mock console.warn to reduce noise in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  // Filter out specific warnings if needed
  if (args[0]?.includes?.('Animated')) return;
  originalWarn.apply(console, args);
};
