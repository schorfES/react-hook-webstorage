import type { Config } from '@jest/types';


const config: Config.InitialOptions = {
  cache: true,
  collectCoverageFrom: ['src/**/*'],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
  },
  preset: 'ts-jest',
  reporters: [
    'default',
    'github-actions',
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.test.jest.json',
    }],
  },
  testEnvironment: 'jsdom',
  verbose: true,
};

export default config;
