// Mock for expo-sensors in Jest tests
//
// We pass implementations directly to jest.fn() to avoid issues with
// Jest auto-mocking or mockImplementation being cleared.
// Using immediately resolving promises to minimize async issues.

// State stored in closure
let listeners = [];
let isAvailable = true;
let mockPermissionStatus = 'granted';

// Create mock functions with implementations inline
// Use Promise.resolve() to immediately resolve without microtask queue
const Magnetometer = {
  isAvailableAsync: jest.fn(() => Promise.resolve(isAvailable)),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: mockPermissionStatus })),
  setUpdateInterval: jest.fn(),
  addListener: jest.fn((callback) => {
    listeners.push(callback);
    return {
      remove: () => {
        listeners = listeners.filter((l) => l !== callback);
      },
    };
  }),
};

// Test helpers - exported at module level (not as Magnetometer properties)
// This prevents Jest from auto-mocking them
const __magnetometerTestHelpers = {
  simulateReading: (data) => {
    listeners.forEach((listener) => listener(data));
  },
  setAvailable: (available) => {
    isAvailable = available;
  },
  setPermissionStatus: (status) => {
    mockPermissionStatus = status;
  },
  reset: () => {
    listeners = [];
    isAvailable = true;
    mockPermissionStatus = 'granted';
    // Clear call counts but implementations stay intact with inline approach
    Magnetometer.isAvailableAsync.mockClear();
    Magnetometer.requestPermissionsAsync.mockClear();
    Magnetometer.setUpdateInterval.mockClear();
    Magnetometer.addListener.mockClear();
  },
  getListenersCount: () => listeners.length,
};

module.exports = {
  Magnetometer,
  __magnetometerTestHelpers,
};
