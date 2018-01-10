# IdCrop

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Image cropper utility that crops an image in any polygonal shape chosen and returns a base64 of the cropped area.

### Usage

```bash
$ npm install idcrop
```

##### Javascript

```js
const IdCrop = require("idcrop");

const idcrop = new IdCrop({
  displaySelector: "#display",
  toolbarSelector: "#toolbar",
  previewSelector: "#preview"
});

idcrop.init();
```

###### Configuration Object

The only required key in the configuration object is the CSS selector for the display area, but we have a bunch of configuration options that will be listed below.

- **displaySelector** CSS selector for the containerof the display area (**required**, **type** CSS Selector)
- **toolbarSelector** CSS selector for the container of the toolbar (**default** "" **type** CSS Selector)
- **previewSelector** CSS selector for the container of the preview area  (**default** "" **type** CSS Selector)
- **allowUpload** Wether or not to allow image upload (**default** true **type** boolean)
- **numPoints** Number of points (**default** 4 **type** integer)
- **croppingArea**
  - **overlayColor** The color of the overlay around the cropping area (**default** "rgba(0, 0, 0, 0.7)" **type** CSS colors)
  - **stroke** Wether or not to add a stroke around the cropping area (**default** true **type** boolean)
  - **strokeColor** The color of the stroke around the cropping area (**default** "white" **type** CSS colors)
  - **strokeDashed** Wether or not the stroke is dashed (**default** true **type** boolean)
  - **strokeWeight** The weight of the stroke around the cropping area (**default** 2 **type** integer)
- **crop**
  - **overlayColor** The color of the overlay around the crop (**default** "rgba(0, 0, 0, 0)" **type** CSS colors)
  - **fillColor** The color of the fill inside the crop (**default** false **type** boolean)
  - **showImage** Wether or not to show the image inside the crop polygon. (**default** true **type** boolean)
  - **stroke** Wether or not to add a stroke around the crop (**default** false **type** boolean)
  - **strokeColor** The color of the stroke around the crop (**default** false **type** boolean)
  - **strokeDashed** Wether or not the stroke is dashed (**default** false **type** boolean)
  - **strokeWeight** The weight of the stroke around the cropping area (**default** 0 **type** integer)
- **handles**
  - **class** Any aditional classes to be added to the handles (**default** "" **type** string)
  - **defaultStyles** Wether or not to add the default styles to the handles. (**default** false **type** boolean)

###### Events

Some events are dispatched to the `document` in some key actions done to the cropper. These events are:

- `created` Dispatched when the IdCrop is loaded or reset. **detail** The IdCrop configuration object.
- `handleCreated` Dispatched when a new handle is created. **detail** The x and y position of the created handle.
- `resized` Dispatched when a handle is moved. **detail** The new x and y position of the moved handle.
- `crop` Dispatched when a crop action happens. **detail** The dataURI for the image created.

###### Getters

Right now we only have one getter method for the IdCrop which is:

- `idcrop.getPoints` This method returns a list with all the points added to the image relative to the real image size.


##### HTML

You can create a container for display (cropping area), toolbar (for now, only
filename) and preview (cropped area preview). Only the display area is required though.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>IdCrop</title>
    <link rel="stylesheet" type="text/css href="https://unpkg.com/idcrop@1.2.2/dist/css/main.min.css">
  </head>

  <body>
    <div id="display"></div>
    <div id="toolbar"></div>
    <div id="preview"></div>
  </body>
</html>
```

### Development Environment Setup

```bash
$ npm install & npm start
```

##### Linting

We use a combination of eslint and prettier for the formatting and linting of our JS code.

```bash
$ npm run lint
$ npm run fix
```

##### Publishing

We have a small npm script that handles the bumping of the version and the publishing of the package for us.

```bash
$ npm --no-git-tag version <newversion>
```

### License

Copyright © 2017, [Idwall](https://idwall.co/). Released under the [MIT license](https://github.com/idwall/idcrop/LICENSE).
