module.exports = {
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    target: "ES2020",
    lib: ["ES2020"],
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    strict: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    resolveJsonModule: true,
    baseUrl: "./src",
    paths: {
      "@/*": ["*"],
      "@/domain/*": ["domain/*"],
      "@/application/*": ["application/*"],
      "@/infrastructure/*": ["infrastructure/*"],
      "@/presentation/*": ["presentation/*"],
    },
  },
};
