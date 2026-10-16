// `npm test` - run the backend (pytest) and frontend (Vitest) test suites.
import { BACKEND, FRONTEND, color, existsSync, fail, run, venvPython } from './lib.mjs';

if (!existsSync(venvPython)) fail('Backend virtual environment not found. Run "npm run setup" first.');

console.log(color.bold('\nBackend tests (pytest)'));
run(venvPython, ['-m', 'pytest'], { cwd: BACKEND });

console.log(color.bold('\nFrontend tests (Vitest)'));
run('npm', ['test'], { cwd: FRONTEND });

console.log(color.green(color.bold('\n✔ All tests passed.\n')));
