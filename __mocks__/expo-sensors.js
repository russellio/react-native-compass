// Mock for expo-sensors in Jest tests

let listeners = [];
let isAvailable = true;
let mockPermissionStatus = 'granted';

const Magnetometer = {
  isAvailableAsync: jest.fn(() => Promise.resolve(isAvailable)),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: mockPermissionStatus })
  ),
  setUpdateInterval: jest.fn(),
  addListener: jest.fn((callback) => {
    listeners.push(callback);
    return {
      remove: () => {
        listeners = listeners.filter((l) => l !== callback);
      },
    };
  }),
  // Test helpers
  __simulateReading: (data) => {
    listeners.forEach((listener) => listener(data));
  },
  __setAvailable: (available) => {
    isAvailable = available;
  },
  __setPermissionStatus: (status) => {
    mockPermissionStatus = status;
  },
  __reset: () => {
    listeners = [];
    isAvailable = true;
    mockPermissionStatus = 'granted';
    Magnetometer.isAvailableAsync.mockClear();
    Magnetometer.requestPermissionsAsync.mockClear();
    Magnetometer.setUpdateInterval.mockClear();
    Magnetometer.addListener.mockClear();
  },
};

module.exports = {
  Magnetometer,
};
