# `joplin-plugin-revealjs-slides`
[On GitHub](https://github.com/personalizedrefrigerator/joplin-plugin-revealjs-slides)

A Joplin plugin for presenting notes using [reveal.js](https://revealjs.com/).

<img width="600" src="./screenshots/screenshot-light.png" alt=""/>

## Installing
Search for "reveal.js" under the plugins tab in Joplin's settings.

# Known issues
 * Starting a presentation while the rich text editor is open **may clear your undo history!** The plugin briefly switches to the markdown editor before running the presentation. This switch may cause issues.
 * At present, the plugin's icon in the rich text editor is a gear: ![screenshot](https://github.com/personalizedrefrigerator/joplin-plugin-revealjs-slides/assets/46334387/da0b8cef-eb32-4550-8d3c-7f9a0f445230)
. [See the upstream bug report](https://github.com/laurent22/joplin/issues/6876)


# Development
## Building the plugin

The plugin is built using Webpack, which creates the compiled code in `/dist`. A JPL archive will also be created at the root, which can use to distribute the plugin.

To build the plugin, simply run `yarn run dist`.

The project is setup to use TypeScript, although you can change the configuration to use plain JavaScript.

## Updating the plugin framework

To update the plugin framework, run `npm run update`.

In general this command tries to do the right thing - in particular it's going to merge the changes in package.json and .gitignore instead of overwriting. It will also leave "/src" as well as README.md untouched.

The file that may cause problem is "webpack.config.js" because it's going to be overwritten. For that reason, if you want to change it, consider creating a separate JavaScript file and include it in webpack.config.js. That way, when you update, you only have to restore the line that include your file.
