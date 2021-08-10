import { babel, getBabelOutputPlugin } from '@rollup/plugin-babel';

export default [{
  input: 'lib/index.js',
  output: {
    file: 'dist/daak.js',
    format: 'iife',
  },
  plugins: [getBabelOutputPlugin({ presets: ['@babel/preset-env'], allowAllFormats: true })],
}, {
  input: 'lib/index.js',
  output: {
    file: 'dist/daak.es.js',
    format: 'iife',
  },
  plugins: [babel({ babelHelpers: 'bundled' })],
}];
