/** Based on https://github.com/postcss/postcss-safe-parser
 * The only difference is that "unknown words" are treated as declarations instead of empty space.
 * This ensures that interpolated declarations in code like
 *
 * && {
 *   color: black;
 *   ${interpolatedDecl};
 * }
 *
 * are kept in the same block by postcss-nested.
 */

const tokenizer = require('postcss/lib/tokenize');
const Comment = require('postcss/lib/comment');
const Parser = require('postcss/lib/parser');
const Input = require('postcss/lib/input');

class PlaceholderSafeParser extends Parser {
  createTokenizer() {
    this.tokenizer = tokenizer(this.input, { ignoreErrors: true });
  }

  comment(token) {
    const node = new Comment();
    this.init(node, token[2], token[3]);
    node.source.end = { line: token[4], column: token[5] };

    let text = token[1].slice(2);
    if (text.slice(-2) === '*/') text = text.slice(0, -2);

    if (/^\s*$/.test(text)) {
      node.text = '';
      node.raws.left = text;
      node.raws.right = '';
    } else {
      const match = text.match(/^(\s*)([^]*[^\s])(\s*)$/);
      node.text = match[2];
      node.raws.left = match[1];
      node.raws.right = match[3];
    }
  }

  decl(tokens) {
    if (tokens.length > 1) {
      super.decl(tokens);
    }
  }

  unclosedBracket() {}

  unknownWord(tokens) {
    super.decl(tokens);
  }

  unexpectedClose() {
    this.current.raws.after += '}';
  }

  doubleColon() {}

  unnamedAtrule(node) {
    node.name = '';
  }

  precheckMissedSemicolon(tokens) {
    const colon = this.colon(tokens);
    if (colon === false) return;

    let split;
    for (split = colon - 1; split >= 0; split--) {
      if (tokens[split][0] === 'word') break;
    }
    for (split -= 1; split >= 0; split--) {
      if (tokens[split][0] !== 'space') {
        split += 1;
        break;
      }
    }
    const other = tokens.splice(split, tokens.length - split);
    this.decl(other);
  }

  checkMissedSemicolon() {}

  endFile() {
    if (this.current.nodes && this.current.nodes.length) {
      this.current.raws.semicolon = this.semicolon;
    }
    this.current.raws.after = (this.current.raws.after || '') + this.spaces;

    while (this.current.parent) {
      this.current = this.current.parent;
      this.current.raws.after = '';
    }
  }
}

export default function placeholderSafeParse(css, opts) {
  const input = new Input(css, opts);

  const parser = new PlaceholderSafeParser(input);
  parser.parse();

  return parser.root;
}
