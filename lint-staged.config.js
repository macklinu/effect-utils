export default {
  '*.{js,jsx,ts,tsx}': ['oxlint --fix', 'prettier --write'],
  '*.{md,yaml,yml,json}': ['prettier --write'],
}
