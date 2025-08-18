module.exports = {
  extends: ['@nuxt/eslint-config', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'warn',
    'no-console': 'warn',
    'no-unused-vars': 'warn',
  },
}
