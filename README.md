# IdCrop

Embed for cropping images and returning a base64 of the cropped area.

### Development Environment Setup

```
npm install
npm run server

```

### Usage

```
npm install idcrop
```

###### Javascript

```

const idcrop = require("idcrop");
idcrop.init("toolbarContainer", "displayContainer", "previewContainer");

```

###### HTML

You must create a container for display (cropping area), toolbar (for now, only filename) and preview (cropped area preview).

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>IdCrop</title>
  <link rel="stylesheet" type="text/css" href="./node_modules/idcrop/dist/css/main.min.css">
</head>
<body>
  <div id="displayContainer"></div>
  <div id="toolbarContainer"></div>
  <div id="previewContainer"></div>
  <script type="text/javascript" src="./path/to/js/file.js"></script>
</body>
</html>
```