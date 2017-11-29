# IdCrop

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Embed for cropping images and returning a base64 of the cropped area.

### Development Environment Setup

```bash
$ npm install & npm start
```

### Usage

```bash
$ npm install idcrop
```

###### Javascript

```js
const idcrop = require('idcrop')

idcrop.init('toolbarContainer', 'displayContainer', 'previewContainer')
```

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
