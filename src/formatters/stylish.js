import _ from 'lodash';

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

/**
 * Рекурсивно форматирует узел дифа в строку
 * @param {Object} item - узел дифа
 * @param {number} depth - текущая глубина
 * @returns {string|string[]} - отформатированная строка или массив строк
 */
function formatNode(item, depth) {
  const indentSize = 4;
  const getKeyIndent = (d) => ' '.repeat((d + 1) * indentSize);
  const getValueIndent = (d) => ' '.repeat(d * indentSize + 2);

  if (item.status === 'nested') {
    const formattedChildren = formatStylish(item.children, depth + 1);
    return [
      `${getKeyIndent(depth)}${item.key}: {`,
      formattedChildren,
      `${getKeyIndent(depth)}}`,
    ];
  }

  const valueIndent = getValueIndent(depth);

  if (item.status === 'added') {
    return `${valueIndent}+ ${item.key}: ${formatValue(item.value)}`;
  }
  if (item.status === 'removed') {
    return `${valueIndent}- ${item.key}: ${formatValue(item.value)}`;
  }
  if (item.status === 'unchanged') {
    return `${valueIndent}  ${item.key}: ${formatValue(item.value)}`;
  }
  if (item.status === 'changed') {
    return [
      `${valueIndent}- ${item.key}: ${formatValue(item.value1)}`,
      `${valueIndent}+ ${item.key}: ${formatValue(item.value2)}`,
    ];
  }
  return '';
}

/**
 * Форматирует массив различий в строку (stylish форматер)
 * @param {Array} diff - массив различий
 * @param {number} depth - текущая глубина вложенности
 * @returns {string} - отформатированная строка
 */
function formatStylish(diff, depth = 0) {
  const lines = diff.flatMap((item) => formatNode(item, depth));

  // Если это корневой уровень, оборачиваем в фигурные скобки
  if (depth === 0) {
    return ['{', lines.join('\n'), '}'].join('\n');
  }

  return lines.join('\n');
}

export default formatStylish;
