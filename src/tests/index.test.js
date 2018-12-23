import pluginTester from 'babel-plugin-tester';
import path from 'path';
import plugin from '../index';

pluginTester({
  plugin,
  pluginName: 'namespace-styled-components',
  pluginOptions: {
    namespace: '.namespace',
  },
  filename: __filename,
  snapshot: true,
  tests: [
    {
      title: 'namespaces a style block with no selectors',
      fixture: path.join(__dirname, 'fixtures/simple.js'),
    },

    {
      title: 'namespaces a style block with &&',
      fixture: path.join(__dirname, 'fixtures/doubleAmpersand.js'),
    },

    {
      title: 'namespaces a style block with a sibling selector',
      fixture: path.join(__dirname, 'fixtures/siblingSelector.js'),
    },

    {
      title: 'namespaces a style block with interpolated selectors',
      fixture: path.join(__dirname, 'fixtures/interpolatedSelector.js'),
    },

    {
      title: 'does not namespace style blocks in helpers',
      fixture: path.join(__dirname, 'fixtures/helpers.js'),
      snapshot: false,
    },

    {
      title: 'throws an error if no namespace is defined',
      fixture: path.join(__dirname, 'fixtures/simple.js'),
      pluginOptions: {
        namespace: undefined,
      },
      snapshot: false,
      error: /option `namespace` must be provided/,
    },
  ],
});
