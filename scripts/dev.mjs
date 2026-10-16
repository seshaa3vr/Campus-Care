// `npm run dev` - start the FastAPI backend and the Vite frontend together.
// `--backend` starts only the API.
//
// Campus Care uses its own ports (API 8010, web 5180) so it can run next to other projects that
// use the common 8000/5173 defaults. Override with API_PORT / WEB_PORT if needed.
import net from 'node:net';
import { BACKEND, FRONTEND, color, existsSync, fail, killTree, path, startPrefixed, venvPython } from './lib.mjs';

const API_PORT = Number(process.env.API_PORT || 8010);
const WEB_PORT = Number(process.env.WEB_PORT || 5180);
const backendOnly = process.argv.includes('--backend');

if (!existsSync(venvPython)) fail('Backend virtual environment not found. Run "npm run setup" first.');
if (!existsSync(path.join(BACKEND, '.env'))) fail('backend/.env not found. Run "npm run setup" first.');
if (!backendOnly && !existsSync(path.join(FRONTEND, 'node_modules'))) fail('Frontend dependencies missing. Run "npm run setup" first.');

/** True if anything is already listening on the port (IPv4 or IPv6 localhost). */
function portInUse(port) {
  const probe = (host) =>
    new Promise((resolve) => {
      const socket = net.connect({ port, host });
      socket.setTimeout(800);
      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.once('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.once('error', () => resolve(false));
    });
  return Promise.all([probe('127.0.0.1'), probe('::1')]).then((results) => results.some(Boolean));
}

const busy = [];
if (await portInUse(API_PORT)) busy.push(`${API_PORT} (API)`);
if (!backendOnly && (await portInUse(WEB_PORT))) busy.push(`${WEB_PORT} (web app)`);
if (busy.length) {
  fail(
    `Port ${busy.join(' and ')} is already in use - probably another copy of this app or another project.\n` +
      '  Stop that program first, or pick other ports, e.g.:  API_PORT=8020 WEB_PORT=5190 npm run dev',
  );
}

const env = { ...process.env, VITE_PROXY_TARGET: `http://localhost:${API_PORT}`, VITE_DEV_PORT: String(WEB_PORT) };
const children = [];
const api = startPrefixed(
  color.cyan('[api]'),
  venvPython,
  ['-m', 'uvicorn', 'app.main:app', '--reload', '--host', '127.0.0.1', '--port', String(API_PORT), '--no-access-log'],
  { cwd: BACKEND, env },
);
api.label = 'API server (uvicorn)';
children.push(api);
if (!backendOnly) {
  const web = startPrefixed(color.magenta('[web]'), 'npm', ['run', 'dev'], { cwd: FRONTEND, env });
  web.label = 'Web server (vite)';
  children.push(web);
}

console.log(color.bold('\nCampus Maintenance System - development servers'));
console.log(`  API:      ${color.cyan(`http://localhost:${API_PORT}`)}   (docs: http://localhost:${API_PORT}/docs)`);
if (!backendOnly) console.log(`  Web app:  ${color.magenta(`http://localhost:${WEB_PORT}`)}   <- open this in your browser`);
console.log(color.dim('  Press Ctrl+C to stop.\n'));

let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  children.forEach(killTree);
  process.exit(code);
}
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
children.forEach((child) =>
  child.on('exit', (code, signal) => {
    if (!stopping) {
      const how = signal ? `signal ${signal}` : `code ${code}`;
      console.error(color.red(`\n${child.label} stopped (${how}). Stopping the other server too - run "npm run dev" again to restart.`));
      stop(typeof code === 'number' && code > 0 && code < 256 ? code : 1);
    }
  }),
);
