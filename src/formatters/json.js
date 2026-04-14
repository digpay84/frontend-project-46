/**
 * Рекурсивно преобразует узел дифа в JSON-совместимый объект
 * @param {Object} item - узел дифа
 * @returns {Object} - JSON-совместимый объект
 */
function convertNode(item) {
  if (item.status === 'nested') {
    const childrenObj = formatJson(item.children)
    return {
      status: item.status,
      value: childrenObj,
    }
  }

  if (item.status === 'added') {
    return {
      status: item.status,
      value: item.value,
    }
  }

  if (item.status === 'removed') {
    return {
      status: item.status,
      value: item.value,
    }
  }

  if (item.status === 'unchanged') {
    return {
      status: item.status,
      value: item.value,
    }
  }

  if (item.status === 'changed') {
    return {
      status: item.status,
      value1: item.value1,
      value2: item.value2,
    }
  }

  return {}
}

/**
 * Форматирует массив различий в JSON объект
 * @param {Array} diff - массив различий
 * @returns {Object} - JSON объект
 */
function formatJson(diff) {
  return diff.reduce((acc, item) => {
    acc[item.key] = convertNode(item)
    return acc
  }, {})
}

/**
 * Форматирует массив различий в JSON строку
 * @param {Array} diff - массив различий
 * @returns {string} - JSON строка
 */
function formatJsonString(diff) {
  const result = formatJson(diff)
  return JSON.stringify(result, null, 2)
}

export { formatJson, formatJsonString }
export default formatJsonString
