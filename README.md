# `joplin-plugin-revealjs-slides`
[On GitHub](https://github.com/personalizedrefrigerator/joplin-plugin-revealjs-slides)

A Joplin plugin for presenting notes using [reveal.js](https://revealjs.com/).

<img width="600" src="./screenshots/editor-lightdark-fullscreen.png"/>

## Installing
Search for "reveal.js" under the plugins tab in Joplin's settings.
![screenshot of the search bar and results in the plugins tab. Freehand Drawing // create and edit drawings with js-draw is the only visible result.](https://user-images.githubusercontent.com/46334387/188908688-1500567d-f9a4-49b5-9dc1-8b5a00210c97.png)

# Known issues
 * Starting a presentation while the rich text editor is open **may clear your undo history!** The plugin briefly switches to the markdown editor before running the presentation. This switch may cause issues.
 * At present, the plugin's icon in the rich text editor is a gear: ![screenshot](https://user-images.githubusercontent.com/46334387/220479210-5f54bef6-a690-4ae1-9d7c-2d675c8f76ea.png). [See the upstream bug report](https://github.com/laurent22/joplin/issues/6876)


# Development
## Building the plugin

The plugin is built using Webpack, which creates the compiled code in `/dist`. A JPL archive will also be created at the root, which can use to distribute the plugin.

To build the plugin, simply run `yarn run dist`.

The project is setup to use TypeScript, although you can change the configuration to use plain JavaScript.

## Updating the plugin framework

To update the plugin framework, run `npm run update`.

In general this command tries to do the right thing - in particular it's going to merge the changes in package.json and .gitignore instead of overwriting. It will also leave "/src" as well as README.md untouched.

The file that may cause problem is "webpack.config.js" because it's going to be overwritten. For that reason, if you want to change it, consider creating a separate JavaScript file and include it in webpack.config.js. That way, when you update, you only have to restore the line that include your file.
