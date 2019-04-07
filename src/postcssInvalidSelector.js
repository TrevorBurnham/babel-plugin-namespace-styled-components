import postcss from 'postcss';

const DOUBLE_AMPERSAND = /&&/;

module.exports = postcss.plugin('postcss-invalid-selector-plugin', function() {
  return function(root) {
    root.walkRules(rule => {
      const { selector } = rule;
      if (DOUBLE_AMPERSAND.test(selector)) {
        throw rule.error('`&&` selector in mixin will break when namespaced', {
          word: '&&',
        });
      }
    });
  };
});
