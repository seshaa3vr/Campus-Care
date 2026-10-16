// `npm run setup` - one-time local setup:
//   backend venv + dependencies, backend/.env (SQLite + random secret), migrations, seed data,
//   frontend dependencies and frontend/.env. Safe to re-run.
import { randomBytes } from 'node:crypto';
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { BACKEND, FRONTEND, color, existsSync, fail, findSystemPython, path, run, venvPython } from './lib.mjs';

console.log(color.bold('\n1/5  Python virtual environment'));
if (!existsSync(venvPython)) {
  const python = findSystemPython();
  if (!python) fail('Python 3.11+ is required. Install it from https://www.python.org/downloads/ and re-run.');
  const [cmd, pre] = python;
  run(cmd, [...pre, '-m', 'venv', path.join(BACKEND, '.venv')]);
} else {
  console.log(color.dim('  already exists'));
}

console.log(color.bold('\n2/5  Backend dependencies'));
run(venvPython, ['-m', 'pip', 'install', '--disable-pip-version-check', '-q', '-r', 'requirements-dev.txt'], { cwd: BACKEND });

console.log(color.bold('\n3/5  Backend configuration'));
const backendEnv = path.join(BACKEND, '.env');
if (!existsSync(backendEnv)) {
  const secret = randomBytes(48).toString('base64url');
  const content = readFileSync(path.join(BACKEND, '.env.example'), 'utf8')
    // Local development defaults to SQLite so no database server is needed; switch DATABASE_URL to PostgreSQL any time.
    .replace(/^DATABASE_URL=postgresql.*$/m, 'DATABASE_URL=sqlite:///./campus.db')
    .replace(/^# DATABASE_URL=sqlite.*$/m, '# DATABASE_URL=postgresql://campus:campus_password@localhost:5432/campus_maintenance')
    .replace(/^SECRET_KEY=$/m, `SECRET_KEY=${secret}`);
  writeFileSync(backendEnv, content);
  console.log(color.green('  created backend/.env (SQLite, random SECRET_KEY)'));
} else {
  console.log(color.dim('  backend/.env already exists - left unchanged'));
}

console.log(color.bold('\n4/5  Database migrations and seed data'));
run(venvPython, ['-m', 'alembic', 'upgrade', 'head'], { cwd: BACKEND });
run(venvPython, ['seed.py'], { cwd: BACKEND });

console.log(color.bold('\n5/5  Frontend dependencies'));
run('npm', ['install', '--no-fund', '--no-audit'], { cwd: FRONTEND });
if (!existsSync(path.join(FRONTEND, '.env'))) {
  copyFileSync(path.join(FRONTEND, '.env.example'), path.join(FRONTEND, '.env'));
  console.log(color.green('  created frontend/.env'));
}

console.log(color.green(color.bold('\n✔ Setup complete. Start everything with:  npm run dev\n')));
