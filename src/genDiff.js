import _ from 'lodash'
import formatStylish from './formatters/stylish.js'
import { getFormatter } from '../src/formatters/index.js'
import { parseFile } from '../src/parsers.js'
import fs from 'node:fs'

/**
 * Сравнивает два значения и возвращает информацию о различиях
 * @param {*} value1 - первое значение
 * @param {*} value2 - второе значение
 * @returns {Object} - объект с информацией о различиях
 */
function compareValues(value1, value2) {
  if (_.isEqual(value1, value2)) {
    return { status: 'unchanged', value: value1 }
  }
  return { status: 'changed', value1, value2 }
}

/**
 * Рекурсивно сравнивает два объекта и возвращает массив различий
 * @param {Object} data1 - первый объект
 * @param {Object} data2 - второй объект
 * @returns {Array} - массив объектов с информацией о различиях
 */
function compareData(data1, data2) {
  const keys1 = Object.keys(data1)
  const keys2 = Object.keys(data2)
  const allKeys = _.union(keys1, keys2)
  const sortedKeys = _.sortBy(allKeys)

  const result = sortedKeys.map((key) => {
    const hasKey1 = _.has(data1, key)
    const hasKey2 = _.has(data2, key)

    if (!hasKey1) {
      return { key, value: data2[key], status: 'added' }
    }
    if (!hasKey2) {
      return { key, value: data1[key], status: 'removed' }
    }

    const value1 = data1[key]
    const value2 = data2[key]

    // Если оба значения - объекты (не массивы и не null), рекурсивно сравниваем
    if (_.isPlainObject(value1) && _.isPlainObject(value2)) {
      return {
        key,
        status: 'nested',
        children: compareData(value1, value2),
      }
    }

    return { key, ...compareValues(value1, value2) }
  })

  return result
}

/**
 * Сравнивает два файла и возвращает отформатированный результат
 * @param {string} filepath1 - путь к первому файлу
 * @param {string} filepath2 - путь ко второму файлу
 * @param {Object} options - опции форматирования
 * @returns {string} - отформатированный результат
 */
function genDiff(filepath1, filepath2, format) {
  const file1 = fs.readFileSync(filepath1, 'utf8')
  const file2 = fs.readFileSync(filepath2, 'utf8')
  const data1 = parseFile(file1, filepath1)
  const data2 = parseFile(file2, filepath2)

  const diff = compareData(data1, data2)
  const formatter = getFormatter(format || 'stylish')
  return formatter(diff)
}

/**
 * Форматирует массив различий в строку (stylish форматер по умолчанию)
 * @param {Array} diff - массив различий
 * @returns {string} - отформатированная строка
 */
function formatDiff(diff) {
  return formatStylish(diff)
}

export { genDiff, formatDiff, compareData }
export default genDiff
