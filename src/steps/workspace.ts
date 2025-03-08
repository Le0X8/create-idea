import { mkdirSync, existsSync, statSync } from 'fs';
import { execSync } from 'child_process';

export function createDir(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  } else if (!statSync(path).isDirectory()) {
    throw new Error(`Path ${path} exists and is not a directory`);
  }
}

export function gitInit(path: string) {
  execSync('git init', { cwd: path });
}