import path from 'node:path'
import yaml from 'js-yaml'

/**
 * Парсит содержимое файла в зависимости от расширения
 * @param {string} content - содержимое файла
 * @param {string} filepath - путь к файлу для определения расширения
 * @returns {Object} - распарсенный объект
 */
function parseFile(content, filepath) {
  const ext = path.extname(filepath).toLowerCase()

  switch (ext) {
  case '.json':
    return JSON.parse(content)
  case '.yml':
  case '.yaml':
    return yaml.load(content)
  default:
    throw new Error(`Unsupported file extension: ${ext}`)
  }
}

export { parseFile }
