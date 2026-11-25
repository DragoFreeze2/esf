import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(rootDir = __dirname) {
  const app = express();

  app.use(
    '/assets',
    express.static(path.join(rootDir, 'assets'), {
      dotfiles: 'ignore',
      index: false,
    }),
  );

  app.get(['/', '/index.html'], (_req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
  });

  app.use((_req, res) => {
    res.status(404).send('Not Found');
  });

  return app;
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isDirectRun) {
  const port = Number(process.env.PORT) || 3000;
  const host = '0.0.0.0';
  const app = createApp();

  app.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
  });
}
