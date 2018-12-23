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

## Acknowledgments

Thanks to QuickBase’s [babel-plugin-styled-components-css-namespace](https://github.com/QuickBase/babel-plugin-styled-components-css-namespace/) for inspiring this project!
