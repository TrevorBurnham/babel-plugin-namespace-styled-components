import postcss from 'postcss';

export default postcss.plugin('postcss-namespace', options => root => {
  const { namespace } = options;
  root.walkRules(rule => {
    rule.selectors = rule.selectors.map(selector => `${namespace} ${selector}`);
  });
});
