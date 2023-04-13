import type { Config } from '@jest/types';

export default (): Config.InitialOptions => {
  return {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageReporters: ['lcov', 'html', 'json'],
    setupFilesAfterEnv: ['./jest.setup.ts'],
    verbose: true,
    testMatch: ['**/*.test.ts'],
    transform: {
      '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    },
    collectCoverageFrom: ['dist/**/*.js'],
  };
};
