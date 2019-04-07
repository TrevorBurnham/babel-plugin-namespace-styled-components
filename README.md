# babel-plugin-namespace-styled-components

Use a namespace to increase the CSS specificity of your styled-components, preventing them from being overwritten by overly broad rules from the page’s stylesheets.

## Usage

Add the plugin to your Babel configuration before the `styled-components` plugin, and specify a CSS selector as its `namespace`:

```json
"plugins": [
  [
    "babel-plugin-namespace-styled-components",
    { "namespace": ".my-namespace" }
  ],
  "styled-components
]
```

Then render your app’s content within that namespace:

```jsx
MyApp = () => <div className="my-namespace">{appContent}</div>;
```

Now all `styled()` blocks will emit selectors that use that namespace.

### Before

```css
.bMqNs {
  color: tomato;
}
```

### After

```css
.my-namespace .bMqNs {
  color: tomato;
}
```

## Compatibility with mixins

If you use multiple ampersands (`&&`) in a selector in a mixin (that is, a style block inserted into a `styled()` template with `${}`), that selector will not match anything. This is a fundamental problem with namespacing at build time: styled-components resolves `&` to

```css
.namespace .c0
```

which means that `&&` will resolve to

```css
.namespace .c0.namespace .c0
```

When the plugin detects an invalid selector like this in a styled-components `css()` block, it’ll throw an error at build time. Be careful to wrap mixins in `css()` rather than using raw strings, which are ignored by the plugin and therefore potentially unsafe.

## Acknowledgments

Thanks to QuickBase’s [babel-plugin-styled-components-css-namespace](https://github.com/QuickBase/babel-plugin-styled-components-css-namespace/) for inspiring this project!
