module.exports = {

  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended'
  ], //使用推荐的React代码检测规范
  plugins: ['@typescript-eslint'],
  env: {
    browser: true,
    node: true,
  },
  settings: { //自动发现React的版本，从而进行规范react代码
    "react": {
      "pragma": "React",
      "version": "detect"
    }
  },
  parserOptions: { //指定ESLint可以解析JSX语法
    "ecmaVersion": 2019,
    "sourceType": 'module',
    "ecmaFeatures": {
      jsx: true
    }
  },
  rules: {
    "no-unused-vars": 1,
    "@typescript-eslint/no-unused-vars": ["error"],
    "@typescript-eslint/interface-name-prefix": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "react/display-name": 0,
    '@typescript-eslint/member-delimiter-style': 'off',
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/no-unused-vars": "off"
  }
}