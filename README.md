### Hexlet tests and linter status:

[![Actions Status](https://github.com/digpay84/frontend-project-46/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/digpay84/frontend-project-46/actions)
[![Tests](https://github.com/digpay84/frontend-project-46/actions/workflows/tests.yml/badge.svg)](https://github.com/digpay84/frontend-project-46/actions/workflows/tests.yml)
[![Test Coverage](https://sonarcloud.io/api/project_badges/measure?project=frontend-project-46&metric=coverage)](https://sonarcloud.io/dashboard?id=frontend-project-46)

## gendiff

Утилита для сравнения конфигурационных файлов и показа разницы между ними. Поддерживает форматы JSON и YAML, а также вложенные структуры.

### Установка

```bash
npm install
```

### Использование

```bash
gendiff filepath1.json filepath2.json
gendiff filepath1.yml filepath2.yml
gendiff filepath1.yaml filepath2.yaml
gendiff -f stylish filepath1.json filepath2.json  # формат stylish (по умолчанию)
gendiff -f plain filepath1.json filepath2.json    # формат plain
gendiff -f json filepath1.json filepath2.json     # формат json
```

### Пример работы

[![asciicast](https://asciinema.org/a/placeholder.svg)](https://asciinema.org/a/placeholder)

### Пример вывода (формат stylish)

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

### Пример вывода для вложенных структур (формат stylish)

```
gendiff nested1.json nested2.json

{
    common: {
      + follow: false
        setting1: Value 1
      - setting2: 200
      - setting3: true
      + setting3: null
      + setting4: blah blah
      + setting5: {"key5":"value5"}
        setting6: {
            doge: {
              - wow:
              + wow: so much
            }
            key: value
          + ops: vops
        }
    }
    group1: {
      - baz: bas
      + baz: bars
        foo: bar
      - nest: {"key":"value"}
      + nest: str
    }
  - group2: {"abc":12345,"deep":{"id":45}}
  + group3: {"deep":{"id":{"number":45}},"fee":100500}
}
```

### Пример вывода (формат plain)

```
gendiff --format plain nested1.json nested2.json

Property 'common.follow' was added with value: false
Property 'common.setting2' was removed
Property 'common.setting3' was updated. From true to null
Property 'common.setting4' was added with value: 'blah blah'
Property 'common.setting5' was added with value: [complex value]
Property 'common.setting6.doge.wow' was updated. From '' to 'so much'
Property 'common.setting6.ops' was added with value: 'vops'
Property 'group1.baz' was updated. From 'bas' to 'bars'
Property 'group1.nest' was updated. From [complex value] to 'str'
Property 'group2' was removed
Property 'group3' was added with value: [complex value]
```

### Пример вывода (формат json)

```
gendiff --format json nested1.json nested2.json

{
  "common": {
    "status": "nested",
    "value": {
      "follow": {
        "status": "added",
        "value": false
      },
      "setting1": {
        "status": "unchanged",
        "value": "Value 1"
      },
      "setting2": {
        "status": "removed",
        "value": 200
      },
      "setting3": {
        "status": "changed",
        "value1": true,
        "value2": null
      }
    }
  },
  "group2": {
    "status": "removed",
    "value": {
      "abc": 12345,
      "deep": {
        "id": 45
      }
    }
  },
  "group3": {
    "status": "added",
    "value": {
      "deep": {
        "id": {
          "number": 45
        }
      },
      "fee": 100500
    }
  }
}
```

### Описание форматов вывода

#### stylish (формат по умолчанию)

- `-` — ключ присутствует только в первом файле (удалён)
- `+` — ключ присутствует только во втором файле (добавлен)
- без префикса (два пробела) — ключ есть в обоих файлах с одинаковым значением
- две строки с `-` и `+` — ключ есть в обоих файлах, но значения различаются
- `{` и `}` — обозначают вложенные объекты

#### plain

- `Property '<путь>' was added with value: <значение>` — свойство добавлено
- `Property '<путь>' was removed` — свойство удалено
- `Property '<путь>' was updated. From <старое> to <новое>` — свойство изменено
- `[complex value]` — обозначение сложного значения (объекта)
- Для вложенных свойств указывается полный путь через точку (например, `common.setting6.doge.wow`)

#### json

Структурированный вывод в формате JSON. Каждый ключ содержит объект со свойствами:

- `status: "added"` — свойство добавлено, есть поле `value`
- `status: "removed"` — свойство удалено, есть поле `value`
- `status: "unchanged"` — свойство не изменено, есть поле `value`
- `status: "changed"` — свойство изменено, есть поля `value1` и `value2`
- `status: "nested"` — вложенный объект, есть поле `value` с рекурсивной структурой

### Лицензия

ISC
