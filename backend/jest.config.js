module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/migrations/**',
    '!src/seeders/**',
    '!src/config/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  testTimeout: 30000,
  globalSetup: '<rootDir>/src/__tests__/globalSetup.js',
  globalTeardown: '<rootDir>/src/__tests__/globalTeardown.js',
};