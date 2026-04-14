import _ from 'lodash'

/**
 * Форматирует значение для вывода
 * @param {*} value - значение
 * @returns {string} - отформатированное значение
 */
function formatValue(value) {
  if (_.isObject(value) && !_.isNull(value)) {
    return '[complex value]'
  }
  if (_.isBoolean(value)) {
    return value
  }
  if (_.isString(value)) {
    return `'${value}'`
  }
  if (_.isNull(value)) {
    return 'null'
  }
  return value
}

/**
 * Рекурсивно форматирует узел дифа в строку (plain форматер)
 * @param {Object} item - узел дифа
 * @param {string} path - текущий путь к ключу
 * @returns {string|string[]} - отформатированная строка или массив строк
 */
function formatNode(item, path) {
  const currentPath = path ? `${path}.${item.key}` : item.key

  if (item.status === 'nested') {
    return formatPlain(item.children, currentPath)
  }

  if (item.status === 'added') {
    return `Property '${currentPath}' was added with value: ${formatValue(item.value)}`
  }
  if (item.status === 'removed') {
    return `Property '${currentPath}' was removed`
  }
  if (item.status === 'unchanged') {
    return null
  }
  if (item.status === 'changed') {
    return `Property '${currentPath}' was updated. From ${formatValue(item.value1)} to ${formatValue(item.value2)}`
  }
  return null
}

/**
 * Форматирует массив различий в строку (plain форматер)
 * @param {Array} diff - массив различий
 * @param {string} path - текущий путь
 * @returns {string} - отформатированная строка
 */
function formatPlain(diff, path = '') {
  const lines = diff
    .flatMap((item) => formatNode(item, path))
    .filter((line) => line !== null)

  return lines.join('\n')
}

export default formatPlain
