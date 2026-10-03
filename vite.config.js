import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync } from 'node:fs';
export default defineConfig(({ command }) => ({
  base: './',
  server: { host: '0.0.0.0', allowedHosts: ['terminal.local'] },
  plugins: [{
    name: 'portable-portfolio-assets',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return command === 'build'
          ? html.replace('<script src="script.js" defer>', '<script type="module" src="./script.js">')
          : html;
      },
    },
    closeBundle() {
      mkdirSync('dist/assets', { recursive: true });
      for (const file of ['Paula-Luruena-Marquez-Resume.pdf', 'bodoni-moda-LICENSE.txt', 'hanken-grotesk-LICENSE.txt']) {
        copyFileSync(`assets/${file}`, `dist/assets/${file}`);
      }
      copyFileSync('.nojekyll', 'dist/.nojekyll');
    },
  }],
}));
