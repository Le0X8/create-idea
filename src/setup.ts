import { createDefaultConfig, path } from './config';
import c from 'chalk';

export function setup(interactive: boolean = false) {
  if (interactive) {
    console.log(c.blueBright.bold('Thank you for using create-idea!'));
    console.log('Setting up...\n');
  }

  createDefaultConfig(interactive);

  if (interactive) {
    console.log(c.bold.greenBright('\nSetup complete!'));
    console.log(
      c.blueBright('You can now run npm create idea to create a new workspace.')
    );
    console.log(
      c.whiteBright('Your configuration file is located at ') +
        c.underline.whiteBright(path + '/config.json')
    );
    console.log(
      c.magentaBright("\nDon't forget to check out the config editor: ") + c.magentaBright.underline('https://idea.leox.dev/')
    );
  }
}
