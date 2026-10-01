import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
function check(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (item.name.startsWith('.') || item.name === 'node_modules') continue;
    const path = join(dir, item.name);
    if (item.isDirectory()) check(path);
    else if (path.endsWith('.js')) execFileSync(process.execPath, ['--check', path], { stdio: 'inherit' });
  }
}
check('.'); console.log('JavaScript syntax checks passed');
