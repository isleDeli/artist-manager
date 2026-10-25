import { createServer } from './grant-writer.mjs';

const port = Number(process.env.PORT || 8787);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  process.stderr.write('Set PORT to an integer from 1 to 65535.\n');
  process.exit(1);
}
const server = createServer({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL,
  accessCode: process.env.GRANT_WRITER_ACCESS_CODE,
  allowedOrigin: process.env.ALLOWED_ORIGIN || 'https://isledeli.github.io',
  allowLocalhost: process.env.NODE_ENV !== 'production'
});
server.listen(port, process.env.HOST || '0.0.0.0', () => {
  process.stdout.write('Grant draft service listening on port ' + port + '.\n');
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
server.on('error', () => {
  process.stderr.write('Grant draft service could not start. Check HOST and PORT availability.\n');
  process.exitCode = 1;
});
