#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'node:fs';
import { genDiff } from './src/genDiff.js';
import { getFormatter } from './src/formatters/index.js';
import { parseFile } from './src/parsers.js';

const program = new Command();

program
  .name('gendiff')
  .description('Compares two configuration files and shows a difference.')
  .version('1.0.0', '-V, --version', 'output the version number')
  .option('-f, --format [type]', 'output format (stylish, plain, json)', 'stylish')
  .argument('<filepath1>', 'first file path')
  .argument('<filepath2>', 'second file path')
  .action((filepath1, filepath2, options) => {
    const file1 = fs.readFileSync(filepath1, 'utf8');
    const file2 = fs.readFileSync(filepath2, 'utf8');

    const data1 = parseFile(file1, filepath1);
    const data2 = parseFile(file2, filepath2);

    const diff = genDiff(data1, data2);
    const format = options.format || 'stylish';
    const formatter = getFormatter(format);

    console.log(formatter(diff));
  });

program.parse();


