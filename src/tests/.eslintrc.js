module.exports = {
  plugins: ['jest', 'react'],
  extends: ['plugin:jest/recommended', 'plugin:react/recommended'],
  rules: {
    'react/prop-types': 'off',
  },
};
