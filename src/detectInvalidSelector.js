import { loopWhile } from 'deasync';
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

  let postcssInvalidSelectorResult;
  postcssInvalidSelector
    .process(`& { ${originalStyleString} }`, {
      from: undefined,
      parser: postcssSafeParser,
    })
    .then(() => {
      postcssInvalidSelectorResult = 0;
    })
    .catch(err => {
      postcssInvalidSelectorResult = err;
    });

  loopWhile(() => postcssInvalidSelectorResult == null);
  if (postcssInvalidSelectorResult instanceof Error)
    throw postcssInvalidSelectorResult;
};

export default detectInvalidSelector;
