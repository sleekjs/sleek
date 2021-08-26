# WIP framework

Just a small experiment. Right now, this framework can resolve imports and scope styles.
The main thing is that this framework is _compiled_, and it produces simple HTML, CSS and JS.

## Example

> `main.fwrk`:
```html
<script>
import Hello from 'hello.fwrk';
</script>

<!-- This will be blue, as defined in hello.fwrk -->
<Hello/>

<p>This will be red</p>

<style>
* {
	color: red;
}
</style>
```

> `hello.fwrk`:

```js
<h1>Hello</h1>

<style>
* {
  color: blue;
}
</style>

```

Check out the output in [`bundle/bundle.html`](./bundle/bundle.html)
