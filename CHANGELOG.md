# 0.10.0
 - Allow changing the default theme in settings or with an `<rjs-theme>theme-name-here</rjs-theme>` tag.

# 0.9.1
 - Fix links and code blocks in exported HTML.

# 0.9.0
 - Support exporting presentations as HTML.

# 0.8.2
 - Update `reveal.js` to [v5.0.5](https://github.com/hakimel/reveal.js/releases/tag/5.0.5)
 - Improve printing to PDF (can be activated by pressing `p` in a slideshow)
 - Improve compatibility with the rich text editor

# 0.7.0
 - Update `reveal.js` to [v5.0.4](https://github.com/hakimel/reveal.js/releases/tag/5.0.4)
 - Partial mobile support (users may need to switch to the viewer and back to the editor for correct rendering).

# 0.6.1
 - Update `reveal.js` to [v5.0.3](https://github.com/hakimel/reveal.js/releases/tag/5.0.3)

# 0.6.0
 - Support highlighting code blocks with `reveal.js`'s highlight plugin. This adds support for line numbers and animated code block transitions.

# 0.5.0
 - Upgrades to [reveal.js 5.0.2](https://github.com/hakimel/reveal.js/releases/tag/5.0.2)
 - Allows removing the "play" button from Joplin's toolbar.
 - Include licenses
 - Internal: Update plugin API

# 0.4.0
 - Upgrades to [reveal.js 4.6.1](https://github.com/hakimel/reveal.js/releases/tag/4.6.1)
 - Adds an option to [scroll overly-large slides](https://discourse.joplinapp.org/t/advanced-slides-plugin/31210/10)

# 0.3.0
 - Add the search plugin.
 - Map `ESC` > `ESC` to closing the slide deck.
 - Bug fix: Don't switch to the rich text editor from the markdown editor before opening the presentation.

# 0.2.0
 - Show the exit presentation mode button when pressing `ESC` (instead of showing the slide overview).
 - Make jump-to-slide links one-indexed instead of zero-indexed.

# 0.1.2
 - Fix regression from 0.1.1: Joplin CSS wasn't loading
 - Sandbox any `iframe`s created by `reveal.js`

# 0.1.1
 - Fix links not working correctly in presentations.
 - Fix previous and next slide buttons.
 - Hide the mermaid export buttons in presentation mode.

# 0.1.0
 - Fix plugin metadata.
 - Print the slide deck when pressing `p`.

# 0.0.1
 - Fork from [the js-draw integration plugin](https://github.com/personalizedrefrigerator/joplin-plugin-freehand-drawing)
