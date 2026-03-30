import _ from 'lodash';

/**
 * Форматирует примитивное значение для вывода
 * @param {*} value - значение
 * @returns {string} - отформатированное значение
 */
function formatPrimitiveValue(value) {
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
  const getNestedValueIndent = (d) => ' '.repeat((d + 2) * indentSize);

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
    // Если добавленное значение — объект, форматируем его в несколько строк
    if (_.isPlainObject(item.value)) {
      const lines = formatObjectInline(item.value, getNestedValueIndent(depth));
      return [
        `${valueIndent}+ ${item.key}: {`,
        lines,
        `${valueIndent}  }`,
      ];
    }
    return `${valueIndent}+ ${item.key}: ${formatPrimitiveValue(item.value)}`;
  }

  if (item.status === 'removed') {
    return `${valueIndent}- ${item.key}: ${formatPrimitiveValue(item.value)}`;
  }

  if (item.status === 'unchanged') {
    return `${valueIndent}  ${item.key}: ${formatPrimitiveValue(item.value)}`;
  }

  if (item.status === 'changed') {
    const removedLine = `${valueIndent}- ${item.key}: ${formatPrimitiveValue(item.value1)}`;

    // Если новое значение — объект, форматируем его в несколько строк
    if (_.isPlainObject(item.value2)) {
      const lines = formatObjectInline(item.value2, getNestedValueIndent(depth));
      return [
        removedLine,
        `${valueIndent}+ ${item.key}: {`,
        lines,
        `${valueIndent}  }`,
      ];
    }

    const addedLine = `${valueIndent}+ ${item.key}: ${formatPrimitiveValue(item.value2)}`;
    return [removedLine, addedLine];
  }

  return '';
}

/**
 * Форматирует объект в одну строку с правильным отступом для вложенных ключей
 * @param {Object} obj - объект
 * @param {string} baseIndent - базовый отступ
 * @returns {string} - отформатированные строки
 */
function formatObjectInline(obj, baseIndent) {
  const lines = Object.entries(obj).map(([key, value]) => {
    const formattedValue = _.isObject(value) && !_.isNull(value)
      ? JSON.stringify(value)
      : value;
    return `${baseIndent}${key}: ${formattedValue}`;
  });
  return lines.join('\n');
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
