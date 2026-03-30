import { describe, expect, test } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { genDiff, formatDiff } from '../src/genDiff.js';
import { parseFile } from '../src/parsers.js';
import formatStylish from '../src/formatters/stylish.js';
import formatPlain from '../src/formatters/plain.js';
import { getFormatter } from '../src/formatters/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesPath = path.join(__dirname, '..', '__fixtures__');

const readFixture = (filename) => {
  const filePath = path.join(fixturesPath, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filename).toLowerCase();

  if (ext === '.json') {
    return JSON.parse(content);
  }
  if (ext === '.yml' || ext === '.yaml') {
    return yaml.load(content);
  }
  throw new Error(`Unsupported file extension: ${ext}`);
};

describe('genDiff с вложенными структурами', () => {
  test('должен обнаруживать удалённые ключи на корневом уровне', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);

    const removedKeys = diff
      .filter((item) => item.status === 'removed')
      .map((item) => item.key);

    expect(removedKeys).toContain('group2');
  });

  test('должен обнаруживать добавленные ключи на корневом уровне', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);

    const addedKeys = diff
      .filter((item) => item.status === 'added')
      .map((item) => item.key);

    expect(addedKeys).toContain('group3');
  });

  test('должен обнаруживать вложенные структуры со статусом nested', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);

    const nestedItem = diff.find((item) => item.key === 'common');

    expect(nestedItem).toBeDefined();
    expect(nestedItem.status).toBe('nested');
    expect(nestedItem.children).toBeDefined();
    expect(Array.isArray(nestedItem.children)).toBe(true);
  });

  test('должен рекурсивно сравнивать вложенные объекты', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);

    const commonItem = diff.find((item) => item.key === 'common');
    const setting6Item = commonItem.children.find((item) => item.key === 'setting6');

    expect(setting6Item.status).toBe('nested');
    expect(setting6Item.children).toBeDefined();

    const dogeItem = setting6Item.children.find((item) => item.key === 'doge');
    expect(dogeItem.status).toBe('nested');

    const wowItem = dogeItem.children.find((item) => item.key === 'wow');
    expect(wowItem.status).toBe('changed');
    expect(wowItem.value1).toBe('');
    expect(wowItem.value2).toBe('so much');
  });

  test('должен обнаруживать изменённые значения во вложенных структурах', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);

    const commonItem = diff.find((item) => item.key === 'common');
    const bazItem = commonItem.children.find((item) => item.key === 'setting3');

    expect(bazItem.status).toBe('changed');
    expect(bazItem.value1).toBe(true);
    expect(bazItem.value2).toBe(null);
  });

  test('должен обнаруживать добавленные ключи во вложенных структурах', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);

    const commonItem = diff.find((item) => item.key === 'common');
    const followItem = commonItem.children.find((item) => item.key === 'follow');

    expect(followItem.status).toBe('added');
    expect(followItem.value).toBe(false);
  });

  test('должен обнаруживать удалённые ключи во вложенных структурах', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);

    const commonItem = diff.find((item) => item.key === 'common');
    const setting2Item = commonItem.children.find((item) => item.key === 'setting2');

    expect(setting2Item.status).toBe('removed');
    expect(setting2Item.value).toBe(200);
  });

  test('должен обнаруживать неизменённые ключи во вложенных структурах', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);

    const commonItem = diff.find((item) => item.key === 'common');
    const setting1Item = commonItem.children.find((item) => item.key === 'setting1');

    expect(setting1Item.status).toBe('unchanged');
    expect(setting1Item.value).toBe('Value 1');
  });

  test('должен обрабатывать изменение типа значения (объект -> примитив)', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);

    const group1Item = diff.find((item) => item.key === 'group1');
    const nestItem = group1Item.children.find((item) => item.key === 'nest');

    expect(nestItem.status).toBe('changed');
    expect(nestItem.value1).toEqual({ key: 'value' });
    expect(nestItem.value2).toBe('str');
  });

  test('должен сортировать ключи по алфавиту на всех уровнях', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);

    const checkSorted = (items) => {
      const keys = items.map((item) => item.key);
      const sortedKeys = [...keys].sort();
      expect(keys).toEqual(sortedKeys);

      items.forEach((item) => {
        if (item.status === 'nested' && item.children) {
          checkSorted(item.children);
        }
      });
    };

    checkSorted(diff);
  });
});

describe('formatStylish (stylish форматер)', () => {
  test('должен форматировать diff с вложенными структурами', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);
    const formatted = formatStylish(diff);

    expect(formatted).toContain('{');
    expect(formatted).toContain('}');
    expect(formatted).toContain('common: {');
    expect(formatted).toContain('+ follow: false');
    expect(formatted).toContain('- setting2: 200');
    expect(formatted).toContain('group1: {');
    expect(formatted).toContain('group3: {');
  });

  test('должен правильно форматировать глубоко вложенные структуры', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);
    const formatted = formatStylish(diff);

    expect(formatted).toContain('doge: {');
    expect(formatted).toContain('- wow:');
    expect(formatted).toContain('+ wow: so much');
  });

  test('должен возвращать строковый тип', () => {
    const diff = genDiff(readFixture('nested1.json'), readFixture('nested2.json'));
    const formatted = formatStylish(diff);

    expect(typeof formatted).toBe('string');
  });

  test('должен форматировать добавленные объекты как JSON', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);
    const formatted = formatStylish(diff);

    expect(formatted).toContain('+ setting5: {"key5":"value5"}');
  });

  test('должен форматировать удалённые объекты как JSON', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);
    const formatted = formatStylish(diff);

    expect(formatted).toContain('- group2: {"abc":12345,"deep":{"id":45}}');
  });
});

