export default {
  // Use Node.js environment
  testEnvironment: 'node',
  
  // Handle ES Modules
  transform: {},
  
  // Module name mapping for imports
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.mjs$': '$1',
  },

  // Test file patterns
  testMatch: [
    "**/Tests/*.test.mjs"
  ],

  // Setup file for tests
  setupFilesAfterEnv: ['<rootDir>/Tests/setup/jest.setup.mjs'],
  forceExit: true,
  detectOpenHandles: true,

  // Coverage configuration
  collectCoverageFrom: [
    'Services/**/*.mjs',
    'Handlers/**/*.mjs',
    '!**/node_modules/**',
    '!**/Tests/**'
  ],

  // Clear mocks automatically
  clearMocks: true
};
