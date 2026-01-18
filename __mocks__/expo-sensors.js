// Mock for expo-sensors in Jest tests
//
// IMPORTANT: We use mockImplementation pattern to preserve closured state.
// Jest auto-mocks functions, so we need to set implementations AFTER creating mocks.

// State stored in closure
let listeners = [];
let isAvailable = true;
let mockPermissionStatus = 'granted';

// Create mock functions first
const Magnetometer = {
  isAvailableAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setUpdateInterval: jest.fn(),
  addListener: jest.fn(),
};

// Set implementations that reference the closure state
// This must happen AFTER the mocks are created, so Jest doesn't replace them
Magnetometer.isAvailableAsync.mockImplementation(() => Promise.resolve(isAvailable));
Magnetometer.requestPermissionsAsync.mockImplementation(() =>
  Promise.resolve({ status: mockPermissionStatus })
);
Magnetometer.addListener.mockImplementation((callback) => {
  listeners.push(callback);
  return {
    remove: () => {
      listeners = listeners.filter((l) => l !== callback);
    },
  };
});

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
    Magnetometer.isAvailableAsync.mockClear();
    Magnetometer.requestPermissionsAsync.mockClear();
    Magnetometer.setUpdateInterval.mockClear();
    Magnetometer.addListener.mockClear();
    // Re-set implementations after mockClear
    Magnetometer.isAvailableAsync.mockImplementation(() => Promise.resolve(isAvailable));
    Magnetometer.requestPermissionsAsync.mockImplementation(() =>
      Promise.resolve({ status: mockPermissionStatus })
    );
    Magnetometer.addListener.mockImplementation((callback) => {
      listeners.push(callback);
      return {
        remove: () => {
          listeners = listeners.filter((l) => l !== callback);
        },
      };
    });
  },
  getListenersCount: () => listeners.length,
};

module.exports = {
  Magnetometer,
  __magnetometerTestHelpers,
};
