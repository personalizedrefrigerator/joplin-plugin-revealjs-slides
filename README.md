# `joplin-plugin-revealjs-slides`
[On GitHub](https://github.com/personalizedrefrigerator/joplin-plugin-revealjs-slides) | [On the plugin website](https://joplinapp.org/plugins/plugin/io.github.personalizedrefrigerator.revealjs-integration/)

A Joplin plugin for presenting notes. Internally, this uses the [reveal.js](https://revealjs.com/) library.

<img width="600" src="./images/screenshot-light.png" alt="Screenshot: A Joplin plugin window showing a slideshow. The current slide states that KaTeX, highlight.js, and Mermaid are supported."/>


## Example presentation

<details><summary>Example presentation</summary>

````markdown

# `joplin-plugin-revealjs-slides`

---

- Separate slides with `---`s (if you're using the rich text editor, press the "horizontal line" button).
- The rest of this example presentation will assume you're using the markdown editor.

---

This plugin uses [reveal.js](https://revealjs.com/) internally. [Read about writing reveal.js presentations here](https://revealjs.com/vertical-slides/).

---

## A note on markdown rendering

`joplin-plugin-revealjs-slides` uses Joplin's markdown renderer internally *not* `reveal.js`'s markdown renderer.

<!-- Read about fragments here: https://revealjs.com/fragments/ -->
<div class="fragment fade-up">

Thus, some of [reveal.js's markdown features are not supported](https://revealjs.com/markdown/).

</div>
<div class="fragment fade-up">

However, this also means that many of Joplin's built-in features are supported. (For example, slideshows can be customized with [userstyle.css](https://discourse.joplinapp.org/t/introduction-to-customising-joplin-userchrome-css-userstyle-css/21370)).

</div>

---

[Note links can also be included](:/9aeb224225314a1b9d7ee977ffeb3078) (though note that they may not work perfectly!)

Slides can be linked to like this: [link to slide 3](#3).

---

# $\KaTeX$ is supported.

```js
// highlight.js is supported (through Joplin's
// markdown renderer).
function foo() {
	alert('test');
}
```

---

**Mermaid** is also supported

```mermaid
graph TD;
    Mermaid-->Also;
    A-->B;
    Also-->Works;
    B-->Works;
```

---

**Speaker notes** can be created using an
```
<aside class="notes">
    Notes!
</aside>
```

A setting exists to show speaker notes (when available).

<aside class="notes">
    Notes!
</aside>

---

<section>

# Keyboard shortcuts

</section>
<section>

Press <kbd>f</kbd> to enter fullscreen and <kbd>esc</kbd> to exit fullscreen.

</section>
<section>

Press <kbd>p</kbd> to print the slideshow.

</section>
<section>

Press <kbd>q</kbd> or navigate to the last slide to show the `Exit` button.

</section>
<section>

Press <kbd>?</kbd> to see a list of additional shortcuts.

</section>

---

# Animating code blocks

Code blocks with highlighted line numbers need to be specified in HTML. See [the upstream reveal.js documentation](https://revealjs.com/code/#manual-highlighting) for details.

Example:
<pre><code data-trim data-line-numbers="1|3|4">
// This
// is
// a test
// of code blocks.
</code></pre>

---

# More

For additional features, see the [reveal.js documentation](https://revealjs.com/backgrounds/).

````

> [!NOTE]
>
> Other examples can be found [on this plugin's GitHub repository](https://github.com/personalizedrefrigerator/joplin-plugin-revealjs-slides/tree/main/examples).
>

</details>

## Installing

Search for "reveal.js" under the plugins tab in Joplin's settings.
![screenshot shows "reveal.js" in the search bar of the "plugins" tab of Joplin's settings.](https://github.com/personalizedrefrigerator/joplin-plugin-revealjs-slides/assets/46334387/5f1a0c20-3d72-47a5-b214-18861cb6f493)


## Keyboard shortcuts

- Press <kbd>f</kbd> to enter fullscreen and <kbd>esc</kbd> to exit fullscreen.
- Press <kbd>p</kbd> to print the slideshow.
- Press <kbd>q</kbd> or navigate to the last slide to show the `Exit` button.
- Press <kbd>?</kbd> to see a list of additional shortcuts.

## Custom theme

It's possible to customize the theme for a slideshow with [CSS](https://developer.mozilla.org/en-US/docs/Learn/CSS) by adding a `<style>` block to the top of a note. To do this:
1. Make sure that the **markdown editor** is active. In markdown mode, the toggle button near the top of the screen should look like this (the "markdown" side should be highlighted): <img alt="screenshot: Toggle editor button labeled near the top right of the screen" src="https://github.com/personalizedrefrigerator/joplin-plugin-revealjs-slides/assets/46334387/c6ba5374-92df-40eb-b4d6-89264f107f80" width="200"/>

2. At the top of the note, add the following:
   ```html
   <style>
	   :root > body {
		   --r-main-color: white;
		   --r-heading-color: white;
		   --r-background-color: darkgray;
		   --r-link-color: lightblue;
	   }
   </style>
   ```
3. Adjust the colors in the `<style>` block to customize the theme.
4. Start the presentation.

**Note**: Other editable theme variables are [listed here](https://revealjs.com/themes/#custom-properties).

## Exporting

### HTML: For a web browser

To export a presentation to an HTML directory, right-click on a note, select export, then select "PRESENTATION.HTML - Export presentation as HTML":
<img src="https://github.com/personalizedrefrigerator/joplin-plugin-revealjs-slides/assets/46334387/cf6d8c8d-1eba-41f0-8d87-6533a1c9a955" alt="screenshot" width="459"/>

A file dialog will then appear. Use this dialog to select an output directory.

The slides plugin will create a `presentation` subfolder within that directory, then a subfolder for the current note's notebook, then a `.presentation.html` file for the current note. Opening that file in a web browser allows viewing the presentation outside of Joplin. Note that this file uses resources in other parts of the `presentation/` directory, so publishing or sharing just the `.presentation.html` file is not sufficient.

**Note**: Exported presentations use a light theme by default. See the [Custom theme](#custom-theme) section above for how to customize the presentation and export theme.

## Notes
 * **Avoid running a presentation with untrusted markdown input.**
     * While it _should_ be safe to do so, it is very possible that a vulnerability exists.
     * `reveal.js` has features like  [`iframe` backgrounds](https://revealjs.com/backgrounds/#iframe-backgrounds) that could pose a security risk (even though, in the `iframe` case, [this plugin attempts to mitigate this by disabling JavaScript in iframe backgrounds](https://github.com/personalizedrefrigerator/joplin-plugin-revealjs-slides/blob/main/src/dialog/webview.ts#L8)).
 * A keyboard shortcut can be associated with starting the slideshow. To do this, open Joplin's settings, click "Keyboard shortcuts", and search for "slideshow". Next, click in the "keyboard shortcut" column. ![screenshot showing "start slideshow" in the list of keyboard shortcuts](https://github.com/personalizedrefrigerator/joplin-plugin-revealjs-slides/assets/46334387/3f20972a-aff7-43d8-82f3-77a1f87c76aa).
 * Press `?` while in presentation mode to see a list of slideshow shortcuts. ![screenshot: A list of shortcuts, including space: to next slide, shift+space: to previous slide, p: print.](https://github.com/personalizedrefrigerator/joplin-plugin-revealjs-slides/assets/46334387/19f8ff5d-dd4c-4038-ae9a-5d1f7b46d02c)


## Known issues
 * Starting a presentation while the rich text editor is open **may clear your undo history!** The plugin briefly switches to the markdown editor before running the presentation. This switch may cause issues.
 * Does not support HTML notes.
 * If the note viewer is hidden, the presentation dialog **will not update.**

## Disclaimer

The developer of this plugin is not affiliated with `reveal.js`.


<details><summary>Development</summary>

# Development
## Building the plugin

The plugin is built using Webpack, which creates the compiled code in `/dist`. A JPL archive will also be created at the root, which can use to distribute the plugin.

To build the plugin, simply run `yarn run dist`.

The project is setup to use TypeScript, although you can change the configuration to use plain JavaScript.

## Updating the plugin framework

To update the plugin framework, run `npm run update`.

In general this command tries to do the right thing - in particular it's going to merge the changes in package.json and .gitignore instead of overwriting. It will also leave "/src" as well as README.md untouched.

The file that may cause problem is "webpack.config.js" because it's going to be overwritten. For that reason, if you want to change it, consider creating a separate JavaScript file and include it in webpack.config.js. That way, when you update, you only have to restore the line that include your file.

</details>
