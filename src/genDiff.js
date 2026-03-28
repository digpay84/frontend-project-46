import _ from 'lodash';

/**
 * Сравнивает два объекта и возвращает массив различий
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
    const value1 = data1[key];
    const value2 = data2[key];

    if (!hasKey1) {
      return { key, value: value2, status: 'added' };
    }
    if (!hasKey2) {
      return { key, value: value1, status: 'removed' };
    }
    if (_.isEqual(value1, value2)) {
      return { key, value: value1, status: 'unchanged' };
    }
    return { key, value1, value2, status: 'changed' };
  });
}

/**
 * Форматирует массив различий в строку
 * @param {Array} diff - массив различий
 * @returns {string} - отформатированная строка
 */
function formatDiff(diff) {
  const lines = diff.map((item) => {
    if (item.status === 'added') {
      return `  + ${item.key}: ${formatValue(item.value)}`;
    }
    if (item.status === 'removed') {
      return `  - ${item.key}: ${formatValue(item.value)}`;
    }
    if (item.status === 'unchanged') {
      return `    ${item.key}: ${formatValue(item.value)}`;
    }
    if (item.status === 'changed') {
      return [
        `  - ${item.key}: ${formatValue(item.value1)}`,
        `  + ${item.key}: ${formatValue(item.value2)}`,
      ].join('\n');
    }
    return '';
  });

  return ['{', lines.join('\n'), '}'].join('\n');
}

/**
 * Форматирует значение для вывода
 * @param {*} value - значение
 * @returns {string} - отформатированное значение
 */
function formatValue(value) {
  if (_.isObject(value) && !_.isNull(value)) {
    return JSON.stringify(value);
  }
  if (_.isBoolean(value)) {
    return value;
  }
  return value;
}

export { genDiff, formatDiff };
