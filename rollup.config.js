import typescript from 'rollup-plugin-typescript2';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';

export default [
  {
    input: 'src/index.ts',
    plugins: [
      json(),
      typescript(),
      babel({
        babelrc: false,
        presets: [['@babel/preset-env', { modules: false, loose: true }]],
        plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
        exclude: 'node_modules/**',
      }),
    ],
    output: [
      { file: 'dist/index.esm.js', format: 'es' },
      { file: 'dist/index.cjs.js', format: 'cjs' },
      { file: 'dist/index.umd.js', format: 'umd', name: 'crop' },
    ],
  },
];
