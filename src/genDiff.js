import _ from 'lodash';
import formatStylish from './formatters/stylish.js';

/**
 * Сравнивает два значения и возвращает информацию о различиях
 * @param {*} value1 - первое значение
 * @param {*} value2 - второе значение
 * @returns {Object} - объект с информацией о различиях
 */
function compareValues(value1, value2) {
  if (_.isEqual(value1, value2)) {
    return { status: 'unchanged', value: value1 };
  }
  return { status: 'changed', value1, value2 };
}

/**
 * Рекурсивно сравнивает два объекта и возвращает массив различий
 * @param {Object} data1 - первый объект
 * @param {Object} data2 - второй объект
 * @returns {Array} - массив объектов с информацией о различиях
 */
function genDiff(data1, data2) {
  const keys1 = Object.keys(data1);
  const keys2 = Object.keys(data2);
  const allKeys = _.union(keys1, keys2);
  const sortedKeys = _.sortBy(allKeys);

  return sortedKeys.map((key) => {
    const hasKey1 = _.has(data1, key);
    const hasKey2 = _.has(data2, key);

    if (!hasKey1) {
      return { key, value: data2[key], status: 'added' };
    }
    if (!hasKey2) {
      return { key, value: data1[key], status: 'removed' };
    }

    const value1 = data1[key];
    const value2 = data2[key];

    // Если оба значения - объекты (не массивы и не null), рекурсивно сравниваем
    if (_.isPlainObject(value1) && _.isPlainObject(value2)) {
      return {
        key,
        status: 'nested',
        children: genDiff(value1, value2),
      };
    }

    return { key, ...compareValues(value1, value2) };
  });
}

/**
 * Форматирует массив различий в строку (stylish форматер по умолчанию)
 * @param {Array} diff - массив различий
 * @returns {string} - отформатированная строка
 */
function formatDiff(diff) {
  return formatStylish(diff);
}

export { genDiff, formatDiff };
export default genDiff;
