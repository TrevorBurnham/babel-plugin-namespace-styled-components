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
      title: 'namespaces a style block with interpolated mixins',
      fixture: path.join(__dirname, 'fixtures/interpolatedMixin.js'),
    },

    {
      title:
        'namespaces a style block with interpolations before and after a declaration',
      fixture: path.join(__dirname, 'fixtures/interpolationSandwich.js'),
    },

    {
      title: 'namespaces a style block with a media query',
      fixture: path.join(__dirname, 'fixtures/mediaQuery.js'),
    },

    {
      title: 'does not namespace style blocks in helpers',
      fixture: path.join(__dirname, 'fixtures/helpers.js'),
      snapshot: false,
    },

    {
      title: 'does not modify any code if namespace is undefined',
      fixture: path.join(__dirname, 'fixtures/simple.js'),
      pluginOptions: {
        namespace: undefined,
      },
      snapshot: false,
    },

    {
      title: 'throws an error if the styles can’t be parsed',
      fixture: path.join(__dirname, 'fixtures/malformatted.js'),
      snapshot: false,
      error: /Unexpected '\/'/,
    },

    {
      title: 'throws an error if a mixin uses &&',
      fixture: path.join(__dirname, 'fixtures/invalidMixin.js'),
      snapshot: false,
      error: /`&&` selector in mixin will break when namespaced/,
    },

    {
      title:
        'throws an error if a mixin uses && even if namespace is undefined',
      fixture: path.join(__dirname, 'fixtures/invalidMixin.js'),
      pluginOptions: {
        namespace: undefined,
      },
      snapshot: false,
      error: /`&&` selector in mixin will break when namespaced/,
    },
  ],
});
