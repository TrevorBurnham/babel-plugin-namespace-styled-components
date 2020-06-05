import postcssInvalidSelector from './postcssInvalidSelector';
import postcssSafeParser from './placeholderSafeParser';

const detectInvalidSelector = path => {
  const { node } = path;
  const {
    quasi: { quasis, expressions },
  } = node;

  const originalStyleString = quasis
    .map((quasi, i) =>
      expressions[i] ? quasi.value.raw + 'EXPRESSION' : quasi.value.raw
    )
    .join('');

  postcssInvalidSelector
    .process(`& { ${originalStyleString} }`, {
      from: undefined,
      parser: postcssSafeParser,
    }).css
};

export default detectInvalidSelector;
