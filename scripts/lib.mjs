// Shared helpers for the cross-platform developer scripts (Windows, macOS, Linux).
import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const BACKEND = path.join(ROOT, 'backend');
export const FRONTEND = path.join(ROOT, 'frontend');
export const IS_WINDOWS = process.platform === 'win32';

export const venvPython = path.join(BACKEND, '.venv', IS_WINDOWS ? 'Scripts' : 'bin', IS_WINDOWS ? 'python.exe' : 'python');

export const color = {
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  magenta: (s) => `\x1b[35m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

// Windows can only launch .cmd shims (npm, py) through a shell. To avoid Node's DEP0190 warning we
// pass one pre-quoted command string in that case; all arguments here are our own constants.
function quote(arg) {
  return /[\s"]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg;
}

function invocation(command, args) {
  const needsShell = IS_WINDOWS && !command.endsWith('.exe');
  return needsShell ? [[command, ...args].map(quote).join(' '), [], { shell: true }] : [command, args, {}];
}

export function fail(message) {
  console.error(color.red(`\n✖ ${message}\n`));
  process.exit(1);
}

/** Run a command synchronously with inherited output; exit on failure. */
export function run(command, args, options = {}) {
  console.log(color.dim(`$ ${command} ${args.join(' ')}`));
  const [cmd, argv, extra] = invocation(command, args);
  const result = spawnSync(cmd, argv, { stdio: 'inherit', ...extra, ...options });
  if (result.status !== 0) fail(`Command failed: ${command} ${args.join(' ')}`);
}

/** Find a system Python 3.11+ for creating the virtual environment. */
export function findSystemPython() {
  const candidates = IS_WINDOWS ? [['py', ['-3']], ['python', []]] : [['python3', []], ['python', []]];
  for (const [cmd, pre] of candidates) {
    const [c, argv, extra] = invocation(cmd, [...pre, '-c', 'import sys; print(sys.version_info >= (3, 11))']);
    const probe = spawnSync(c, argv, { encoding: 'utf8', ...extra });
    if (probe.status === 0 && probe.stdout.trim() === 'True') return [cmd, pre];
  }
  return null;
}

/** Spawn a long-running process with every output line prefixed by a coloured label. */
export function startPrefixed(label, command, args, options) {
  const [cmd, argv, extra] = invocation(command, args);
  const child = spawn(cmd, argv, { stdio: ['inherit', 'pipe', 'pipe'], ...extra, ...options });
  const write = (stream) => (chunk) => {
    for (const line of chunk.toString().split(/\r?\n/)) if (line.trim()) stream.write(`${label} ${line}\n`);
  };
  child.stdout.on('data', write(process.stdout));
  child.stderr.on('data', write(process.stderr));
  return child;
}

export function killTree(child) {
  if (!child || child.exitCode !== null) return;
  if (IS_WINDOWS) spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  else child.kill('SIGTERM');
}

export { existsSync, path };
