import path from 'path';
import React from 'react';
import renderer from 'react-test-renderer';
import { transformFileSync } from 'babel-core';
import 'jest-styled-components';

const evalFixture = filename => {
  const { code } = transformFileSync(filename, {
    plugins: [
      [path.join(__dirname, '../index.js'), { namespace: '.namespace' }],
    ],
  });

  if (code == null) throw new Error(`Fixture not found: ${filename}`);

  return eval(code);
};

describe('styled-components output', () => {
  test('for a style block with no selectors', () => {
    const Simple = evalFixture(path.join(__dirname, 'fixtures/simple.js'));
    expect(
      renderer.create(<Simple backgroundColor="#333" />).toJSON()
    ).toMatchSnapshot();
  });

  test('for a style block with &&', () => {
    const Input = evalFixture(
      path.join(__dirname, 'fixtures/doubleAmpersand.js')
    );
    expect(
      renderer
        .create(<Input borderWidth="1px" borderColor="fuchsia" />)
        .toJSON()
    ).toMatchSnapshot();
  });

  test('for a style block with a sibling selector', () => {
    const Button = evalFixture(
      path.join(__dirname, 'fixtures/siblingSelector.js')
    );
    expect(
      renderer.create(<Button padding="4px" spaceBetween="8px" />).toJSON()
    ).toMatchSnapshot();
  });

  test('for a style block with interpolated selectors', () => {
    const Parent = evalFixture(
      path.join(__dirname, 'fixtures/interpolatedSelector.js')
    );
    expect(
      renderer
        .create(
          <Parent childStyles="transform: scale(90%);" spaceBetween="12px" />
        )
        .toJSON()
    ).toMatchSnapshot();
  });

  test('for a style block with interpolated mixins', () => {
    const Menu = evalFixture(
      path.join(__dirname, 'fixtures/interpolatedMixin.js')
    );
    expect(renderer.create(<Menu />).toJSON()).toMatchSnapshot();
  });

  test('for a style block with interpolations before and afer a selector', () => {
    const Span = evalFixture(
      path.join(__dirname, 'fixtures/interpolationSandwich.js')
    );
    expect(renderer.create(<Span />).toJSON()).toMatchSnapshot();
  });
});
