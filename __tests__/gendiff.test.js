import { describe, expect, test } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { genDiff, formatDiff } from '../src/genDiff.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesPath = path.join(__dirname, '..', '__fixtures__');

const readFixture = (filename) => {
  const filePath = path.join(fixturesPath, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

describe('genDiff', () => {
  test('should detect removed keys', () => {
    const data1 = readFixture('file1.json');
    const data2 = readFixture('file2.json');
    const diff = genDiff(data1, data2);

    const removedKeys = diff
      .filter((item) => item.status === 'removed')
      .map((item) => item.key);

    expect(removedKeys).toContain('follow');
    expect(removedKeys).toContain('proxy');
  });

  test('should detect added keys', () => {
    const data1 = readFixture('file1.json');
    const data2 = readFixture('file2.json');
    const diff = genDiff(data1, data2);

    const addedKeys = diff
      .filter((item) => item.status === 'added')
      .map((item) => item.key);

    expect(addedKeys).toContain('verbose');
  });

  test('should detect changed values', () => {
    const data1 = readFixture('file1.json');
    const data2 = readFixture('file2.json');
    const diff = genDiff(data1, data2);

    const changedItem = diff.find((item) => item.key === 'timeout');

    expect(changedItem).toBeDefined();
    expect(changedItem.status).toBe('changed');
    expect(changedItem.value1).toBe(50);
    expect(changedItem.value2).toBe(20);
  });

  test('should detect unchanged keys', () => {
    const data1 = readFixture('file1.json');
    const data2 = readFixture('file2.json');
    const diff = genDiff(data1, data2);

    const unchangedItem = diff.find((item) => item.key === 'host');

    expect(unchangedItem).toBeDefined();
    expect(unchangedItem.status).toBe('unchanged');
    expect(unchangedItem.value).toBe('hexlet.io');
  });

  test('should sort keys alphabetically', () => {
    const data1 = readFixture('file1.json');
    const data2 = readFixture('file2.json');
    const diff = genDiff(data1, data2);

    const keys = diff.map((item) => item.key);
    const sortedKeys = [...keys].sort();

    expect(keys).toEqual(sortedKeys);
  });

  test('should return empty diff for identical files', () => {
    const data1 = readFixture('same1.json');
    const data2 = readFixture('same2.json');
    const diff = genDiff(data1, data2);

    const changedItems = diff.filter((item) => item.status !== 'unchanged');

    expect(changedItems).toHaveLength(0);
  });

  test('should handle completely different files', () => {
    const data1 = readFixture('empty1.json');
    const data2 = readFixture('empty2.json');
    const diff = genDiff(data1, data2);

    expect(diff).toHaveLength(2);
    expect(diff.find((item) => item.key === 'a').status).toBe('removed');
    expect(diff.find((item) => item.key === 'b').status).toBe('added');
  });
});

describe('formatDiff', () => {
  test('should format diff as string with correct structure', () => {
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

  test('should return string type', () => {
    const diff = genDiff(readFixture('file1.json'), readFixture('file2.json'));
    const formatted = formatDiff(diff);

    expect(typeof formatted).toBe('string');
  });
});
