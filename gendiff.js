import { Command } from 'commander';
import fs from 'node:fs';
import { genDiff, formatDiff } from './src/genDiff.js';

const program = new Command();

program
  .name('gendiff')
  .description('Compares two configuration files and shows a difference.')
  .version('1.0.0', '-V, --version', 'output the version number')
  .arguments('<filepath1> <filepath2>')
  .option('-f, --format [type]', 'output format')
  .action((filepath1, filepath2) => {
    const file1 = fs.readFileSync(filepath1, 'utf8');
    const file2 = fs.readFileSync(filepath2, 'utf8');

    const data1 = JSON.parse(file1);
    const data2 = JSON.parse(file2);

    const diff = genDiff(data1, data2);
    console.log(formatDiff(diff));
  });

program.parse();
