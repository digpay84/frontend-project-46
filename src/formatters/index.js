import formatStylish from './stylish.js';
import formatPlain from './plain.js';

const formatters = {
  stylish: formatStylish,
  plain: formatPlain,
};

/**
 * Возвращает форматер по имени
 * @param {string} name - имя форматера
 * @returns {Function} - функция форматера
 */
function getFormatter(name) {
  const formatter = formatters[name];
  if (!formatter) {
    throw new Error(`Unknown format: ${name}`);
  }
  return formatter;
}

export { formatters, getFormatter };
export default getFormatter;
