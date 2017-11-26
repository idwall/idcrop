# IdWidget

Cropping widget all in "VanillaJS".

### Development Environment Setup

```
npm install
npm run server

```

### Usage

###### Javascript

```

const IdWidget = require("./widget.js");
Widget.Widget.init("toolbarContainer", "displayContainer", "previewContainer");

```

###### HTML

You must create a container for display (cropping area), toolbar (upload button and filename) and preview (cropped area preview)  

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>IdWidget</title>
  <link rel="stylesheet" type="text/css" href="./dist/css/main.min.css">
</head>
<body>

  <div id="displayContainer"></div>

  <div id="toolbarContainer"></div>

  <div id="previewContainer"></div>

  <script type="text/javascript" src="./dist/js/bundle.min.js"></script>
</body>
</html>
```