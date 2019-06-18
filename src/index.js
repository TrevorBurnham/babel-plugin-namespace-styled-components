import postcssNested from 'postcss-nested';
import { loopWhile } from 'deasync';
import * as t from 'babel-types';
import {
  isCSSHelper,
  isStyled,
  isPureHelper,
  isInjectGlobalHelper,
} from 'babel-plugin-styled-components/lib/utils/detectors';
import detectInvalidSelector from './detectInvalidSelector';
import postcssSafeParser from './placeholderSafeParser';
import postcssNamespace from './postcssNamespace';

const makePlaceholder = index => `EXPRESSION_PLACEHOLDER_${index}`;
const PLACEHOLDER_PATTERN = /EXPRESSION_PLACEHOLDER_(\d+)/g;

const replacementNodes = new WeakSet();

const taggedTemplateVisitor = (path, state) => {
  const { namespace } = state.opts;
  const { node } = path;
  const {
    tag,
    quasi: { quasis, expressions },
  } = node;

  if (!namespace) throw new Error('option `namespace` must be provided');

  // Ignore nodes generated by this visitor, to prevent infinite loops
  if (replacementNodes.has(node)) return;

  // Ignore templates tagged with anything other than `styled(x)`
  if (isCSSHelper(t)(tag, state)) {
    detectInvalidSelector(path, state);
    return;
  }
  if (!isStyled(t)(tag, state)) return;
  if (isPureHelper(t)(tag, state)) return;
  if (isInjectGlobalHelper(t)(tag, state)) return;

  // Convert the tagged template to a string, with ${} expressions replaced with placeholders
  const originalStyleString = quasis
    .map((quasi, i) =>
      expressions[i] ? quasi.value.raw + makePlaceholder(i) : quasi.value.raw
    )
    .join('');

  // Run the string through postcss-nested to "unwrap" any nested style rules
  let postcssNestedResult;
  postcssNested
    .process(`& { ${originalStyleString} }`, {
      from: undefined,
      parser: postcssSafeParser,
    })
    .then(asyncResult => {
      postcssNestedResult = asyncResult;
    })
    .catch(err => {
      postcssNestedResult = err;
    });
  loopWhile(() => postcssNestedResult == null);
  if (postcssNestedResult instanceof Error) throw postcssNestedResult;

  // Run the string through our namespace plugin to prefix each selector with the given namespace
  let postcssNamespaceResult;
  postcssNamespace
    .process(
      postcssNestedResult.css,
      { from: undefined, parser: postcssSafeParser },
      { namespace }
    )
    .then(asyncResult => {
      postcssNamespaceResult = asyncResult;
    })
    .catch(err => {
      postcssNamespaceResult = err;
    });
  loopWhile(() => postcssNamespaceResult == null);
  if (postcssNamespaceResult instanceof Error) throw postcssNamespaceResult;

  // Replace the expression placeholders to form a new, properly namespaced tagged template
  const processedString = postcssNamespaceResult.css;
  const newTemplateStringChunks = [];
  const newTemplateExpressions = [];
  let placeholderMatch;
  let prevLastIndex = 0;

  while ((placeholderMatch = PLACEHOLDER_PATTERN.exec(processedString))) {
    const chunkBefore = processedString.slice(
      prevLastIndex,
      placeholderMatch.index
    );
    newTemplateStringChunks.push(chunkBefore);

    newTemplateExpressions.push(expressions[placeholderMatch[1]]);

    prevLastIndex = PLACEHOLDER_PATTERN.lastIndex;
  }
  newTemplateStringChunks.push(processedString.slice(prevLastIndex));
  PLACEHOLDER_PATTERN.lastIndex = 0;

  // Insert the replacement node and store a reference to prevent us from reprocessing it
  const replacementNode = t.taggedTemplateExpression(
    tag,
    t.templateLiteral(
      newTemplateStringChunks.map((str, i) =>
        t.templateElement(
          { raw: str, cooked: str.replace(/\\\\/g, '\\') },
          i === newTemplateStringChunks.length - 1
        )
      ),
      newTemplateExpressions
    )
  );
  replacementNodes.add(replacementNode);
  path.replaceWith(replacementNode);
};

const throwIfAfterStyledComponentsPlugin = plugins => {
  let styledComponentsPluginIndex = -1;
  let thisPluginIndex = -1;
  plugins.forEach(([plugin], index) => {
    if (plugin.key === 'styled-components') {
      styledComponentsPluginIndex = index;
    } else if (plugin.pre === pre) {
      thisPluginIndex = index;
    }
  });
  if (
    styledComponentsPluginIndex !== -1 &&
    styledComponentsPluginIndex < thisPluginIndex
  ) {
    throw new Error(
      '`babel-plugin-namespace-styled-components` must be defined before the ' +
        '`styled-components` plugin'
    );
  }
};

let isFirstVisit = true;

const pre = state => {
  if (isFirstVisit) {
    throwIfAfterStyledComponentsPlugin(state.opts.plugins),
      (isFirstVisit = false);
  }
};

export default function() {
  return {
    pre,
    visitor: {
      TaggedTemplateExpression: taggedTemplateVisitor,
    },
  };
}
