module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // nueva funcionalidad
        'fix', // corrección de bug
        'docs', // cambios en documentación
        'style', // formato (espacios, comas…)
        'refactor', // refactor de código
        'test', // pruebas
        'chore', // tareas varias
      ],
    ],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
  },
};
