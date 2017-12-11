# IdCrop

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Image cropper utility that crops an image in any polygonal shape chosen and returns a base64 of the cropped area.

### Usage

```bash
$ npm install idcrop
```

###### Javascript

```js
const IdCrop = require("idcrop");

const idcrop = new IdCrop(
  "#displayContainer",
  "#previewContainer",
  "#toolbarContainer",
  6
);

idcrop.init();
```

The paramenters for the `init` function are, in order:

- The CSS selector of the container you want the toolbar to render at.
- The CSS selector of the container you want the display to render at.
- The CSS selector of the container you want the preview to render at.
- The number of sides you want the cropping polygon to have.

###### HTML

You must create a container for display (cropping area), toolbar (for now, only
filename) and preview (cropped area preview).

**For now, you can only have one cropper per page.**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>IdCrop</title>
    <link rel="stylesheet" type="text/css href="https://unpkg.com/idcrop@1.2.1/dist/css/main.min.css">
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

###### Publishing

We have a small npm script that handles the bumping of the version and the publishing of the package for us.

```bash
$ npm --no-git-tag version <newversion>
```

### License

Copyright © 2017, [Idwall](https://idwall.co/). Released under the [MIT license](https://github.com/idwall/idcrop/LICENSE).
