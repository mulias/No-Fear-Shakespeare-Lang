/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': ['babel-jest', { presets: [['@babel/preset-env', { modules: 'commonjs' }]] }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json', 'node', 'wasm'],
  // Let Node.js handle WASM files naturally
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.wasm$))',
  ],
};