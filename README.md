### Hexlet tests and linter status:

[![Actions Status](https://github.com/digpay84/frontend-project-46/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/digpay84/frontend-project-46/actions)
[![Tests](https://github.com/digpay84/frontend-project-46/actions/workflows/tests.yml/badge.svg)](https://github.com/digpay84/frontend-project-46/actions/workflows/tests.yml)
[![Test Coverage](https://sonarcloud.io/api/project_badges/measure?project=frontend-project-46&metric=coverage)](https://sonarcloud.io/dashboard?id=frontend-project-46)

## gendiff

Утилита для сравнения конфигурационных файлов и показа разницы между ними.

### Установка

```bash
npm install
```

### Использование

```bash
gendiff filepath1.json filepath2.json
```

### Пример работы

[![asciicast](https://asciinema.org/a/placeholder.svg)](https://asciinema.org/a/placeholder)

### Пример вывода

```
gendiff file1.json file2.json

{
  - follow: false
    host: hexlet.io
  - proxy: 123.234.53.22
  - timeout: 50
  + timeout: 20
  + verbose: true
}
```

### Описание формата вывода

- `-` — ключ присутствует только в первом файле (удалён)
- `+` — ключ присутствует только во втором файле (добавлен)
- без префикса — ключ есть в обоих файлах с одинаковым значением
- две строки с `-` и `+` — ключ есть в обоих файлах, но значения различаются

### Лицензия

ISC
