import postcssNested from 'postcss-nested';
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

  // If no namespace is given, skip processing (this mode is just to confirm compatibility)
  if (!namespace) return;

  // Convert the tagged template to a string, with ${} expressions replaced with placeholders
  const originalStyleString = quasis
    .map((quasi, i) =>
      expressions[i] ? quasi.value.raw + makePlaceholder(i) : quasi.value.raw
    )
    .join('');

  // Run the string through postcss-nested to "unwrap" any nested style rules
  const postcssNestedResult = postcssNested
      .process(`& { ${originalStyleString} }`, {
          from: undefined,
          parser: postcssSafeParser,
        }).css

  // Run the string through our namespace plugin to prefix each selector with the given namespace
  const postcssNamespaceResult = postcssNamespace
    .process(
      postcssNestedResult,
      { from: undefined, parser: postcssSafeParser },
      { namespace }
    ).css

  // Replace the expression placeholders to form a new, properly namespaced tagged template
  const processedString = postcssNamespaceResult;
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
  let styledComponentsPluginKey;
  plugins.find((p, index) => {
    const plugin = Array.isArray(p) ? p[0] : p
    if (plugin.key.match(/^(babel-plugin-)?styled-components$/)) {
      styledComponentsPluginIndex = index;
      styledComponentsPluginKey = plugin.key;
    } else if (plugin.pre === pre) {
      if (
        styledComponentsPluginIndex !== -1 &&
        styledComponentsPluginIndex < index
      ) {
        throw new Error(
          `"${plugin.key}" must come before "${styledComponentsPluginKey}" ` +
            'in the Babel `plugins` list'
        );
      }
      return true;
    }
    return false;
  });
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
