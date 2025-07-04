/* eslint-disable */
export default {
  displayName: 'access-service',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(js|ts)',
    '<rootDir>/src/**/(*.)+(spec|test).(js|ts)',
  ],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { 
      tsconfig: '<rootDir>/tsconfig.spec.json',
      isolatedModules: true,
    }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/access-service',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapping: {
    '^@enterprise/shared$': '<rootDir>/../../libs/shared/src/index.ts',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/test-setup.ts',
  ],
  coverageReporters: ['html', 'lcov', 'text'],
  testTimeout: 10000,
  verbose: true,
};
