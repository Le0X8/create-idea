import envPaths from 'env-paths';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import c, { ChalkInstance } from 'chalk';
import { join as pathJoin } from 'path';

export const path = envPaths('create-idea', { suffix: '' }).config;

if (!existsSync(path)) mkdirSync(path);

export type PackageManager = 'npm' | 'yarn' | 'pnpm';

export type Config = {
  packageManager: PackageManager; // npm
  always?: {
    git?: boolean;
  };
  presets: Record<string, Preset | string>; // default: ...
  user: {
    fullName: string;
    npmUsername?: string;
    gitUsername?: string;
  };
  defaultLicense?: string; // MIT
  esm?: boolean; // true
  steps: {
    workspace: CustomStep;
    node: CustomStep;
  };
};

export type Preset = {
  displayName?: string;
  package?: {
    prefix?: string | boolean;
    suffix?: string;
    nameSource?: 'prompt' | 'path';
    version?: string;
    entryPoint?: string;
    typeDefs?: string;
    moduleEntryPoint?: string | boolean;
    bins?: Record<string, string | boolean> | boolean;
    publishInclude?: string[];
    repo?: string | boolean;
    description?: string;
    keywords?: string[];
    author?: string | boolean;
    license?: string | boolean;
    esm?: boolean | 'default';
  };
  files?: Record<string, string>;
  steps: Step[];
};

export type Step = CustomStep | 'workspace' | 'node';

export type CliColor = keyof ChalkInstance;

export type CustomStep = {
  icon?: string;
  color?: CliColor;
  name: string;
  questions: Questions[];
};

export type Questions = Question | 'git';

export type Question = {
  type: 'input';
  id: string;
};

export const defaultConfig: Config = {
  packageManager: 'npm',
  user: {
    fullName: '!! CHANGE ME !!',
  },
  steps: {
    workspace: {
      icon: '\uf413',
      name: 'Workspace',
      questions: ['git'],
    },
    node: {
      icon: '\ued0d',
      name: 'Node.js',
      color: 'greenBright',
      questions: [],
    },
  },
  presets: {
    default: {
      displayName: 'Simple Node.js Package',
      steps: ['workspace'],
      package: {
        version: '0.1.0',
        entryPoint: 'src/main.js',
        typeDefs: 'src/main.d.ts',
        moduleEntryPoint: true,
        publishInclude: [
          'src',
          'package.json',
          'package-lock.json',
          'pnpm-lock.yaml',
          'yarn.lock',
          'LICENSE',
          'README.md',
        ],
        author: true,
        license: true,
        esm: 'default',
      },
    },
  },
};

export const getConfig: () => Config = () => {
  if (!existsSync(`${path}/config.json`)) {
    return defaultConfig;
  }

  return {
    ...defaultConfig,
    ...JSON.parse(readFileSync(`${path}/config.json`, 'utf8')),
  };
};

export const existsConfig = () => existsSync(`${path}/config.json`);

export const createDefaultConfig = (interactive: boolean = false) => {
  if (!existsSync(`${path}/config.json`)) {
    writeFileSync(
      `${path}/config.json`,
      JSON.stringify(defaultConfig, null, 2)
    );
  } else if (interactive)
    console.log(
      c.yellowBright('Warning: Config file already exists, skipping creation.')
    );
};

export const loadPreset = (cfg: Config, name: string = 'default') => {
  if (!cfg.presets[name]) {
    throw new Error(`Preset "${name}" not found.`);
  }

  if (typeof cfg.presets[name] === 'string') {
    const file = pathJoin(path, cfg.presets[name] + '.json');
    if (!existsSync(file)) {
      throw new Error(`Preset file "${cfg.presets[name]}" not found.`);
    }
    return JSON.parse(readFileSync(file, 'utf8')) as Preset;
  };
  return cfg.presets[name];
};