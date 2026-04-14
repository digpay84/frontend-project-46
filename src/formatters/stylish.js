import _ from 'lodash'

/**
 * Форматирует примитивное значение для вывода
 * @param {*} value - значение
 * @returns {string} - отформатированное значение
 */
function formatPrimitiveValue(value) {
  if (_.isBoolean(value)) {
    return value
  }
  if (_.isNull(value)) {
    return 'null'
  }
  if (_.isObject(value)) {
    return JSON.stringify(value)
  }
  return value
}

/**
 * Форматирует объект в несколько строк с рекурсивным раскрытием
 * @param {Object} obj - объект
 * @param {string} contentIndent - отступ для содержимого
 * @returns {string} - отформатированные строки
 */
function formatObjectMultiline(obj, contentIndent) {
  const indentSize = 4

  const lines = Object.entries(obj).map(([key, value]) => {
    const indent = contentIndent + ' '.repeat(indentSize)
    if (_.isPlainObject(value)) {
      const nestedLines = formatObjectMultiline(value, indent)
      return [
        `${indent}${key}: {`,
        nestedLines,
        `${indent}}`,
      ].flat()
    }
    const formattedValue = formatPrimitiveValue(value)
    return `${indent}${key}: ${formattedValue}`
  })

  return lines.flat().join('\n')
}

/**
 * Рекурсивно форматирует узел дифа в строку
 * @param {Object} item - узел дифа
 * @param {number} depth - текущая глубина
 * @returns {string|string[]} - отформатированная строка или массив строк
 */
function formatNode(item, depth) {
  const indentSize = 4
  const getKeyIndent = d => ' '.repeat((d + 1) * indentSize)
  const getValueIndent = d => ' '.repeat(d * indentSize + 2)

  if (item.status === 'nested') {
    const formattedChildren = formatStylish(item.children, depth + 1)
    return [
      `${getKeyIndent(depth)}${item.key}: {`,
      formattedChildren,
      `${getKeyIndent(depth)}}`,
    ]
  }

  const valueIndent = getValueIndent(depth)
  // Для содержимого объектов используем тот же отступ что и valueIndent
  const objectContentIndent = ' '.repeat(depth * indentSize + 4)

  if (item.status === 'added') {
    // Если добавленное значение — объект, форматируем его в несколько строк
    if (_.isPlainObject(item.value)) {
      const lines = formatObjectMultiline(item.value, objectContentIndent)
      return [
        `${valueIndent}+ ${item.key}: {`,
        lines,
        `${valueIndent}  }`,
      ]
    }
    return `${valueIndent}+ ${item.key}: ${formatPrimitiveValue(item.value)}`
  }

  if (item.status === 'removed') {
    // Если удалённое значение — объект, форматируем его в несколько строк
    if (_.isPlainObject(item.value)) {
      const lines = formatObjectMultiline(item.value, objectContentIndent)
      return [
        `${valueIndent}- ${item.key}: {`,
        lines,
        `${valueIndent}  }`,
      ]
    }
    return `${valueIndent}- ${item.key}: ${formatPrimitiveValue(item.value)}`
  }

  if (item.status === 'unchanged') {
    // Если неизменённое значение — объект, форматируем его в несколько строк
    if (_.isPlainObject(item.value)) {
      const lines = formatObjectMultiline(item.value, objectContentIndent)
      return [
        `${valueIndent}  ${item.key}: {`,
        lines,
        `${valueIndent}  }`,
      ]
    }
    return `${valueIndent}  ${item.key}: ${formatPrimitiveValue(item.value)}`
  }

  if (item.status === 'changed') {
    // Если старое значение — объект, форматируем его в несколько строк
    if (_.isPlainObject(item.value1)) {
      const removedLines = formatObjectMultiline(item.value1, objectContentIndent)
      const result = [`${valueIndent}- ${item.key}: {`, removedLines, `${valueIndent}  }`]

      // Если новое значение — объект, форматируем его в несколько строк
      if (_.isPlainObject(item.value2)) {
        const addedLines = formatObjectMultiline(item.value2, objectContentIndent)
        result.push(`${valueIndent}+ ${item.key}: {`)
        result.push(addedLines)
        result.push(`${valueIndent}  }`)
      }
      else {
        result.push(`${valueIndent}+ ${item.key}: ${formatPrimitiveValue(item.value2)}`)
      }

      return result
    }

    const removedLine = `${valueIndent}- ${item.key}: ${formatPrimitiveValue(item.value1)}`

    // Если новое значение — объект, форматируем его в несколько строк
    if (_.isPlainObject(item.value2)) {
      const addedLines = formatObjectMultiline(item.value2, objectContentIndent)
      return [
        removedLine,
        `${valueIndent}+ ${item.key}: {`,
        addedLines,
        `${valueIndent}  }`,
      ]
    }

    const addedLine = `${valueIndent}+ ${item.key}: ${formatPrimitiveValue(item.value2)}`
    return [removedLine, addedLine]
  }

  return ''
}

/**
 * Форматирует массив различий в строку (stylish форматер)
 * @param {Array} diff - массив различий
 * @param {number} depth - текущая глубина вложенности
 * @returns {string} - отформатированная строка
 */
function formatStylish(diff, depth = 0) {
  const lines = diff.flatMap(item => formatNode(item, depth))

  // Если это корневой уровень, оборачиваем в фигурные скобки
  if (depth === 0) {
    return ['{', lines.join('\n'), '}'].join('\n')
  }

  return lines.join('\n')
}

export default formatStylish
