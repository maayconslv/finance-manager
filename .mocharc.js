module.exports = {
  require: [
    'tsconfig-paths/register',
    'ts-node/register'
  ],
  extensions: ['ts'],
  spec: 'src/**/*.test.ts',
  timeout: 5000,
  reporter: 'spec',
  colors: true,
  'ts-node': {
    project: './tsconfig.json'
  }
};