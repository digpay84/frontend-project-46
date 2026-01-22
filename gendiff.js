import { Command } from "commander";
import _ from 'lodash';
import fs from 'fs';

const program = new Command();

program
  .name('gendiff')
  .description('Compares two configuration files and shows a difference.')
  .version('1.0.0', '-V, --version', 'output the version number')
  .arguments('<filepath1> <filepath2>')
  .option('-f, --format [type]', 'output format')
  .action((filepath1, filepath2) => {

    console.log(`Comparing ${filepath1} and ${filepath2}`);
    const file1 = fs.readFileSync('file1.json', 'utf8');
    const json1 = JSON.parse(file1)
    console.log(json1)

  });


program.parse()

const options = program.opts()




const obj = { z: 1, a: 2, m: 3, b: 4 };

function sortObjectKeys(obj, order = 'asc') {
  return _.chain(obj)
    .toPairs()
    .orderBy([0], [order === 'asc' ? 'asc' : 'desc'])
    .fromPairs()
    .value()
}

console.log(sortObjectKeys(obj))


