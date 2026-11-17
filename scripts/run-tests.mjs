import { build } from 'vite';
import { execSync } from 'node:child_process';

console.log('Compiling test suite with Vite...');
await build({
  logLevel: 'warn',
  build: {
    target: 'esnext',
    ssr: 'tests/workflow.test.ts',
    outDir: 'tests-dist',
    rollupOptions: {
      external: ['node:test', 'node:assert', 'node:assert/strict', /^node:.*/]
    }
  }
});

console.log('Executing test suite with Node.js test runner...\n');
execSync('node --test tests-dist/workflow.test.js', { stdio: 'inherit' });
