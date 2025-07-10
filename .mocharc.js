module.exports = {
  require: ['ts-node/register', 'tsconfig-paths/register'],
  extension: ['ts'],
  spec: 'src/**/*.test.ts',
  timeout: 5000,
  reporter: 'spec',
  colors: true,
}; 