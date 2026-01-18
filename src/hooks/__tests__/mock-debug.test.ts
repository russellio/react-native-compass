// Use factory function to bypass Jest's auto-mocking
jest.mock('expo-sensors', () => jest.requireActual('../../../__mocks__/expo-sensors'));

import { Magnetometer } from 'expo-sensors';

// Import test helpers - now they should work because we used requireActual
const { __magnetometerTestHelpers } = require('expo-sensors');

describe('Mock debug', () => {
  beforeEach(() => {
    __magnetometerTestHelpers.reset();
  });

  it('should show implementation details', () => {
    console.log('addListener toString:', Magnetometer.addListener.toString().substring(0, 200));
    console.log('getListenersCount type:', typeof __magnetometerTestHelpers.getListenersCount);
    console.log('simulateReading type:', typeof __magnetometerTestHelpers.simulateReading);

    // Check listeners count before
    console.log('listeners count before:', __magnetometerTestHelpers.getListenersCount());

    // Try calling addListener and checking what it returns
    const callback = jest.fn();
    const result = Magnetometer.addListener(callback);
    console.log('addListener result:', result);
    console.log('addListener result type:', typeof result);
    console.log('addListener result.remove:', typeof result?.remove);

    // Check listeners count after
    console.log('listeners count after:', __magnetometerTestHelpers.getListenersCount());

    // Try simulating a reading
    __magnetometerTestHelpers.simulateReading({ x: 1, y: 0, z: 0 });
    console.log('callback was called:', callback.mock.calls.length, 'times');

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
