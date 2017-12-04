# IdCrop

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Image cropper utility that crops an image in any polygonal shape chosen and returns a base64 of the cropped area.

### Usage

```bash
$ npm install idcrop
```

###### Javascript

```js
const idcrop = require('idcrop')

idcrop.init('toolbarContainer', 'displayContainer', 'previewContainer', 4)
```

The paramenters for the `init` function are, in order:

- The id of the container you want the toolbar to render at.
- The id of the container you want the display to render at.
- The id of the container you want the preview to render at.
- The number of sides you want the cropping polygon to have.

###### HTML

You must create a container for display (cropping area), toolbar (for now, only
filename) and preview (cropped area preview).

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>IdCrop</title>
    <link rel="stylesheet" type="text/css href="https://unpkg.com/idcrop@1.0.1/dist/css/main.min.css">
  </head>

  <body>
    <div id="displayContainer"></div>
    <div id="toolbarContainer"></div>
    <div id="previewContainer"></div>

    <script type="text/javascript" src="./path/to/js/file.js"></script>
  </body>
</html>
```

### Development Environment Setup

```bash
$ npm install & npm start
```

###### Linting

We use a combination of eslint and prettier for the formatting and linting of our JS code.

```bash
$ npm run lint
$ npm run fix
```

### License

Copyright © 2017, [Idwall](https://idwall.co/). Released under the [MIT license](https://github.com/idwall/idcrop/LICENSE).