describe('formatPlain (plain форматер)', () => {
  test('должен форматировать добавленные свойства на корневом уровне', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);
    const formatted = formatPlain(diff);

    expect(formatted).toContain("Property 'group3' was added with value: [complex value]");
  });

  test('должен форматировать удалённые свойства на корневом уровне', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);
    const formatted = formatPlain(diff);

    expect(formatted).toContain("Property 'group2' was removed");
  });

  test('должен форматировать изменённые свойства с полным путём', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);
    const formatted = formatPlain(diff);

    expect(formatted).toContain("Property 'common.setting3' was updated. From true to null");
    expect(formatted).toContain("Property 'group1.baz' was updated. From 'bas' to 'bars'");
  });

  test('должен форматировать глубоко вложенные свойства', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);
    const formatted = formatPlain(diff);

    expect(formatted).toContain("Property 'common.setting6.doge.wow' was updated. From '' to 'so much'");
    expect(formatted).toContain("Property 'common.setting6.ops' was added with value: 'vops'");
  });

  test('должен показывать [complex value] для объектов', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);
    const formatted = formatPlain(diff);

    expect(formatted).toContain("Property 'common.setting5' was added with value: [complex value]");
    expect(formatted).toContain("Property 'group1.nest' was updated. From [complex value] to 'str'");
  });

  test('должен возвращать строковый тип', () => {
    const diff = genDiff(readFixture('nested1.json'), readFixture('nested2.json'));
    const formatted = formatPlain(diff);

    expect(typeof formatted).toBe('string');
  });

  test('должен форматировать булевы значения без кавычек', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);
    const formatted = formatPlain(diff);

    expect(formatted).toContain("Property 'common.follow' was added with value: false");
  });

  test('должен форматировать null значения', () => {
    const data1 = readFixture('nested1.json');
    const data2 = readFixture('nested2.json');
    const diff = genDiff(data1, data2);
    const formatted = formatPlain(diff);

    expect(formatted).toContain("Property 'common.setting3' was updated. From true to null");
  });
});

describe('getFormatter', () => {
  test('должен возвращать stylish форматер по умолчанию', () => {
    const formatter = getFormatter('stylish');
    expect(formatter).toBe(formatStylish);
  });

  test('должен возвращать plain форматер', () => {
    const formatter = getFormatter('plain');
    expect(formatter).toBe(formatPlain);
  });

  test('должен выбрасывать ошибку для неизвестного формата', () => {
    expect(() => getFormatter('unknown')).toThrow('Unknown format: unknown');
  });
});

describe('Поддержка YAML с вложенными структурами', () => {
  test('должен корректно парсить YAML файл с вложенностями', () => {
    const data = readFixture('nested1.yml');

    expect(data.common.setting1).toBe('Value 1');
    expect(data.common.setting6.doge.wow).toBe('');
    expect(data.group1.nest.key).toBe('value');
  });

  test('должен сравнивать YAML файлы с вложенными структурами', () => {
    const data1 = readFixture('nested1.yml');
    const data2 = readFixture('nested2.yml');
    const diff = genDiff(data1, data2);

    const commonItem = diff.find((item) => item.key === 'common');
    expect(commonItem.status).toBe('nested');

    const followItem = commonItem.children.find((item) => item.key === 'follow');
    expect(followItem.status).toBe('added');
    expect(followItem.value).toBe(false);
  });

  test('должен форматировать diff для YAML файлов в stylish', () => {
    const data1 = readFixture('nested1.yml');
    const data2 = readFixture('nested2.yml');
    const diff = genDiff(data1, data2);
    const formatted = formatStylish(diff);

    expect(formatted).toContain('{');
    expect(formatted).toContain('}');
    expect(formatted).toContain('common: {');
    expect(formatted).toContain('+ follow: false');
  });

  test('должен форматировать diff для YAML файлов в plain', () => {
    const data1 = readFixture('nested1.yml');
    const data2 = readFixture('nested2.yml');
    const diff = genDiff(data1, data2);
    const formatted = formatPlain(diff);

    expect(formatted).toContain("Property 'common.follow' was added with value: false");
    expect(formatted).toContain("Property 'group2' was removed");
  });
});

describe('parseFile', () => {
  test('должен парсить JSON файл', () => {
    const filePath = path.join(fixturesPath, 'file1.json');
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parseFile(content, filePath);

    expect(parsed.host).toBe('hexlet.io');
    expect(parsed.timeout).toBe(50);
  });

  test('должен парсить YAML файл с расширением .yml', () => {
    const filePath = path.join(fixturesPath, 'file1.yml');
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parseFile(content, filePath);

    expect(parsed.host).toBe('hexlet.io');
    expect(parsed.timeout).toBe(50);
  });

  test('должен парсить YAML файл с расширением .yaml', () => {
    const yamlContent = 'key: value\nnumber: 42\n';
    const parsed = parseFile(yamlContent, 'test.yaml');

    expect(parsed.key).toBe('value');
    expect(parsed.number).toBe(42);
  });

  test('должен выбрасывать ошибку для неподдерживаемого расширения', () => {
    const content = 'some content';

    expect(() => parseFile(content, 'file.txt')).toThrow('Unsupported file extension: .txt');
  });
});
