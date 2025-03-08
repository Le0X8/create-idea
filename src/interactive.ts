import { program } from 'commander';
import { setup } from './setup';
import c, { ChalkInstance } from 'chalk';
import { Config, existsConfig, getConfig, loadPreset, Preset } from './config';
import confirm from '@inquirer/confirm';
import { createDir, gitInit } from './steps/workspace';

const theme = {
  prefix: {
    idle: c.dim('└'),
    done: c.dim('│'),
  },
};

let inSection = false;

function end() {
  const width = process.stdout.columns;
  if (inSection) {
    inSection = false;
    console.log(c.dim(`│\n╰${'─'.repeat(width - 1)}`));
  }
}

function section(
  title: string,
  color: ChalkInstance = c.blueBright,
  icon?: string
) {
  end();
  inSection = true;

  const width = process.stdout.columns;
  const reserved = (icon ? 7 : 4) + title.length;
  const right = width - reserved;
  console.log(
    `\n${c.dim('╭─')} ${color.bold((icon ? icon + '  ' : '') + title)} ${c.dim(
      '─'.repeat(right)
    )}\n${c.dim('│')}`
  );
}

function abort() {
  console.log(c.bold.redBright('\nAborted.'));
  process.exit(1);
}

function err(fn: () => any) {
  try {
    fn();
  } catch (e: unknown) {
    console.log(c.bold.redBright(`\nError: ${(e as Error).message}`));
    process.exit(1);
  }
}

function nl() {
  console.log(c.dim('│'));
}

const questions = {
  git: async (env: { preset: Preset; directory: string; cfg: Config }) => {
    const useGit =
      typeof env.cfg?.always?.git === 'boolean'
        ? (() => {
          if (env.cfg.always.git) console.log(c.dim('│ ' + c.italic('Using \ue702 Git for version control (config).')));
          else console.log(c.dim('│ ' + c.italic('Not using \ue702 Git for version control (config).')));
          return env.cfg.always.git;
        })()
        : await confirm({
            message: 'Do you want to use \ue702 Git for version control?',
            default: true,
            theme,
          }).catch(abort);
    if (useGit) err(() => gitInit(env.directory));
  },
};

export async function createInteractive() {
  program
    .option('--setup')
    .option('-p, --preset <string>')
    //.option('-x, --officialPreset [string]')
    //.option('-u, --unofficialPreset <string>')
    .argument('[string]');

  program.parse(process.argv);

  const options = program.opts() as {
    setup: boolean;
    preset: string;
    officialPreset: string | boolean;
    unofficialPreset: string;
    default: boolean;
  };

  if (options.setup) {
    setup(true);
    return;
  } else if (!existsConfig()) {
    err(() => {
      throw new Error(
        'No configuration file found. Run with --setup to create one.'
      );
    });
    return;
  }

  const directory = program.args[0] ?? '.';

  const cfg = getConfig();

  const preset = loadPreset(cfg, options.preset);

  console.log(
    c.blueBright(
      `Creating new ${c.greenBright.bold(
        preset.displayName ?? options.preset ?? 'default'
      )} project...`
    )
  );

  const env = { preset, directory, cfg };

  createDir(directory);

  for (const s of preset.steps) {
    const step = typeof s === 'string' ? cfg.steps[s] : s;
    section(
      step.name,
      c[step.color ?? 'blueBright'] as ChalkInstance,
      step.icon
    );

    for (const q of step.questions) {
      if (typeof q === 'string') await questions[q](env);
      else
        err(() => {
          throw new Error('Not implemented yet.'); // TODO
        });
    }
  }

  end();
}
