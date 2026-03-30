import { describe, expect, test } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { genDiff, formatDiff } from '../src/genDiff.js';
import { parseFile } from '../src/parsers.js';

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

describe('genDiff', () => {
  test('должен обнаруживать удалённые ключи', () => {
    const data1 = readFixture('file1.json');
    const data2 = readFixture('file2.json');
    const diff = genDiff(data1, data2);

    const removedKeys = diff
      .filter((item) => item.status === 'removed')
      .map((item) => item.key);

    expect(removedKeys).toContain('follow');
    expect(removedKeys).toContain('proxy');
  });

  test('должен обнаруживать добавленные ключи', () => {
    const data1 = readFixture('file1.json');
    const data2 = readFixture('file2.json');
    const diff = genDiff(data1, data2);

    const addedKeys = diff
      .filter((item) => item.status === 'added')
      .map((item) => item.key);

    expect(addedKeys).toContain('verbose');
  });

  test('должен обнаруживать изменённые значения', () => {
    const data1 = readFixture('file1.json');
    const data2 = readFixture('file2.json');
    const diff = genDiff(data1, data2);

    const changedItem = diff.find((item) => item.key === 'timeout');

    expect(changedItem).toBeDefined();
    expect(changedItem.status).toBe('changed');
    expect(changedItem.value1).toBe(50);
    expect(changedItem.value2).toBe(20);
  });

  test('должен обнаруживать неизменённые ключи', () => {
    const data1 = readFixture('file1.json');
    const data2 = readFixture('file2.json');
    const diff = genDiff(data1, data2);

    const unchangedItem = diff.find((item) => item.key === 'host');

    expect(unchangedItem).toBeDefined();
    expect(unchangedItem.status).toBe('unchanged');
    expect(unchangedItem.value).toBe('hexlet.io');
  });

  test('должен сортировать ключи по алфавиту', () => {
    const data1 = readFixture('file1.json');
    const data2 = readFixture('file2.json');
    const diff = genDiff(data1, data2);

    const keys = diff.map((item) => item.key);
    const sortedKeys = [...keys].sort();

    expect(keys).toEqual(sortedKeys);
  });

  test('должен возвращать пустой diff для идентичных файлов', () => {
    const data1 = readFixture('same1.json');
    const data2 = readFixture('same2.json');
    const diff = genDiff(data1, data2);

    const changedItems = diff.filter((item) => item.status !== 'unchanged');

    expect(changedItems).toHaveLength(0);
  });

  test('должен обрабатывать полностью различные файлы', () => {
    const data1 = readFixture('empty1.json');
    const data2 = readFixture('empty2.json');
    const diff = genDiff(data1, data2);

    expect(diff).toHaveLength(2);
    expect(diff.find((item) => item.key === 'a').status).toBe('removed');
    expect(diff.find((item) => item.key === 'b').status).toBe('added');
  });
});

describe('formatDiff', () => {
  test('должен форматировать diff в виде строки с правильной структурой', () => {
    const data1 = readFixture('file1.json');
    const data2 = readFixture('file2.json');
    const diff = genDiff(data1, data2);
    const formatted = formatDiff(diff);

    expect(formatted).toContain('{');
    expect(formatted).toContain('}');
    expect(formatted).toContain('- follow: false');
    expect(formatted).toContain('- proxy: 123.234.53.22');
    expect(formatted).toContain('- timeout: 50');
    expect(formatted).toContain('+ timeout: 20');
    expect(formatted).toContain('+ verbose: true');
    expect(formatted).toContain('host: hexlet.io');
  });

  test('должен возвращать строковый тип', () => {
    const diff = genDiff(readFixture('file1.json'), readFixture('file2.json'));
    const formatted = formatDiff(diff);

    expect(typeof formatted).toBe('string');
  });
});

describe('Поддержка YAML', () => {
  test('должен корректно парсить YAML файл', () => {
    const data = readFixture('file1.yml');

    expect(data.host).toBe('hexlet.io');
    expect(data.timeout).toBe(50);
    expect(data.proxy).toBe('123.234.53.22');
    expect(data.follow).toBe(false);
  });

  test('должен обнаруживать удалённые ключи в YAML файлах', () => {
    const data1 = readFixture('file1.yml');
    const data2 = readFixture('file2.yml');
    const diff = genDiff(data1, data2);

    const removedKeys = diff
      .filter((item) => item.status === 'removed')
      .map((item) => item.key);

    expect(removedKeys).toContain('follow');
    expect(removedKeys).toContain('proxy');
  });

  test('должен обнаруживать добавленные ключи в YAML файлах', () => {
    const data1 = readFixture('file1.yml');
    const data2 = readFixture('file2.yml');
    const diff = genDiff(data1, data2);

    const addedKeys = diff
      .filter((item) => item.status === 'added')
      .map((item) => item.key);

    expect(addedKeys).toContain('verbose');
  });

  test('должен обнаруживать изменённые значения в YAML файлах', () => {
    const data1 = readFixture('file1.yml');
    const data2 = readFixture('file2.yml');
    const diff = genDiff(data1, data2);

    const changedItem = diff.find((item) => item.key === 'timeout');

    expect(changedItem).toBeDefined();
    expect(changedItem.status).toBe('changed');
    expect(changedItem.value1).toBe(50);
    expect(changedItem.value2).toBe(20);
  });

  test('должен обнаруживать неизменённые ключи в YAML файлах', () => {
    const data1 = readFixture('file1.yml');
    const data2 = readFixture('file2.yml');
    const diff = genDiff(data1, data2);

    const unchangedItem = diff.find((item) => item.key === 'host');

    expect(unchangedItem).toBeDefined();
    expect(unchangedItem.status).toBe('unchanged');
    expect(unchangedItem.value).toBe('hexlet.io');
  });

  test('должен корректно форматировать diff для YAML', () => {
    const data1 = readFixture('file1.yml');
    const data2 = readFixture('file2.yml');
    const diff = genDiff(data1, data2);
    const formatted = formatDiff(diff);

    expect(formatted).toContain('{');
    expect(formatted).toContain('}');
    expect(formatted).toContain('- follow: false');
    expect(formatted).toContain('- proxy: 123.234.53.22');
    expect(formatted).toContain('- timeout: 50');
    expect(formatted).toContain('+ timeout: 20');
    expect(formatted).toContain('+ verbose: true');
    expect(formatted).toContain('host: hexlet.io');
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
