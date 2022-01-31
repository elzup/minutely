const config = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js', '**/*.test.ts', '**/*.test.tsx'],
  // setupFilesAfterEnv: ['<rootDir>/src/test/utils/setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  transformIgnorePatterns: ['/node_modules/'],

  transform: {
    '.+\\.(t|j)sx?$': '@swc/jest',
  },
}

module.exports = config
