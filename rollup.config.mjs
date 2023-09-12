import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'


const INPUT = {
  'index': 'src/index.ts',
  'useWebStorage': 'src/useWebStorage.ts',
  'events/events/WebStorageErrorEvent': 'src/events/WebStorageErrorEvent.ts',
  'events/events/WebStorageUpdateEvent': 'src/events/WebStorageUpdateEvent.ts',
  'localstorage/index': 'src/localstorage/index.ts',
  'localstorage/useLocalStorage': 'src/localstorage/useLocalStorage.ts',
  'sessionstorage/index': 'src/sessionstorage/index.ts',
  'sessionstorage/useSessionStorage': 'src/sessionstorage/useSessionStorage.ts',
}

export default [
  {
    input: INPUT,
    external: ['react', 'exenv'],
    plugins: [nodeResolve(), commonjs(), esbuild()],
    output: [
      {
        dir: 'dist/formats/cjs',
        format: 'cjs',
        sourcemap: true,
      },
    ]
  },
  {
    input: INPUT,
    external: ['react', 'exenv'],
    plugins: [nodeResolve(), commonjs(), esbuild()],
    output: [
      {
        dir: 'dist',
        format: 'esm',
        sourcemap: true,
      },
    ]
  },
  {
    input: 'src/index.ts',
    external: ['react'],
    plugins: [nodeResolve(), commonjs(), esbuild()],
    output: [
      {
        dir: 'dist/formats/umd',
        format: 'umd',
        sourcemap: true,
        name: 'react-hook-webstorage',
        globals: ['react'],
      },
    ]
  },
  {
    input: INPUT,
    external: ['react', 'exenv'],
    plugins: [dts()],
    output: {
      dir: 'dist',
      format: 'es',
    },
  }
]
